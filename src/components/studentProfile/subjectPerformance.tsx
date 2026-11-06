import { academicPaths, academicActionPermissions } from 'src/constants/academic-menu';
import { StudentRelatedUnavailable } from 'src/screens/student/studentProfile/student-related-unavailable';

export default function SubjectPerformance({ onOverview }: { onOverview?: () => void }) {
  return (
    <StudentRelatedUnavailable
      title="Subject Performance"
      message="Student subject performance is unavailable here."
      onOverview={onOverview}
      destination={{
        href: academicPaths.studentAcademic360,
        label: 'Open student academic overview',
        permission: academicActionPermissions.studentAcademic360,
      }}
    />
  );
}
