import type { AppDispatch } from 'src/redux/store';

import { admissionInquiriesApi } from 'src/redux/student/admissions/admission-inquiries-api';
import { admissionInquiryManagementApi } from 'src/redux/student/admissions/admission-inquiry-management-api';

/** Share the destination's existing keys; do not create subscriptions or force refreshes. */
export function preloadInquiryWorkspace(dispatch: AppDispatch, id: string) {
  dispatch(admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate(id, { subscribe: false }));
  dispatch(
    admissionInquiryManagementApi.endpoints.getAdmissionInquiryManagement.initiate(id, {
      subscribe: false,
    })
  );
}
