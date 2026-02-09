export interface IAcademicRule {
  boards: string[];
  mediums: string[];
  stages: string[];
  classes: string[];
  divisions: string[];
}

export interface IFilterRow {
  field: number;
  operator: number;
  value: string;
}

export interface IGroupRules {
  academicRules: IAcademicRule | null;
  roles: string[];
  studentFilters: IFilterRow[];
  employeeFilters: IFilterRow[];
  academicTree: any[];
}

export interface INameBasedRules extends IGroupRules {
  selectedMembers: any[];
}

export interface IGroup {
  id: string;
  name: string;
  description: string;
  ruleBased: IGroupRules;
  nameBased: INameBasedRules;
}
