import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  RubricStatus,
  RubricVisibility,
  RubricScoringModel,
  useAddRubricMutation,
  useUpdateRubricMutation,
  usePublishRubricMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { getPublishErrors } from './rubricFormValues';
import { fullValidationSchema } from './rubricValidation';
import { levelNumberAt } from './performance-level-order';
import { parseRubricTags } from './components/RubricTagsField';

import type { RubricConfigFormProps, RubricConfigFormValues } from './types';

export function useRubricTemplateSave(
  { editData, onClose }: RubricConfigFormProps,
  mediumId?: string,
  onSaved?: (values: RubricConfigFormValues) => void
) {
  const savedId = useRef(editData?.id);
  const saving = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<'draft' | 'publish'>('draft');
  const [addRubric, { isLoading: isAddLoading }] = useAddRubricMutation();
  const [updateRubric, { isLoading: isUpdateLoading }] = useUpdateRubricMutation();
  const [publishRubric, { isLoading: isPublishLoading }] = usePublishRubricMutation();

  const submitRubric = async (
    mode: 'draft' | 'publish',
    values: RubricConfigFormValues,
    setIsLoading: (val: boolean) => void
  ) => {
    if (saving.current) return;
    saving.current = true;
    setSubmitting(true);
    setSubmitMode(mode);
    setIsLoading(true);

    try {
      await fullValidationSchema.validate(values);
      const publishErrors = getPublishErrors(values);
      if (mode === 'publish' && publishErrors.length > 0) {
        shikshaMitraToast.error({ message: publishErrors[0] });
        return;
      }

      const validCriteria = values.criteria
        .filter((criterion) => criterion.title.trim())
        .map((criterion, index) => ({
          title: criterion.title.trim(),
          description: criterion.description.trim() || null,
          studentDescription: criterion.studentDescription.trim() || null,
          teacherGuidance: criterion.teacherGuidance.trim() || null,
          isRequired: criterion.isRequired,
          ...(values.scoringModel === RubricScoringModel.PerformanceLevels
            ? {}
            : values.scoringModel === RubricScoringModel.WeightedPercentage
              ? { weight: Number(criterion.weight) }
              : { points: Number(criterion.points) }),
          displayOrder: index + 1,
        }));

      const body = {
        standardId: null,
        subjectId: null,
        academicMediumId: mediumId || null,
        homeworkId: null,
        assignmentId: null,
        homeworkTypeId: null,
        assignmentTypeId: null,
        isTemplate: true,
        appliesToWorkType: Number(values.appliesToWorkType),
        scoringModel: values.scoringModel,
        // Keep existing scopes on edit; new templates belong to the institution.
        visibility: editData?.visibility ?? RubricVisibility.Institution,
        title: values.title.trim(),
        description: values.description.trim() || null,
        evaluationInstructions: values.evaluationInstructions.trim() || null,
        studentInstructions: values.studentInstructions.trim() || null,
        tags: parseRubricTags(values.tags),
        performanceLevels: values.performanceLevels.map((level, index) => ({
          level: levelNumberAt(index, values.performanceLevels.length),
          label: level.label.trim(),
          score: Number(level.score),
          description: level.description.trim() || null,
          studentLabel: level.studentLabel.trim() || null,
        })),
        criteria: validCriteria,
      };

      const saved = savedId.current
        ? await updateRubric({ id: savedId.current, body }).unwrap()
        : await addRubric(body).unwrap();
      savedId.current = saved.id;
      onSaved?.(values);

      if (mode === 'publish' && saved.status !== RubricStatus.Published) {
        await publishRubric(saved.id).unwrap();
        shikshaMitraToast.success({ message: 'Rubric template published successfully.' });
        onClose(null, true);
      } else {
        shikshaMitraToast.success({
          message: editData
            ? 'Rubric template updated as draft.'
            : 'Rubric template saved as draft.',
        });
        if (mode === 'publish') {
          onClose(null, true);
        }
      }
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string; detail?: string } };
      shikshaMitraToast.error({
        message:
          apiError.data?.detail ||
          apiError.data?.message ||
          (error instanceof Error ? error.message : 'Failed to save rubric template.'),
      });
    } finally {
      saving.current = false;
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  const isSaving = submitting || isAddLoading || isUpdateLoading || isPublishLoading;

  return { submitRubric, isSaving, submitMode };
}
