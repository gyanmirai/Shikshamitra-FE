type CreateSubstitutionActionOptions<TSegment, TResult> = {
  segments: TSegment[];
  create: (segment: TSegment) => Promise<TResult>;
  resetMutation: () => void;
};

type TeacherReference = {
  teacherId?: string | null;
  teacherName?: string | null;
};

export const resolveAvailabilityTeacherSelection = (
  availabilityTeacher: TeacherReference,
  lectureTeacher: TeacherReference
) => ({
  originalTeacherId: availabilityTeacher.teacherId || lectureTeacher.teacherId || '',
  originalTeacherName:
    availabilityTeacher.teacherName?.trim() || lectureTeacher.teacherName?.trim() || '',
});

export const createSubstitutionSegments = async <TSegment, TResult>({
  segments,
  create,
  resetMutation,
}: CreateSubstitutionActionOptions<TSegment, TResult>): Promise<TResult[]> => {
  try {
    return await Promise.all(segments.map(create));
  } finally {
    resetMutation();
  }
};
