import type {
  PaymentTermUsage as Usage,
  PaymentTermDefaultImpact,
} from 'src/redux/finance/paymentTerm';

import { Stack, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

export const assignmentNote =
  'Existing fee structures keep their assigned term. The new default applies only to new fee head assignments.';

export function PaymentTermUsageSummary({ usage }: { usage: Usage }) {
  const classes = Array.from(new Set(usage.assignments.map((row) => row.className)));
  return (
    <Typography variant="body2">
      Used in {usage.feeHeadCount} Fee Heads across {usage.feeStructureCount} Fee Structures{' '}
      (Classes: {classes.join(', ') || 'None'}).{' '}
      {usage.versionId ? 'Counts cover the selected version.' : 'Counts cover all versions.'}
    </Typography>
  );
}

export function PaymentTermDefaultSummary({
  impact,
  name,
  version,
}: {
  impact: PaymentTermDefaultImpact;
  name: string;
  version: number;
}) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">
        {impact.currentDefaultName
          ? `${impact.currentDefaultName} · v${impact.currentDefaultVersionNumber ?? '?'}`
          : 'No current default'}
        {' → '}
        {name || 'New payment term'} · v{version}
      </Typography>
      {impact.currentDefaultUsage && <PaymentTermUsageSummary usage={impact.currentDefaultUsage} />}
      <Typography variant="body2">{assignmentNote}</Typography>
    </Stack>
  );
}

export function PaymentTermUsageBreakdown({ usage }: { usage: Usage }) {
  return (
    <Stack spacing={2}>
      <PaymentTermUsageSummary usage={usage} />
      <CustomizableTable
        tableId="payment-term-usage"
        columns={[
          { id: 'className', label: 'Class', minWidth: 100 },
          { id: 'feeStructureName', label: 'Fee Structure', minWidth: 150 },
          { id: 'feeHeadName', label: 'Fee Head', minWidth: 150 },
          {
            id: 'versionNumber',
            label: 'Version',
            minWidth: 90,
            render: (value) => (value ? `v${value}` : 'Unspecified'),
          },
        ]}
        data={usage.assignments.map((row, index) => ({
          ...row,
          id: `${row.feeStructureId}-${row.feeHeadId}-${index}`,
        }))}
        isPagination
        noDataText="This payment term has no fee head assignments."
      />
    </Stack>
  );
}
