import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';

import { getSubjectMasterStatusLabel } from '../../subjectMasterStatus';

import type { ISubject } from '../type';

interface SubjectLifecycleActionProps {
  canManage: boolean;
  isRestoring: boolean;
  selectedSubject: ISubject | null;
  onArchive?: (subject: ISubject) => void;
  onRestore?: (subject: ISubject) => Promise<boolean>;
  onClose: () => void;
}

export function SubjectLifecycleAction({
  canManage,
  isRestoring,
  selectedSubject,
  onArchive,
  onRestore,
  onClose,
}: SubjectLifecycleActionProps) {
  if (!canManage || !selectedSubject) return null;

  const isArchived = getSubjectMasterStatusLabel(selectedSubject.status) === 'Archived';

  if (isArchived && onRestore) {
    return (
      <Button
        size="small"
        variant="outlined"
        color="success"
        loading={isRestoring}
        startIcon={<Iconify icon="solar:restart-bold" width={15} />}
        onClick={async () => {
          if (await onRestore(selectedSubject)) onClose();
        }}
        sx={{ fontWeight: 600, fontSize: '12px' }}
      >
        Restore Subject
      </Button>
    );
  }

  if (!isArchived && onArchive) {
    return (
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<Iconify icon="solar:archive-bold" width={15} />}
        onClick={() => {
          onClose();
          onArchive(selectedSubject);
        }}
        sx={{ fontWeight: 600, fontSize: '12px' }}
      >
        Archive Subject
      </Button>
    );
  }

  return null;
}
