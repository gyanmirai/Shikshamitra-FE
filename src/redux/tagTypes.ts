// ===== Academic Calendar API (reducerPath: academicApi) =====
export const academicCalendarType = {
  calendar: 'AcademicCalendar',
  calendarDay: 'AcademicCalendarDay',
  workingHour: 'AcademicCalendarWorkingHour',
  checkDate: 'AcademicCalendarCheckDate',
  impactLog: 'AcademicCalendarImpactLog',
  auditLog: 'AcademicCalendarAuditLog',
  settings: 'AcademicCalendarSettings',
  emergencyClosure: 'AcademicCalendarEmergencyClosure',
} as const;

// ===== Academic API (reducerPath: academicApi) =====
export const academicType = {
  subject: 'Subject',
  division: 'Division',
  standard: 'Standard',
  academicYear: 'AcademicYear',
  medium: 'Medium',
  mediumStage: 'MediumStage',
  courseProgress: 'CourseProgress',
  electiveGroup: 'ElectiveGroup',
  subjectAssignment: 'SubjectAssignment',
  chapter: 'Chapter',
  assignment: 'Assignment',
  assignmentList: 'AssignmentList',
  assignmentDetail: 'AssignmentDetail',
  assignmentSubmissions: 'AssignmentSubmissions',
  assignmentType: 'AssignmentType',
  assignmentTypeList: 'AssignmentTypeList',
  assignmentTypeDetail: 'AssignmentTypeDetail',
  homework: 'Homework',
  homeworkSubmissions: 'HomeworkSubmissions',
  homeworkType: 'HomeworkType',
  learningResource: 'LearningResource',
  assessmentRubric: 'AssessmentRubric',
  rubricEvaluation: 'RubricEvaluation',
  exam: 'Exam',
  curriculumFile: 'CurriculumFile',
  examinationType: 'ExaminationType',
  gradeScaling: 'GradeScaling',
  seatAllocation: 'SeatAllocation',
  recordMarks: 'RecordMarks',
  quiz: 'Quiz',
  weeklyLectureSlot: 'WeeklyLectureSlot',
  lectureSlot: 'LectureSlot',
  timetableManagement: 'TimetableManagement',
  substitutionList: 'SubstitutionList',
  substitutionDashboard: 'SubstitutionDashboard',
  substitutionDuties: 'SubstitutionDuties',
  substitutionAvailability: 'SubstitutionAvailability',
  substitutionCreateMetadata: 'SubstitutionCreateMetadata',
  substitutionLectures: 'SubstitutionLectures',
  substitutionAffectedLectures: 'SubstitutionAffectedLectures',
  substitutionSuggestions: 'SubstitutionSuggestions',
  substitutionDailySheet: 'SubstitutionDailySheet',
  substitutionAnalytics: 'SubstitutionAnalytics',
  academicReport: 'AcademicReport',
  academicReportExport: 'AcademicReportExport',
  examResult: 'ExamResult',
  academic360: 'Academic360',
  questionBank: 'QuestionBank',
  questionPaper: 'QuestionPaper',
  // Lesson Plan / Teacher Diary
  lessonPlan: 'LessonPlan',
  teacherDiary: 'TeacherDiary',
  diaryEvidence: 'DiaryEvidence',
  lessonPlanReview: 'LessonPlanReview',
  missedLesson: 'MissedLesson',
  lessonResource: 'LessonResource',
  lessonPlanSettings: 'LessonPlanSettings',
  lessonPlanAuditLog: 'LessonPlanAuditLog',
  aiLessonSuggestion: 'AiLessonSuggestion',
  lessonPlanReport: 'LessonPlanReport',
  teachingExecutionHealth: 'TeachingExecutionHealth',
  coverageTracker: 'CoverageTracker',
  academicAudit: 'AcademicAudit',
} as const;

// ===== Quiz Management API (reducerPath: quizManagementApi) =====
export const quizManagementType = {
  quiz: 'Quiz',
} as const;

// ===== Homework Type API (reducerPath: homeworkTypeApi) =====
export const homeworkType = {
  homeworkType: 'HomeworkType',
} as const;

// ===== Board API (reducerPath: boardApi) =====
export const boardType = {
  board: 'Board',
} as const;

// ===== Book Reservation API (reducerPath: ReservationBookApi) =====
export const reservationBookType = {
  reservationBook: 'ReservationBook',
} as const;

// ===== Book Category API (reducerPath: BookCategoryApi) =====
export const bookCategoryType = {
  bookCategory: 'BookCategory',
} as const;

// ===== Book Category Options API (reducerPath: BookCategoryOptionsApi) =====
export const bookCategoryOptionsType = {
  bookCategoryOptions: 'BookCategoryOptions',
} as const;

// ===== Book Issued API (reducerPath: BookIssuedApi) =====
export const bookIssuedType = {
  bookIssued: 'BookIssued',
} as const;

// ===== Book Management API (reducerPath: BookManagementApi) =====
export const bookManagementType = {
  bookManagement: 'BookManagement',
} as const;

// ===== Budget API (reducerPath: BudgetApi) =====
export const budgetType = {
  budget: 'Budget',
} as const;

// ===== Budget Sub Category API (reducerPath: BudgetSubCategoryApi) =====
export const budgetSubCategoryType = {
  budgetSubCategoryData: 'BudgetSubCategoryData',
} as const;

// ===== Budget Category API (reducerPath: budgetCategoryApi) =====
export const budgetCategoryType = {
  budgetCategoryData: 'BudgetCategoryData',
} as const;

// ===== Calendar Module API (reducerPath: calendarModuleApi) =====
export const calendarModuleType = {
  employee: 'Employee',
  users: 'Users',
  holiday: 'Holiday',
  holidayType: 'HolidayType',
  eventTypeOptions: 'EventTypeOptions',
  events: 'Events',
  groups: 'Groups',
  groupDetails: 'GroupDetails',
} as const;

// ===== Class API (reducerPath: classApi) =====
export const classType = {
  class: 'Class',
} as const;

// ===== Class Management API (reducerPath: classManagementApi) =====
export const classManagementType = {
  dashboard: 'ClassManagementDashboard',
  class: 'Class',
  division: 'Division',
  standard: 'Standard',
  teacher: 'Teacher',
  student: 'Student',
  room: 'Room',
  timetable: 'Timetable',
  studentElectiveAssignment: 'StudentElectiveAssignment',
  subjectProgress: 'SubjectProgress',
  classTeacherAssignment: 'ClassTeacherAssignment',
  teacherAssignment: 'TeacherAssignment',
} as const;

// ===== Communication API (reducerPath: communicationApi) =====
export const communicationType = {
  classWiseAnnouncement: 'ClassWiseAnnouncement',
  eventAnnouncement: 'EventAnnouncement',
  schoolWiseAnnouncement: 'SchoolWiseAnnouncement',
  holiday: 'Holiday',
  meetingDetails: 'MeetingDetails',
  announcementTypeOptions: 'AnnouncementTypeOptions',
  eventTypeOptions: 'EventTypeOptions',
  holidayTypeOptions: 'HolidayTypeOptions',
  importanceLevelOptions: 'ImportanceLevelOptions',
  deliveryChannelTypeOptions: 'DeliveryChannelTypeOptions',
  notificationTemplates: 'NotificationTemplates',
  notificationHistory: 'NotificationHistory',
  sentNotificationHistory: 'SentNotificationHistory',
  notifications: 'Notifications',
  communicationDashboard: 'CommunicationDashboard',
  communicationProviderSettings: 'CommunicationProviderSettings',
  communicationDeliveryAttempts: 'CommunicationDeliveryAttempts',
  communicationReplies: 'CommunicationReplies',
  communicationUsageLedger: 'CommunicationUsageLedger',
  communicationApprovalRules: 'CommunicationApprovalRules',
} as const;

// ===== Meeting Type Options API (reducerPath: MeetingTypeOptionsApi) =====
export const meetingTypeOptionsType = {
  meetingTypeOptions: 'MeetingTypeOptions',
} as const;

// ===== Survey Type Options API (reducerPath: SurveyTypeOptionsApi) =====
export const surveyTypeOptionsType = {
  surveyTypeOptions: 'SurveyTypeOptions',
} as const;

// ===== Core Subject API (reducerPath: coreSubjectApi) =====
export const coreSubjectType = {
  subject: 'Subject',
} as const;

// ===== Division API (reducerPath: divisionApi) =====
export const divisionType = {
  division: 'Division',
} as const;

// ===== Document API (reducerPath: documentApi) =====
export const documentType = {
  document: 'Document',
} as const;

// ===== Main Dashboard API (reducerPath: api) =====
export const dashboardType = {
  summary: 'DashboardSummary',
} as const;

// ===== Earning Component API (reducerPath: earningComponentApi) =====
export const earningComponentType = {
  earningComponent: 'EarningComponent',
} as const;

// ===== Employee API (reducerPath: employeeApi) =====
export const employeeType = {
  employee: 'Employee',
  employeeApplication: 'Employee-Application',
  hrDashboard: 'HR-Dashboard',
  employeeDocument: 'EmployeeDocument',
  employeeType: 'Employee-Type',
  deductionComponents: 'Deduction-Components',
  employeePayroll: 'Employee-Payroll',
  earningComponents: 'Earning-Components',
  salarySlip: 'Salary-Slip',
  pf: 'PF',
  runPayroll: 'Run-Payroll',
  salaryStructure: 'Salary-Structure',
  employeeDocumentConfig: 'Employee-Document-Config',
  employeeLeavePolicy: 'Employee-Leave-Policy',
  attendanceRule: 'AttendanceRule',
  attendance: 'Attendance',
  attendanceImport: 'Attendance-Import',
  employeeICardTemplate: 'Employee-Icard-Template',
  professionalReview: 'Professional-Review',
  hrReports: 'HR-Reports',
} as const;

// ===== Student Report API (reducerPath: studentReportApi) =====
export const studentReportType = {
  studentReport: 'Student-Report',
  studentReportExport: 'Student-Report-Export',
} as const;

// ===== Entrance Exam API (reducerPath: EntranceExamApi) =====
export const entranceExamType = {
  entranceExam: 'Entrance-Exam',
} as const;

// ===== Event Holiday API (reducerPath: EventHolidayApi) =====
export const eventHolidayType = {
  eventHoliday: 'EventHoliday',
} as const;

// ===== Expense API (reducerPath: ExpenseApi) =====
export const expenseType = {
  expense: 'Expense',
} as const;

// ===== Fee Concession API (reducerPath: FeeConcessionApi) =====
export const feeConcessionType = {
  feeConcession: 'Fee-Concession',
} as const;

// ===== Fee Refund Terms API (reducerPath: FeeRefundTermsApi) =====
export const feeRefundTermsType = {
  refundTermsData: 'refund-terms-data',
} as const;

// ===== Fee Terms API (reducerPath: FeeTermsApi) =====
export const feeTermsType = {
  feeTerms: 'Fee-Terms',
} as const;

// ===== Finance Module API (reducerPath: financeModuleApi) =====
export const financeModuleType = {
  charges: 'Charges',
  studentCharges: 'StudentCharges',
  feeRefund: 'FeeRefund',
  feeAdjustment: 'FeeAdjustment',
  concession: 'Concession',
  concessionRequest: 'ConcessionRequest',
  incomeCategories: 'IncomeCategories',
  bankAccounts: 'BankAccounts',
  concessionType: 'Concession-Type',
  expenseCategory: 'expense-category',
  budgetOptions: 'budget-options',
  receiptBook: 'ReceiptBook',
  feeCategory: 'FeeCategory',
  feeHead: 'FeeHead',
  feeHeadModule: 'FeeHeadModule',
  feeCollection: 'FeeCollection',
  feeDetails: 'FeeDetails',
  expenseDetails: 'ExpenseDetails',
  expenseOptions: 'ExpenseOptions',
  paymentMethodsConfig: 'paymentMethodsConfig',
  incomeTracking: 'IncomeTracking',
  chargeCategory: 'Charge-Category',
  incomeCategoryData: 'incomeCategoryData',
  bankAccount: 'bank-account',
  feeStructure: 'FeeStructure',
  classWiseFeeStructure: 'ClassWiseFeeStructure',
  financeAudit: 'FinanceAudit',
  accountHead: 'AccountHead',
  accountPosting: 'AccountPosting',
  draftPosting: 'DraftPosting',
  payrollPostingConfig: 'PayrollPostingConfig',
} as const;

// ===== Finance Budgets Category API (reducerPath: BudgetsCategoryApi) =====
export const budgetsCategoryType = {
  budgetCategory: 'Budget-Category',
  budgetSubCategory: 'Budget-Sub-Category',
} as const;

// ===== Income API (reducerPath: IncomeApi) =====
export const incomeType = {
  income: 'Income',
  paymentMethodsConfig: 'paymentMethodsConfig',
} as const;

// ===== Income Details API (reducerPath: IncomeDetailsApi) =====
export const incomeDetailsType = {
  incomeDetails: 'IncomeDetails',
} as const;

// ===== Inquiry Preference API (reducerPath: inquiryPreferenceApi) =====
export const inquiryPreferenceType = {
  studentDocumentType: 'Student-Document-Type',
} as const;

// ===== Institute Setup API (reducerPath: instituteSetupApi) =====
export const instituteSetupType = {
  roomTypes: 'RoomTypes',
  rooms: 'Rooms',
  buildings: 'Buildings',
  floors: 'Floors',
  hostels: 'Hostels',
  beds: 'Beds',
  wings: 'Wings',
} as const;

// ===== Invoice API (reducerPath: InvoiceApi) =====
export const invoiceType = {
  invoice: 'Invoice',
} as const;

// ===== Issue Return Form API (reducerPath: IssueReturnFormApi) =====
export const issueReturnFormType = {
  issueReturnForm: 'IssueReturnForm',
} as const;

// ===== Book Condition Options API (reducerPath: BookConditionOptionsApi) =====
export const bookConditionOptionsType = {
  bookConditionOptions: 'BookConditionOptions',
} as const;

// ===== Library Charge Category Options API (reducerPath: LibraryChargeCategoryOptionsApi) =====
export const libraryChargeCategoryOptionsType = {
  libraryChargeCategoryOptions: 'LibraryChargeCategoryOptions',
} as const;

// ===== Library Charge API (reducerPath: LibraryChargeApi) =====
export const libraryChargeType = {
  libraryCharge: 'LibraryCharge',
} as const;

// ===== Library Module API (reducerPath: libraryModuleApi) =====
export const libraryModuleType = {
  books: 'Books',
  copies: 'Copies',
  copyLabels: 'CopyLabels',
  members: 'Members',
  bookCategory: 'BookCategory',
  bookIssue: 'BookIssue',
  bookReturn: 'BookReturn',
  bookReservation: 'BookReservation',
  memberCharges: 'MemberCharges',
  borrowHistory: 'BorrowHistory',
  librarySettings: 'LibrarySettings',
  dashboard: 'LibraryDashboard',
  reports: 'LibraryReports',
  reportExports: 'LibraryReportExports',
  libraryNotifications: 'LibraryNotifications',
  libraryNotificationHistory: 'LibraryNotificationHistory',
} as const;

// ===== Library Settings API (reducerPath: LibrarySettingsApi) =====
export const librarySettingsType = {
  librarySettings: 'LibrarySettings',
} as const;

// ===== Medium API (reducerPath: mediumApi) =====
export const mediumType = {
  medium: 'Medium',
  board: 'Board',
} as const;

// ===== Member Management API (reducerPath: MemberManagementApi) =====
export const memberManagementType = {
  memberManagement: 'MemberManagement',
  memberOptions: 'MemberOptions',
  roleOptions: 'RoleOptions',
  classOptions: 'ClassOptions',
  divisionOptions: 'DivisionOptions',
  studentOptions: 'StudentOptions',
  statusOptions: 'StatusOptions',
  bookCategoryOptions: 'BookCategoryOptions',
  bookTitleOptions: 'BookTitleOptions',
} as const;

// ===== Organization API (reducerPath: organizationApi) =====
export const organizationType = {
  organization: 'Organization',
  academicOrganizationOptions: 'AcademicOrganizationOptions',
} as const;

// ===== Organization Unit API (reducerPath: organizationUnitApi) =====
export const organizationUnitType = {
  organizationUnit: 'OrganizationUnit',
} as const;

// ===== Outstanding Fee API (reducerPath: OutstandingFeeApi) =====
export const outstandingFeeType = {
  outstandingFee: 'Outstanding-Fee',
} as const;

// ===== Payment History API (reducerPath: PaymentHistoryApi) =====
export const paymentHistoryType = {
  paymentHistory: 'Payment-History',
} as const;

// ===== Payment Status Option API (reducerPath: paymentStatusOptionApi) =====
export const paymentStatusOptionType = {
  paymentStatusOption: 'paymentStatusOption',
} as const;

// ===== Payment Term API (reducerPath: PaymentTermApi) =====
export const paymentTermType = {
  paymentTerm: 'Payment-Term',
} as const;

// ===== Finance Policy API (reducerPath: api) =====
export const financePolicyType = {
  financePolicy: 'Finance-Policy',
} as const;

// ===== Payroll Structure API (reducerPath: payrollStructureApi) =====
export const payrollStructureType = {
  payrollStructure: 'PayrollStructure',
  salaryTemplate: 'SalaryTemplate',
  statutoryScheme: 'StatutoryScheme',
} as const;

// ===== Professional Tax API (reducerPath: ProfessionalApi) =====
export const professionalType = {
  pf: 'PF',
} as const;

// ===== Receipt API (reducerPath: ReceiptApi) =====
export const receiptType = {
  receipt: 'Receipt',
} as const;

// ===== Reconciliation API (reducerPath: ReconciliationApi) =====
export const reconciliationType = {
  reconciliation: 'Reconciliation',
} as const;

// ===== Reservation Data API (reducerPath: ReservationDataApi) =====
export const reservationDataType = {
  reservation: 'Reservation',
} as const;

// ===== Reservation Request API (reducerPath: ReservationRequestApi) =====
export const reservationRequestType = {
  reservationRequest: 'ReservationRequest',
} as const;

// ===== Role API (reducerPath: roleApi) =====
export const roleType = {
  role: 'Role',
} as const;

// ===== Role Options API (reducerPath: RoleOptionsApi) =====
export const roleOptionsType = {
  roleOptions: 'RoleOptions',
} as const;

// ===== Shift Management API (reducerPath: shiftManagementApi) =====
export const shiftManagementType = {
  shift: 'Shift',
} as const;

// ===== Student API (reducerPath: StudentApi) =====
export const studentType = {
  student: 'Student',
} as const;

// ===== Student Admission API (reducerPath: StudentAdmissionApi) =====
export const studentAdmissionType = {
  studentAdmission: 'Student-Admission',
  studentDocument: 'Student-Document',
} as const;

// ===== Student Attendance Rule API (reducerPath: StudentAttendanceRuleApi) =====
export const studentAttendanceRuleType = {
  studentAttendanceRule: 'Student-Attendance-Rule',
} as const;

// ===== Student Attendance Type API (reducerPath: StudentAttendanceTypeApi) =====
export const studentAttendanceType = {
  studentAttendanceType: 'Student-Attendance-Type',
} as const;

// ===== Student Certificate API (reducerPath: StudentCertificateApi) =====
export const studentCertificateType = {
  enrollmentReportApi: 'Enrollment-Report-Api',
} as const;

// ===== Student Change Class API (reducerPath: studentChangeClassApi) =====
export const studentChangeClassType = {
  studentChangeClass: 'studentChangeClass',
} as const;

// ===== Student GR Number API (reducerPath: studentGrNumberApi) =====
export const studentGrNumberType = {
  studentGrNumber: 'studentGrNumber',
} as const;

// ===== Student Group API (reducerPath: studentGroupApi) =====
export const studentGroupType = {
  studentGroup: 'studentGroup',
} as const;

// ===== Focused Student Admissions CRM clients (shared Redux API) =====
export const studentAdmissionsCrmType = {
  lead: 'Student-Admissions-Crm-Lead',
  configuration: 'Student-Admissions-Crm-Configuration',
  task: 'Student-Admissions-Crm-Task',
  timeline: 'Student-Admissions-Crm-Timeline',
  exam: 'Student-Admissions-Crm-Exam',
  event: 'Student-Admissions-Crm-Event',
  structuredReview: 'Student-Admissions-Crm-Structured-Review',
  analytics: 'Student-Admissions-Crm-Analytics',
  publicForm: 'Student-Admissions-Crm-Public-Form',
  communication: 'Student-Admissions-Crm-Communication',
} as const;

// ===== Student Invoice API (reducerPath: StudentInvoiceApi) =====
export const studentInvoiceType = {
  studentInvoice: 'StudentInvoice',
} as const;

// ===== Student Leave API (reducerPath: StudentLeaveApi) =====
export const studentLeaveType = {
  studentLeave: 'Student-Leave',
} as const;

// ===== Student Receipt API (reducerPath: StudentReceiptApi) =====
export const studentReceiptType = {
  studentReceipt: 'StudentReceipt',
} as const;

// ===== Student Registration API (reducerPath: StudentRegistrationApi) =====
export const studentRegistrationType = {
  studentRegistration: 'Student-Registration',
  studentDocument: 'Student-Document',
} as const;

// ===== Student Roll Number API (reducerPath: studentRollNumberApi) =====
export const studentRollNumberType = {
  studentRollNumber: 'studentRollNumber',
} as const;

// ===== Student Take Attendance API (reducerPath: StudentTakeAttendanceApi) =====
export const studentTakeAttendanceType = {
  studentTakeAttendance: 'Student-Take-Attendance',
} as const;

// ===== Bulk Student API (reducerPath: BulkStudentApi) =====
export const bulkStudentType = {
  studentDocumentType: 'Student-Document-Type',
} as const;

// ===== Tenant API (reducerPath: tenantApi) =====
export const tenantType = {
  tenant: 'Tenant',
} as const;

// ===== Transport API (reducerPath: transportApi) =====
export const transportType = {
  vehicleManagement: 'VehicleManagement',
  documentRows: 'DocumentRows',
  vehicleTypeOptions: 'VehicleTypeOptions',
  fuelTypeOptions: 'FuelTypeOptions',
  insurance: 'Insurance',
  driver: 'Driver',
  documents: 'Documents',
  documentDetailsData: 'documentDetailsData',
  vehicleDocuments: 'VehicleDocuments',
  vehicleTypes: 'VehicleTypes',
  serviceTypes: 'ServiceTypes',
  licenceTypes: 'LicenceTypes',
  fuelTypes: 'FuelTypes',
  maintenanceHistory: 'MaintenanceHistory',
  routeHistoryData: 'routeHistoryData',
  driverHistory: 'DriverHistory',
  driverConductorData: 'DriverConductorData',
  maintenanceData: 'MaintenanceData',
  availableRoutes: 'AvailableRoutes',
  stopManagement: 'StopManagement',
  routeAssignedStudentData: 'RouteAssignedStudentData',
  routeStopsData: 'RouteStopsData',
  vehicleHistoryData: 'VehicleHistoryData',
  driverConductorHistoryData: 'DriverConductorHistoryData',
  availableVehicles: 'AvailableVehicles',
  assignableVehicles: 'AssignableVehicles',
  selectableDrivers: 'SelectableDrivers',
  selectableConductors: 'SelectableConductors',
  routeTypeOptions: 'RouteTypeOptions',
  locationOptions: 'LocationOptions',
  routeManagementData: 'RouteManagementData',
  stopBasedFeeData: 'StopBasedFeeData',
  distanceCalculationOptions: 'DistanceCalculationOptions',
  frequencyOptions: 'FrequencyOptions',
  zoneBasedFeeData: 'ZoneBasedFeeData',
  availableStopsOptions: 'AvailableStopsOptions',
  zoneAreaOptions: 'ZoneAreaOptions',
  member: 'Member',
  routeStop: 'RouteStop',
  feeConfiguration: 'FeeConfiguration',
  feeRuns: 'FeeRuns',
  feeDues: 'FeeDues',
  routeManagement: 'RouteManagement',
  transportDashboard: 'TransportDashboard',
  transportReports: 'TransportReports',
} as const;

// ===== Year API (reducerPath: yearApi) =====
export const yearType = {
  year: 'Year',
} as const;

export const permissionType = {
  permission: 'Permission',
} as const;

export const allTagTypes = {
  ...academicCalendarType,
  ...academicType,
  ...quizManagementType,
  ...homeworkType,
  ...boardType,
  ...reservationBookType,
  ...bookCategoryType,
  ...bookCategoryOptionsType,
  ...bookIssuedType,
  ...bookManagementType,
  ...budgetType,
  ...budgetSubCategoryType,
  ...budgetCategoryType,
  ...calendarModuleType,
  ...classType,
  ...classManagementType,
  ...communicationType,
  ...meetingTypeOptionsType,
  ...surveyTypeOptionsType,
  ...coreSubjectType,
  ...divisionType,
  ...documentType,
  ...dashboardType,
  ...earningComponentType,
  ...employeeType,
  ...studentReportType,
  ...entranceExamType,
  ...eventHolidayType,
  ...expenseType,
  ...feeConcessionType,
  ...feeRefundTermsType,
  ...feeTermsType,
  ...financeModuleType,
  ...budgetsCategoryType,
  ...incomeType,
  ...incomeDetailsType,
  ...inquiryPreferenceType,
  ...instituteSetupType,
  ...invoiceType,
  ...issueReturnFormType,
  ...bookConditionOptionsType,
  ...libraryChargeCategoryOptionsType,
  ...libraryChargeType,
  ...libraryModuleType,
  ...librarySettingsType,
  ...mediumType,
  ...memberManagementType,
  ...organizationType,
  ...organizationUnitType,
  ...outstandingFeeType,
  ...paymentHistoryType,
  ...paymentStatusOptionType,
  ...paymentTermType,
  ...financePolicyType,
  ...payrollStructureType,
  ...professionalType,
  ...receiptType,
  ...reconciliationType,
  ...reservationDataType,
  ...reservationRequestType,
  ...roleType,
  ...roleOptionsType,
  ...shiftManagementType,
  ...studentType,
  ...studentAdmissionType,
  ...studentAttendanceRuleType,
  ...studentAttendanceType,
  ...studentCertificateType,
  ...studentChangeClassType,
  ...studentGrNumberType,
  ...studentGroupType,
  ...studentAdmissionsCrmType,
  academicExam: academicType.exam,
  ...studentInvoiceType,
  ...studentLeaveType,
  ...studentReceiptType,
  ...studentRegistrationType,
  ...studentRollNumberType,
  ...studentTakeAttendanceType,
  ...bulkStudentType,
  ...tenantType,
  ...transportType,
  ...yearType,
  ...permissionType,
} as const;

export const tagTypes = Object.values(allTagTypes);
