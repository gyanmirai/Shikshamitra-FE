export const getOnboardingErrorMessage = (error: any, fallback: string) =>
  error?.data?.error?.message ||
  error?.data?.detail ||
  error?.data?.message ||
  error?.data?.title ||
  error?.error ||
  error?.message ||
  fallback;
