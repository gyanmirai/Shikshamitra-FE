interface NavigationItem {
  _action?: string;
  isGranted?: boolean;
  isEditGranted?: boolean;
  isDeleteGranted?: boolean;
  isAddGranted?: boolean;
  submodule?: NavigationItem[];
  children?: NavigationItem[];
  permission?: string;
}

interface Permission {
  name: string;
  isGranted: boolean;
}

interface PermissionGroup {
  permissions: Permission[];
}

const firstDataset = [
  {
    title: 'Student',
    path: '/student/enrollment/dashboard',
    icon: {
      type: {},
      key: null,
      ref: null,
      props: {
        src: 'http://localhost:3000/assets/icons/navbar/ic-student.svg',
      },
      _owner: null,
      _store: {},
    },
    _action: 'student',
    submodule: [
      {
        title: 'Student Enrollment',
        path: '',
        _action: 'student-enrollment',
        permission: 'Permission:StudentEnrollment',
        children: [
          {
            title: 'Dashboard',
            path: '/student/enrollment/dashboard',
            _action: 'student-enrollment-dashboard',
            permission: 'Permission:StudentEnrollment.Dashboard',
          },
          {
            title: 'Inquiry',
            path: '/student/enrollment/inquiry',
            _action: 'student-enrollment-inquiry',
            permission: 'Permission:StudentEnrollment.Inquiry',
          },
          {
            title: 'Registration Form Issued',
            path: '/student/enrollment/registration-form',
            _action: 'student-enrollment-registration-form',
            permission: 'Permission:StudentEnrollment.RegistrationForm',
          },
          {
            title: 'Registration',
            path: '/student/enrollment/registration',
            _action: 'student-enrollment-registration',
            permission: 'Permission:StudentEnrollment.Registration',
          },
          {
            title: 'Entrance Exam',
            path: '/student/enrollment/entrance-exam',
            _action: 'student-enrollment-entrance-exam',
            permission: 'Permission:StudentEnrollment.EntranceExam',
          },
          {
            title: 'Follow-up',
            path: '/student/enrollment/follow-up',
            _action: 'student-enrollment-follow-up',
            permission: 'Permission:StudentEnrollment.FollowUp',
          },
          {
            title: 'Admission',
            path: '/student/enrollment/admission',
            _action: 'student-enrollment-admission',
            permission: 'Permission:StudentEnrollment.Admission',
          },
          {
            title: 'Admission Fees',
            path: '/student/enrollment/admission-fees',
            _action: 'student-enrollment-admission-fees',
            permission: 'Permission:StudentEnrollment.AdmissionFees',
          },
          {
            title: 'Reports',
            path: '/student/enrollment/reports',
            _action: 'student-enrollment-reports',
            permission: 'Permission:StudentEnrollment.Reports',
          },
          {
            title: 'Setting',
            path: '/student/enrollment/setting',
            _action: 'student-enrollment-setting',
            permission: 'Permission:StudentEnrollment.Setting',
          },
        ],
      },
      {
        title: 'Student Records',
        path: '',
        _action: 'student-records',
        children: [
          {
            title: 'Dashboard',
            path: '/student/overview',
            _action: 'student-overview',
          },
          {
            title: 'Student List',
            path: '/student/profile',
            _action: 'student-profile',
          },
          {
            title: 'Student I-Card',
            path: '/student/student-i-card',
            _action: 'student-i-card',
            disabled: true,
            caption: 'Coming Soon',
          },
          {
            title: 'Student Management',
            path: '/student/management',
            _action: 'student-management',
          },
          {
            title: 'Certificates',
            path: '/student/certificates',
            _action: 'student-certificates',
          },
          {
            title: 'Reports',
            path: '/student/reports',
            _action: 'student-reports',
          },
          {
            title: 'Setting',
            path: '/student/setting',
            _action: 'student-setting',
          },
        ],
      },
      {
        title: 'Attendance',
        path: '',
        _action: 'student-attendance',
        children: [
          {
            title: 'Dashboard',
            path: '/student/attendance/dashboard',
            _action: 'student-attendance-dashboard',
          },
          {
            title: 'Mark Attendance',
            path: '/student/attendance/take-attendance',
            _action: 'student-attendance-take-attendance',
          },
          {
            title: 'Leave & Absent',
            path: '/student/attendance/leave-absent',
            _action: 'student-attendance-leave-absent',
          },
          {
            title: 'Notifications History',
            path: '/student/attendance/notification',
            _action: 'student-attendance-notification',
            disabled: true,
            caption: 'Coming Soon',
          },
          {
            title: 'Reports',
            path: '/student/attendance/reports',
            _action: 'student-attendance-reports',
          },
          {
            title: 'Setting',
            path: '/student/attendance/setting',
            _action: 'student-attendance-setting',
          },
        ],
      },
    ],
  },
];

const secondDataset = [
  {
    name: 'Student',
    displayName: 'Permission:Student',
    displayNameKey: 'Permission:Student',
    displayNameResource: 'ShikshaMitra',
    permissions: [
      {
        name: 'Student.Enrollment',
        displayName: 'Permission:StudentEnrollment',
        parentName: null,
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Dashboard',
        displayName: 'Permission:StudentEnrollment.Dashboard',
        parentName: 'Student.Enrollment',
        isGranted: true,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Dashboard.Create',
        displayName: 'Permission:StudentEnrollment.Dashboard.Create',
        parentName: 'Student.Enrollment.Dashboard',
        isGranted: true,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Dashboard.Edit',
        displayName: 'Permission:StudentEnrollment.Dashboard.Edit',
        parentName: 'Student.Enrollment.Dashboard',
        isGranted: true,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Dashboard.Delete',
        displayName: 'Permission:StudentEnrollment.Dashboard.Delete',
        parentName: 'Student.Enrollment.Dashboard',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Inquiry',
        displayName: 'Permission:StudentEnrollment.Inquiry',
        parentName: 'Student.Enrollment',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Inquiry.Create',
        displayName: 'Permission:StudentEnrollment.Inquiry.Create',
        parentName: 'Student.Enrollment.Inquiry',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Inquiry.Edit',
        displayName: 'Permission:StudentEnrollment.Inquiry.Edit',
        parentName: 'Student.Enrollment.Inquiry',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Inquiry.Delete',
        displayName: 'Permission:StudentEnrollment.Inquiry.Delete',
        parentName: 'Student.Enrollment.Inquiry',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.RegistrationForm',
        displayName: 'Permission:StudentEnrollment.RegistrationForm',
        parentName: 'Student.Enrollment',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.RegistrationForm.Create',
        displayName: 'Permission:StudentEnrollment.RegistrationForm.Create',
        parentName: 'Student.Enrollment.RegistrationForm',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.RegistrationForm.Edit',
        displayName: 'Permission:StudentEnrollment.RegistrationForm.Edit',
        parentName: 'Student.Enrollment.RegistrationForm',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.RegistrationForm.Delete',
        displayName: 'Permission:StudentEnrollment.RegistrationForm.Delete',
        parentName: 'Student.Enrollment.RegistrationForm',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Registration',
        displayName: 'Permission:StudentEnrollment.Registration',
        parentName: 'Student.Enrollment',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Registration.Create',
        displayName: 'Permission:StudentEnrollment.Registration.Create',
        parentName: 'Student.Enrollment.Registration',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Registration.Edit',
        displayName: 'Permission:StudentEnrollment.Registration.Edit',
        parentName: 'Student.Enrollment.Registration',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Registration.Delete',
        displayName: 'Permission:StudentEnrollment.Registration.Delete',
        parentName: 'Student.Enrollment.Registration',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.EntranceExam',
        displayName: 'Permission:StudentEnrollment.EntranceExam',
        parentName: 'Student.Enrollment',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.EntranceExam.Create',
        displayName: 'Permission:StudentEnrollment.EntranceExam.Create',
        parentName: 'Student.Enrollment.EntranceExam',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.EntranceExam.Edit',
        displayName: 'Permission:StudentEnrollment.EntranceExam.Edit',
        parentName: 'Student.Enrollment.EntranceExam',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.EntranceExam.Delete',
        displayName: 'Permission:StudentEnrollment.EntranceExam.Delete',
        parentName: 'Student.Enrollment.EntranceExam',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.FollowUp',
        displayName: 'Permission:StudentEnrollment.FollowUp',
        parentName: 'Student.Enrollment',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.FollowUp.Create',
        displayName: 'Permission:StudentEnrollment.FollowUp.Create',
        parentName: 'Student.Enrollment.FollowUp',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.FollowUp.Edit',
        displayName: 'Permission:StudentEnrollment.FollowUp.Edit',
        parentName: 'Student.Enrollment.FollowUp',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.FollowUp.Delete',
        displayName: 'Permission:StudentEnrollment.FollowUp.Delete',
        parentName: 'Student.Enrollment.FollowUp',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Admission',
        displayName: 'Permission:StudentEnrollment.Admission',
        parentName: 'Student.Enrollment',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Admission.Create',
        displayName: 'Permission:StudentEnrollment.Admission.Create',
        parentName: 'Student.Enrollment.Admission',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Admission.Edit',
        displayName: 'Permission:StudentEnrollment.Admission.Edit',
        parentName: 'Student.Enrollment.Admission',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Admission.Delete',
        displayName: 'Permission:StudentEnrollment.Admission.Delete',
        parentName: 'Student.Enrollment.Admission',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.AdmissionFees',
        displayName: 'Permission:StudentEnrollment.AdmissionFees',
        parentName: 'Student.Enrollment',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.AdmissionFees.Create',
        displayName: 'Permission:StudentEnrollment.AdmissionFees.Create',
        parentName: 'Student.Enrollment.AdmissionFees',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.AdmissionFees.Edit',
        displayName: 'Permission:StudentEnrollment.AdmissionFees.Edit',
        parentName: 'Student.Enrollment.AdmissionFees',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.AdmissionFees.Delete',
        displayName: 'Permission:StudentEnrollment.AdmissionFees.Delete',
        parentName: 'Student.Enrollment.AdmissionFees',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Reports',
        displayName: 'Permission:StudentEnrollment.Reports',
        parentName: 'Student.Enrollment',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Reports.Create',
        displayName: 'Permission:StudentEnrollment.Reports.Create',
        parentName: 'Student.Enrollment.Reports',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Reports.Edit',
        displayName: 'Permission:StudentEnrollment.Reports.Edit',
        parentName: 'Student.Enrollment.Reports',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Reports.Delete',
        displayName: 'Permission:StudentEnrollment.Reports.Delete',
        parentName: 'Student.Enrollment.Reports',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Setting',
        displayName: 'Permission:StudentEnrollment.Setting',
        parentName: 'Student.Enrollment',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Setting.Create',
        displayName: 'Permission:StudentEnrollment.Setting.Create',
        parentName: 'Student.Enrollment.Setting',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Setting.Edit',
        displayName: 'Permission:StudentEnrollment.Setting.Edit',
        parentName: 'Student.Enrollment.Setting',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
      {
        name: 'Student.Enrollment.Setting.Delete',
        displayName: 'Permission:StudentEnrollment.Setting.Delete',
        parentName: 'Student.Enrollment.Setting',
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      },
    ],
  },
];

const convertedMenu = (originalDataSet: NavigationItem[], abpData: PermissionGroup[]) => {
  originalDataSet.forEach((originalItem) => {
    const findPermission = (data: PermissionGroup[], key: string = ''): any => {
      const findItem = data.reduce((acc, curr: any) => {
        const searchTerm = `${originalItem?.permission}${key ? `.${key}` : ''}`;

        if (curr.displayName === searchTerm) {
          acc = { ...curr };
        }
        if (curr?.permissions?.length) {
          acc = { ...findPermission(curr.permissions, key) };
        }
        return acc;
      }, {});
      return findItem;
    };

    const getPermission = findPermission(abpData);
    const editPermission = findPermission(abpData, 'Edit');
    const deletePermission = findPermission(abpData, 'Delete');
    const createPermission = findPermission(abpData, 'Create');

    originalItem.isGranted = !!getPermission?.isGranted;
    originalItem.isAddGranted = !!createPermission?.isGranted;
    originalItem.isEditGranted = !!editPermission?.isGranted;
    originalItem.isDeleteGranted = !!deletePermission?.isGranted;

    if (originalItem?.submodule?.length) {
      convertedMenu(originalItem.submodule, abpData);
    }
    if (originalItem?.children?.length) {
      convertedMenu(originalItem.children, abpData);
    }
  });
};
convertedMenu(firstDataset, secondDataset);
console.log('🚀 ~ firstDataset:', firstDataset);
