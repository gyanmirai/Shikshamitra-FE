export const canDeleteCriterion = (count: number) => count > 1;

export const addCriterionFromChip = <T extends { title: string }>(
  criteria: T[],
  title: string,
  createCriterion: (title: string) => T
) => {
  const normalizedTitle = title.trim().toLocaleLowerCase();
  if (
    criteria.some((criterion) => criterion.title.trim().toLocaleLowerCase() === normalizedTitle)
  ) {
    return criteria;
  }

  const emptyIndex = criteria.findIndex((criterion) => !criterion.title.trim());
  if (emptyIndex < 0) return [...criteria, createCriterion(title)];

  return criteria.map((criterion, index) =>
    index === emptyIndex ? { ...criterion, title } : criterion
  );
};
