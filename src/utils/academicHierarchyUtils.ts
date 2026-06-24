type Division = {
  [key: string]: any;
};

type Standard = {
  divisions?: Division[];
  [key: string]: any;
};

type EducationMediumStage = {
  standards?: Standard[];
  [key: string]: any;
};

type EducationMedium = {
  educationMediumStages?: EducationMediumStage[];
  [key: string]: any;
};

type Board = {
  educationMediums?: EducationMedium[];
  [key: string]: any;
};

export interface HierarchyCounts {
  boards: number;
  educationMediums: number;
  educationMediumStages: number;
  standards: number;
  divisions: number;
}

/**
 * Calculates total counts of academic hierarchy entities from the provided data.
 * @param data Single Board object or array of Board objects
 * @returns Object containing counts for boards, educationMediums, educationMediumStages, standards, and divisions
 */
export const countAcademicHierarchy = (
  data: Board | Board[] | null | undefined
): HierarchyCounts => {
  const counts: HierarchyCounts = {
    boards: 0,
    educationMediums: 0,
    educationMediumStages: 0,
    standards: 0,
    divisions: 0,
  };

  if (!data) return counts;

  const boards = Array.isArray(data) ? data : [data];

  counts.boards = boards.length;

  boards.forEach((board) => {
    if (Array.isArray(board.educationMediums)) {
      counts.educationMediums += board.educationMediums.length;

      board.educationMediums.forEach((medium) => {
        if (Array.isArray(medium.educationMediumStages)) {
          counts.educationMediumStages += medium.educationMediumStages.length;

          medium.educationMediumStages.forEach((stage) => {
            if (Array.isArray(stage.standards)) {
              counts.standards += stage.standards.length;

              stage.standards.forEach((std) => {
                if (Array.isArray(std.divisions)) {
                  counts.divisions += std.divisions.length;
                }
              });
            }
          });
        }
      });
    }
  });

  return counts;
};

// ---------------------------------------------------------------------------
// Access control: expand an `accessibleHierarchy` BE response into flat id sets
// ---------------------------------------------------------------------------
//
// The BE compresses the response: when a `hasFull*Access` flag is set at a
// level, the children at the next level may be returned as an empty array
// (e.g. `hasFullBoardAccess: true` with `boards: []`).
//
// To pre-select the corresponding checkboxes on the FE we have to expand
// these "full access" branches by pulling the missing ids from the full
// boards tree returned by `useGetBoardsQuery` for the same academic year.

export type AccessSelection = {
  boards: string[];
  mediums: string[];
  organizations: string[];
  standards: string[];
  divisions: string[];
};

export type AcademicScopeRow = {
  educationBoardId?: string;
  educationMediumId?: string;
  educationMediumStageId?: string;
  standardId?: string;
  divisionId?: string;
};

export type GlobalAcademicSearchOption<TAcademicYear = any, TBoard = any, TMedium = any> = {
  label: string;
  value: string;
  academicYear: TAcademicYear;
  board: TBoard;
  medium: TMedium;
};

export type GlobalAcademicSelection<TAcademicYear = any, TBoard = any, TMedium = any> = {
  academicYear: TAcademicYear;
  board: TBoard;
  medium: TMedium;
  selectedOption: GlobalAcademicSearchOption<TAcademicYear, TBoard, TMedium> | null;
  clearYear: boolean;
};

export const emptyAccessSelection = (): AccessSelection => ({
  boards: [],
  mediums: [],
  organizations: [],
  standards: [],
  divisions: [],
});

const accessSelectionKeys: Array<keyof AccessSelection> = [
  'boards',
  'mediums',
  'organizations',
  'standards',
  'divisions',
];

const emptySelection = emptyAccessSelection;

export const dedupeAccessSelection = (selection: AccessSelection): AccessSelection => {
  const out = emptyAccessSelection();

  accessSelectionKeys.forEach((key) => {
    out[key] = Array.from(new Set(selection[key] || []));
  });

  return out;
};

export const hasAccessSelection = (selection?: Partial<AccessSelection> | null) =>
  !!selection && accessSelectionKeys.some((key) => (selection[key]?.length ?? 0) > 0);

type AccessScopeTreeNode = {
  id: string;
  type: keyof AccessSelection;
  path: AcademicScopeRow;
  children?: AccessScopeTreeNode[];
};

type AccessSelectionSets = Record<keyof AccessSelection, Set<string>>;

const toAccessScopeTree = (allBoards: any[] | undefined): AccessScopeTreeNode[] =>
  (allBoards || []).map((board: any) => ({
    id: board.id,
    type: 'boards',
    path: {
      educationBoardId: board.id,
    },
    children: board.educationMediums?.map((medium: any) => ({
      id: medium.id,
      type: 'mediums',
      path: {
        educationBoardId: board.id,
        educationMediumId: medium.id,
      },
      children: medium.educationMediumStages?.map((stage: any) => ({
        id: stage.id,
        type: 'organizations',
        path: {
          educationBoardId: board.id,
          educationMediumId: medium.id,
          educationMediumStageId: stage.id,
        },
        children: stage.standards?.map((standard: any) => ({
          id: standard.id,
          type: 'standards',
          path: {
            educationBoardId: board.id,
            educationMediumId: medium.id,
            educationMediumStageId: stage.id,
            standardId: standard.id,
          },
          children: standard.divisions?.map((division: any) => ({
            id: division.id,
            type: 'divisions',
            path: {
              educationBoardId: board.id,
              educationMediumId: medium.id,
              educationMediumStageId: stage.id,
              standardId: standard.id,
              divisionId: division.id,
            },
          })),
        })),
      })),
    })),
  }));

const toAccessSelectionSets = (selection: AccessSelection): AccessSelectionSets => ({
  boards: new Set(selection.boards || []),
  mediums: new Set(selection.mediums || []),
  organizations: new Set(selection.organizations || []),
  standards: new Set(selection.standards || []),
  divisions: new Set(selection.divisions || []),
});

export const compressExplicitAcademicSelection = (
  checkedItem: AccessSelection,
  allBoards: any[] | undefined
): AccessSelection => {
  if (!allBoards?.length) return emptyAccessSelection();

  const roots = toAccessScopeTree(allBoards);
  const sourceSets = toAccessSelectionSets(checkedItem || emptyAccessSelection());
  const output = emptyAccessSelection();

  const visit = (node: AccessScopeTreeNode) => {
    if (sourceSets[node.type].has(node.id)) {
      output[node.type].push(node.id);
      return;
    }

    node.children?.forEach(visit);
  };

  roots.forEach(visit);
  return dedupeAccessSelection(output);
};

export const compressAcademicSelectionToScopeRows = (
  checkedItem: AccessSelection,
  allBoards: any[] | undefined
): AcademicScopeRow[] => {
  if (!allBoards?.length) return [];

  const scopeRoots = toAccessScopeTree(allBoards);
  const sourceSets = toAccessSelectionSets(checkedItem || emptyAccessSelection());
  const rows: AcademicScopeRow[] = [];
  const seen = new Set<string>();

  const pushRow = (row: AcademicScopeRow) => {
    const key = [
      row.educationBoardId,
      row.educationMediumId,
      row.educationMediumStageId,
      row.standardId,
      row.divisionId,
    ].join('|');
    if (!seen.has(key)) {
      seen.add(key);
      rows.push({ ...row });
    }
  };

  const visit = (node: AccessScopeTreeNode) => {
    if (sourceSets[node.type].has(node.id)) {
      pushRow(node.path);
      return;
    }

    node.children?.forEach(visit);
  };

  scopeRoots.forEach(visit);
  return rows;
};

// Add every id within a board (from the full boards tree) into `out`.
const addAllFromBoardTree = (board: any, out: AccessSelection) => {
  if (!board) return;
  out.boards.push(board.id);
  board.educationMediums?.forEach((medium: any) => {
    addAllFromMediumTree(medium, out);
  });
};

const addAllFromMediumTree = (medium: any, out: AccessSelection) => {
  if (!medium) return;
  out.mediums.push(medium.id);
  medium.educationMediumStages?.forEach((stage: any) => {
    addAllFromStageTree(stage, out);
  });
};

const addAllFromStageTree = (stage: any, out: AccessSelection) => {
  if (!stage) return;
  out.organizations.push(stage.id);
  stage.standards?.forEach((std: any) => {
    addAllFromStandardTree(std, out);
  });
};

const addAllFromStandardTree = (std: any, out: AccessSelection) => {
  if (!std) return;
  out.standards.push(std.id);
  std.divisions?.forEach((div: any) => {
    if (div?.id) out.divisions.push(div.id);
  });
};

/**
 * Expand a BE `accessibleHierarchy` response into flat id sets matching the
 * UI's checkedItem shape. Uses the full boards tree to fill in branches the
 * BE compressed via `hasFull*Access` flags.
 *
 * @param accessControl    The full BE response (with `accessibleHierarchy`).
 * @param allBoards        Full boards tree for the same academic year
 *                         (e.g. `useGetBoardsQuery().data.items` filtered by year).
 */
export const expandAccessibleHierarchy = (
  accessControl: any,
  allBoards: any[] | undefined
): AccessSelection => {
  const out = emptySelection();
  const root = accessControl?.accessibleHierarchy?.[0];
  if (!root || !allBoards?.length) return out;

  // Top-level: full access to every board in the academic year.
  if (root.hasFullBoardAccess) {
    allBoards.forEach((b) => addAllFromBoardTree(b, out));
    return out;
  }

  root.boards?.forEach((beBoard: any) => {
    const fullBoard = allBoards.find((b) => b.id === beBoard.boardId);
    if (!fullBoard) return;

    if (beBoard.hasFullMediumAccess) {
      out.boards.push(fullBoard.id);
      fullBoard.educationMediums?.forEach((m: any) => addAllFromMediumTree(m, out));
      return;
    }

    beBoard.mediums?.forEach((beMedium: any) => {
      const fullMedium = fullBoard.educationMediums?.find((m: any) => m.id === beMedium.mediumId);
      if (!fullMedium) return;

      if (beMedium.hasFullMediumStageAccess) {
        out.mediums.push(fullMedium.id);
        fullMedium.educationMediumStages?.forEach((s: any) => addAllFromStageTree(s, out));
        return;
      }

      beMedium.mediumStages?.forEach((beStage: any) => {
        const fullStage = fullMedium.educationMediumStages?.find(
          (s: any) => s.id === beStage.mediumStageId
        );
        if (!fullStage) return;

        if (beStage.hasFullStandardAccess) {
          out.organizations.push(fullStage.id);
          fullStage.standards?.forEach((st: any) => addAllFromStandardTree(st, out));
          return;
        }

        beStage.standards?.forEach((beStd: any) => {
          const fullStd = fullStage.standards?.find((st: any) => st.id === beStd.standardId);
          if (!fullStd) return;

          if (beStd.hasFullDivisionAccess) {
            out.standards.push(fullStd.id);
            // Use fullStd.divisions to handle the case where BE returns empty divisions array
            fullStd.divisions?.forEach((d: any) => {
              if (d?.id) out.divisions.push(d.id);
            });
            return;
          }

          beStd.divisions?.forEach((beDiv: any) => {
            if (!beDiv.hasAccess) return;
            const fullDiv = fullStd.divisions?.find((d: any) => d.id === beDiv.divisionId);
            if (!fullDiv) return;
            out.divisions.push(fullDiv.id);
          });
        });
      });
    });
  });

  // De-duplicate; overlapping branches should not normally occur.
  return dedupeAccessSelection(out);
};

const hasNodeAccess = (node: any, fullAccessKey?: string) =>
  !!node?.hasAccess || (fullAccessKey ? !!node?.[fullAccessKey] : false);

const hasAccessibleStandard = (standardScope: any) =>
  hasNodeAccess(standardScope, 'hasFullDivisionAccess') ||
  standardScope?.divisions?.some((divisionScope: any) => divisionScope?.hasAccess);

const hasAccessibleMediumStage = (mediumStageScope: any) =>
  hasNodeAccess(mediumStageScope, 'hasFullStandardAccess') ||
  mediumStageScope?.standards?.some(hasAccessibleStandard);

const hasAccessibleMedium = (mediumScope: any) =>
  hasNodeAccess(mediumScope, 'hasFullMediumStageAccess') ||
  mediumScope?.mediumStages?.some(hasAccessibleMediumStage);

const hasAccessibleBoard = (boardScope: any) =>
  hasNodeAccess(boardScope, 'hasFullMediumAccess') ||
  boardScope?.mediums?.some(hasAccessibleMedium);

const pruneStandardByScope = <TStandard extends { id: string; divisions?: any[] }>(
  standard: TStandard,
  standardScope: any
): TStandard | null => {
  if (!hasAccessibleStandard(standardScope)) return null;

  if (standardScope.hasFullDivisionAccess) {
    return standard;
  }

  const divisions = (standard.divisions || []).filter((division: any) =>
    standardScope.divisions?.some(
      (divisionScope: any) => divisionScope?.divisionId === division.id && divisionScope?.hasAccess
    )
  );

  if (!hasNodeAccess(standardScope) && divisions.length === 0) {
    return null;
  }

  return { ...standard, divisions };
};

const pruneMediumStageByScope = <
  TMediumStage extends { id: string; standards?: Array<TStandard> },
  TStandard extends { id: string; divisions?: any[] },
>(
  stage: TMediumStage,
  stageScope: any
): TMediumStage | null => {
  if (!hasAccessibleMediumStage(stageScope)) return null;

  if (stageScope.hasFullStandardAccess) {
    return stage;
  }

  const standards = (stage.standards || [])
    .map((standard) => {
      const standardScope = stageScope.standards?.find(
        (item: any) => item.standardId === standard.id
      );
      return pruneStandardByScope(standard, standardScope);
    })
    .filter(Boolean) as TStandard[];

  if (!hasNodeAccess(stageScope) && standards.length === 0) {
    return null;
  }

  return { ...stage, standards };
};

const pruneMediumByScope = <
  TMedium extends { id: string; educationMediumStages?: Array<TMediumStage> },
  TMediumStage extends { id: string; standards?: Array<TStandard> },
  TStandard extends { id: string; divisions?: any[] },
>(
  medium: TMedium,
  mediumScope: any
): TMedium | null => {
  if (!hasAccessibleMedium(mediumScope)) return null;

  if (mediumScope.hasFullMediumStageAccess) {
    return medium;
  }

  const educationMediumStages = (medium.educationMediumStages || [])
    .map((stage) => {
      const stageScope = mediumScope.mediumStages?.find(
        (item: any) => item.mediumStageId === stage.id
      );
      return pruneMediumStageByScope(stage, stageScope);
    })
    .filter(Boolean) as TMediumStage[];

  if (!hasNodeAccess(mediumScope) && educationMediumStages.length === 0) {
    return null;
  }

  return { ...medium, educationMediumStages };
};

export const getScopedAcademicData = <
  TAcademicYear extends { id: string; boards: Array<TBoard> },
  TBoard extends { id: string; educationMediums?: Array<TMedium> },
  TMedium extends { id: string; educationMediumStages?: Array<TMediumStage> },
  TMediumStage extends { id: string; standards?: Array<TStandard> },
  TStandard extends { id: string; divisions?: any[] },
>(
  academicData: TAcademicYear[],
  accessControl: any
): TAcademicYear[] => {
  if (!academicData.length) return [];
  if (accessControl?.isAdmin) return academicData;

  const hierarchy = accessControl?.accessibleHierarchy;
  if (!Array.isArray(hierarchy)) return [];

  return academicData
    .map((year) => {
      const yearScope = hierarchy.find((item: any) => item.academicYearId === year.id);
      if (!yearScope) return null;

      if (yearScope.hasFullBoardAccess) {
        return year;
      }

      const boards = year.boards
        .map((board) => {
          const boardScope = yearScope.boards?.find((item: any) => item.boardId === board.id);
          if (!hasAccessibleBoard(boardScope)) return null;

          if (boardScope.hasFullMediumAccess) {
            return board;
          }

          const educationMediums = (board.educationMediums || [])
            .map((medium) => {
              const mediumScope = boardScope.mediums?.find(
                (item: any) => item.mediumId === medium.id
              );
              return pruneMediumByScope(medium, mediumScope);
            })
            .filter(Boolean) as TMedium[];

          return educationMediums.length ? { ...board, educationMediums } : null;
        })
        .filter(Boolean) as TBoard[];

      return boards.length ? { ...year, boards } : null;
    })
    .filter(Boolean) as TAcademicYear[];
};

export const getScopedAcademicYears = <TAcademicYear extends { id: string }>(
  academicData: TAcademicYear[],
  accessControl: any
): TAcademicYear[] => {
  if (!academicData.length) return [];
  if (accessControl?.isAdmin) return academicData;

  const hierarchy = accessControl?.accessibleHierarchy;
  if (!Array.isArray(hierarchy)) return [];

  const scopedYearIds = new Set(hierarchy.map((item: any) => item?.academicYearId).filter(Boolean));

  return academicData.filter((year) => scopedYearIds.has(year.id));
};

export const getGlobalAcademicSearchOptions = <
  TAcademicYear extends { id: string; name: string; boards: Array<TBoard> },
  TBoard extends { id: string; name: string; educationMediums?: Array<TMedium> },
  TMedium extends { id: string; name: string },
>(
  scopedData: TAcademicYear[]
): Array<GlobalAcademicSearchOption<TAcademicYear, TBoard, TMedium>> => {
  const options: Array<GlobalAcademicSearchOption<TAcademicYear, TBoard, TMedium>> = [];

  scopedData.forEach((year) => {
    year.boards.forEach((board) => {
      (board.educationMediums || []).forEach((medium) => {
        options.push({
          label: `${year.name} / ${board.name} / ${medium.name}`,
          value: `${year.id}-${board.id}-${medium.id}`,
          academicYear: year,
          board,
          medium,
        });
      });
    });
  });

  return options;
};

export const getValidGlobalAcademicSelection = <
  TAcademicYear extends { id: string },
  TBoard extends { id?: string },
  TMedium extends { id?: string },
>(
  currentYear: { id?: string } | undefined,
  currentBoard: { id?: string } | undefined,
  currentMedium: { id?: string } | undefined,
  scopedYears: TAcademicYear[],
  options: Array<GlobalAcademicSearchOption<TAcademicYear, TBoard, TMedium>>
): GlobalAcademicSelection<TAcademicYear, TBoard, TMedium> | null => {
  if (!currentYear?.id) return null;

  const scopedYear = scopedYears.find((year) => year.id === currentYear.id);
  if (!scopedYear) {
    return {
      academicYear: {} as TAcademicYear,
      board: {} as TBoard,
      medium: {} as TMedium,
      selectedOption: null,
      clearYear: true,
    };
  }

  if (!currentBoard?.id && !currentMedium?.id) {
    return {
      academicYear: scopedYear,
      board: {} as TBoard,
      medium: {} as TMedium,
      selectedOption: null,
      clearYear: false,
    };
  }

  const selectedOption = options.find(
    (option) =>
      option.academicYear.id === currentYear.id &&
      option.board.id === currentBoard?.id &&
      option.medium.id === currentMedium?.id
  );

  if (!selectedOption) {
    return {
      academicYear: scopedYear,
      board: {} as TBoard,
      medium: {} as TMedium,
      selectedOption: null,
      clearYear: false,
    };
  }

  return {
    academicYear: selectedOption.academicYear,
    board: selectedOption.board,
    medium: selectedOption.medium,
    selectedOption,
    clearYear: false,
  };
};

export const getScopedSelectedAcademicOption = <
  TAcademicYear extends { id: string },
  TBoard extends { id?: string },
  TMedium extends { id?: string },
>(
  currentYear: { id?: string } | undefined,
  currentBoard: { id?: string } | undefined,
  currentMedium: { id?: string } | undefined,
  options: Array<GlobalAcademicSearchOption<TAcademicYear, TBoard, TMedium>>
): GlobalAcademicSearchOption<TAcademicYear, TBoard, TMedium> | null => {
  if (!currentYear?.id || !currentBoard?.id || !currentMedium?.id) {
    return null;
  }

  return (
    options.find(
      (option) =>
        option.academicYear.id === currentYear.id &&
        option.board.id === currentBoard.id &&
        option.medium.id === currentMedium.id
    ) ?? null
  );
};
