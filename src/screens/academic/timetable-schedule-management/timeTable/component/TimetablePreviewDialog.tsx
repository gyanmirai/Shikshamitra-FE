import type { TimetableBoardProps } from 'src/components/timetable/TimetableBoard';

import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import TimetableBoard from 'src/components/timetable/TimetableBoard';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomDialog from 'src/components/customDialog';
import { Box, IconButton, Typography, DialogContent } from '@mui/material';

interface TimetablePreviewDialogProps
  extends Pick<
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
      maxWidth="lg"
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
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Timetable Preview (Read Only)
          </Typography>
          <CustomTooltip
            arrow
            placement="bottom-start"
            title="Full-screen read-only preview of the complete weekly timetable board."
          >
            <IconButton aria-label="About timetable preview" size="small" color="info" sx={{ p: 0.5 }}>
              <Iconify icon="mdi:information-outline" width={18} />
            </IconButton>
          </CustomTooltip>
        </Box>
      }
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
