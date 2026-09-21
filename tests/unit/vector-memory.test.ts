import { computeEmbedding, cosineSimilarity, searchVectorMemory, VECTOR_KNOWLEDGE_BASE } from '../../src/services/ai/vector-memory';

describe('Vector Memory & Semantic Search (RAG)', () => {
  it('computes non-zero normalized embedding vectors', () => {
    const text = 'Prompt injection attack bypassing system instructions';
    const vec = computeEmbedding(text);

    expect(vec).toHaveLength(16);
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    expect(norm).toBeCloseTo(1.0, 4);
  });

  it('calculates higher cosine similarity for semantically related queries', () => {
    const vecPromptInj = computeEmbedding('override prompt instructions jailbreak system');
    const vecOWASP01 = VECTOR_KNOWLEDGE_BASE[0].embedding;
    const vecDOS = VECTOR_KNOWLEDGE_BASE.find((v) => v.category === 'dos_resource')!.embedding;

    const simToInj = cosineSimilarity(vecPromptInj, vecOWASP01);
    const simToDos = cosineSimilarity(vecPromptInj, vecDOS);

    expect(simToInj).toBeGreaterThan(simToDos);
  });

  it('retrieves top-K relevant cybersecurity vectors matching audit findings', () => {
    const results = searchVectorMemory('System prompt leaked confidential API keys', 2);

    expect(results).toHaveLength(2);
    expect(results[0].node.category).toBe('system_leak');
    expect(results[0].similarity).toBeGreaterThan(0.5);
  });
});
