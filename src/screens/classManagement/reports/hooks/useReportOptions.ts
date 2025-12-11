import { useMemo } from 'react';

// Mock data - Replace with actual Redux API calls when available
const MOCK_CLASSES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];
const MOCK_SECTIONS = ['A', 'B', 'C', 'D'];
const MOCK_TEACHERS = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis'];
const MOCK_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Hindi',
  'Social Studies',
  'Computer Science',
];
const MOCK_ROOMS = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203'];

export const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export const MEDIUM_OPTIONS = ['English', 'Hindi', 'Marathi', 'Gujarati'];

export const SUBJECT_TYPE_OPTIONS = ['Core', 'Elective', 'Optional', 'Extra-Curricular'];

export const ROLE_OPTIONS = ['Class Teacher', 'Co-Teacher', 'Subject Teacher'];

export const MESSAGE_TYPE_OPTIONS = ['Circular', 'Notice', 'Alert', 'Announcement', 'Reminder'];

export const ACTION_TYPE_OPTIONS = ['Create', 'Update', 'Delete', 'Assign', 'Promote', 'Transfer'];

export const ASSET_TYPE_OPTIONS = ['Furniture', 'Electronics', 'Teaching Aids', 'Sports Equipment'];

export const CONDITION_OPTIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

export const ATTENDANCE_STATUS_OPTIONS = ['Present', 'Absent', 'Late'];

export const PROMOTION_STATUS_OPTIONS = ['Promoted', 'Detained', 'Under Review'];

export const REQUEST_STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected', 'Completed'];

export const useReportOptions = () => {
  // TODO: Replace with actual Redux API calls
  // const { data: classData } = useGetClassesQuery({});
  // const { data: sectionData } = useGetSectionsQuery({});
  // const { data: teacherData } = useGetTeachersQuery({});
  // const { data: subjectData } = useGetSubjectsQuery({});

  const classOptions = useMemo(() => MOCK_CLASSES, []);
  const sectionOptions = useMemo(() => MOCK_SECTIONS, []);
  const teacherOptions = useMemo(() => MOCK_TEACHERS, []);
  const subjectOptions = useMemo(() => MOCK_SUBJECTS, []);
  const roomOptions = useMemo(() => MOCK_ROOMS, []);

  return {
    classOptions,
    sectionOptions,
    teacherOptions,
    subjectOptions,
    roomOptions,
    statusOptions: STATUS_OPTIONS,
    mediumOptions: MEDIUM_OPTIONS,
    subjectTypeOptions: SUBJECT_TYPE_OPTIONS,
    roleOptions: ROLE_OPTIONS,
    messageTypeOptions: MESSAGE_TYPE_OPTIONS,
    actionTypeOptions: ACTION_TYPE_OPTIONS,
    assetTypeOptions: ASSET_TYPE_OPTIONS,
    conditionOptions: CONDITION_OPTIONS,
    attendanceStatusOptions: ATTENDANCE_STATUS_OPTIONS,
    promotionStatusOptions: PROMOTION_STATUS_OPTIONS,
    requestStatusOptions: REQUEST_STATUS_OPTIONS,
  };
};
