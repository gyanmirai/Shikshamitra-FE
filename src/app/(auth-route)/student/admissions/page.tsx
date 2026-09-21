import { redirect } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';

export default function AdmissionsIndexPage() {
  redirect(studentPaths.enrollment.inquiries);
}
