export default function useQueryAndMutation({ currentQueryAndMutation }: { currentQueryAndMutation: () => unknown }) { return currentQueryAndMutation(); }
