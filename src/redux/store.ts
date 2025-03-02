import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import { PFApi } from './PF/PFApi';
import { userApi } from './user/userApi';
import { roleApi } from './role/roleApi';
import { yearApi } from './year/yearApi';
import authReducer from './auth/authSlice';
import { boardApi } from './board/boardApi';
import { classApi } from './class/classApi';
import { mediumApi } from './medium/mediumApi';
import { tenantApi } from './tenant/tenantApi';
import { feeHeadApi } from './feeHead/feeHeadApi';
import { divisionApi } from './division/divisionApi';
import { employeeApi } from './employee/employeeApi';
import { documentApi } from './document/documentApi';
import globalStateReducer from './globalState/globalSlice';
import { permissionApi } from './permission/permissionApi';
import { payElementApi } from './payElement/payElementApi';
import { organizationApi } from './oraganization/oraganization';
import { FollowUpApi } from './student/follow-up/follow-up-api';
import { EventHolidayApi } from './eventHoliday/eventHolidayApi';
import { StudentInquiryApi } from './student/inquiry/inquiry-api';
import confirmPopupReducer from './confirmPopup/confirmPopupSlice';
import { ProfessionalApi } from './ProfessionalTax/ProfessionalTaxApi';
import { budgetCategoryApi } from './budgetCategory/budgetCategoryApi';
import { StudentAdmissionApi } from './student/admission/admission-api';
import { StudentCertificateApi } from './student/certificate/certificate';
import { EntranceExamApi } from './student/entrance-exam/entrance-exam-api';
import { payrollStructureApi } from './payrollStructure/payrollStructureApi';
import { organizationUnitApi } from './organizationUnit/organizationUnitApi';
import { StudentRegistrationApi } from './student/registration/registration-api';
import { StudentDocumentTypeApi } from './student/document-type/document-type-api';
import { paymentStatusOptionApi } from './paymentStatusOption/paymentStatusOptionApi';
import { StudentAttendanceRuleApi } from './student/attendance-rule/attendance-rule-api';
import { StudentAttendanceTypeApi } from './student/attendance-type/attendance-type-api';
import { EntranceExamSlotApi } from './student/entrance-exam-slot/entrance-exam-slot-api';
import { inquiryPreferenceApi } from './student/inquiry-preference/inquiry-preference-api';
import { StudentRegistrationFormApi } from './student/registration-form/registration-form-api';
import { EnrollmentReportApi } from './student/student-enrollment-report/student-enrollemt-report';


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
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

export const persistor = persistStore(store);



