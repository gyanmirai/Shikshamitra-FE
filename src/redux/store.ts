import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import { configureStore, combineReducers } from '@reduxjs/toolkit';

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
import { feeHeadApi } from './feeHead/feeHeadApi';
import { FeeRefundApi } from './finance/feeRefund';
import { divisionApi } from './division/divisionApi';
import { employeeApi } from './employee/employeeApi';
import { documentApi } from './document/documentApi';
import { feeTermsApi } from './feeCollection/feeTerms';
import { PaymentTermApi } from './finance/paymentTerm';
import globalStateReducer from './globalState/globalSlice';
import { permissionApi } from './permission/permissionApi';
import { payElementApi } from './payElement/payElementApi';
import { ConcessionTypeApi } from './finance/concessionType';
import { ConcessionApi } from './feeConcession/feeConcession';
import { organizationApi } from './oraganization/oraganization';
import { FollowUpApi } from './student/follow-up/follow-up-api';
import { EventHolidayApi } from './eventHoliday/eventHolidayApi';
import { feeConcessionApi } from './feeCollection/feeConcession';
import { StudentInquiryApi } from './student/inquiry/inquiry-api';
import confirmPopupReducer from './confirmPopup/confirmPopupSlice';
import { paymentHistoryApi } from './feeCollection/paymentHistory';
import { ProfessionalApi } from './ProfessionalTax/ProfessionalTaxApi';
import { budgetCategoryApi } from './budgetCategory/budgetCategoryApi';
import { outstandingFeeApi } from './feeCollection/outstandingFeeData';
import { FinanceFeeStructureApi } from './finance/financeFeeStructure';
import { StudentAdmissionApi } from './student/admission/admission-api';
import { studentGroupApi } from './student/student-group/student-group';
import { financeFeeCollectionApi } from './feeCollection/feeCollection';
import { BulkStudentApi } from './student/buik-student/bulk-student-api';
import { CoreSubjectApi } from './subject/core-subject/core-subject-api';
import { StudentCertificateApi } from './student/certificate/certificate';
import { EntranceExamApi } from './student/entrance-exam/entrance-exam-api';
import { shiftManagementApi } from './shiftManagement/shift-management-api';
import { StudentLeaveApi } from './student/student-leave/student-leave-api';
import { payrollStructureApi } from './payrollStructure/payrollStructureApi';
import { organizationUnitApi } from './organizationUnit/organizationUnitApi';
import { quizManagementApi } from './academics/examination/quiz-management-api';
import { StudentRegistrationApi } from './student/registration/registration-api';
import { StudentDocumentTypeApi } from './student/document-type/document-type-api';
import { studentGrNumberApi } from './student/studentGrNumber/student-gr-number-api';
import { paymentStatusOptionApi } from './paymentStatusOption/paymentStatusOptionApi';
import { StudentTakeAttendanceApi } from './student/take-attendance/take-attendace-api';
import { StudentAttendanceRuleApi } from './student/attendance-rule/attendance-rule-api';
import { StudentAttendanceTypeApi } from './student/attendance-type/attendance-type-api';
import { EntranceExamSlotApi } from './student/entrance-exam-slot/entrance-exam-slot-api';
import { inquiryPreferenceApi } from './student/inquiry-preference/inquiry-preference-api';
import { StudentRegistrationFormApi } from './student/registration-form/registration-form-api';
import { studentChangeClassApi } from './student/student-change-class/student-change-class-api';
import { EnrollmentReportApi } from './student/student-enrollment-report/student-enrollemt-report';
import { invoiceApi } from './invoiceAndReceipt/invoiceApi';
import { receiptApi } from './invoiceAndReceipt/receiptApi';

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
  [feeHeadApi.reducerPath]: feeHeadApi.reducer,
  [paymentStatusOptionApi.reducerPath]: paymentStatusOptionApi.reducer,
  [budgetCategoryApi.reducerPath]: budgetCategoryApi.reducer,
  [organizationUnitApi.reducerPath]: organizationUnitApi.reducer,
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
  [ConcessionTypeApi.reducerPath]: ConcessionTypeApi.reducer,
  [ConcessionApi.reducerPath]: ConcessionApi.reducer,
  [invoiceApi.reducerPath]: invoiceApi.reducer,
  [receiptApi.reducerPath]: receiptApi.reducer,
  [FeeRefundApi.reducerPath]: FeeRefundApi.reducer,
});

const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(roleApi.middleware)
      .concat(permissionApi.middleware)
      .concat(boardApi.middleware)
      .concat(mediumApi.middleware)
      .concat(organizationApi.middleware)
      .concat(classApi.middleware)
      .concat(divisionApi.middleware)
      .concat(yearApi.middleware)
      .concat(tenantApi.middleware)
      .concat(employeeApi.middleware)
      .concat(documentApi.middleware)
      .concat(payElementApi.middleware)
      .concat(payrollStructureApi.middleware)
      .concat(PFApi.middleware)
      .concat(EventHolidayApi.middleware)
      .concat(ProfessionalApi.middleware)
      .concat(StudentAttendanceRuleApi.middleware)
      .concat(StudentAttendanceTypeApi.middleware)
      .concat(StudentDocumentTypeApi.middleware)
      .concat(inquiryPreferenceApi.middleware)
      .concat(StudentInquiryApi.middleware)
      .concat(StudentRegistrationFormApi.middleware)
      .concat(StudentRegistrationApi.middleware)
      .concat(feeHeadApi.middleware)
      .concat(paymentStatusOptionApi.middleware)
      .concat(budgetCategoryApi.middleware)
      .concat(organizationUnitApi.middleware)
      .concat(EntranceExamSlotApi.middleware)
      .concat(EntranceExamApi.middleware)
      .concat(FollowUpApi.middleware)
      .concat(StudentAdmissionApi.middleware)
      .concat(EnrollmentReportApi.middleware)
      .concat(StudentCertificateApi.middleware)
      .concat(studentGrNumberApi.middleware)
      .concat(StudentCertificateApi.middleware)
      .concat(StudentTakeAttendanceApi.middleware)
      .concat(shiftManagementApi.middleware)
      .concat(StudentApi.middleware)
      .concat(studentGroupApi.middleware)
      .concat(studentChangeClassApi.middleware)
      .concat(StudentLeaveApi.middleware)
      .concat(BulkStudentApi.middleware)
      .concat(CoreSubjectApi.middleware)
      .concat(quizManagementApi.middleware)
      .concat(financeFeeCollectionApi.middleware)
      .concat(feeTermsApi.middleware)
      .concat(paymentHistoryApi.middleware)
      .concat(feeConcessionApi.middleware)
      .concat(outstandingFeeApi.middleware)
      .concat(FinanceFeeStructureApi.middleware)
      .concat(PaymentTermApi.middleware)
      .concat(ConcessionTypeApi.middleware)
      .concat(ConcessionApi.middleware)
      .concat(invoiceApi.middleware)
      .concat(receiptApi.middleware)
      .concat(FeeRefundApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

export const persistor = persistStore(store);
