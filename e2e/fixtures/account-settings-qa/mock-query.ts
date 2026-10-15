export default function useQueryAndMutation({
  currentQueryAndMutation,
  params,
}: {
  currentQueryAndMutation: (params?: unknown) => unknown;
  params?: unknown;
}) {
  return currentQueryAndMutation(params);
}
