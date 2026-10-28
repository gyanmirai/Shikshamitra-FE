const responses = {
  '/api/academic/dashboard/context': {
    defaultMode: 'admin',
    availableModes: ['admin'],
    supportsSectionDashboard: true,
    displayName: 'Synthetic Academic administrator',
    classAssignments: [],
  },
  '/api/academic/dashboard/admin/curriculum': {
    curriculumCompletion: 0,
    totalStudents: 0,
    totalTeachers: 0,
    assignedSubjects: 0,
    electiveGroups: 0,
    pendingElectiveGroups: 0,
    insights: [],
    configurationStatus: [],
  },
  '/api/academic/dashboard/admin/timetable': {
    timetableRate: 0,
    activeTimetables: 0,
    pendingTimetables: 0,
    conflictsCount: 0,
    insights: [],
    configurationStatus: [],
    operationalStatus: [],
  },
  '/api/academic/dashboard/admin/assessment': {
    readinessRate: 0,
    pendingGradeEntries: 0,
    pendingEvaluations: 0,
    upcomingExams: 0,
    insights: [],
    operationalStatus: [],
  },
  '/api/academic/dashboard/admin/analytics': {
    recentActivities: [],
    subjectPassFailChart: { subjectNames: [], passCounts: [], failCounts: [] },
    classSyllabusProgressChart: { classNames: [], completionPercentages: [] },
  },
};

export function handleDashboard(url, method, send, fixture) {
  const data = responses[url.pathname];
  if (method !== 'GET' || !data) return false;
  fixture.state.requests.push({ method, path: url.pathname });
  send(200, data);
  return true;
}
