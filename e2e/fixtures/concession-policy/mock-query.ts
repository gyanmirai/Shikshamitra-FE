// Match the owning hook's interface while keeping the standalone fixture offline.
export default function useQueryAndMutation(options: any): any {
  const hook = options.currentQueryAndMutation;
  return options.type === 'mutation' ? hook() : hook(options.params, options.options);
}
