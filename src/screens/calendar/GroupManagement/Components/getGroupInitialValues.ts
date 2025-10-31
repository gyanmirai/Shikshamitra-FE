import type { IGroup } from './type';

export const getGroupInitialValues = (initialValues: IGroup | null): IGroup => ({
  id: initialValues?.id || '',
  groupName: initialValues?.groupName || '',
  description: initialValues?.description || '',
  boards: initialValues?.boards || [],
  mediums: initialValues?.mediums || [],
  organizations: initialValues?.organizations || [],
  classes: initialValues?.classes || [],
  divisions: initialValues?.divisions || [],
  users: initialValues?.users || [],
  roles: initialValues?.roles || [],
  total: initialValues?.total ?? 0,
});
