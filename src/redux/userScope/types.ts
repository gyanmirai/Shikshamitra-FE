export interface UserScopeHierarchy {
  userId: string;
  userName: string;
  email?: string | null;
  isAdmin: boolean;
  fromCache: boolean;
  generatedAt: string;
  accessibleHierarchy: AcademicYearScopeNode[];
}

export interface AcademicYearScopeNode {
  academicYearId: string;
  academicYearName: string;
  hasFullBoardAccess: boolean;
  boards: BoardScopeNode[];
}

export interface BoardScopeNode {
  boardId: string;
  boardName: string;
  hasAccess: boolean;
  hasFullMediumAccess: boolean;
  mediums: MediumScopeNode[];
}

export interface MediumScopeNode {
  mediumId: string;
  mediumName: string;
  hasAccess: boolean;
  hasFullMediumStageAccess: boolean;
  mediumStages: MediumStageScopeNode[];
}

export interface MediumStageScopeNode {
  mediumStageId: string;
  mediumStageName: string;
  hasAccess: boolean;
  hasFullStandardAccess: boolean;
  standards: StandardScopeNode[];
}

export interface StandardScopeNode {
  standardId: string;
  standardName: string;
  hasAccess: boolean;
  hasFullDivisionAccess: boolean;
  divisions: DivisionScopeNode[];
}

export interface DivisionScopeNode {
  divisionId: string;
  divisionName: string;
  hasAccess: boolean;
  roomNumber?: string | null;
}
