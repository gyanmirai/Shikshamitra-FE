import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import { StudentApi } from './student';
import { userApi } from './user/userApi';
import { roleApi } from './role/roleApi';
import { yearApi } from './year/yearApi';
import authReducer from './auth/authSlice';
import { boardApi } from './board/boardApi';
import { classApi } from './class/classApi';
import { mediumApi } from './medium/mediumApi';
import { tenantApi } from './tenant/tenantApi';
import { employeeApi } from './hr/employeeApi';
import { incomeApi } from './income-api/incomeApi';
import { budgetApi } from './budget-api/budgetApi';
import { roleOptionsApi } from './library/roleApi';
import { divisionApi } from './division/divisionApi';
import { documentApi } from './document/documentApi';
import { feeTermsApi } from './fee-collection/feeTerms';
import { PaymentTermApi } from './finance/paymentTerm';
import { academicApi } from './academic-api/academicApi';
import { transportApi } from './transport/transportApi';
import { librarySettingsApi } from './library/settingApi';
import globalStateReducer from './global-state/globalSlice';
import { permissionApi } from './permission/permissionApi';
import { calendarModuleApi } from './calendar/calendarApi';
import { invoiceApi } from './invoice-and-receipt/invoiceApi';
import { receiptApi } from './invoice-and-receipt/receiptApi';
import { ReconciliationApi } from './finance/reconciliation';
import { expenseApi } from './finance/expense-api/expenseApi';
import { openLibraryApi } from './library/LibraryDataSearch';
import { feeRefundsTermsApi } from './finance/feeRefundTerms';
import { libraryModuleApi } from './library/libraryModuleApi';
import { financeModuleApi } from './finance/financeModuleApi';
import { organizationApi } from './oraganization/oraganization';
import { FollowUpApi } from './student/follow-up/follow-up-api';
import { feeConcessionApi } from './fee-collection/feeConcession';
import { incomeDetailsApi } from './income-api/incomeDetailedApi';
import { EventHolidayApi } from './event-holiday/eventHolidayApi';
import { StudentInquiryApi } from './student/inquiry/inquiry-api';
import confirmPopupReducer from './confirm-popup/confirmPopupSlice';
import { paymentHistoryApi } from './fee-collection/paymentHistory';
import { bookIssuedApi } from './book-issued-data/bookIssuedDataApi';
import { bookCategoryApi } from './book-category-api/bookCategoryApi';
import { issueReturnFormApi } from './issue-retun-api/issueReturnApi';
import { communicationApi } from './communication/communicationApi';
import { budgetSubCategoryApi } from './budget-api/budgetSubCategory';
import { ProfessionalApi } from './professional-tax/ProfessionalTaxApi';
import { outstandingFeeApi } from './fee-collection/outstandingFeeData';
import { bookManagementApi } from './book-management/bookManagementApi';
import { instituteSetupApi } from './institute-setup/instituteSetupApi';
import { StudentAdmissionApi } from './student/admission/admission-api';
import { studentGroupApi } from './student/student-group/student-group';
import { BulkStudentApi } from './student/buik-student/bulk-student-api';
import { CoreSubjectApi } from './subject/core-subject/core-subject-api';
import { StudentCertificateApi } from './student/certificate/certificate';
import { studentInvoiceApi } from './invoice-and-receipt/studentInvoiceApi';
import { studentReceiptApi } from './invoice-and-receipt/studentReceiptApi';
import { EntranceExamApi } from './student/entrance-exam/entrance-exam-api';
import { shiftManagementApi } from './shift-management/shift-management-api';
import { StudentLeaveApi } from './student/student-leave/student-leave-api';
// import { payrollStructureApi } from './payroll-structure/payrollStructureApi';
import { organizationUnitApi } from './organization-unit/organizationUnitApi';
import { memberManagementApi } from './member-management/memberManagementApi';
import { reservationDataApi } from './reservation-data-api/reservationDataApi';
import { bookConditionOptionsApi } from './library/setting/bookConditionApi';
import { classManagementApi } from './class-management-api/classManagementApi';
import { studentRollNumberApi } from './student/roll-number/roll-number-api';
import { quizManagementApi } from './academics/examination/quiz-management-api';
import { LibraryChargeApi } from './library/charges-management/charges-get-api';
import { StudentRegistrationApi } from './student/registration/registration-api';
import { reservationBookApi } from './book-reservation-api/book-reservation-api';
import { StudentDocumentTypeApi } from './student/document-type/document-type-api';
import { studentGrNumberApi } from './student/student-gr-number/student-gr-number-api';
import { paymentStatusOptionApi } from './payment-status-option/paymentStatusOptionApi';
import { reservationRequestApi } from './reservation-request-api/reservationRequestApi';
import { StudentTakeAttendanceApi } from './student/take-attendance/take-attendace-api';
import { bookCategoryOptionsApi } from './book-category-options-api/bookCategoryOptionApi';
import { StudentAttendanceRuleApi } from './student/attendance-rule/attendance-rule-api';
import { StudentAttendanceTypeApi } from './student/attendance-type/attendance-type-api';
import { EntranceExamSlotApi } from './student/entrance-exam-slot/entrance-exam-slot-api';
import { inquiryPreferenceApi } from './student/inquiry-preference/inquiry-preference-api';
import { StudentRegistrationFormApi } from './student/registration-form/registration-form-api';
import { studentChangeClassApi } from './student/student-change-class/student-change-class-api';
import { EnrollmentReportApi } from './student/student-enrollment-report/student-enrollemt-report';
import { libraryChargeCategoryOptionsApi } from './library/charges-management/charge-category-api';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['globalState'],
};

const reducers = combineReducers({
  auth: authReducer,
  globalState: globalStateReducer,
  confirmPopup: confirmPopupReducer,
  [userApi.reducerPath]: userApi.reducer,
  [roleApi.reducerPath]: roleApi.reducer,
  [permissionApi.reducerPath]: permissionApi.reducer,
  [boardApi.reducerPath]: boardApi.reducer,
  [mediumApi.reducerPath]: mediumApi.reducer,
  [organizationApi.reducerPath]: organizationApi.reducer,
  [classApi.reducerPath]: classApi.reducer,
  [divisionApi.reducerPath]: divisionApi.reducer,
  [yearApi.reducerPath]: yearApi.reducer,
  [tenantApi.reducerPath]: tenantApi.reducer,
  [employeeApi.reducerPath]: employeeApi.reducer,
  [documentApi.reducerPath]: documentApi.reducer,
  // [payrollStructureApi.reducerPath]: payrollStructureApi.reducer,
  [ProfessionalApi.reducerPath]: ProfessionalApi.reducer,
  [StudentAttendanceRuleApi.reducerPath]: StudentAttendanceRuleApi.reducer,
  [StudentAttendanceTypeApi.reducerPath]: StudentAttendanceTypeApi.reducer,
  [StudentDocumentTypeApi.reducerPath]: StudentDocumentTypeApi.reducer,
  [inquiryPreferenceApi.reducerPath]: inquiryPreferenceApi.reducer,
  [StudentInquiryApi.reducerPath]: StudentInquiryApi.reducer,
  [StudentRegistrationFormApi.reducerPath]: StudentRegistrationFormApi.reducer,
  [StudentRegistrationApi.reducerPath]: StudentRegistrationApi.reducer,
  [paymentStatusOptionApi.reducerPath]: paymentStatusOptionApi.reducer,
  // [FeeHeadManagementApi.reducerPath]: FeeHeadManagementApi.reducer,
  [organizationUnitApi.reducerPath]: organizationUnitApi.reducer,
  [EntranceExamSlotApi.reducerPath]: EntranceExamSlotApi.reducer,
  [EntranceExamApi.reducerPath]: EntranceExamApi.reducer,
  [FollowUpApi.reducerPath]: FollowUpApi.reducer,
  [StudentAdmissionApi.reducerPath]: StudentAdmissionApi.reducer,
  [EnrollmentReportApi.reducerPath]: EnrollmentReportApi.reducer,
  [StudentCertificateApi.reducerPath]: StudentCertificateApi.reducer,
  [studentGrNumberApi.reducerPath]: studentGrNumberApi.reducer,
  [studentRollNumberApi.reducerPath]: studentRollNumberApi.reducer,
  [StudentTakeAttendanceApi.reducerPath]: StudentTakeAttendanceApi.reducer,
  [shiftManagementApi.reducerPath]: shiftManagementApi.reducer,
  [StudentApi.reducerPath]: StudentApi.reducer,
  [studentGroupApi.reducerPath]: studentGroupApi.reducer,
  [studentChangeClassApi.reducerPath]: studentChangeClassApi.reducer,
  [StudentLeaveApi.reducerPath]: StudentLeaveApi.reducer,
  [BulkStudentApi.reducerPath]: BulkStudentApi.reducer,
  [CoreSubjectApi.reducerPath]: CoreSubjectApi.reducer,
  [quizManagementApi.reducerPath]: quizManagementApi.reducer,
  // [feeCollectionApi.reducerPath]: feeCollectionApi.reducer,
  [feeTermsApi.reducerPath]: feeTermsApi.reducer,
  [paymentHistoryApi.reducerPath]: paymentHistoryApi.reducer,
  [feeConcessionApi.reducerPath]: feeConcessionApi.reducer,
  [outstandingFeeApi.reducerPath]: outstandingFeeApi.reducer,
  [PaymentTermApi.reducerPath]: PaymentTermApi.reducer,
  [ReconciliationApi.reducerPath]: ReconciliationApi.reducer,
  [invoiceApi.reducerPath]: invoiceApi.reducer,
  [receiptApi.reducerPath]: receiptApi.reducer,
  [studentInvoiceApi.reducerPath]: studentInvoiceApi.reducer,
  [studentReceiptApi.reducerPath]: studentReceiptApi.reducer,
  // [feeCategoryApi.reducerPath]: feeCategoryApi.reducer,
  // [ExpenseCategoryApi.reducerPath]: ExpenseCategoryApi.reducer,
  [financeModuleApi.reducerPath]: financeModuleApi.reducer,
  [expenseApi.reducerPath]: expenseApi.reducer,
  [incomeApi.reducerPath]: incomeApi.reducer,
  [incomeDetailsApi.reducerPath]: incomeDetailsApi.reducer,
  [budgetApi.reducerPath]: budgetApi.reducer,
  [budgetSubCategoryApi.reducerPath]: budgetSubCategoryApi.reducer,
  [bookManagementApi.reducerPath]: bookManagementApi.reducer,
  [bookCategoryApi.reducerPath]: bookCategoryApi.reducer,
  [memberManagementApi.reducerPath]: memberManagementApi.reducer,
  [issueReturnFormApi.reducerPath]: issueReturnFormApi.reducer,
  [reservationBookApi.reducerPath]: reservationBookApi.reducer,
  [bookIssuedApi.reducerPath]: bookIssuedApi.reducer,
  [bookCategoryOptionsApi.reducerPath]: bookCategoryOptionsApi.reducer,
  [reservationRequestApi.reducerPath]: reservationRequestApi.reducer,
  [reservationDataApi.reducerPath]: reservationDataApi.reducer,
  [feeRefundsTermsApi.reducerPath]: feeRefundsTermsApi.reducer,
  [librarySettingsApi.reducerPath]: librarySettingsApi.reducer,
  [LibraryChargeApi.reducerPath]: LibraryChargeApi.reducer,
  [libraryChargeCategoryOptionsApi.reducerPath]: libraryChargeCategoryOptionsApi.reducer,
  [bookConditionOptionsApi.reducerPath]: bookConditionOptionsApi.reducer,
  [communicationApi.reducerPath]: communicationApi.reducer,
  [roleOptionsApi.reducerPath]: roleOptionsApi.reducer,
  [transportApi.reducerPath]: transportApi.reducer,
  [libraryModuleApi.reducerPath]: libraryModuleApi.reducer,
  [openLibraryApi.reducerPath]: openLibraryApi.reducer,
  [academicApi.reducerPath]: academicApi.reducer,
  [instituteSetupApi.reducerPath]: instituteSetupApi.reducer,
  [classManagementApi.reducerPath]: classManagementApi.reducer,
  [EventHolidayApi.reducerPath]: EventHolidayApi.reducer,
  [calendarModuleApi.reducerPath]: calendarModuleApi.reducer,
});

const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // serializableCheck: {
      //   ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      // },
      serializableCheck: false,
    }).concat([
      userApi.middleware,
      roleApi.middleware,
      permissionApi.middleware,
      boardApi.middleware,
      mediumApi.middleware,
      organizationApi.middleware,
      classApi.middleware,
      divisionApi.middleware,
      yearApi.middleware,
      tenantApi.middleware,
      employeeApi.middleware,
      documentApi.middleware,
      // payrollStructureApi.middleware,
      // EventHolidayApi.middleware,
      ProfessionalApi.middleware,
      StudentAttendanceRuleApi.middleware,
      StudentAttendanceTypeApi.middleware,
      StudentDocumentTypeApi.middleware,
      inquiryPreferenceApi.middleware,
      StudentInquiryApi.middleware,
      StudentRegistrationFormApi.middleware,
      StudentRegistrationApi.middleware,
      paymentStatusOptionApi.middleware,
      organizationUnitApi.middleware,
      EntranceExamSlotApi.middleware,
      EntranceExamApi.middleware,
      FollowUpApi.middleware,
      StudentAdmissionApi.middleware,
      EnrollmentReportApi.middleware,
      StudentCertificateApi.middleware,
      studentGrNumberApi.middleware,
      studentRollNumberApi.middleware,
      StudentTakeAttendanceApi.middleware,
      shiftManagementApi.middleware,
      StudentApi.middleware,
      studentGroupApi.middleware,
      studentChangeClassApi.middleware,
      StudentLeaveApi.middleware,
      BulkStudentApi.middleware,
      CoreSubjectApi.middleware,
      quizManagementApi.middleware,
      // feeCollectionApi.middleware,
      feeTermsApi.middleware,
      paymentHistoryApi.middleware,
      feeConcessionApi.middleware,
      outstandingFeeApi.middleware,
      PaymentTermApi.middleware,
      ReconciliationApi.middleware,
      invoiceApi.middleware,
      receiptApi.middleware,
      studentInvoiceApi.middleware,
      // FeeHeadManagementApi.middleware,
      studentReceiptApi.middleware,
      // feeCategoryApi.middleware,
      // ExpenseCategoryApi.middleware,
      financeModuleApi.middleware,
      expenseApi.middleware,
      academicApi.middleware,
      incomeApi.middleware,
      incomeDetailsApi.middleware,
      issueReturnFormApi.middleware,
      budgetApi.middleware,
      budgetSubCategoryApi.middleware,
      bookCategoryOptionsApi.middleware,
      bookManagementApi.middleware,
      bookCategoryApi.middleware,
      memberManagementApi.middleware,
      reservationBookApi.middleware,
      bookIssuedApi.middleware,
      reservationRequestApi.middleware,
      reservationDataApi.middleware,
      feeRefundsTermsApi.middleware,
      librarySettingsApi.middleware,
      LibraryChargeApi.middleware,
      libraryChargeCategoryOptionsApi.middleware,
      bookConditionOptionsApi.middleware,
      EventHolidayApi.middleware,
      // communicationApi.middleware,
      communicationApi.middleware,
      // meetingDetailsApi.middleware,
      // holidayApi.middleware,
      roleOptionsApi.middleware,
      transportApi.middleware,
      libraryModuleApi.middleware,
      openLibraryApi.middleware,
      instituteSetupApi.middleware,
      classManagementApi.middleware,
      calendarModuleApi.middleware,
    ]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

export const persistor = persistStore(store);
