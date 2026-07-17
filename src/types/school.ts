export interface AcademicYear {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Board {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  type: number;
  name: string;
  academicYearId: string;
  educationMediums: Medium[];
}

export interface Medium {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  educationBoardId: string;
  educationMediumStages: Organization[];
}

export interface Organization {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  educationMediumId: string;
  name: string;
  standards: Standards[];
}
export interface Standards {
  // map(arg0: (cls: Standards) => JSX.Element): import('react').ReactNode;
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  educationMediumStageId: string;
  shiftId?: string | null;
  shift?: {
    id?: string;
    shiftName?: string;
    startTime?: string;
    endTime?: string;
  } | null;
  divisions: Division[];
}

export interface Division {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  strength: number;
  standardId: string;
}
