export interface IAcademicRule {
  boards: string[];
  mediums: string[];
  stages: string[];
  classes: string[];
  divisions: string[];
}

export interface IFilterRow {
  field: string;
  operator: string;
  value: string;
}

export interface IGroupRules {
  academicRules: IAcademicRule[];
  roles: string[];
  studentFilters: IFilterRow[];
  employeeFilters: IFilterRow[];
  academicTree: any[];
}

export interface INameBasedRules extends IGroupRules {
  selectedMembers: string[];
}

export interface IGroup {
  id: string;
  name: string;
  description: string;
  ruleBased: IGroupRules;
  nameBased: INameBasedRules;
}
