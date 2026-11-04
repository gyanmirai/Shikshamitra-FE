import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Tooltip, IconButton } from '@mui/material';

import type { StudentElectiveRow } from '../types';

export default function LockedElectiveEditAction({ student, onEdit }: {
  student: StudentElectiveRow;
  onEdit: (student: StudentElectiveRow) => void;
}) {
  return (
    <Tooltip title="Change locked assignment">
      <IconButton aria-label={`Change locked assignment for ${student.studentName}`}
        onClick={() => onEdit(student)} sx={{ minWidth: 44, minHeight: 44 }}>
        <Iconify icon={GlobalIcons.edit} width={20} />
      </IconButton>
    </Tooltip>
  );
}
