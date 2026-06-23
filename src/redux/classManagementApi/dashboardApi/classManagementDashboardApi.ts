import { classManagementApi } from '../classManagementApi';

export type ClassManagementDashboardMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  severity: 'success' | 'warning' | 'error' | 'info' | string;
};

export type ClassManagementDashboardAlert = {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | string;
  category: string;
  actionLabel: string;
  actionHref?: string;
};

export type ClassManagementDashboardAction = {
  id: string;
  title: string;
  description: string;
  count: number;
  priority: 'high' | 'medium' | 'low' | string;
  actionLabel: string;
  actionHref: string;
};

export type ClassManagementDashboardProgress = {
  id: string;
  label: string;
  subLabel: string;
  value: number;
  target: number;
  status: 'on-track' | 'watch' | 'behind' | string;
};

export type ClassManagementDashboardClassRisk = {
  id: string;
  className: string;
  divisionName: string;
  students: number;
  capacity: number;
  courseProgress: number;
  classTeacher: string;
  riskLevel: 'high' | 'medium' | 'low' | string;
  riskReason: string;
};

export type ClassManagementDashboardWorkload = {
  id: string;
  teacherName: string;
  classes: number;
  subjects: number;
  loadScore: number;
  status: 'overloaded' | 'balanced' | 'underloaded' | string;
};

export type ClassManagementDashboardData = {
  role: string;
  healthScore: number;
  healthLabel: string;
  metrics: ClassManagementDashboardMetric[];
  alerts: ClassManagementDashboardAlert[];
  actions: ClassManagementDashboardAction[];
  progressItems: ClassManagementDashboardProgress[];
  classRisks: ClassManagementDashboardClassRisk[];
  teacherWorkload: ClassManagementDashboardWorkload[];
  progressTrend: {
    labels: string[];
    planned: number[];
    actual: number[];
  };
};

export const classManagementDashboardApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassManagementDashboard: builder.query<
      ClassManagementDashboardData,
      { role?: string; academicMediumId: string }
    >({
      query: (params) => ({
        url: 'class-management/dashboard',
        method: 'GET',
        params,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetClassManagementDashboardQuery } = classManagementDashboardApi;
