import type { IRoomDetails, IDivisionRoomDetail } from '../type';

export interface ReviewSubjectRoomEntry {
  subjectId: string;
  subjectName: string;
  electiveGroupName?: string;
  divisionMap: Record<string, IDivisionRoomDetail>;
}

export function buildReviewSubjectRoomEntries(
  subjects: any[],
  divisionIds: string[],
  roomDetails: IRoomDetails
): ReviewSubjectRoomEntry[] {
  const selectedDivisionIds = new Set(divisionIds.filter((divisionId) => divisionId !== 'all'));
  const entries: ReviewSubjectRoomEntry[] = [];

  const addEntry = (subjectId: string, subjectName: string, electiveGroupName?: string) => {
    const rawDivisionMap = roomDetails?.[subjectId] ?? {};
    const divisionMap: Record<string, IDivisionRoomDetail> = {};

    selectedDivisionIds.forEach((divisionId) => {
      if (rawDivisionMap[divisionId]?.roomIds?.length > 0) {
        divisionMap[divisionId] = rawDivisionMap[divisionId];
      }
    });

    if (Object.keys(divisionMap).length > 0) {
      entries.push({ subjectId, subjectName, electiveGroupName, divisionMap });
    }
  };

  subjects.forEach((subject: any) => {
    if (
      subject?.electiveGroupId &&
      Array.isArray(subject?.subjects) &&
      subject.subjects.length > 0
    ) {
      subject.subjects.forEach((nestedSubject: any) => {
        if (nestedSubject?.isExamSelectionDisabled) return;
        const subjectId = nestedSubject.subjectId || nestedSubject.id;
        if (!subjectId) return;

        const nestedName = nestedSubject.subjectName || nestedSubject.name || '';
        const groupName =
          subject.electiveGroupName ||
          nestedSubject.electiveGroupName ||
          (subject.subjectName !== nestedName ? subject.subjectName : undefined);

        addEntry(subjectId, nestedName || subject.subjectName, groupName);
      });
      return;
    }

    const subjectId = subject?.subjectId || subject?.id;
    if (!subjectId) return;
    addEntry(
      subjectId,
      subject.subjectName || subject.name || '',
      subject.electiveGroupId ? subject.electiveGroupName : undefined
    );
  });

  return entries;
}
