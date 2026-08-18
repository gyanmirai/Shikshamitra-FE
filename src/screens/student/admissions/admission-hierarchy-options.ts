import type { AcademicOrganizationOption } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

export type AcademicSelectOption = { id: string; name: string };

const unique = (items: AcademicSelectOption[]) =>
  items.filter((item, index) => items.findIndex((other) => other.id === item.id) === index);

export const getAdmissionHierarchyOptions = (
  hierarchy: AcademicOrganizationOption[],
  boardId: string,
  mediumId: string
) => ({
  boards: unique(hierarchy.map((item) => ({ id: item.boardId, name: item.boardName }))),
  mediums: unique(
    hierarchy
      .filter((item) => item.boardId === boardId)
      .map((item) => ({ id: item.mediumId, name: item.mediumName }))
  ),
  stages: hierarchy
    .filter((item) => item.mediumId === mediumId)
    .map((item) => ({ id: item.id, name: item.label })),
});
