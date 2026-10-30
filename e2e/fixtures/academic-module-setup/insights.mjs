import { point, series, insightKeys, populatedSections } from './insights-data.mjs';
export { insightsPermissions } from './insights-permissions.mjs';

export function insightsResponse(options = {}, studentId) {
  const role = options.role ?? 'admin';
  let sections = options.populated
    ? populatedSections()
    : insightKeys.map((key) => ({
        key,
        status: 'empty',
        summary: 'No records are available in this academic scope.',
        metrics: [],
        series: [],
        items: [],
      }));
  const students =
    role === 'parent'
      ? [
          { id: 'student-one', label: 'Anaya · Class 6 A' },
          { id: 'student-two', label: 'Dev · Class 7 A' },
        ]
      : [];
  if (role === 'parent' || role === 'student') {
    sections =
      students.length > 1 && !studentId
        ? []
        : sections.filter((entry) =>
            ['student360', 'tasks', 'exams', 'curriculum', 'calendar', 'timetable'].includes(
              entry.key
            )
          );
    const attendance = sections.find((entry) => entry.key === 'student360');
    if (attendance) {
      const attendancePercentage = studentId === 'student-two' ? 90 : 96;
      const score = studentId === 'student-two' ? 75 : 84;
      attendance.metrics = [
        { key: 'attendance', label: 'Attendance', value: attendancePercentage, unit: '%' },
        {
          key: 'exam-score',
          label: 'Average published exam score in preview',
          value: score,
          unit: '%',
        },
      ];
      attendance.series = [
        series('attendance-score', [
          point(studentId ?? 'student-one', studentId === 'student-two' ? 'Dev' : 'Anaya', score, {
            x: attendancePercentage,
            y: score,
          }),
        ]),
      ];
    }
    const timetable = sections.find((entry) => entry.key === 'timetable');
    if (timetable) {
      timetable.metrics = [];
      timetable.series.forEach((entry) =>
        entry.points.forEach((sample) => {
          sample.value = 1;
        })
      );
    }
    const tasks = sections.find((entry) => entry.key === 'tasks');
    if (tasks) tasks.metrics = [{ key: 'tasks', label: 'Visible tasks', value: 23 }];
    const curriculum = sections.find((entry) => entry.key === 'curriculum');
    if (curriculum)
      curriculum.metrics = [{ key: 'chapters', label: 'Published chapters', value: 12 }];
    const exams = sections.find((entry) => entry.key === 'exams');
    if (exams) {
      exams.metrics = [];
      exams.series = [series('stages', [point('published', 'published', 2)])];
      exams.items = [{ id: 'exam-1', label: 'Science unit test', status: 'Scheduled' }];
    }
  }
  return {
    role,
    scopeLabel:
      students.length && !studentId
        ? 'Select a student'
        : `${studentId === 'student-two' ? 'Dev · Class 7 A' : 'Class 6 A'} · Synthetic school`,
    generatedAt: '2026-10-29T10:00:00Z',
    sections,
    students,
  };
}
