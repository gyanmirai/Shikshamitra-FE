'use client';

import type { RootState } from 'src/redux/store';
import type { Standards } from 'src/types/school';

import { Box, Stack, Divider } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { INITIAL_COPY_VALUES } from './subject-copy-dialog/constants';
import { SubjectCopyInfoTooltip } from './subject-copy-dialog/SubjectCopySectionHeading';
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
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const form = useSubjectCopyForm(open);
  const classes = useEligibleCopyClasses({ open, allClass, sourceClassId });
  const subjects = useCopySubjects({
    open,
    copyFromClass: form.copyFromClass,
    selectionMode: form.selectionMode,
  });

  const handleCancel = () => {
    if (!isChanges || window.confirm('Are you sure you want to leave this page?')) {
      dispatch(setIsChanges(false));
      onClose();
    }
  };

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
  const currentValues = { ...form.currentValues, selectedSubjectIds: subjects.selectedSubjectIds };

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
        handleClose={onClose}
        maxWidth="md"
        title={
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
            Copy subject allocations
            <SubjectCopyInfoTooltip
              label="Copy subject allocations"
              description="Choose a source class, review what will be copied, then confirm the destination."
            />
          </Box>
        }
        paperProps={{ sx: { backgroundImage: 'none' } }}
      >
        <BackPopUpChecked initialValues={INITIAL_COPY_VALUES} currentValues={currentValues}>
          <DialogScrollContent>
            <Stack spacing={3}>
              <SubjectCopyClassFlow
                sourceClass={form.copyFromClass}
                targetClassName={sourceClassName}
                eligibleClasses={classes.eligibleClasses}
                isLoading={classes.isFilteringClasses}
                hasError={classes.filterError}
                onRetry={classes.retry}
                onChange={handleSourceChange}
              />
              <Divider />
              <SubjectCopySubjectScope
                selectionMode={form.selectionMode}
                onModeChange={handleModeChange}
                sourceClassSelected={Boolean(form.copyFromClass)}
                subjects={subjects}
              />
              <Divider />
              <SubjectCopyOptions form={form} />
            </Stack>
          </DialogScrollContent>

          <SubjectCopyActions
            isLoading={isLoading}
            canSubmit={canSubmit}
            onCancel={handleCancel}
            onReview={() => form.setConfirmOpen(true)}
          />
        </BackPopUpChecked>
      </CustomDialog>

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
