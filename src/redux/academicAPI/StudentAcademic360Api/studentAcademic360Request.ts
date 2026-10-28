export type StudentAcademic360Request = {
  studentId: string;
  tab?: string;
  academicYearId?: string;
  attendanceStartDate?: string;
  attendanceEndDate?: string;
  includeHistorical?: boolean;
  taskSkipCount?: number;
  taskMaxResultCount?: number;
  examSkipCount?: number;
  examMaxResultCount?: number;
  recentTaskCount?: number;
  recentExamCount?: number;
  taskStatusFilter?: string;
  taskSubjectName?: string;
  examStatusFilter?: string;
  examSearchTerm?: string;
  detailPaging?: boolean;
};

export function studentAcademic360Request({
  studentId,
  tab,
  academicYearId,
  attendanceStartDate,
  attendanceEndDate,
  includeHistorical = false,
  taskSkipCount = 0,
  taskMaxResultCount = 20,
  examSkipCount = 0,
  examMaxResultCount = 10,
  recentTaskCount = 10,
  recentExamCount = 5,
  taskStatusFilter,
  taskSubjectName,
  examStatusFilter,
  examSearchTerm,
  detailPaging,
}: StudentAcademic360Request) {
  const params = new URLSearchParams({
    includeHistorical: String(includeHistorical),
    taskSkipCount: String(taskSkipCount),
    taskMaxResultCount: String(taskMaxResultCount),
    examSkipCount: String(examSkipCount),
    examMaxResultCount: String(examMaxResultCount),
    recentTaskCount: String(recentTaskCount),
    recentExamCount: String(recentExamCount),
  });
  if (academicYearId) params.set('academicYearId', academicYearId);
  if (attendanceStartDate) params.set('attendanceStartDate', attendanceStartDate);
  if (attendanceEndDate) params.set('attendanceEndDate', attendanceEndDate);
  if (taskStatusFilter) params.set('taskStatusFilter', taskStatusFilter);
  if (taskSubjectName) params.set('taskSubjectName', taskSubjectName);
  if (examStatusFilter) params.set('examStatusFilter', examStatusFilter);
  if (examSearchTerm) params.set('examSearchTerm', examSearchTerm);
  if (detailPaging) params.set('detailPaging', 'true');
  const tabPath = tab ? `/tabs/${tab}` : '';
  return {
    url: `academics/student-academic-360/${studentId}${tabPath}?${params.toString()}`,
    method: 'GET',
  };
}
