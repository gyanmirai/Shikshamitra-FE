import { hrPaths } from './hr-menus';

export const hrReportPaths = {
  library: hrPaths.reports,
  history: `${hrPaths.reports}?tab=generated`,
  generate: (id: string) => `${hrPaths.reports}?mode=generate&template=${encodeURIComponent(id)}`,
  design: (id?: string, copy = false) =>
    `${hrPaths.reports}?mode=design${id ? `&template=${encodeURIComponent(id)}` : ''}${copy ? '&copy=1' : ''}`,
  result: (id: string) => `${hrPaths.reports}?mode=result&run=${encodeURIComponent(id)}`,
};
