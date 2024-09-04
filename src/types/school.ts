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
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  educationMediumStageId: string;
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
