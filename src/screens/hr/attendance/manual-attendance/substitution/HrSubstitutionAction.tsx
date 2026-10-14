import { Button } from '@mui/material';

import type { HrSubstitutionEmployee } from './use-hr-substitution';

type Props = {
  employee: HrSubstitutionEmployee;
  dirty: boolean;
  disabled: boolean;
  onArrange: (employee: HrSubstitutionEmployee) => void;
};

export function HrSubstitutionAction({ employee, dirty, disabled, onArrange }: Props) {
  if (
    !employee.isTeaching ||
    employee.isApprovedLeave ||
    !['Absent', 'HalfDay'].includes(employee.status || '')
  )
    return null;
  return (
    <Button
      size="small"
      variant="outlined"
      sx={{ whiteSpace: 'nowrap' }}
      disabled={disabled}
      onClick={() => onArrange(employee)}
      aria-label={`${dirty ? 'Save attendance and arrange' : 'Arrange'} substitution for ${employee.fullName || employee.id}`}
    >
      {dirty ? 'Save attendance & arrange substitution' : 'Arrange substitution'}
    </Button>
  );
}
