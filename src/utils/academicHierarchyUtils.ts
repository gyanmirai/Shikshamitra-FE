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

const emptySelection = (): AccessSelection => ({
  boards: [],
  mediums: [],
  organizations: [],
  standards: [],
  divisions: [],
});

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

  // De-duplicate (defensive — overlapping branches shouldn't normally occur).
  (Object.keys(out) as Array<keyof AccessSelection>).forEach((k) => {
    out[k] = Array.from(new Set(out[k]));
  });

  return out;
};
