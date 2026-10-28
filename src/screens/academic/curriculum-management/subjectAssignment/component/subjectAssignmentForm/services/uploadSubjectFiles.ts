export async function uploadSubjectFiles<T>(
  files: File[],
  upload: (file: File) => Promise<T>
): Promise<T[]> {
  const results = new Array<T>(files.length);
  let next = 0;
  let failed = false;
  let failure: unknown;

  const worker = async (): Promise<void> => {
    if (failed || next >= files.length) return;
    const index = next;
    next += 1;
    try {
      results[index] = await upload(files[index]);
    } catch (error) {
      if (!failed) failure = error;
      failed = true;
    }
    await worker();
  };

  await Promise.all(Array.from({ length: Math.min(3, files.length) }, worker));
  if (failed) throw failure;
  return results;
}
