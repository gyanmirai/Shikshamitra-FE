import { redirect } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';

export default function Page() {
  redirect(studentPaths.enrollment.settings.publicInquiryLinks);
}
