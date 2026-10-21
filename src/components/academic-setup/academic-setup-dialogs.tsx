import type { Board } from 'src/types/school';

import { BoardForm } from './board-form';
import { AcademicYearForm } from './academic-year-form';
import { AcademicFormDialog } from './academic-form-dialog';

import type { AcademicYearRecord } from './academic-setup-model';

type AcademicSetupDialogsProps = {
  currentYear?: AcademicYearRecord;
  boards: Board[];
  editYear: AcademicYearRecord | null;
  isYearDialogOpen: boolean;
  isBoardDialogOpen: boolean;
  onCloseYearDialog: () => void;
  onCloseBoardDialog: () => void;
};

export const AcademicSetupDialogs = ({
  currentYear,
  boards,
  editYear,
  isYearDialogOpen,
  isBoardDialogOpen,
  onCloseYearDialog,
  onCloseBoardDialog,
}: AcademicSetupDialogsProps) => (
  <>
    <AcademicFormDialog
      kind="year"
      title={editYear ? `Edit Academic Year (${editYear.name})` : 'Create Academic Year'}
      open={isYearDialogOpen}
      handleClose={onCloseYearDialog}
    >
      <AcademicYearForm editData={editYear} onClose={onCloseYearDialog} />
    </AcademicFormDialog>

    <AcademicFormDialog
      kind="board"
      title="Add Education Board"
      open={isBoardDialogOpen}
      handleClose={onCloseBoardDialog}
    >
      {currentYear && isBoardDialogOpen ? (
        <BoardForm
          academicYearId={currentYear.id}
          handleClose={onCloseBoardDialog}
          editData={null}
          boards={boards}
          academicYear={currentYear}
        />
      ) : null}
    </AcademicFormDialog>
  </>
);
