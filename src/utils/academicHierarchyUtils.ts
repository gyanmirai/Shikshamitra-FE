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
