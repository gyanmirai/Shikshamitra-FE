export const getOnboardingErrorMessage = (error: any, fallback: string) =>
  error?.data?.error?.message ||
  error?.data?.message ||
  error?.error ||
  error?.message ||
  fallback;
