export function mergeCategoryTags(tags: string[], draft: string): string[] {
  const seen = new Set<string>();
  return [...tags, draft]
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
