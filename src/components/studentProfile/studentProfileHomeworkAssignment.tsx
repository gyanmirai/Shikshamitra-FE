import { academicPaths } from 'src/constants/academic-menu';
import { StudentRelatedUnavailable } from 'src/screens/student/studentProfile/student-related-unavailable';

export default function MyProfileSubmission({ onOverview }: { onOverview?: () => void }) {
  return (
    <StudentRelatedUnavailable
      title="Homework and Assignments"
      message="Student homework and assignments are unavailable here."
      onOverview={onOverview}
      destination={{
        href: academicPaths.homework.learningTasks,
        label: 'Open learning tasks',
        permission: 'Academics.HomeworkAndAssignment.LearningTasks.View',
      }}
    />
  );
}
