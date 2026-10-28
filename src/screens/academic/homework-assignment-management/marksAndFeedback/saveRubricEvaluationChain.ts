export async function saveRubricEvaluationChain({ upsert, submit, approve, refresh }: {
  upsert: () => Promise<{ id: string }>;
  submit: (evaluationId: string) => Promise<unknown>;
  approve: (evaluationId: string) => Promise<unknown>;
  refresh: () => void;
}) {
  try {
    const saved = await upsert();
    await submit(saved.id);
    await approve(saved.id);
  } finally {
    refresh();
  }
}
