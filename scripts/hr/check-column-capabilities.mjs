import fs from 'node:fs';
import path from 'node:path';
import { columnInventory } from './column-inventory.mjs';

const fields = JSON.parse(fs.readFileSync('src/screens/hr/hooks/hr-table-fields.json', 'utf8'));
const aliases = {
  'hr-attendance-shift-management': 'hr-shifts',
  'biometric-attendance-history-table': 'hr-attendance-imports',
  'import-detail-preview-table': 'hr-attendance-import-rows',
  'employee-icard-table': 'hr-icard-templates',
  'apply-leave-table': 'hr-leave-requests',
  'leave-approvals-table': 'hr-leave-requests',
  'leave-balance-history': 'hr-leave-requests',
  'payroll-registration-review': 'hr-payroll-registration-readiness',
  'pf-table': 'hr-pf-rules',
  'professional-table': 'hr-professional-tax',
  'hr-work-calendars': 'hr-policy-calendar',
  'hr-leave-policies-workspace': 'hr-policy-leave',
  'hr-{type}-policies': 'hr-policy-payroll',
};
const actionIds = new Set([
  'action',
  'actions',
  'select',
  'selection',
  'checkBox',
  'upload',
  'view',
  'download',
  'substitution',
  'reviewId',
]);
const hook = fs.readFileSync('src/screens/hr/hooks/use-hr-table-query.ts', 'utf8');
function typedSet(name) {
  const content =
    new RegExp(`const ${name} = new Set\\(\\[([\\s\\S]*?)\\]\\)`).exec(hook)?.[1] || '';
  return new Set([...content.matchAll(/'([^']+)'/g)].map((match) => match[1]));
}
const numbers = typedSet('numbers'),
  money = typedSet('money'),
  dates = typedSet('dates'),
  timestamps = typedSet('timestamps');
function typeFor(column) {
  return (
    column.filterType ||
    (numbers.has(column.id) || money.has(column.id)
      ? 'number'
      : dates.has(column.id)
        ? 'date'
        : timestamps.has(column.id)
          ? 'dateTime'
          : 'string')
  );
}
const review = columnInventory.find((item) => item.id === 'performance-reviews');
const issues = [];
// Display/query projection parity is covered by the paired backend regressions.
export const pendingProjectionGaps = [];
const matrix = columnInventory.map((item) => {
  const id = typeof item.id === 'string' ? item.id : `${item.owner} (adapter)`;
  const source = aliases[id] || (fields[id] ? id : undefined);
  let columns = item.columns;
  let schema;
  let exception;
  if (item.tag === 'ReviewTable') {
    columns = review.columns;
    schema =
      'Same actual ReviewTable column definition as performance-reviews; includes overview/reviews/self/observation/calibration/outcomes.';
  } else if (item.owner === 'SectionTable') {
    columns = [];
    schema =
      'Every consumer heading maps to columnIds[index] or columnN; consumer columnDefinitions retain numeric/enum/date accessors; Actions is excluded. Consumers are separately enumerated.';
  } else if (item.owner === 'PerformanceDataTable') {
    columns = [];
    schema =
      'Forwards the consumer columns and server callbacks unchanged. Every consumer definition is separately enumerated.';
  } else if (item.owner === 'HrReportPreviewTable' || item.tag === 'HrReportPreviewTable') {
    columns = [];
    schema =
      'Each selected salary-document column uses the owning operational serverColumnTypes allowlist. Numeric/money/date controls come from that metadata; identity/month/status are text. Raw null amounts remain unavailable. Server criteria/count/export use the same selected source fields.';
  } else if (item.owner === 'ReportResultTable' || item.tag === 'ReportResultTable') {
    columns = [];
    schema =
      'Every configured report output column uses reportFieldColumn metadata: number/money => numeric, date/datetime => date, boolean/options => named enum, remaining => text. Captured result criteria precede server pagination/export; designer sample is explicitly labelled and unpaginated.';
  } else if (item.owner === 'EmployeeAttendanceTrendChart') {
    columns = [
      ...columns.filter((column) => column.id),
      { id: 'series{index}', label: 'Each returned series', filterType: 'number' },
    ];
    schema =
      'All chart series are numeric, have row-keyed values and controls; full selected monthly chart population is local.';
  } else if (item.owner === 'CalendarPolicyDrawer' && item.tag === 'Table') {
    columns = ['Date / Range', 'Days', 'Holiday', 'Source', 'Notes', 'Status', 'Actions'].map(
      (label) => ({ id: label, label })
    );
    exception =
      'Editable holiday configuration: scope/search/source controls operate on stable original draft indices; sorting is intentionally absent to preserve editing/inclusion/removal context. Not a paged record dataset.';
  } else if (item.owner === 'PayrollPolicyDrawer' && item.tag === 'Table') {
    columns = [
      'Month',
      'Calendar Days',
      'Saturdays',
      'Saturday Units',
      'Working Units',
      'Holiday Units Excluded',
      'Payroll Basis Days',
      'Calculation Source',
    ].map((label) => ({ id: label, label }));
    exception =
      'Editable month-by-month payroll basis: chronological calculation grid, draft manual-day input and formula validation. Month order and full twelve-month comparison are preserved; no record sorting/filtering/export.';
  }
  if (!columns.length && !schema && !exception)
    issues.push(`${item.file}#${item.owner}: unresolved column definition`);
  const rows = columns.map((rawColumn) => {
    const column =
      item.tag === 'SectionTable' &&
      !source &&
      ['Status', 'Type', 'Scope', 'Source', 'Action'].includes(rawColumn.label)
        ? {
            ...rawColumn,
            filterType: 'enum',
            optionsSource:
              'Distinct displayed labels from the complete authorized local collection',
          }
        : rawColumn;
    if (typeof column.id !== 'string') {
      issues.push(`${item.file}#${item.owner}: unresolved column ${JSON.stringify(column)}`);
      return { id: '?', unresolved: true };
    }
    const action =
      (actionIds.has(column.id) &&
        !(id === 'performance-report-pending-actions' && column.id === 'action')) ||
      column.label === 'Actions';
    if (exception || action)
      return {
        id: column.id,
        label: typeof column.label === 'string' ? column.label : column.id,
        sort: false,
        filter: false,
        export: false,
        exception: exception || 'Action/selection/navigation control; not a record property.',
      };
    if (source && !fields[source].includes(column.id))
      issues.push(`${id}.${column.id}: missing authorized backend field`);
    if (!source && column.isSort === false)
      issues.push(`${id}.${column.id}: sorting disabled without a data exception`);
    if (!source && column.isFilter === false)
      issues.push(`${id}.${column.id}: filtering disabled without a data exception`);
    return {
      semanticLimit: pendingProjectionGaps.find(
        (gap) => gap.table === source && gap.columns.includes(column.id)
      )?.reason,
      id: column.id,
      label: typeof column.label === 'string' ? column.label : column.id,
      sort: source ? 'global before pagination' : 'complete local population',
      filter: typeFor(column),
      optionsSource: column.optionsSource,
      enumOptions: Array.isArray(column.enumOptions) ? column.enumOptions : undefined,
      export: column.excludeFromExport
        ? false
        : source
          ? 'same global criteria, visible ordered fields'
          : 'filtered visible fields',
      computedAccessors: Boolean(
        column.filterValue || column.sortValue || column.searchValue || column.exportValue
      ),
    };
  });
  return {
    routes: item.routes,
    table: id,
    file: item.file,
    owner: item.owner,
    dataset: source || 'complete local collection / configured adapter',
    schema,
    exception,
    columns: rows,
  };
});
export const columnCapabilityMatrix = matrix;
export const columnCapabilityIssues = issues;
const cli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve('scripts/hr/check-column-capabilities.mjs');
if (cli) {
  if (process.argv.includes('--json'))
    console.log(JSON.stringify({ matrix, issues, pendingProjectionGaps }, null, 2));
  else {
    console.log(
      `HR column definitions/call sites: ${matrix.length}; explicit column occurrences: ${matrix.flatMap((table) => table.columns).length}; schema-parametric adapters: ${matrix.filter((table) => table.schema).length}; editable-grid exceptions: ${matrix.filter((table) => table.exception).length}.`
    );
    issues.forEach((issue) => console.error(issue));
    console.log(
      issues.length
        ? `${issues.length} unresolved column capability issue(s).`
        : 'All enumerated columns and dynamic schemas are accounted for. Runtime validation remains separate.'
    );
  }
  process.exitCode = issues.length ? 1 : 0;
}
