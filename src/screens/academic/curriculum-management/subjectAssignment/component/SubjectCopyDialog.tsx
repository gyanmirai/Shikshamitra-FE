'use client';

import type { Standards } from 'src/types/school';

import { Stack } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useAcademicDiscardGuard } from 'src/screens/academic/components/useAcademicDiscardGuard';

import { INITIAL_COPY_VALUES } from './subject-copy-dialog/constants';
import { useCopySubjects } from './subject-copy-dialog/useCopySubjects';
import { SubjectCopyActions } from './subject-copy-dialog/SubjectCopyActions';
import { SubjectCopyOptions } from './subject-copy-dialog/SubjectCopyOptions';
import { useSubjectCopyForm } from './subject-copy-dialog/useSubjectCopyForm';
import { SubjectCopyClassFlow } from './subject-copy-dialog/SubjectCopyClassFlow';
import { useEligibleCopyClasses } from './subject-copy-dialog/useEligibleCopyClasses';
import { SubjectCopySubjectScope } from './subject-copy-dialog/SubjectCopySubjectScope';
import { SubjectCopyConfirmDialog } from './subject-copy-dialog/SubjectCopyConfirmDialog';

import type { CopySubjectPayload, SubjectCopyDialogProps } from './subject-copy-dialog/types';

export type { CopySubjectPayload } from './subject-copy-dialog/types';

export default function SubjectCopyDialog(props: SubjectCopyDialogProps) {
  const { open, isLoading, allClass, sourceClassId, sourceClassName, onClose, onConfirm } = props;
  const dispatch = useDispatch();
  const form = useSubjectCopyForm(open);
  const classes = useEligibleCopyClasses({ open, allClass, sourceClassId });
  const subjects = useCopySubjects({
    open,
    copyFromClass: form.copyFromClass,
    selectionMode: form.selectionMode,
  });

  const handleConfirm = async () => {
    if (!form.copyFromClass) return;
    const payload: CopySubjectPayload = {
      sourceClassId: String(form.copyFromClass.id),
      targetClassId: sourceClassId,
      subjectIds: form.selectionMode === 'ALL' ? null : subjects.selectedSubjectIds,
      includeTeachers: form.includeTeachers,
      includeDocuments: form.includeDocuments,
      conflictStrategy: form.conflictStrategy,
      targetStatus: 0,
    };
    try {
      await onConfirm(payload);
      form.setConfirmOpen(false);
      dispatch(setIsChanges(false));
    } catch {
      // The parent mutation handler owns user-facing error feedback.
    }
  };

  const canSubmit =
    Boolean(form.copyFromClass) &&
    (form.selectionMode === 'ALL' || subjects.selectedSubjectIds.length > 0);
  const currentValues = {
    copyFromClass: form.copyFromClass,
    selectionMode: form.selectionMode,
    selectedSubjectIds: subjects.selectedSubjectIds,
    includeDocuments: form.includeDocuments,
    includeTeachers: form.includeTeachers,
    conflictStrategy: form.conflictStrategy,
  };
  const isDirty = JSON.stringify(INITIAL_COPY_VALUES) !== JSON.stringify(currentValues);
  const discardGuard = useAcademicDiscardGuard(open && isDirty, isLoading);
  const requestClose = () => {
    if (isLoading) return;
    discardGuard.requestNavigation(() => {
      dispatch(setIsChanges(false));
      onClose();
    });
  };

  const handleSourceChange = (value: Standards | null) => {
    form.setCopyFromClass(value);
    subjects.resetSelection();
  };

  const handleModeChange = (value: 'ALL' | 'SPECIFIC') => {
    form.setSelectionMode(value);
    subjects.resetSelection();
  };

  return (
    <>
      <CustomDialog
        open={open}
        handleClose={requestClose}
        maxWidth="md"
        title="Copy Subject Allocations"
        titleInfo="Choose a source class, review what will be copied, then confirm the destination."
        guardUnsavedChanges={false}
        disableClose={isLoading}
        paperProps={{ sx: { backgroundImage: 'none' } }}
      >
        <BackPopUpChecked initialValues={INITIAL_COPY_VALUES} currentValues={currentValues}>
          <DialogScrollContent>
            <Stack spacing={2}>
              <SubjectCopyClassFlow
                sourceClass={form.copyFromClass}
                targetClassName={sourceClassName}
                eligibleClasses={classes.eligibleClasses}
                isLoading={classes.isFilteringClasses}
                hasError={classes.filterError}
                onRetry={classes.retry}
                onChange={handleSourceChange}
              />
              <SubjectCopySubjectScope
                selectionMode={form.selectionMode}
                onModeChange={handleModeChange}
                sourceClassSelected={Boolean(form.copyFromClass)}
                subjects={subjects}
              />
              <SubjectCopyOptions form={form} />
            </Stack>
          </DialogScrollContent>

          <SubjectCopyActions
            isLoading={isLoading}
            canSubmit={canSubmit}
            onCancel={requestClose}
            onReview={() => form.setConfirmOpen(true)}
          />
        </BackPopUpChecked>
      </CustomDialog>

      {discardGuard.confirmation}

      <SubjectCopyConfirmDialog
        open={form.confirmOpen}
        isLoading={isLoading}
        sourceClassName={form.copyFromClass?.name}
        targetClassName={sourceClassName}
        selectionMode={form.selectionMode}
        selectedSubjects={subjects.selectedSubjectsList}
        includeDocuments={form.includeDocuments}
        includeTeachers={form.includeTeachers}
        conflictStrategy={form.conflictStrategy}
        onClose={() => form.setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
