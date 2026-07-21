import { academicType } from 'src/redux/tagTypes';

import { academicApi } from './academicApi';

type AcademicDashboardReadinessItem = {
  key: string;
  title: string;
  status: 'complete' | 'partial' | 'missing' | string;
  severity: 'success' | 'critical' | 'warning' | 'info' | string;
  completedCount: number;
  totalCount: number;
  missingCount: number;
  description: string;
  actionLabel: string;
  actionHref: string;
};

type AcademicDashboardActionCenterItem = {
  id: string;
  title: string;
  summary: string;
  severity: 'critical' | 'warning' | 'info' | string;
  source: string;
  count: number;
  actionLabel: string;
  actionHref: string;
};

type AcademicDashboardDataHealthItem = {
  key: string;
  title: string;
  status: 'healthy' | 'needsAttention' | string;
  severity: 'success' | 'warning' | 'critical' | 'info' | string;
  detail: string;
  actionHref: string;
};

export type AdminAcademicDashboardData = {
  curriculumCompletion: number;
  totalStudents: number;
  totalTeachers: number;
  assignedSubjects: number;
  electiveGroups: number;
  pendingElectiveGroups: number;
  timetableRate: number;
  activeTimetables: number;
  pendingTimetables: number;
  conflictsCount: number;
  readinessRate: number;
  pendingGradeEntries: number;
  pendingEvaluations: number;
  upcomingExams: number;
  insights: Array<{
    title: string;
    summary: string;
    severity: 'critical' | 'warning' | 'info';
    source: string;
    actionLabel: string;
    actionHref: string;
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    actor: string;
    time: string;
    type: 'create' | 'update' | 'schedule' | 'configure' | 'publish' | 'delete';
  }>;
  configurationStatus: Array<{
    label: string;
    status: 'configured' | 'active' | 'missing' | 'complete' | 'partial';
    path: string;
    icon: string;
  }>;
  operationalStatus: Array<{
    module: string;
    status: string;
    level: 'success' | 'warning' | 'error' | 'info';
    progress: number;
    icon: string;
  }>;
  readinessItems?: AcademicDashboardReadinessItem[];
  actionCenterItems?: AcademicDashboardActionCenterItem[];
  dataHealthItems?: AcademicDashboardDataHealthItem[];
  subjectPassFailChart: {
    subjectNames: string[];
    passCounts: number[];
    failCounts: number[];
  };
  plannedVsActualProgressChart: {
    intervals: string[];
    plannedPercentages: number[];
    actualPercentages: number[];
  };
};

export type PrincipalAcademicDashboardData = {
  schoolPerformanceIndex: number;
  schoolAverageGrade: string;
  averageAttendance: string;
  totalTeachers: number;
  totalStudents: number;
  performanceIndexHelper: string;
  syllabusProgress: number;
  mathProgress: number;
  mathTarget: number;
  scienceProgress: number;
  scienceTarget: number;
  englishProgress: number;
  englishTarget: number;
  readinessRate: number;
  evaluationLag: string;
  upcomingExams: number;
  insights: Array<{
    title: string;
    summary: string;
    severity: 'critical' | 'warning' | 'info';
    source: string;
    actionLabel: string;
    actionHref?: string;
  }>;
  readinessItems?: AcademicDashboardReadinessItem[];
  actionCenterItems?: AcademicDashboardActionCenterItem[];
  dataHealthItems?: AcademicDashboardDataHealthItem[];
  chapterCompletionChart: {
    standardNames: string[];
    completionPercentages: number[];
  };
  subjectPassFailChart: {
    subjectNames: string[];
    passCounts: number[];
    failCounts: number[];
  };
  teacherPerformanceComparison: Array<{
    teacherName: string;
    averageScore: number;
  }>;
  upcomingExamsList: Array<{
    id: string;
    examName: string;
    date: string;
    time: string;
    className: string;
    roomName: string;
  }>;
  topPerformers: Array<{
    id: string;
    name: string;
    avatarUrl: string;
    totalMarks: number;
  }>;
  bottomPerformers: Array<{
    id: string;
    name: string;
    avatarUrl: string;
    totalMarks: number;
  }>;
};

export type TeacherAcademicDashboardData = {
  attendanceRate: number;
  todaysLecturesCount: number;
  lecturesDone: number;
  lecturesOngoing: number;
  pendingAttendanceClasses: number;
  assignedClassesCount: number;
  assignedSubjectsCount: number;
  systemAlertsCount: number;
  evaluationsRate: number;
  pendingHomework: number;
  pendingEvaluations: number;
  upcomingExams: number;
  studentsAttentionCount: number;
  insights: Array<{
    title: string;
    summary: string;
    severity: 'critical' | 'warning' | 'info';
    source: string;
    actionLabel: string;
    actionHref?: string;
  }>;
  readinessItems?: AcademicDashboardReadinessItem[];
  actionCenterItems?: AcademicDashboardActionCenterItem[];
  dataHealthItems?: AcademicDashboardDataHealthItem[];
  todaySchedule: Array<{
    id: string;
    time: string;
    subject: string;
    classDivision: string;
    room: string;
    status: 'completed' | 'ongoing' | 'upcoming';
    attendanceMarked: boolean;
  }>;
  pendingTasks: Array<{
    id: string;
    title: string;
    count: number;
    priority: 'high' | 'medium' | 'low';
    action: string;
    icon: string;
    path: string;
  }>;
  studentsAttention: Array<{
    id: string;
    name: string;
    classDivision: string;
    attendance: number;
    performance: number;
    warning: string;
    avatarUrl: string;
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    actor: string;
    time: string;
    type:
      | 'create'
      | 'update'
      | 'schedule'
      | 'configure'
      | 'publish'
      | 'delete'
      | 'info'
      | 'success'
      | 'secondary';
  }>;
  homeworkStatus: {
    completed: number;
    pending: number;
    graded: number;
  };
  upcomingExamsList: Array<{
    id: string;
    examName: string;
    date: string;
    time: string;
    className: string;
    roomName: string;
  }>;
  performanceDistribution: {
    excellent: number;
    good: number;
    average: number;
    needsImprovement: number;
  };
  chapterProgressChart: {
    standardNames: string[];
    completionPercentages: number[];
  };
};

const mockAdminData: AdminAcademicDashboardData = {
  curriculumCompletion: 75,
  totalStudents: 1248,
  totalTeachers: 64,
  assignedSubjects: 38,
  electiveGroups: 4,
  pendingElectiveGroups: 2,
  timetableRate: 78,
  activeTimetables: 18,
  pendingTimetables: 3,
  conflictsCount: 1,
  readinessRate: 68,
  pendingGradeEntries: 18,
  pendingEvaluations: 24,
  upcomingExams: 6,
  insights: [
    {
      title: 'Timetable conflict detected in Class 9B',
      summary: 'Teacher Aarav Sharma is double-booked during Period 3 on Monday.',
      severity: 'critical',
      source: 'timetable',
      actionLabel: 'Resolve Overlap',
      actionHref: '/academic/newTimetable',
    },
    {
      title: 'Grade entries overdue for 3 subjects',
      summary: 'Class 10A Mathematics & Science UT grades have not been compiled.',
      severity: 'critical',
      source: 'grades',
      actionLabel: 'Record Marks',
      actionHref: '/academic/gradeEntry',
    },
    {
      title: 'Syllabus coverage lag in Grade 10',
      summary: 'Class 10A Science is 45% behind the planned curriculum schedule.',
      severity: 'warning',
      source: 'curriculum',
      actionLabel: 'View Chapter Tracker',
      actionHref: '/academic/courseSubjects',
    },
    {
      title: 'Exam seating plan not generated',
      summary: 'Mid-term seating layouts need allocation before tomorrow afternoon.',
      severity: 'warning',
      source: 'exams',
      actionLabel: 'Generate Seats',
      actionHref: '/academic/seatallocation',
    },
  ],
  recentActivities: [
    {
      id: 'ac1',
      action: "Subject 'Physics Advanced' created",
      actor: 'Admin',
      time: '2 hours ago',
      type: 'create',
    },
    {
      id: 'ac2',
      action: 'Timetable updated for Class 10B — added Saturday sessions',
      actor: 'Admin',
      time: '4 hours ago',
      type: 'update',
    },
    {
      id: 'ac3',
      action: 'Final Exam scheduled for Class 10A, 10B, 10C',
      actor: 'Admin',
      time: '1 day ago',
      type: 'schedule',
    },
    {
      id: 'ac4',
      action: 'Grade scaling changed for Grade 9 — updated pass percentage',
      actor: 'Admin',
      time: '1 day ago',
      type: 'configure',
    },
    {
      id: 'ac5',
      action: "Elective group 'Science Stream' created with 3 subjects",
      actor: 'Admin',
      time: '2 days ago',
      type: 'create',
    },
  ],
  configurationStatus: [
    {
      label: 'Curriculum',
      status: 'active',
      path: '/academic/curriculumSubjects',
      icon: 'fluent:book-24-regular',
    },
    {
      label: 'Subjects Creation',
      status: 'configured',
      path: '/academic/curriculumSetting',
      icon: 'solar:book-bold',
    },
    {
      label: 'Elective Groups',
      status: 'missing',
      path: '/academic/curriculumSetting',
      icon: 'solar:users-group-two-rounded-bold',
    },
    {
      label: 'Timetable',
      status: 'active',
      path: '/academic/newTimetable',
      icon: 'solar:calendar-bold',
    },
    {
      label: 'Weekly Lectures',
      status: 'configured',
      path: '/academic/timetableSettings',
      icon: 'solar:calendar-date-bold',
    },
    {
      label: 'Lecture Slots',
      status: 'missing',
      path: '/academic/timetableSettings',
      icon: 'solar:calendar-date-bold',
    },
  ],
  operationalStatus: [
    {
      module: 'Subject Allocation',
      status: '92% Complete',
      level: 'success',
      progress: 92,
      icon: 'fluent:book-24-regular',
    },
    {
      module: 'Timetable Setup',
      status: 'Pending for 2 Classes',
      level: 'warning',
      progress: 78,
      icon: 'solar:calendar-bold',
    },
    {
      module: 'Grade Entry',
      status: '18 Pending',
      level: 'error',
      progress: 55,
      icon: 'solar:document-text-bold',
    },
    {
      module: 'Homework Evaluation',
      status: '24 Pending',
      level: 'warning',
      progress: 62,
      icon: 'solar:notebook-bold',
    },
  ],
  subjectPassFailChart: {
    subjectNames: ['Math', 'Science', 'English', 'History', 'Geography', 'Art'],
    passCounts: [85, 78, 92, 88, 90, 95],
    failCounts: [15, 22, 8, 12, 10, 5],
  },
  plannedVsActualProgressChart: {
    intervals: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    plannedPercentages: [15, 30, 45, 60, 75, 90],
    actualPercentages: [12, 28, 40, 58, 72, 85],
  },
};

const mockPrincipalData: PrincipalAcademicDashboardData = {
  schoolPerformanceIndex: 82,
  schoolAverageGrade: 'B+',
  averageAttendance: '94.2%',
  totalTeachers: 64,
  totalStudents: 1248,
  performanceIndexHelper: 'Improvement over last term',
  syllabusProgress: 82,
  mathProgress: 88,
  mathTarget: 90,
  scienceProgress: 70,
  scienceTarget: 85,
  englishProgress: 90,
  englishTarget: 92,
  readinessRate: 91,
  evaluationLag: '2.4 days',
  upcomingExams: 6,
  insights: [
    {
      title: 'Grade 10 Science syllabus lag detected',
      summary: 'Science syllabus progress is 15% behind the scheduled target timeline.',
      severity: 'warning',
      source: 'curriculum',
      actionLabel: 'Syllabus Tracker',
      actionHref: '/academic/courseSubjects',
    },
    {
      title: '24 homework evaluations pending review',
      summary: 'Grade 9 and 10 teachers have pending assessments older than 5 days.',
      severity: 'warning',
      source: 'evaluations',
      actionLabel: 'Assessment portal',
      actionHref: '/academic/gradingAndFeedback',
    },
    {
      title: 'Math exam passing ratio drop',
      summary: 'Class 10B Mathematics UT passing ratio has dropped to 89% vs average 94%.',
      severity: 'info',
      source: 'performance',
      actionLabel: 'Report list',
      actionHref: '/academic/curriculumReports',
    },
  ],
  chapterCompletionChart: {
    standardNames: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    completionPercentages: [88, 85, 78, 92, 80, 75],
  },
  subjectPassFailChart: {
    subjectNames: ['Math', 'Science', 'English', 'History', 'Geography', 'Art'],
    passCounts: [85, 78, 92, 88, 90, 95],
    failCounts: [15, 22, 8, 12, 10, 5],
  },
  teacherPerformanceComparison: [
    { teacherName: 'Aarav Sharma', averageScore: 88 },
    { teacherName: 'Neha Gupta', averageScore: 72 },
    { teacherName: 'Prakash Raj', averageScore: 94 },
    { teacherName: 'Sita Raman', averageScore: 80 },
  ],
  upcomingExamsList: [
    {
      id: 'ex1',
      examName: 'UT-2 Mathematics',
      date: '23 Jun 2026',
      time: '09:00 AM',
      className: 'Class 10-A',
      roomName: 'Room 204',
    },
    {
      id: 'ex2',
      examName: 'Mid-Term Physics',
      date: '25 Jun 2026',
      time: '10:30 AM',
      className: 'Class 11-B',
      roomName: 'Physics Lab',
    },
  ],
  topPerformers: [
    {
      id: 'tp1',
      name: 'Priya Patel',
      avatarUrl: '/static/images/avatars/avatar_1.png',
      totalMarks: 98,
    },
    {
      id: 'tp2',
      name: 'Raj Kumar',
      avatarUrl: '/static/images/avatars/avatar_2.png',
      totalMarks: 95,
    },
    {
      id: 'tp3',
      name: 'Meera Singh',
      avatarUrl: '/static/images/avatars/avatar_3.png',
      totalMarks: 92,
    },
  ],
  bottomPerformers: [
    {
      id: 'bp1',
      name: 'Rohan Singh',
      avatarUrl: '/static/images/avatars/avatar_4.png',
      totalMarks: 45,
    },
    {
      id: 'bp2',
      name: 'Sneha Kumari',
      avatarUrl: '/static/images/avatars/avatar_5.png',
      totalMarks: 42,
    },
    {
      id: 'bp3',
      name: 'Vijay Pratap',
      avatarUrl: '/static/images/avatars/avatar_6.png',
      totalMarks: 38,
    },
  ],
};

const mockTeacherData: TeacherAcademicDashboardData = {
  attendanceRate: 80,
  todaysLecturesCount: 6,
  lecturesDone: 2,
  lecturesOngoing: 1,
  pendingAttendanceClasses: 2,
  assignedClassesCount: 3,
  assignedSubjectsCount: 5,
  systemAlertsCount: 3,
  evaluationsRate: 85,
  pendingHomework: 7,
  pendingEvaluations: 12,
  upcomingExams: 4,
  studentsAttentionCount: 9,
  insights: [
    {
      title: 'Kartik Rao (10-B) attention needed',
      summary: 'Low attendance (68%) combined with weak exam performance (39%).',
      severity: 'critical',
      source: 'student-att',
      actionLabel: 'View Profile',
    },
    {
      title: 'Mahi Desai (9-A) missing homeworks',
      summary: '4 consecutive homework tasks are overdue and missing submissions.',
      severity: 'critical',
      source: 'homework-miss',
      actionLabel: 'Open portal',
      actionHref: '/academic/gradingAndFeedback',
    },
    {
      title: 'Arjun Menon (11-A) performance decline',
      summary: 'Assessment average marks declined by 12% over the last week.',
      severity: 'warning',
      source: 'perf-decline',
      actionLabel: 'Details',
    },
    {
      title: 'Syllabus behind planned schedule',
      summary: 'Class 11 Mathematics syllabus tracker is behind target milestones.',
      severity: 'warning',
      source: 'syll-delay',
      actionLabel: 'Update chapters',
      actionHref: '/academic/courseSubjects',
    },
  ],
  todaySchedule: [
    {
      id: 'lec-1',
      time: '08:00 - 08:45',
      subject: 'Mathematics',
      classDivision: 'Class 10 - A',
      room: 'Room 204',
      status: 'completed',
      attendanceMarked: true,
    },
    {
      id: 'lec-2',
      time: '09:00 - 09:45',
      subject: 'Mathematics',
      classDivision: 'Class 11 - B',
      room: 'Lab 2',
      status: 'ongoing',
      attendanceMarked: false,
    },
    {
      id: 'lec-3',
      time: '10:00 - 10:45',
      subject: 'Mathematics',
      classDivision: 'Class 9 - A',
      room: 'Room 110',
      status: 'upcoming',
      attendanceMarked: false,
    },
    {
      id: 'lec-4',
      time: '11:20 - 12:05',
      subject: 'Mathematics',
      classDivision: 'Class 10 - B',
      room: 'Room 307',
      status: 'upcoming',
      attendanceMarked: false,
    },
  ],
  pendingTasks: [
    {
      id: 'p2',
      title: 'Homework Reviews Pending',
      count: 12,
      priority: 'high',
      action: 'Review',
      icon: 'solar:notebook-bold',
      path: '/academic/gradingAndFeedback',
    },
    {
      id: 'p3',
      title: 'Grade Entries Pending',
      count: 3,
      priority: 'medium',
      action: 'Enter',
      icon: 'solar:document-text-bold',
      path: '/academic/gradeEntry',
    },
    {
      id: 'p4',
      title: 'Assignment Evaluations Pending',
      count: 5,
      priority: 'medium',
      action: 'Evaluate',
      icon: 'solar:clipboard-check-bold',
      path: '/academic/gradingAndFeedback',
    },
    {
      id: 'p5',
      title: 'Syllabus Progress Behind Plan',
      count: 2,
      priority: 'low',
      action: 'Update',
      icon: 'solar:checklist-minimalistic-bold',
      path: '/academic/courseSubjects',
    },
  ],
  studentsAttention: [
    {
      id: 'sa-1',
      name: 'Kartik Rao',
      classDivision: '10-B',
      attendance: 68,
      performance: 39,
      warning: 'Low attendance + weak performance',
      avatarUrl: '/static/images/avatars/avatar_7.png',
    },
    {
      id: 'sa-2',
      name: 'Mahi Desai',
      classDivision: '9-A',
      attendance: 73,
      performance: 44,
      warning: 'Missing homework submissions',
      avatarUrl: '/static/images/avatars/avatar_8.png',
    },
    {
      id: 'sa-3',
      name: 'Arjun Menon',
      classDivision: '11-A',
      attendance: 76,
      performance: 42,
      warning: 'Performance decline this week',
      avatarUrl: '/static/images/avatars/avatar_9.png',
    },
  ],
  recentActivities: [
    {
      id: 'ra-1',
      action: 'Homework uploaded for Class 10-A (Algebra Set 4)',
      actor: 'Teacher',
      time: '15 min ago',
      type: 'info',
    },
    {
      id: 'ra-2',
      action: 'Attendance marked for Class 11-B',
      actor: 'Teacher',
      time: '35 min ago',
      type: 'success',
    },
    {
      id: 'ra-3',
      action: 'Assignment created: Physics Numerical Practice',
      actor: 'Teacher',
      time: '1 hour ago',
      type: 'secondary',
    },
  ],
  homeworkStatus: {
    completed: 45,
    pending: 15,
    graded: 30,
  },
  upcomingExamsList: [
    {
      id: 'ex3',
      examName: 'Unit Test Math',
      date: '23 Jun 2026',
      time: '08:00 AM',
      className: 'Class 10-A',
      roomName: 'Room 204',
    },
    {
      id: 'ex4',
      examName: 'Oral Math Test',
      date: '24 Jun 2026',
      time: '10:00 AM',
      className: 'Class 9-A',
      roomName: 'Room 110',
    },
  ],
  performanceDistribution: {
    excellent: 30,
    good: 40,
    average: 20,
    needsImprovement: 10,
  },
  chapterProgressChart: {
    standardNames: ['Numbers', 'Algebra', 'Geometry', 'Data and Statistics', 'Problem Solving'],
    completionPercentages: [90, 20, 80, 65, 45],
  },
};

const useAcademicDashboardMockFallback =
  process.env.NEXT_PUBLIC_USE_ACADEMIC_DASHBOARD_MOCKS === 'true';

export const academicDashboardApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAcademicDashboard: builder.query<AdminAcademicDashboardData, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: '/academic/dashboard/admin',
          method: 'GET',
        });
        if (result.error) {
          return useAcademicDashboardMockFallback
            ? { data: mockAdminData }
            : { error: result.error };
        }
        return { data: result.data as AdminAcademicDashboardData };
      },
      providesTags: [academicType.timetableManagement, academicType.academicReport],
    }),

    getPrincipalAcademicDashboard: builder.query<PrincipalAcademicDashboardData, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: '/academic/dashboard/principal',
          method: 'GET',
        });
        if (result.error) {
          return useAcademicDashboardMockFallback
            ? { data: mockPrincipalData }
            : { error: result.error };
        }
        return { data: result.data as PrincipalAcademicDashboardData };
      },
      providesTags: [academicType.timetableManagement, academicType.academicReport],
    }),

    getTeacherAcademicDashboard: builder.query<TeacherAcademicDashboardData, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: '/academic/dashboard/teacher',
          method: 'GET',
        });
        if (result.error) {
          return useAcademicDashboardMockFallback
            ? { data: mockTeacherData }
            : { error: result.error };
        }
        return { data: result.data as TeacherAcademicDashboardData };
      },
      providesTags: [academicType.timetableManagement, academicType.academicReport],
    }),

    refreshAcademicDashboard: builder.mutation<void, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: '/academic/dashboard/refresh',
          method: 'POST',
        });
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data as void };
      },
      invalidatesTags: [academicType.timetableManagement, academicType.academicReport],
    }),

    getSubjectPassFailChartFiltered: builder.query<
      { passed: number; failed: number },
      { standardId: string; divisionId: string; examName: string }
    >({
      async queryFn(args, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: `/academic/dashboard/exam-pass-fail?standardId=${args.standardId}&divisionId=${args.divisionId}&examName=${encodeURIComponent(args.examName)}`,
          method: 'GET',
        });
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data as { passed: number; failed: number } };
      },
    }),

    getChapterCompletionChartFiltered: builder.query<
      {
        subjects: Array<{
          subjectName: string;
          completedChapters: number;
          pendingChapters: number;
        }>;
      },
      { standardId: string; divisionId: string }
    >({
      async queryFn(args, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: `/academic/dashboard/chapter-completion?standardId=${args.standardId}&divisionId=${args.divisionId}`,
          method: 'GET',
        });
        if (result.error) {
          return { error: result.error };
        }
        return {
          data: result.data as {
            subjects: Array<{
              subjectName: string;
              completedChapters: number;
              pendingChapters: number;
            }>;
          },
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminAcademicDashboardQuery,
  useGetPrincipalAcademicDashboardQuery,
  useGetTeacherAcademicDashboardQuery,
  useRefreshAcademicDashboardMutation,
  useGetSubjectPassFailChartFilteredQuery,
  useGetChapterCompletionChartFilteredQuery,
} = academicDashboardApi;
