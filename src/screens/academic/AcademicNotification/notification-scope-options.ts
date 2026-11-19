import type { Board, Medium, AcademicYear } from 'src/types/school';
import type { UserScopeHierarchy } from 'src/redux/userScope/types';
import type { AcademicNotificationScope } from 'src/redux/academic-notifications/types';

export interface NotificationScopeOption {
  value: string;
  label: string;
  scope: AcademicNotificationScope;
}

export function notificationScopeOptions(
  hierarchy: UserScopeHierarchy,
  year: Partial<AcademicYear>,
  board: Partial<Board>,
  medium: Partial<Medium>
): NotificationScopeOption[] {
  const options: NotificationScopeOption[] = hierarchy.isAdmin
    ? [{ value: 'school', label: 'Whole school', scope: {} }]
    : [];
  if (!year.id) return options;

  const yearNode = hierarchy.accessibleHierarchy.find((entry) => entry.academicYearId === year.id);
  const yearAccess = hierarchy.isAdmin || yearNode?.hasFullBoardAccess === true;
  const yearScope = { academicYearId: year.id };
  if (yearAccess) options.push({ value: 'year', label: 'Academic year', scope: yearScope });
  if (!board.id) return options;

  const boardNode = yearNode?.boards.find((entry) => entry.boardId === board.id);
  const boardAccess = yearAccess || boardNode?.hasFullMediumAccess === true;
  const boardScope = { ...yearScope, boardId: board.id };
  if (boardAccess) options.push({ value: 'board', label: 'Board', scope: boardScope });
  if (!medium.id) return options;

  const mediumNode = boardNode?.mediums.find((entry) => entry.mediumId === medium.id);
  const mediumAccess = boardAccess || mediumNode?.hasFullMediumStageAccess === true;
  const mediumScope = { ...boardScope, mediumId: medium.id };
  if (mediumAccess) options.push({ value: 'medium', label: 'Medium', scope: mediumScope });

  (medium.educationMediumStages ?? []).forEach((stage) => {
    const stageNode = mediumNode?.mediumStages.find((entry) => entry.mediumStageId === stage.id);
    const stageAccess = mediumAccess || stageNode?.hasFullStandardAccess === true;
    (stage.standards ?? []).forEach((standard) => {
      const classNode = stageNode?.standards.find((entry) => entry.standardId === standard.id);
      const classAccess = stageAccess || classNode?.hasFullDivisionAccess === true;
      const classScope = { ...mediumScope, classId: standard.id };
      const classLabel = `${stage.name} / ${standard.name}`;
      if (classAccess) options.push({ value: `class:${standard.id}`, label: classLabel, scope: classScope });
      (standard.divisions ?? []).forEach((division) => {
        if (classAccess || classNode?.divisions.some((node) => node.divisionId === division.id && node.hasAccess)) {
          options.push({
            value: `division:${division.id}`,
            label: `${classLabel} / ${division.name}`,
            scope: { ...classScope, divisionId: division.id },
          });
        }
      });
    });
  });
  return options;
}
