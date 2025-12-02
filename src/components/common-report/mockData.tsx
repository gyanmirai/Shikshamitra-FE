import type { UserStats, ReportItem, ReportCategory, ReportSubCategory } from './types';

export const CATEGORIES: ReportCategory[] = [
  { id: 'student', name: 'Student Reports', icon: 'ph:student-fill' },
  { id: 'staff', name: 'Staff Reports', icon: 'ph:users-three-fill' },
  { id: 'fees', name: 'Fee Reports', icon: 'ph:currency-inr-bold' },
  { id: 'academic', name: 'Academic Reports', icon: 'ph:books-fill' },
  { id: 'attendance', name: 'Attendance', icon: 'ph:calendar-check-fill' },
  { id: 'transport', name: 'Transport', icon: 'ph:bus-fill' },
  { id: 'library', name: 'Library', icon: 'ph:book-open-text-fill' },
];

export const SUB_CATEGORIES: ReportSubCategory[] = [
  {
    id: 'classwise',
    name: 'Classwise Reports',
    categoryId: 'student',
    icon: 'ph:chart-bar-fill',
    description: 'Get a detailed report of student strength across all classes.',
    render: () => <div>sfd</div>,
  },
  {
    id: 'admission',
    name: 'Admission Reports',
    categoryId: 'student',
    icon: 'ph:user-plus-fill',
    description: 'Get a detailed report of student strength across all classes.',
    render: () => <div>sfd</div>,
  },
  {
    id: 'fee_collection',
    name: 'Collection Reports',
    categoryId: 'fees',
    icon: 'ph:receipt-fill',
    description: 'Get a detailed report of student strength across all classes.',
    render: () => <div>sfd</div>,
  },
  {
    id: 'fee_defaulters',
    name: 'Defaulter Reports',
    categoryId: 'fees',
    icon: 'ph:receipt-fill',
    description: 'Get a detailed report of student strength across all classes.',
    render: () => <div>sfd</div>,
  },
  {
    id: 'staff_attendance',
    name: 'Staff Attendance',
    categoryId: 'staff',
    icon: 'ph:calendar-check-fill',
    description: 'Get a detailed report of student strength across all classes.',
    render: () => <div>sfd</div>,
  },
  {
    id: 'payroll',
    name: 'Payroll',
    categoryId: 'staff',
    icon: 'ph:calendar-check-fill',
    description: 'Get a detailed report of student strength across all classes.',
    render: () => <div>sfd</div>,
  },
];

export const REPORTS: ReportItem[] = [
  {
    id: 'student_strength',
    name: 'Classwise Student Strength',
    description: 'Get a detailed report of student strength across all classes.',
    categoryId: 'student',
    subCategoryId: 'classwise',
    icon: 'ph:chart-bar-fill',
    tags: ['Popular'],
    schema: {
      fields: [
        {
          name: 'academicYear',
          label: 'Academic Year',
          type: 'select',
          options: [
            { label: '2023-2024', value: '2023-2024' },
            { label: '2024-2025', value: '2024-2025' },
          ],
          required: true,
        },
        {
          name: 'class',
          label: 'Class',
          type: 'select',
          options: [
            { label: 'Class 1', value: '1' },
            { label: 'Class 2', value: '2' },
          ],
        },
      ],
    },
  },
  {
    id: 'admission_register',
    name: 'Admission Register',
    description: 'List of all students admitted within a date range.',
    categoryId: 'student',
    subCategoryId: 'admission',
    icon: 'ph:user-plus-fill',
    tags: ['Recommended'],
    schema: {
      fields: [
        { name: 'dateRange', label: 'Date Range', type: 'date-range', required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
        },
      ],
    },
  },
  {
    id: 'fee_collection_daily',
    name: 'Daily Fee Collection',
    description: 'Daily fee collection report with mode of payment breakdown.',
    categoryId: 'fees',
    subCategoryId: 'fee_collection',
    icon: 'ph:receipt-fill',
    tags: ['New'],
    schema: {
      fields: [
        { name: 'date', label: 'Date', type: 'date', required: true },
        {
          name: 'paymentMode',
          label: 'Payment Mode',
          type: 'select',
          options: [
            { label: 'All', value: 'all' },
            { label: 'Cash', value: 'cash' },
            { label: 'Online', value: 'online' },
          ],
        },
      ],
    },
  },
];

export const MOCK_USER_STATS: UserStats = {
  xp: 1250,
  level: 5,
  streak: 3,
  badges: ['Fast Generator', 'Weekly Insights'],
  reportsGenerated: 42,
};
