export function lectureSlotActionLocation(pathname: string, search: string, action?: string) {
  const params = new URLSearchParams(search);
  params.delete('recordId');
  if (action) params.set('action', action);
  else params.delete('action');
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
