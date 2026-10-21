import type { SchoolIdentityWorkspace } from './hooks/use-school-identity';
import type { IdentityEditorScope } from './components/identity-editor-context';

export function getIdentityEditorScope(
  workspace: SchoolIdentityWorkspace
): IdentityEditorScope | undefined {
  const { context, boards, years, selectedYear } = workspace;
  if (!context.boardId) return undefined;
  const board = boards.find((item) => item.id === context.boardId);
  const medium = board?.educationMediums?.find((item) => item.id === context.mediumId);
  return {
    year: years.find((item) => item.id === selectedYear)?.name,
    board: board?.name,
    medium: medium?.name,
    organization: medium?.educationMediumStages?.find((item) => item.id === context.organizationId)
      ?.name,
  };
}
