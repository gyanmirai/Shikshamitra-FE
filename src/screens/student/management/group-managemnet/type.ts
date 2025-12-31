export interface IGroup {
  name: string;
  id: string;
  color: string;
  logoUrl?: string | File | null;
  description?: string;
  academicMediumId?: string;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
  creationTime?: string;
  creatorId?: string;
}

export interface IStudentHouse {
  studentId: string;
  studentName: string;
  grNo: number;
  rollNo: number;
  houseSettingId: string;
  houseSetting: IGroup;
  isDivisionHouseLeader: boolean;
  isGlobalHouseLeader: boolean;
}
