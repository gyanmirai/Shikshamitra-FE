export function withAdmissionCounsellorFilter(search: string, counsellorId: string): string {
  const params = new URLSearchParams(search);
  if (counsellorId) params.set('counsellor', counsellorId);
  else params.delete('counsellor');
  return params.size ? `?${params.toString()}` : '';
}
