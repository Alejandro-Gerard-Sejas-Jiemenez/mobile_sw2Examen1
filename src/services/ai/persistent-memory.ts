import * as FileSystem from 'expo-file-system/legacy';
import { STORAGE_FILENAMES, STORAGE_LIMITS } from '@/constants/storage.constants';
import { StorageError } from '@/errors/storage-error';

export interface MemoryDirective {
  id: string;
  text: string;
  tone: string;
  timestamp: string;
}

export interface LearnedSecurityRule {
  id: string;
  category: 'prompt_guard' | 'compliance' | 'code_fix' | 'general';
  rule: string;
  addedAt: string;
}

export interface PersistentMemoryData {
  version: number;
  lastUpdated: string;
  directives: MemoryDirective[];
  learnedRules: LearnedSecurityRule[];
  auditedTargetsHistory: string[];
}

const MEMORY_FILE_PATH = `${FileSystem.documentDirectory || ''}${STORAGE_FILENAMES.AI_PERSISTENT_MEMORY}`;

const DEFAULT_MEMORY: PersistentMemoryData = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  directives: [
    {
      id: 'dir-default-1',
      text: 'Priorizar protección contra exfiltración de System Prompts y fuga de credenciales internas.',
      tone: 'executive',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'dir-default-2',
      text: 'Exigir delimitadores XML inmutables y sanitización pre-inferencia en frameworks Django/Next.js.',
      tone: 'technical',
      timestamp: new Date().toISOString(),
    },
  ],
  learnedRules: [
    {
      id: 'rule-1',
      category: 'prompt_guard',
      rule: 'Todo prompt de usuario debe ser encapsulado en etiquetas <user_input> sin privilegios de sistema.',
      addedAt: new Date().toISOString(),
    },
    {
      id: 'rule-2',
      category: 'compliance',
      rule: 'Controles alineados con OWASP LLM01:2025 (Prompt Injection) y LLM02 (Sensitive Information Disclosure).',
      addedAt: new Date().toISOString(),
    },
    {
      id: 'rule-3',
      category: 'code_fix',
      rule: 'Inhabilitar decodificación automática de secuencias Base64/Hex sin pasar por Llama-Guard.',
      addedAt: new Date().toISOString(),
    },
  ],
  auditedTargetsHistory: [],
};

class PersistentMemoryManager {
  private cache: PersistentMemoryData = DEFAULT_MEMORY;
  private isLoaded: boolean = false;

  async load(): Promise<PersistentMemoryData> {
    try {
      const info = await FileSystem.getInfoAsync(MEMORY_FILE_PATH);
      if (info.exists) {
        const raw = await FileSystem.readAsStringAsync(MEMORY_FILE_PATH);
        if (raw && typeof raw === 'string' && raw.trim().length > 0) {
          const parsed = JSON.parse(raw);
          this.cache = {
            ...DEFAULT_MEMORY,
            ...parsed,
            directives: parsed.directives || DEFAULT_MEMORY.directives,
            learnedRules: parsed.learnedRules || DEFAULT_MEMORY.learnedRules,
          };
        } else {
          this.cache = DEFAULT_MEMORY;
        }
      } else {
        await this.persist(DEFAULT_MEMORY);
        this.cache = DEFAULT_MEMORY;
      }
    } catch (err) {
      console.warn('[persistent-memory] Load error, using in-memory cache:', err);
      this.cache = DEFAULT_MEMORY;
    }
    this.isLoaded = true;
    return this.cache;
  }

  getMemorySync(): PersistentMemoryData {
    return this.cache;
  }

  async saveDirective(text: string, tone: string): Promise<void> {
    if (!text || text.trim().length === 0) return;
    if (!this.isLoaded) await this.load();

    const exists = this.cache.directives.some(
      (d) => d.text.toLowerCase().trim() === text.toLowerCase().trim()
    );

    if (!exists) {
      const newDirective: MemoryDirective = {
        id: `dir-${Date.now()}`,
        text: text.trim(),
        tone,
        timestamp: new Date().toISOString(),
      };
      this.cache.directives = [newDirective, ...this.cache.directives].slice(
        0,
        STORAGE_LIMITS.MAX_PERSISTENT_DIRECTIVES
      );
      this.cache.lastUpdated = new Date().toISOString();
      await this.persist(this.cache);
    }
  }

  async addLearnedRule(
    rule: string,
    category: LearnedSecurityRule['category'] = 'general'
  ): Promise<void> {
    if (!rule || rule.trim().length === 0) return;
    if (!this.isLoaded) await this.load();

    const exists = this.cache.learnedRules.some(
      (r) => r.rule.toLowerCase().trim() === rule.toLowerCase().trim()
    );

    if (!exists) {
      const newRule: LearnedSecurityRule = {
        id: `rule-${Date.now()}`,
        category,
        rule: rule.trim(),
        addedAt: new Date().toISOString(),
      };
      this.cache.learnedRules = [newRule, ...this.cache.learnedRules].slice(
        0,
        STORAGE_LIMITS.MAX_PERSISTENT_LEARNED_RULES
      );
      this.cache.lastUpdated = new Date().toISOString();
      await this.persist(this.cache);
    }
  }

  async recordAuditedTarget(targetUrl: string): Promise<void> {
    if (!targetUrl) return;
    if (!this.isLoaded) await this.load();

    if (!this.cache.auditedTargetsHistory.includes(targetUrl)) {
      this.cache.auditedTargetsHistory = [
        targetUrl,
        ...this.cache.auditedTargetsHistory,
      ].slice(0, STORAGE_LIMITS.MAX_PERSISTENT_TARGETS);
      await this.persist(this.cache);
    }
  }

  getFormattedMemoryContext(): string {
    const rulesStr = this.cache.learnedRules
      .map((r, i) => `  ${i + 1}. [${r.category.toUpperCase()}] ${r.rule}`)
      .join('\n');
    const recentDirs = this.cache.directives
      .slice(0, 3)
      .map((d, i) => `  ${i + 1}. "${d.text}" (Tono: ${d.tone})`)
      .join('\n');

    return `### REGLAS DE SEGURIDAD PERSISTENTES APRENDIDAS:\n${rulesStr}\n\n### DIRECTIVAS HISTÓRICAS DEL AUDITOR:\n${recentDirs}`;
  }

  private async persist(data: PersistentMemoryData): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(
        MEMORY_FILE_PATH,
        JSON.stringify(data, null, 2)
      );
    } catch (err) {
      const storageErr = new StorageError(
        'STORAGE_WRITE_FAILED',
        `Failed to persist AI memory to ${MEMORY_FILE_PATH}`,
        { cause: err }
      );
      console.warn(storageErr.message);
    }
  }
}

export const persistentMemory = new PersistentMemoryManager();
// Trigger initial load asynchronously
persistentMemory.load();
