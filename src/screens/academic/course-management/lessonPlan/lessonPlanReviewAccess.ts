export const canRoleReviewLessonPlans = (role: string) =>
  role === 'admin' ||
  role === 'administrator' ||
  role === 'principal' ||
  role.includes('coordinator');
