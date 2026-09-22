import { initLlama, type LlamaContext } from 'llama.rn';
import { isModelDownloaded } from './model-manager';
import type { Audit, Finding } from '../api/types';
import type { ReportTone } from '../reports/types';

const SYSTEM_PROMPT =
  'Sos un analista senior de ciberseguridad especializado en seguridad ofensiva de LLMs. ' +
  'Se te da el resultado YA CALCULADO de una auditoría de Red-Team contra un chatbot con IA: ' +
  'nivel de riesgo, score y hallazgos confirmados por un juez. Tu ÚNICA tarea es redactar el ' +
  'diagnóstico narrativo en español, entre 2 y 4 párrafos, en el tono solicitado. ' +
  'No inventes datos, cifras, CVEs, hashes ni hallazgos que no se te hayan dado explícitamente. ' +
  'No repitas listas ni tablas — escribí prosa fluida y profesional. ' +
  'No agregues encabezados, viñetas ni markdown: solo el texto del diagnóstico.';

const N_CTX = 2048;
const N_PREDICT = 400;
const INFERENCE_TIMEOUT_MS = 60000;

let contextPromise: Promise<LlamaContext> | null = null;

// The native llama.rn context is NOT reentrant — only one completion() call
// may run at a time, and a second concurrent call fails immediately with
// "Context is busy" instead of queueing. `use-report-preview` can legitimately
// fire generateLocalNarrative more than once in quick succession (React Query
// re-renders, tone/format switches), so every call is chained onto this
// promise to force them to run one after another instead of colliding.
let inferenceQueue: Promise<void> = Promise.resolve();

/** Lazily loads the already-downloaded GGUF model into a llama.rn context and
 *  caches it for the app's lifetime — loading an ~800MB model per report would
 *  be unusably slow. Returns null (never throws) if the model isn't downloaded
 *  or fails to load, so callers always have a deterministic fallback path. */
async function getContext(): Promise<LlamaContext | null> {
  const status = await isModelDownloaded();
  console.log(
    `[llama-inference] 🔍 isModelDownloaded → exists=${status.exists}` +
      (status.exists ? ` size=${(status.sizeBytes / 1024 / 1024).toFixed(1)} MB uri=${status.uri}` : '')
  );
  if (!status.exists) {
    console.warn('[llama-inference] ⚠️  Modelo GGUF NO encontrado en disco — se usará diagnóstico heurístico.');
    return null;
  }

  if (!contextPromise) {
    console.log('[llama-inference] 🚀 Iniciando carga del contexto Llama (primera vez o tras fallo previo)…');
    contextPromise = initLlama({
      model: status.uri,
      n_ctx: N_CTX,
      // Offload every transformer layer to the GPU (OpenCL backend — this
      // build's llama.rn was compiled with ggml-opencl support). Falls back
      // to CPU automatically on devices without a compatible GPU; if
      // initLlama rejects outright, the .catch below nulls contextPromise
      // and generateLocalNarrative degrades to the heuristic narrative.
      n_gpu_layers: 99,
    })
      .then((ctx) => {
        console.log('[llama-inference] ✅ Contexto Llama cargado y cacheado correctamente.');
        return ctx;
      })
      .catch((err) => {
        contextPromise = null; // allow a retry on the next call instead of caching a permanent failure
        throw err;
      });
  } else {
    console.log('[llama-inference] ♻️  Reutilizando contexto Llama ya cacheado en memoria.');
  }

  try {
    return await contextPromise;
  } catch (err) {
    console.warn('[llama-inference] ❌ Error al cargar el modelo GGUF local:', err);
    return null;
  }
}

function toneLabel(tone: ReportTone): string {
  switch (tone) {
    case 'technical':
      return 'técnico, orientado a DevSecOps';
    case 'compliance':
      return 'de cumplimiento normativo';
    case 'custom':
      return 'personalizado según la directiva del auditor';
    case 'executive':
    default:
      return 'ejecutivo, para nivel C-Level';
  }
}

export interface NarrateOptions {
  audit: Audit;
  findings: Finding[];
  overallRiskLevel: string;
  riskScore: number;
  tone: ReportTone;
  auditorDirectives?: string;
}

/**
 * Generates the narrative diagnosis paragraph using the on-device Llama model,
 * grounded in the ALREADY-COMPUTED risk score and findings (the model never
 * invents scores or evidence — it only narrates what it's given).
 *
 * Returns null — never throws — if the model isn't downloaded, fails to load,
 * or inference times out. Callers must fall back to the deterministic template
 * narrative (`risk-calculator.ts`'s `threatSummary`) in that case.
 */
export async function generateLocalNarrative(options: NarrateOptions): Promise<string | null> {
  // Wait for any in-flight completion on the shared context to finish first —
  // running two at once makes the native side throw "Context is busy".
  let release: () => void;
  const myTurn = new Promise<void>((resolve) => {
    release = resolve;
  });
  const previousTurn = inferenceQueue;
  inferenceQueue = myTurn;
  await previousTurn;

  try {
    return await runGenerateLocalNarrative(options);
  } finally {
    release!();
  }
}

async function runGenerateLocalNarrative(options: NarrateOptions): Promise<string | null> {
  console.log(
    `[llama-inference] 📝 generateLocalNarrative() → auditId=${options.audit.id} tone=${options.tone}` +
      ` findings=${options.findings.length} riskScore=${options.riskScore} riskLevel=${options.overallRiskLevel}`
  );
  const context = await getContext();
  if (!context) {
    console.warn('[llama-inference] ⚠️  Sin contexto Llama disponible — narrative será null (caerá al heurístico).');
    return null;
  }
  console.log('[llama-inference] ✅ Contexto OK — arrancando inferencia local…');

  const findingsList =
    options.findings
      .slice(0, 10)
      .map((f) => `- [${f.severity.toUpperCase()}] ${f.summary}`)
      .join('\n') || '- No se detectaron hallazgos confirmados; el objetivo resistió los payloads probados.';

  const userPrompt = [
    `Objetivo auditado: ${options.audit.name}`,
    `Nivel de riesgo calculado: ${options.overallRiskLevel} (score ${options.riskScore}/10)`,
    `Tono solicitado: ${toneLabel(options.tone)}`,
    `Hallazgos confirmados (${options.findings.length}):`,
    findingsList,
    options.auditorDirectives?.trim()
      ? `Directiva específica del auditor: "${options.auditorDirectives.trim()}"`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  let accumulated = '';
  const inferenceStart = Date.now();

  try {
    console.log(
      `[llama-inference] ⏳ Lanzando completion — n_predict=${N_PREDICT} temp=0.3` +
        ` timeout=${INFERENCE_TIMEOUT_MS / 1000}s`
    );
    const completionPromise = context
      .completion(
        {
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          n_predict: N_PREDICT,
          temperature: 0.3,
        },
        (data) => {
          if (data.token) accumulated += data.token;
        },
      )
      .then(() => accumulated.trim());

    let timeoutHandle: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutHandle = setTimeout(() => {
        console.warn(
          `[llama-inference] ⏰ TIMEOUT tras ${INFERENCE_TIMEOUT_MS / 1000}s — ` +
            `tokens generados hasta ahora: ${accumulated.length} chars. Cancelando…`
        );
        resolve(null);
      }, INFERENCE_TIMEOUT_MS);
    });

    const text = await Promise.race([completionPromise, timeoutPromise]);
    clearTimeout(timeoutHandle!);

    if (text === null) {
      // Timed out — stop the native generation instead of leaving it running
      // in the background (it would otherwise keep the context busy for the
      // next report's inference attempt).
      // `stopCompletion()` isn't reliably a Promise across llama.rn versions —
      // wrap it so a synchronous return (or throw) can't skip cleanup here.
      await Promise.resolve(context.stopCompletion()).catch(() => {});
      return null;
    }

    const elapsedMs = Date.now() - inferenceStart;
    if (text.length > 0) {
      console.log(
        `[llama-inference] 🎉 Inferencia completada en ${elapsedMs}ms — ` +
          `${text.length} chars generados. Preview: "${text.slice(0, 80).replace(/\n/g, ' ')}…"`
      );
      return text;
    }

    console.warn('[llama-inference] ⚠️  Completion devolvió texto vacío — retornando null.');
    return null;
  } catch (err) {
    console.warn('[llama-inference] ❌ Completion falló con error:', err);
    return null;
  }
}

/**
 * Detiene cualquier inferencia en curso y libera el contexto Llama de la RAM.
 * Llama esto cuando el usuario navega fuera de la pantalla de reporte o
 * cuando quiere liberar ~800 MB de memoria del modelo.
 * Seguro de llamar aunque no haya contexto cargado (no-op en ese caso).
 */
export async function releaseLocalAI(): Promise<void> {
  if (!contextPromise) {
    console.log('[llama-inference] releaseLocalAI() → sin contexto activo, nada que liberar.');
    return;
  }

  console.log('[llama-inference] 🛑 releaseLocalAI() → deteniendo inferencia y liberando contexto…');
  try {
    const ctx = await contextPromise.catch(() => null);
    if (ctx) {
      await ctx.stopCompletion().catch(() => {});
      await ctx.release();
      console.log('[llama-inference] ✅ Contexto Llama liberado de RAM correctamente.');
    }
  } catch (err) {
    console.warn('[llama-inference] ⚠️  Error al liberar contexto:', err);
  } finally {
    // Null the promise so the next getContext() call loads fresh.
    contextPromise = null;
  }
}
