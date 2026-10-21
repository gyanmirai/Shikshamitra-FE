import { hrPaths } from './hr-menus';

export const hrReportPaths = {
  library: `${hrPaths.reports}/templates`,
  history: hrPaths.reports,
  choose: `${hrPaths.reports}/generate`,
  generate: (id: string, query = '') =>
    `${hrPaths.reports}/generate/${encodeURIComponent(id)}${query ? `?${query}` : ''}`,
  design: (id?: string, copy = false) =>
    id && !copy
      ? `${hrPaths.reports}/templates/${encodeURIComponent(id)}/edit`
      : `${hrPaths.reports}/templates/new${id ? `?copyFrom=${encodeURIComponent(id)}` : ''}`,
  result: (id: string) => `${hrPaths.reports}/runs/${encodeURIComponent(id)}`,
};
