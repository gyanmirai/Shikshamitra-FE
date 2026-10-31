export type HousePage<T> = { items: T[]; totalCount: number };
export type HouseCataloguePage = HousePage<House> & { canManage: boolean };
export type HouseStudent = {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  admissionNumber?: string | null;
  standardId: string;
  standardName: string;
  divisionId?: string | null;
  divisionName?: string | null;
  rollNumber?: number | null;
  houseId?: string | null;
  houseName?: string | null;
  isHouseLeader: boolean;
  isDivisionLeader: boolean;
  concurrencyStamp: string;
};
export type House = {
  id: string;
  name: string;
  color: string;
  description?: string | null;
  logoUrl?: string | null;
  memberCount: number;
  leader: HouseStudent | null;
  concurrencyStamp: string;
  canManage: boolean;
};
export type HouseDivision = {
  id: string;
  name: string;
  standardId: string;
  standardName: string;
  studentCount: number;
  leader: HouseStudent | null;
  concurrencyStamp: string;
  canManage: boolean;
};
export type HouseQuery = {
  academicMediumId: string;
  skipCount?: number;
  maxResultCount?: number;
  filter?: string;
  sorting?: string;
  standardId?: string;
  divisionId?: string;
  houseId?: string;
  unassignedOnly?: boolean;
};
export type SaveHouse = {
  academicMediumId: string;
  name: string;
  color: string;
  logoUrl?: string | null;
  description?: string | null;
};
export type HouseAssignment = {
  academicMediumId: string;
  houseId: string | null;
  enrollmentIds: string[];
};
export type HouseAssignmentPreview = {
  previewToken: string;
  students: HouseStudent[];
  clearedHouseLeaders: HouseStudent[];
  targetHouseId?: string | null;
  targetHouseName?: string | null;
};
export type HouseLeaderCommand = {
  id: string;
  academicMediumId: string;
  enrollmentId: string | null;
  concurrencyStamp: string;
};
