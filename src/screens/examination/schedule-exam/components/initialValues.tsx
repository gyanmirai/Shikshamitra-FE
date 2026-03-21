import dayjs from 'dayjs';

export const basicDetailsInitialValues = (editData: any = null) => ({
  examType: editData?.examTypeId || '',
  examName: editData?.examName || '',
  className: editData?.standardId || '',
  divisions: editData?.divisionIds || [],
  selectedSubjects: editData?.subjectIds || [],
  description: editData?.description || '',
});

export const scheduleInitialValues = (editData: any = null) => ({
  subjects:
    editData?.subjects?.map((sub: any) => ({
      ...sub,
      subjectId: sub.subjectId,
      examDate: sub.examDate ? dayjs(sub.examDate) : null,
      startTime: sub.startTime ? dayjs(`2000-01-01T${sub.startTime}`) : null,
      endTime: sub.endTime ? dayjs(`2000-01-01T${sub.endTime}`) : null,
      totalMarks: sub.totalMarks || 0,
      passingMarks: sub.passingMarks || 0,
      notes: sub.notes || '',
    })) || [],
});

export const roomAssignmentInitialValues = (editData: any = null, formikSubjects: any[] = []) => {
  const reconstructedRoomDetails: Record<string, any> = {};
  const isRoomAssign = editData?.isRoomAssigned ?? false;

  if (editData?.subjects) {
    editData.subjects.forEach((sub: any) => {
      const subjectInForm = formikSubjects.find(
        (s: any) => s.id === sub.subjectId || s.subjectId === sub.subjectId
      );
      const subjectName = subjectInForm?.subjectName || sub.subjectId;

      const divisionsMap: Record<string, any> = {};
      sub.divisions.forEach((div: any) => {
        divisionsMap[div.divisionId] = {
          roomIds: div.roomIds,
          capacity: div.capacity,
        };
      });

      reconstructedRoomDetails[subjectName] = {
        divisions: divisionsMap,
        examDate: sub.examDate ? dayjs(sub.examDate) : null,
      };
    });
  }

  // If roomDetails is empty but we have subjects, initialize it with empty structures
  if (Object.keys(reconstructedRoomDetails).length === 0 && formikSubjects.length > 0) {
    formikSubjects.forEach((sub: any) => {
      reconstructedRoomDetails[sub.subjectName] = {
        divisions: {},
        examDate: sub.examDate,
      };
    });
  }

  return {
    isRoomAssign,
    roomDetails: reconstructedRoomDetails,
  };
};
