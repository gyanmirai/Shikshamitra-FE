import { GlobalIcons } from 'src/utils/icons';
import { DialogActions } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CancelButton from 'src/components/cancel-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import ViewTimetableComp from './viewTimetableComp';

import type { IExamFormValues } from '../type';

type Props = {
  open: boolean;
  examData: IExamFormValues | null;
  onClose: () => void;
};

export default function ExamTimetableDialog({ open, examData, onClose }: Props) {
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={examData?.examName ? `${examData.examName} Timetable` : 'Exam Timetable'}
      titleInfo="Review the saved subject schedule, school-local times and marks for this exam."
      maxWidth="lg"
      paperProps={{ sx: { maxWidth: 1040 } }}
      hasForm={false}
      guardUnsavedChanges={false}
    >
      <DialogScrollContent>
        <ViewTimetableComp examData={examData} />
      </DialogScrollContent>
      <DialogActions>
        <CancelButton
          buttonText="Close"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
        />
      </DialogActions>
    </CustomDialog>
  );
}
