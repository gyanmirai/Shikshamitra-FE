import storage from 'redux-persist/lib/storage';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PURGE,
  PERSIST,
  REGISTER,
  REHYDRATE,
  persistStore,
  persistReducer,
} from 'redux-persist';

import { PFApi } from './PF/PFApi';
import { StudentApi } from './student';
import { userApi } from './user/userApi';
import { roleApi } from './role/roleApi';
import { yearApi } from './year/yearApi';
import authReducer from './auth/authSlice';
import { boardApi } from './board/boardApi';
import { classApi } from './class/classApi';
import { mediumApi } from './medium/mediumApi';
import { tenantApi } from './tenant/tenantApi';
import { incomeApi } from './incomeApi/incomeApi';
import { budgetApi } from './budgetApi/budgetApi';
import { FeeRefundApi } from './finance/feeRefund';
import { divisionApi } from './division/divisionApi';
import { employeeApi } from './employee/employeeApi';
import { documentApi } from './document/documentApi';
import { feeHeadApi } from './feeHeadApi/feeHeadApi';
import { chargesApi } from './chargesApi/chargesApi';
import { feeTermsApi } from './feeCollection/feeTerms';
import { PaymentTermApi } from './finance/paymentTerm';
import { librarySettingsApi } from './library/settingApi';
import globalStateReducer from './globalState/globalSlice';
import { permissionApi } from './permission/permissionApi';
import { payElementApi } from './payElement/payElementApi';
import { invoiceApi } from './invoiceAndReceipt/invoiceApi';
import { receiptApi } from './invoiceAndReceipt/receiptApi';
import { ReconciliationApi } from './finance/reconciliation';
import { ConcessionTypeApi } from './finance/concessionType';
import { ChargeCategoryApi } from './finance/chargeCategory';
import { expenseApi } from './finance/expenseApi/expenseApi';
import { incomeCategoryApi } from './finance/incomeCategory';
import { ConcessionApi } from './feeConcession/feeConcession';
import { feeCategoryApi } from './feeCategory/feeCategoryApi';
import { feeRefundsTermsApi } from './finance/feeRefundTerms';
import { ExpenseCategoryApi } from './finance/expenseCategory';
import { BudgetsCategoryApi } from './finance/budgetsCategory';
import { organizationApi } from './oraganization/oraganization';
import { FollowUpApi } from './student/follow-up/follow-up-api';
import { EventHolidayApi } from './eventHoliday/eventHolidayApi';
import { feeConcessionApi } from './feeCollection/feeConcession';
import { incomeDetailsApi } from './incomeApi/incomeDetailedApi';
import { StudentInquiryApi } from './student/inquiry/inquiry-api';
import confirmPopupReducer from './confirmPopup/confirmPopupSlice';
import { paymentHistoryApi } from './feeCollection/paymentHistory';
import { bookIssuedApi } from './bookIssuedData/bookIssuedDataApi';
import { bookCategoryApi } from './bookCategoryApi/bookCategoryApi';
import { issueReturnFormApi } from './issueRetunApi/issueReturnApi';
import { budgetSubCategoryApi } from './budgetApi/budgetSubCategory';
import { ProfessionalApi } from './ProfessionalTax/ProfessionalTaxApi';
import { budgetCategoryApi } from './budgetCategory/budgetCategoryApi';
import { outstandingFeeApi } from './feeCollection/outstandingFeeData';
import { FinanceFeeStructureApi } from './finance/financeFeeStructure';
import { bookManagementApi } from './bookManagement/bookManagementApi';
import { StudentAdmissionApi } from './student/admission/admission-api';
import { studentGroupApi } from './student/student-group/student-group';
import { financeFeeCollectionApi } from './feeCollection/feeCollection';
import { BulkStudentApi } from './student/buik-student/bulk-student-api';
import { CoreSubjectApi } from './subject/core-subject/core-subject-api';
import { StudentCertificateApi } from './student/certificate/certificate';
import { studentInvoiceApi } from './invoiceAndReceipt/studentInvoiceApi';
import { studentReceiptApi } from './invoiceAndReceipt/studentReceiptApi';
import { EntranceExamApi } from './student/entrance-exam/entrance-exam-api';
import { shiftManagementApi } from './shiftManagement/shift-management-api';
import { StudentLeaveApi } from './student/student-leave/student-leave-api';
import { expenseDetailsApi } from './finance/expenseApi/expenseDetailedApi';
import { payrollStructureApi } from './payrollStructure/payrollStructureApi';
import { organizationUnitApi } from './organizationUnit/organizationUnitApi';
import { memberManagementApi } from './memberManagement/memberManagementApi';
import { reservationDataApi } from './reservationDataApi/reservationDataApi';
import { bookConditionOptionsApi } from './library/setting/bookConditionApi';
import { quizManagementApi } from './academics/examination/quiz-management-api';
import { LibraryChargeApi } from './library/charges-management/charges-get-api';
import { StudentRegistrationApi } from './student/registration/registration-api';
import { reservationBookApi } from './book-reservation-api/book-reservation-api';
import { StudentDocumentTypeApi } from './student/document-type/document-type-api';
import { studentGrNumberApi } from './student/studentGrNumber/student-gr-number-api';
import { paymentStatusOptionApi } from './paymentStatusOption/paymentStatusOptionApi';
import { reservationRequestApi } from './reservationRequestApi/reservationRequestApi';
import { StudentTakeAttendanceApi } from './student/take-attendance/take-attendace-api';
import { bookCategoryOptionsApi } from './bookCategoryOptionsApi/bookCategoryOptionApi';
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
  [payElementApi.reducerPath]: payElementApi.reducer,
  [payrollStructureApi.reducerPath]: payrollStructureApi.reducer,
  [PFApi.reducerPath]: PFApi.reducer,
  [EventHolidayApi.reducerPath]: EventHolidayApi.reducer,
  [ProfessionalApi.reducerPath]: ProfessionalApi.reducer,
  [StudentAttendanceRuleApi.reducerPath]: StudentAttendanceRuleApi.reducer,
  [StudentAttendanceTypeApi.reducerPath]: StudentAttendanceTypeApi.reducer,
  [StudentDocumentTypeApi.reducerPath]: StudentDocumentTypeApi.reducer,
  [inquiryPreferenceApi.reducerPath]: inquiryPreferenceApi.reducer,
  [StudentInquiryApi.reducerPath]: StudentInquiryApi.reducer,
  [StudentRegistrationFormApi.reducerPath]: StudentRegistrationFormApi.reducer,
  [StudentRegistrationApi.reducerPath]: StudentRegistrationApi.reducer,
  [paymentStatusOptionApi.reducerPath]: paymentStatusOptionApi.reducer,
  [budgetCategoryApi.reducerPath]: budgetCategoryApi.reducer,
  [organizationUnitApi.reducerPath]: organizationUnitApi.reducer,
  [BudgetsCategoryApi.reducerPath]: BudgetsCategoryApi.reducer,
  [EntranceExamSlotApi.reducerPath]: EntranceExamSlotApi.reducer,
  [EntranceExamApi.reducerPath]: EntranceExamApi.reducer,
  [FollowUpApi.reducerPath]: FollowUpApi.reducer,
  [StudentAdmissionApi.reducerPath]: StudentAdmissionApi.reducer,
  [EnrollmentReportApi.reducerPath]: EnrollmentReportApi.reducer,
  [StudentCertificateApi.reducerPath]: StudentCertificateApi.reducer,
  [studentGrNumberApi.reducerPath]: studentGrNumberApi.reducer,
  [StudentTakeAttendanceApi.reducerPath]: StudentTakeAttendanceApi.reducer,
  [shiftManagementApi.reducerPath]: shiftManagementApi.reducer,
  [StudentApi.reducerPath]: StudentApi.reducer,
  [studentGroupApi.reducerPath]: studentGroupApi.reducer,
  [studentChangeClassApi.reducerPath]: studentChangeClassApi.reducer,
  [StudentLeaveApi.reducerPath]: StudentLeaveApi.reducer,
  [BulkStudentApi.reducerPath]: BulkStudentApi.reducer,
  [CoreSubjectApi.reducerPath]: CoreSubjectApi.reducer,
  [quizManagementApi.reducerPath]: quizManagementApi.reducer,
  [financeFeeCollectionApi.reducerPath]: financeFeeCollectionApi.reducer,
  [feeTermsApi.reducerPath]: feeTermsApi.reducer,
  [paymentHistoryApi.reducerPath]: paymentHistoryApi.reducer,
  [feeConcessionApi.reducerPath]: feeConcessionApi.reducer,
  [outstandingFeeApi.reducerPath]: outstandingFeeApi.reducer,
  [FinanceFeeStructureApi.reducerPath]: FinanceFeeStructureApi.reducer,
  [PaymentTermApi.reducerPath]: PaymentTermApi.reducer,
  [ReconciliationApi.reducerPath]: ReconciliationApi.reducer,
  [ConcessionTypeApi.reducerPath]: ConcessionTypeApi.reducer,
  [ConcessionApi.reducerPath]: ConcessionApi.reducer,
  [invoiceApi.reducerPath]: invoiceApi.reducer,
  [receiptApi.reducerPath]: receiptApi.reducer,
  [FeeRefundApi.reducerPath]: FeeRefundApi.reducer,
  [studentInvoiceApi.reducerPath]: studentInvoiceApi.reducer,
  [studentReceiptApi.reducerPath]: studentReceiptApi.reducer,
  [feeHeadApi.reducerPath]: feeHeadApi.reducer,
  [feeCategoryApi.reducerPath]: feeCategoryApi.reducer,
  [ChargeCategoryApi.reducerPath]: ChargeCategoryApi.reducer,
  [ExpenseCategoryApi.reducerPath]: ExpenseCategoryApi.reducer,
  [chargesApi.reducerPath]: chargesApi.reducer,
  [expenseApi.reducerPath]: expenseApi.reducer,
  [expenseDetailsApi.reducerPath]: expenseDetailsApi.reducer,
  [incomeApi.reducerPath]: incomeApi.reducer,
  [incomeDetailsApi.reducerPath]: incomeDetailsApi.reducer,
  [budgetApi.reducerPath]: budgetApi.reducer,
  [budgetSubCategoryApi.reducerPath]: budgetSubCategoryApi.reducer,
  [incomeCategoryApi.reducerPath]: incomeCategoryApi.reducer,
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
});

const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
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
      payElementApi.middleware,
      payrollStructureApi.middleware,
      PFApi.middleware,
      EventHolidayApi.middleware,
      ProfessionalApi.middleware,
      StudentAttendanceRuleApi.middleware,
      StudentAttendanceTypeApi.middleware,
      StudentDocumentTypeApi.middleware,
      inquiryPreferenceApi.middleware,
      StudentInquiryApi.middleware,
      StudentRegistrationFormApi.middleware,
      StudentRegistrationApi.middleware,
      feeHeadApi.middleware,
      paymentStatusOptionApi.middleware,
      budgetCategoryApi.middleware,
      BudgetsCategoryApi.middleware,
      organizationUnitApi.middleware,
      EntranceExamSlotApi.middleware,
      EntranceExamApi.middleware,
      FollowUpApi.middleware,
      StudentAdmissionApi.middleware,
      EnrollmentReportApi.middleware,
      StudentCertificateApi.middleware,
      studentGrNumberApi.middleware,
      StudentTakeAttendanceApi.middleware,
      shiftManagementApi.middleware,
      StudentApi.middleware,
      studentGroupApi.middleware,
      studentChangeClassApi.middleware,
      StudentLeaveApi.middleware,
      BulkStudentApi.middleware,
      CoreSubjectApi.middleware,
      quizManagementApi.middleware,
      financeFeeCollectionApi.middleware,
      feeTermsApi.middleware,
      paymentHistoryApi.middleware,
      feeConcessionApi.middleware,
      outstandingFeeApi.middleware,
      FinanceFeeStructureApi.middleware,
      PaymentTermApi.middleware,
      ReconciliationApi.middleware,
      ConcessionTypeApi.middleware,
      ConcessionApi.middleware,
      invoiceApi.middleware,
      receiptApi.middleware,
      FeeRefundApi.middleware,
      studentInvoiceApi.middleware,
      studentReceiptApi.middleware,
      feeCategoryApi.middleware,
      ChargeCategoryApi.middleware,
      ExpenseCategoryApi.middleware,
      chargesApi.middleware,
      expenseApi.middleware,
      expenseDetailsApi.middleware,
      incomeApi.middleware,
      incomeDetailsApi.middleware,
      issueReturnFormApi.middleware,
      budgetApi.middleware,
      budgetSubCategoryApi.middleware,
      incomeCategoryApi.middleware,
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
    ]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

export const persistor = persistStore(store);
