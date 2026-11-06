import type { ReportSubCategory } from 'src/components/common-report/types';

import {
  StudentRecordsReportTitleOptions,
  StudentRecordsReportTitle as Report,
} from 'src/enums/studentRecordsReports';

import LegacyReportUnavailable from './components/LegacyReportUnavailable';
import { complianceReportCatalog } from './student-compliance-report-catalog';

export const studentReportCategories = [
  { name: 'Student Lists', id: 'Student Lists', icon: 'mdi:account-multiple-outline' },
  { name: 'Birthday & Dates', id: 'Birthday & Dates', icon: 'mdi:calendar-star-outline' },
  { name: 'Summaries', id: 'Summaries', icon: 'mdi:chart-box-outline' },
  { name: 'Demographics', id: 'Demographics', icon: 'mdi:account-group-outline' },
  { name: 'Compliance', id: 'Compliance', icon: 'mdi:file-check-outline' },
];

const legacyReports: [Report, string, string, string][] = [
  [
    Report.AddressLabelReport,
    'Student Lists',
    'address-label-report',
    'Generate address labels for students',
  ],
  [
    Report.StudentContactList,
    'Student Lists',
    'student-contact-list',
    'View student contact information',
  ],
  [
    Report.StudentDetailInformationForm,
    'Student Lists',
    'student-detail-information-form',
    'Detailed student information form',
  ],
  [
    Report.StudentListDivisionWiseSerialNo,
    'Student Lists',
    'student-list-division-wise',
    'Student list organized by division serial numbers',
  ],
  [
    Report.StudentListIDNoWise,
    'Student Lists',
    'student-list-id-wise',
    'Student list sorted by ID numbers',
  ],
  [Report.StudentRegister, 'Student Lists', 'student-register', 'Official student register'],
  [
    Report.StudentRegisterWithAddress,
    'Student Lists',
    'student-register-with-address',
    'Student register including addresses',
  ],
  [
    Report.NewStudentAdmissionReport,
    'Student Lists',
    'new-student-admission-report',
    'Report of newly admitted students',
  ],
  [
    Report.AllBirthdayWishListReport,
    'Birthday & Dates',
    'all-birthday-wish-list',
    'Complete birthday wish list for students',
  ],
  [
    Report.LeftStudentList,
    'Birthday & Dates',
    'left-student-list',
    'List of students who have left',
  ],
  [
    Report.StudentStrengthDivisionWiseSummary,
    'Summaries',
    'student-strength-division-wise',
    'Student strength summary by division',
  ],
  [Report.AgeWiseSummary, 'Summaries', 'age-wise-summary', 'Student distribution by age'],
  [Report.AgewiseList, 'Summaries', 'agewise-list', 'Detailed age-wise student list'],
  [
    Report.GenderwiseStudentStrengthSummary,
    'Summaries',
    'genderwise-student-strength',
    'Student strength by gender',
  ],
  [Report.GenderwiseSummary, 'Summaries', 'genderwise-summary', 'Gender distribution summary'],
  [
    Report.AdmissionCategorywiseList,
    'Summaries',
    'admission-categorywise-list',
    'Students by admission category',
  ],
  [
    Report.VerifyStudentData,
    'Summaries',
    'verify-student-data',
    'Verify and validate student data',
  ],
  [
    Report.ReligionWiseReport,
    'Demographics',
    'religion-wise-report',
    'Student distribution by religion',
  ],
  [
    Report.CasteCategoryWiseReport,
    'Demographics',
    'caste-category-wise-report',
    'Student distribution by caste category',
  ],
  [
    Report.BloodGroupWiseReport,
    'Demographics',
    'blood-group-wise-report',
    'Student distribution by blood group',
  ],
  [
    Report.MotherTongueWiseReport,
    'Demographics',
    'mother-tongue-wise-report',
    'Student distribution by mother tongue',
  ],
];

export function studentReportCatalog(onGenerated: () => void): ReportSubCategory[] {
  return [
    ...legacyReports.map(([report, categoryId, id, description]) => ({
      name:
        report === Report.AgewiseList
          ? 'Agewise List'
          : StudentRecordsReportTitleOptions.find((option) => option.name === report)!.label,
      id,
      description,
      categoryId,
      icon: '',
      render: () => <LegacyReportUnavailable />,
    })),
    ...complianceReportCatalog(onGenerated),
  ];
}
