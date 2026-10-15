import type { FormikHelpers } from 'formik';

import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useAddSubjectAssignmentMutation,
  useUpdateSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import type { ISubjectAssignmentFormValues } from '../type';

export function useSubjectAssignmentSubmit({
  academicMediumId,
  assignmentId,
  onClose,
}: {
  academicMediumId: string;
  assignmentId?: string;
  onClose: (data: null, isSuccess: boolean) => void;
}) {
  const [addAssignment, { isLoading: isAddLoading }] = useAddSubjectAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdateLoading }] = useUpdateSubjectAssignmentMutation();

  const onSubmit = async (
    values: ISubjectAssignmentFormValues,
    helpers: FormikHelpers<ISubjectAssignmentFormValues>
  ) => {
    helpers.setStatus(undefined);
    const body = {
      classId: values.classId,
      status: values.status,
      subjects: values.subjects.map((subject) => ({
        subjectId: subject.subjectId,
        electiveGroupId: subject.electiveGroupId || null,
        subjectCode: subject.subjectCode,
        documents: subject.documents || [],
        learningGoal: subject.learningGoal,
        prerequisites: subject.prerequisites,
        description: subject.description,
        teacherIds: subject.teacherIds,
      })),
    };

    try {
      if (assignmentId) {
        await updateAssignment({ assignmentId, body }).unwrap();
      } else {
        await addAssignment({ academicMediumId, body }).unwrap();
      }
      const action = assignmentId
        ? 'updated successfully'
        : values.status === 0
          ? 'saved as draft'
          : 'published successfully';
      shikshaMitraToast.success({
        message: `Subject Assignment ${action} for ${values.className}`,
      });
      onClose(null, true);
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      const payload = (
        error as {
          data?: { data?: { SubjectId?: string }; error?: { data?: { SubjectId?: string } } };
        }
      ).data;
      const subjectId = payload?.data?.SubjectId ?? payload?.error?.data?.SubjectId;
      if (
        problem.errorCode === 'Academic:Curriculum:020005' &&
        values.subjects.some((subject) => subject.subjectId === subjectId)
      ) {
        helpers.setStatus({ subjectId, teacherError: problem.detail });
      } else if (problem.errorCode === 'UserScope:AccessDenied') {
        helpers.setStatus({ classError: problem.detail });
      } else {
        shikshaMitraToast.error({ message: problem.detail });
      }
    }
  };

  return { onSubmit, isAddLoading, isUpdateLoading };
}
