import type { IFeeHeadDependencies } from 'src/redux/feeCategory/feeCategoryApi';

import { Alert, Button, Stack } from '@mui/material';
import { financePermissions } from 'src/constants/finance-menu';

import { useFinancePermissions } from '../../hooks/useFinancePermissions';

const countLabel = (count: number, singular: string) =>
  `${count} ${singular}${count === 1 ? '' : 's'}`;

export const feeHeadDependencyMessage = (name: string, dependencies?: IFeeHeadDependencies) =>
  dependencies
    ? `${name} is used by ${countLabel(dependencies.studentCount, 'student')}, ${countLabel(dependencies.assignmentCount, 'assignment')}, ${countLabel(dependencies.feeStructureCount, 'fee structure')}, and ${countLabel(dependencies.paymentTermCount, 'payment term')}. Remove or reassign these references before removing or deactivating this fee head.`
    : `${name} is already in use. Review its fee structures and student assignments before removing or deactivating it.`;

export default function FeeHeadDependencies({
  name,
  dependencies,
  feeHeadId,
}: {
  name: string;
  dependencies?: IFeeHeadDependencies;
  feeHeadId?: string;
}) {
  const assignments = useFinancePermissions(financePermissions.fees.structureAssign);
  const structures = useFinancePermissions(financePermissions.fees.settings.feeStructure);
  return (
    <Alert severity="error">
      {feeHeadDependencyMessage(name, dependencies)}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
        {assignments.canView && (
          <Button
            size="small"
            href={
              feeHeadId
                ? `/finance/fee-structure-assign?feeHeadId=${encodeURIComponent(feeHeadId)}`
                : '/finance/fee-structure-assign'
            }
            target="_blank"
            rel="noopener"
          >
            Review Fee Assignments
          </Button>
        )}
        {structures.canView && (
          <Button
            size="small"
            href="/finance/settings/create-fee-structure"
            target="_blank"
            rel="noopener"
          >
            Review Fee Structures
          </Button>
        )}
      </Stack>
    </Alert>
  );
}
