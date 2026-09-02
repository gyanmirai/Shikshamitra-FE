import { BoardForm } from './board-setup';
import CustomDialog from '../customDialog';
import { AcademicYearForm } from './academic-year-form';

import type { AcademicYearRecord } from './academic-setup-model';

type AcademicSetupDialogsProps = {
  currentYear?: AcademicYearRecord;
  editYear: AcademicYearRecord | null;
  isYearDialogOpen: boolean;
  isBoardDialogOpen: boolean;
  onCloseYearDialog: () => void;
  onCloseBoardDialog: () => void;
};

export const AcademicSetupDialogs = ({
  currentYear,
  editYear,
  isYearDialogOpen,
  isBoardDialogOpen,
  onCloseYearDialog,
  onCloseBoardDialog,
}: AcademicSetupDialogsProps) => (
  <>
    <CustomDialog
      title={editYear ? `Edit academic year (${editYear.name})` : 'Create academic year'}
      open={isYearDialogOpen}
      handleClose={onCloseYearDialog}
    >
      <AcademicYearForm editData={editYear} onClose={onCloseYearDialog} />
    </CustomDialog>

    <CustomDialog
      title="Add education board"
      open={isBoardDialogOpen}
      handleClose={onCloseBoardDialog}
    >
      {currentYear ? (
        <BoardForm
          academicYearId={currentYear.id}
          handleClose={onCloseBoardDialog}
          editData={null}
        />
      ) : null}
    </CustomDialog>
  </>
);
