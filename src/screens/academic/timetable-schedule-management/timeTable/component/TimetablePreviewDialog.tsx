import type { TimetableBoardProps } from 'src/components/timetable/TimetableBoard';

import { alpha } from '@mui/material/styles';
import { DialogContent } from '@mui/material';
import CustomDialog from 'src/components/customDialog';
import TimetableBoard from 'src/components/timetable/TimetableBoard';

interface TimetablePreviewDialogProps extends Pick<
  TimetableBoardProps,
  | 'slots'
  | 'subjects'
  | 'selectedClass'
  | 'selectedDivision'
  | 'standardId'
  | 'divisionId'
  | 'timetableStatus'
> {
  open: boolean;
  onClose: () => void;
}

/** Read-only timetable preview isolated from the editable board behind it. */
export function TimetablePreviewDialog({
  open,
  onClose,
  slots,
  subjects,
  selectedClass,
  selectedDivision,
  standardId,
  divisionId,
  timetableStatus,
}: TimetablePreviewDialogProps) {
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="xl"
      hasForm={false}
      paperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          isolation: 'isolate',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.6),
          },
        },
      }}
      title="Timetable Preview"
      titleInfo="Review the complete weekly timetable without changing its assignments."
    >
      <DialogContent
        data-testid="timetable-preview-surface"
        sx={{ height: '70vh', p: 0, bgcolor: 'background.paper' }}
      >
        <TimetableBoard
          slots={slots}
          onChange={() => {}}
          subjects={subjects}
          readOnly
          previewMode
          selectedClass={selectedClass}
          selectedDivision={selectedDivision}
          standardId={standardId}
          divisionId={divisionId}
          timetableStatus={timetableStatus}
        />
      </DialogContent>
    </CustomDialog>
  );
}
