import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useBulkSaveMarksMutation,
  useValidateMarksMutation,
  useSaveDraftMarksMutation,
} from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';

import { buildMarksPayload } from '../marks-payload';

import type { IExamMarkItem } from '../type';
import type { GradeEntryReviewValidationResult } from '../types/grade-entry-review';

interface ReviewOptions {
  examId: string;
  divisionId: string;
  subjectId: string;
  rows: IExamMarkItem[];
  isDirty: boolean;
  onSaveStateChange: (state: 'saving' | 'saved' | 'failed') => void;
  onSaved: () => void;
}

const emptyValidation: GradeEntryReviewValidationResult = {
  isValid: false,
  blockers: [],
  warnings: [],
};

export function useGradeEntryReview({
  examId,
  divisionId,
  subjectId,
  rows,
  isDirty,
  onSaveStateChange,
  onSaved,
}: ReviewOptions) {
  const dialog = useBoolean();
  const [isPreparing, setIsPreparing] = useState(false);
  const [preparationError, setPreparationError] = useState('');
  const [validation, setValidation] = useState(emptyValidation);
  const request = useRef({ generation: 0, pending: false, needsDraft: false });
  const [bulkSave] = useBulkSaveMarksMutation();
  const [saveDraft] = useSaveDraftMarksMutation();
  const [validate] = useValidateMarksMutation();
  const closeDialog = dialog.onFalse;

  useEffect(() => {
    const activeRequest = request.current;
    closeDialog();
    setIsPreparing(false);
    setPreparationError('');
    setValidation(emptyValidation);
    return () => {
      // Ignore old responses if the selected exam changes or this screen unmounts.
      activeRequest.generation += 1;
      activeRequest.pending = false;
      activeRequest.needsDraft = false;
    };
  }, [examId, divisionId, subjectId, closeDialog]);

  const prepareReview = async () => {
    if (request.current.pending) return;
    if (!examId || !divisionId || !subjectId) {
      shikshaMitraToast.error({
        message: 'Select an exam, subject and division before reviewing marks.',
      });
      return;
    }
    request.current.pending = true;
    const { generation } = request.current;
    const isCurrent = () => generation === request.current.generation;
    const target = { examId, divisionId, subjectId };
    setValidation(emptyValidation);
    setPreparationError('');
    setIsPreparing(true);
    // Inputs commit onChange. Opening immediately moves focus and gives feedback before any request.
    dialog.onTrue();
    let saved = !isDirty && !request.current.needsDraft;
    try {
      if (!saved) {
        onSaveStateChange('saving');
        if (isDirty) {
          await bulkSave({
            examId,
            body: { subjectId, divisionId, rows: buildMarksPayload(rows) },
          }).unwrap();
          if (!isCurrent()) return;
          // A table refetch may clear dirty state before the draft request succeeds.
          request.current.needsDraft = true;
        }
        await saveDraft(target).unwrap();
        if (!isCurrent()) return;
        request.current.needsDraft = false;
        saved = true;
        onSaved();
        onSaveStateChange('saved');
      }
      const response = await validate(target).unwrap();
      if (!isCurrent()) return;
      const result = response?.data ?? response;
      if (
        typeof result?.isValid !== 'boolean' ||
        !Array.isArray(result.blockers) ||
        !Array.isArray(result.warnings)
      ) {
        throw new Error('Review validation could not be confirmed. Retry the review.');
      }
      setValidation({ ...result, isValid: result.isValid && result.blockers.length === 0 });
      if (!result.isValid || result.blockers.length > 0) {
        shikshaMitraToast.error({
          message: 'Resolve the validation blockers shown in the review before submitting marks.',
        });
      }
    } catch (error) {
      if (!isCurrent()) return;
      const { detail } = parseApiProblemDetail(error);
      const message = `Could not prepare the grade review. ${detail || 'Retry the review to continue.'}`;
      setPreparationError(message);
      if (!saved) onSaveStateChange('failed');
      shikshaMitraToast.error({ message });
    } finally {
      if (isCurrent()) {
        request.current.pending = false;
        setIsPreparing(false);
      }
    }
  };

  const closeReview = () => {
    if (!request.current.pending) closeDialog();
  };

  return {
    open: dialog.value,
    prepareReview,
    closeReview,
    isPreparing,
    preparationError,
    validation,
    canSubmit:
      !isPreparing && !preparationError && validation.isValid && validation.blockers.length === 0,
  };
}
