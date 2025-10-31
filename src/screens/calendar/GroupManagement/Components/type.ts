export interface IGroup {
  id: string;
  groupName: string;
  description: string;
  boards: string[];
  mediums: string[];
  organizations: string[];
  classes: string[];
  divisions: string[];
  users: string[];
  roles: string[];
  total: number;
}
