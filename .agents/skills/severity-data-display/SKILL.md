---
name: severity-data-display
description: Cómo mostrar severidad, hallazgos y datos técnicos (hashes, CVE IDs, evidencia) en pantalla en la Auditor Mobile Console — codificación de severidad, densidad de card vs. detalle, truncado/copiado de identificadores técnicos, y paleta oscura orientada a OLED. Usar al construir o revisar pantallas de findings, alertas o el panel de monitoreo (Historias 2, 3 y 4).
---

# Mostrar severidad y datos técnicos de seguridad

Esta skill cubre específicamente cómo se ve un `Finding`/`Alert`/`Audit` en pantalla (ver `src/services/api/types.ts` y `specs/001-auditor-mobile-console/data-model.md`), no la lógica de red que ya cubren [[api-vulnerabilidades]] y [[push-vulnerabilidades]]. Para reglas de tamaño de touch target y layout de una columna, ver [[mobile-touch-ergonomics]] — esta skill es sobre *qué* mostrar y *cómo codificarlo visualmente*, no dónde ponerlo en la pantalla.

**Contexto del proyecto**: paleta en `src/constants/theme.ts` (`Colors.light`/`Colors.dark`), sin NativeWind. Cualquier valor de color que sugiera esta skill se agrega ahí como un token nombrado, no como un hex suelto en el componente.

## 1. Severidad = color + ícono + texto, siempre los tres

- **Nunca** codificar severidad solo con color. Un auditor con luz solar directa, o con daltonismo, o mirando de reojo mientras camina, tiene que poder distinguir "critical" de "medium" sin depender del matiz exacto de rojo vs. naranja.
- Patrón obligatorio para cualquier `FindingSeverity` (`critical | high | medium | low`, ver `types.ts`): **badge con ícono + texto corto ("CRITICAL", "HIGH"...) + color de fondo/borde**. El texto es la fuente de verdad; color e ícono son refuerzo.
- Íconos sugeridos por severidad (usar `expo-symbols`/`@expo/vector-icons`, lo que ya esté disponible en el proyecto — no agregar una librería de íconos nueva solo para esto):
  - `critical` → ícono de alerta llena/octágono (parada obligatoria).
  - `high` → triángulo de alerta.
  - `medium` → círculo con signo "i" o punto.
  - `low` → check o punto vacío.

## 2. Tokens de color propuestos (agregar a `theme.ts`, no inventar en el componente)

Extendiendo el patrón que ya existe (`tint`, `danger` en `Colors.light`/`Colors.dark`):

```ts
// Colors.light
severityCritical: '#B3261E',
severityHigh:     '#C4560C',
severityMedium:   '#A66A00',
severityLow:      '#3A6B35',

// Colors.dark — MÁS CLAROS/DESATURADOS que en light, nunca el mismo hex.
// Un rojo saturado tipo "red-500" sobre fondo negro quema el ojo y pierde
// legibilidad con brillo alto de pantalla al sol. Preferir el equivalente
// a "red-400": más claro, menos saturado.
severityCritical: '#F2867B',
severityHigh:     '#F5A968',
severityMedium:   '#E8C468',
severityLow:      '#8FC48A',
```

**Regla dura**: el color de `dark` para severidad NUNCA es el mismo valor que el de `light` reescalado — tiene que ser deliberadamente más claro y menos saturado. Verificar contraste contra `Colors.dark.background` (que es `#000000`, ver punto 4) antes de dar por buena una elección.

## 3. Densidad: qué va en la lista vs. qué va en el detalle

Esto ya está en el spec (FR-008 vs. FR-009) — esta skill lo hace explícito para cuando se construya la UI:

- **Card de lista** (findings list, alerts list): severidad (badge) + título/`summary` + timestamp. **Nada más.** No mostrar `evidence` ni `impactParameters` acá aunque haya espacio — es ruido que hace más lenta la triage visual, que es el propósito de la lista.
- **Pantalla de detalle** (`findings/[findingId].tsx`, aún no construida): ahí sí va `evidence`, `impactParameters`, `confirmationState`, `reclassifiedAt`.
- Si una card de lista se siente "vacía", **no** es señal de agregar más campos — es el layout apilado de una columna ([[mobile-touch-ergonomics]] punto 4) haciendo su trabajo. Resistir la tentación de llenarla.

## 4. Identificadores técnicos: monoespaciado, truncado, copiable

Aplica a cualquier campo de `impactParameters`/`evidence` que sea un identificador (hash, token, ID de CVE, ruta de archivo):

- **Fuente**: `Fonts.mono` (ya existe en `theme.ts`) para cualquier identificador técnico. Texto normal (`Fonts.sans` implícito vía `ThemedText` default) para todo lo demás — no monoespacear prosa.
- **IDs cortos** (tipo `CVE-2024-12345`, ~15-20 caracteres): mostrar completo, sin truncar. Entran en una línea a este ancho de pantalla.
- **IDs largos** (hash SHA-256, JWT, token): **truncar siempre**. Patrón concreto:
  ```tsx
  <ThemedText type="code" numberOfLines={1} ellipsizeMode="middle">
    {longHashValue}
  </ThemedText>
  ```
  `ellipsizeMode="middle"` y no `"tail"` — para un hash, el principio Y el final suelen ser lo que alguien compara a simple vista; truncar solo el final oculta la mitad útil.
- **Copiar al mantener presionado**: cualquier identificador truncado necesita una forma de copiarlo completo — no sirve de nada mostrarlo si no se puede pegar en otro lado (ej. para buscarlo en el sistema de escritorio). Implementación: `expo-clipboard` (**no está instalado todavía** — es una dependencia nueva a agregar cuando se construya la pantalla de detalle de findings, vía `npx expo install expo-clipboard`), con un `Pressable` de `onLongPress` que llame `Clipboard.setStringAsync(fullValue)` y dé feedback visual breve (ej. cambiar el texto a "Copied" por 1-2s).
- Esto es exactamente el mismo cuidado de "no loguear tokens completos" de [[auth-jwt-securestore]], pero aplicado a datos de hallazgos en vez de credenciales — la regla de fondo es la misma: dato largo y sensible, mostralo truncado, dalo completo solo bajo una acción deliberada.

## 5. Paleta oscura orientada a OLED

- `Colors.dark.background` ya es `#000000` (negro puro) — **esto es correcto y hay que preservarlo**, no "mejorarlo" a un gris oscuro tipo `slate-950` por estética. En pantallas OLED, negro puro apaga literalmente los píxeles; un gris oscuro los mantiene encendidos y consume más batería. Para un auditor de campo que depende de batería, esto es una decisión funcional, no solo visual.
- `backgroundElement`/`backgroundSelected` en dark (`#212225`/`#2E3135`) sí pueden ser gris oscuro — son superficies elevadas (cards), no el fondo base. La regla de negro puro aplica específicamente a `background`, no a todos los tokens oscuros.
- Documentar esto explícitamente si se escribe cualquier informe/documentación del proyecto — es un argumento real a favor del modo oscuro por defecto, no solo preferencia estética.

## 6. Bordes finos y densidad

- Un borde de 1px lógico puede desaparecer en pantallas de alta densidad de píxeles. Si hace falta un borde, usar `StyleSheet.hairlineWidth` (ya se usa así en `sign-in.tsx` para los inputs) — nunca un `1` literal.
- Preferir, cuando sea posible, **diferenciar por color de fondo en vez de por borde** — es el patrón que ya sigue `AuditRow`/las cards del panel de monitoreo (`ThemedView type="backgroundElement"` sin borde, contraste contra el fondo de la pantalla). Mantener ese patrón al construir las cards de findings/alerts en vez de introducir bordes nuevos.

## Al revisar una pantalla de findings/alertas/monitoreo

1. ¿La severidad se puede identificar solo por color? → falla la regla 1.
2. ¿Un color de severidad en dark mode es el mismo hex que en light? → falla la regla 2.
3. ¿La card de lista muestra `evidence`/`impactParameters`? → debería estar solo en el detalle (regla 3).
4. ¿Hay un hash/token largo sin truncar, o truncado pero sin forma de copiarlo? → falla la regla 4.
5. ¿Se usó un gris en vez de negro puro para el fondo base en dark mode? → falla la regla 5.
6. ¿Hay un borde con valor numérico fijo en vez de `hairlineWidth` o diferenciación por fondo? → falla la regla 6.
