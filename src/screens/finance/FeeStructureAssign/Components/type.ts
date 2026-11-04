export interface IFeeStructureData {
  id: string;
  studentId: string;
  studentName?: string;
  grNumber?: string;
  rollNumber?: string | number | null;
  standardDivision?: string;
  boardName?: string;
  mediumName?: string;
  stageName?: string;
  className?: string;
  divisionName?: string;
  totalFees?: number;
  paidFees?: number;
  pendingFees?: number;
  overdueFees?: number;
  totalCharges?: number;
  pendingCharges?: number;
  status?: string;
  name?: string;
  isFeeStructureAssigned?: boolean;
  canEditStructure?: boolean;
  structureEditBlocker?: string;
  structureId?: string;
  structureRevision?: number;
  isActive?: boolean;
  assignmentState?: 'Unassigned' | 'Selected' | 'Prepared' | 'Assigned' | 'NeedsAttention';
  assignmentSource?: 'Admission' | 'Finance';
}

export interface IFeeStructureTableProps {
  onAssignStructure: (row: IFeeStructureData) => void;
  onEdit?: (row: IFeeStructureData) => void;
  onBulkAssign?: (rows: IFeeStructureData[], standardId: string) => void;
}
