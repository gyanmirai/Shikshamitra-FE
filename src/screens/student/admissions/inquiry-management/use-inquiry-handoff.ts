import type { RootState } from 'src/redux/store';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useStartAdmissionApplicationMutation } from 'src/redux/student/admissions/admission-applications-api';

import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';

export function inquiryHandoffBlocker(inquiry: AdmissionInquiry): string | undefined {
  if (inquiry.isTransferred || inquiry.applicationId)
    return 'This inquiry has already moved to Pipeline.';
  if (inquiry.status !== 2) return 'Mark the inquiry Interested before moving to the next stage.';
  if (!inquiry.admissionOfferingId)
    return 'Resolve this older inquiry’s admission offering before proceeding.';
  if (!inquiry.applicantId)
    return 'This inquiry has no linked applicant. Contact the admission administrator.';
  if (inquiry.isDuplicate)
    return 'This inquiry is linked as a duplicate. Continue the original inquiry.';
  return undefined;
}

export function useInquiryHandoff() {
  const router = useRouter();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canMove = hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage);
  const [start, state] = useStartAdmissionApplicationMutation();
  const movingRef = useRef(false);
  const move = async (inquiry: AdmissionInquiry) => {
    if (!canMove || movingRef.current || state.isLoading || inquiryHandoffBlocker(inquiry)) return;
    movingRef.current = true;
    try {
      const application = await start({
        applicantId: inquiry.applicantId!,
        offeringId: inquiry.admissionOfferingId!,
        inquiryId: inquiry.id,
      }).unwrap();
      shikshaMitraToast.success({
        message: 'Inquiry moved to Pipeline. Continue the application.',
      });
      router.push(`${studentPaths.enrollment.applications}/${application.id}`);
    } catch (error) {
      shikshaMitraToast.error({
        message:
          parseApiProblemDetail(error).detail ||
          'Unable to move this inquiry. Refresh and try again.',
      });
    } finally {
      movingRef.current = false;
    }
  };
  return { canMove, moving: state.isLoading, move };
}
