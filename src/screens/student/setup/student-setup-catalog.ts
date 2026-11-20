import { studentPaths, studentPermissions } from 'src/constants/student-menu';

export const studentSetupStages = [
  { key: 'welcome', title: 'Welcome & prerequisites' },
  { key: 'admissions', title: 'Admission Setup' },
  { key: 'numbering', title: 'Student Numbering' },
  { key: 'records', title: 'Records & Houses' },
  { key: 'workflows', title: 'Student Workflows' },
  { key: 'review', title: 'Review & Finish' },
] as const;

export const studentSetupSettings = [
  { key: 'admission-periods', stage: 'admissions', title: 'Admission Periods',
    description: 'Create or review the admission period and publish its application window.',
    path: studentPaths.enrollment.settings.cycles, permission: studentPermissions.enrollment.settings.cycles },
  { key: 'admission-forms', stage: 'admissions', title: 'Admission Forms',
    description: 'Prepare and publish reusable Inquiry and Registration forms.',
    path: studentPaths.enrollment.settings.forms, permission: studentPermissions.enrollment.settings.forms },
  { key: 'admission-stages', stage: 'admissions', title: 'Admission Stages',
    description: 'Configure and publish the journey, Registration form and required document checks.',
    path: studentPaths.enrollment.settings.workflows, permission: studentPermissions.enrollment.settings.workflows },
  { key: 'admission-offerings', stage: 'admissions', title: 'Admission Offerings',
    description: 'Connect the period, admission type, classes and published journey, then activate the intended offerings.',
    path: studentPaths.enrollment.settings.offerings, permission: studentPermissions.enrollment.settings.offerings },
  { key: 'public-inquiry-links', stage: 'admissions', title: 'Public Inquiry Links',
    description: 'Create a link after a published Inquiry form is attached to an active inquiry offering.',
    path: studentPaths.enrollment.settings.publicInquiryLinks, permission: studentPermissions.enrollment.settings.offerings },
  { key: 'gr-number', stage: 'numbering', title: 'GR Number',
    description: 'Publish the applicable GR series, number format, starting number and optional maximum.',
    path: studentPaths.onboarding.settingsSections.grNumber, permission: studentPermissions.onboarding.settings },
  { key: 'roll-number', stage: 'numbering', title: 'Roll Number',
    description: 'Publish the applicable grouping and ordering rules for Roll assignment.',
    path: studentPaths.onboarding.settingsSections.rollNumber, permission: studentPermissions.onboarding.settings },
  { key: 'houses', stage: 'records', title: 'Houses',
    description: 'Create medium-wise houses if your school uses them. Assign students and leaders later.',
    path: studentPaths.records.houseManagement, permission: studentPermissions.records.houseManagement },
  { key: 'records-policy', stage: 'records', title: 'Records Policies',
    description: 'Review the effective school defaults or published year override. Custom changes are optional.',
    path: studentPaths.records.settingsWorkspace, permission: studentPermissions.records.setting },
] as const;

export type StudentSetupStageKey = typeof studentSetupStages[number]['key'];
export type StudentSetupSettingKey = typeof studentSetupSettings[number]['key'];
export type StudentSetupPosition = { stage: StudentSetupStageKey; setting: StudentSetupSettingKey | null };

export const studentSetupWorkflows = [
  { title: 'Admissions', path: studentPaths.enrollment.inquiries, permission: studentPermissions.enrollment.inquiries,
    description: 'Capture and qualify an inquiry, then continue its configured journey from Pipeline.' },
  { title: 'Pipeline & Applications', path: studentPaths.enrollment.pipeline, permission: studentPermissions.enrollment.applications,
    description: 'Complete the configured Registration, assessment and document checks. Finalization hands the student to Onboarding. Supported special admissions can begin with Registration.' },
  { title: 'Student Setup', path: studentPaths.onboarding.setup, permission: studentPermissions.onboarding.setup,
    description: 'Review the checks, assign Division and GR/Roll numbers, complete applicable fee work and activate enrollment. App Login selects recipients and sends credentials through its existing controls.' },
  { title: 'Student Records', path: studentPaths.records.studentList, permission: studentPermissions.records.studentList,
    description: 'Find activated students and maintain their profiles. Use existing governed workflows for year-end changes and returning students.' },
  { title: 'House Management', path: studentPaths.records.houseManagement, permission: studentPermissions.records.houseManagement,
    description: 'Assign enrolled students to houses and select optional house or division leaders.' },
] as const;
