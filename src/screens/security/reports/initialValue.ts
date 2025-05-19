import type { IInitialValues } from './security-reports-interface';

export const getSecurityReportsInitialValues = (): IInitialValues => ({
  report: '',

  startDate: null,
  endDate: null,
});
