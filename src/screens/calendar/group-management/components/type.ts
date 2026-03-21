export interface TreeNodeData {
  id: string;
  name: string;
  type: 'boards' | 'mediums' | 'organizations' | 'standards' | 'divisions' | string;
  parentId: string | null;
  children?: TreeNodeData[];
}

export interface IAcademicSelection {
  boards: string[];
  mediums: string[];
  stages: string[];
  classes: string[];
  divisions: string[];
}

export interface IFilter {
  id: string;
  field: number;
  operator: number;
  value: string;
}

export interface ISelectedMember {
  id?: string;
  memberType: number; // 0 for Student, 1 for Employee probably
  memberId: string;
  userId: string;
  displayName?: string;
}

export interface IStudent {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  studentName: string;
  standardId: string;
  standardName: string;
  divisionId: string;
  divisionName: string;
  academicBoardId: string;
  academicBoardName: string;
  academicMediumId: string;
  academicMediumName: string;
  gender: number;
  grNo: number;
  rollNo: number;
  status: number;
  primaryContactNo?: string;
  email?: string;
  profilePicture?: string;
}

export interface IEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeName: string;
  department: string;
  designation: string;
  roleId: string;
  roleName: string;
  genderType: number;
  mobileNo?: string;
  email?: string;
  employeeStatusType: number;
  userId: string;
  profilePicture?: string;
}

export interface IRuleBased {
  academicSelection: IAcademicSelection;
  roleIds: string[];
  studentFilters: IFilter[];
  employeeFilters: IFilter[];
}

export interface INameBased {
  academicSelection: IAcademicSelection;
  roleIds: string[];
  studentFilters: IFilter[];
  employeeFilters: IFilter[];
  selectedMembers: ISelectedMember[];
  students: IStudent[];
  employees: IEmployee[];
  studentCount: number;
  employeeCount: number;
}

export interface IGroup {
  id: string;
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
  tenantId?: string;
  academicYearId?: string;
  name: string;
  description: string;
  ruleBased: IRuleBased;
  nameBased: INameBased;
  memberCount?: number;
  studentCount?: number;
  employeeCount?: number;
}
