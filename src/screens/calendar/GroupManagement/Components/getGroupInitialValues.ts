import type { IGroup } from './type';

export const getGroupInitialValues = (initialValues: any): IGroup & { [key: string]: any } => ({
  id: initialValues?.id || '',
  name: initialValues?.name || initialValues?.groupName || '',
  description: initialValues?.description || '',
  ruleBased: {
    academicRules:
      initialValues?.ruleBased?.academicRules || initialValues?.ruleBased?.academicSelection || [],
    roles: initialValues?.ruleBased?.roleIds || [],
    studentFilters: initialValues?.ruleBased?.studentFilters || [],
    employeeFilters: initialValues?.ruleBased?.employeeFilters || [],
    academicTree: initialValues?.ruleBased?.academicTree || [],
  },
  nameBased: {
    academicRules:
      initialValues?.nameBased?.academicRules || initialValues?.nameBased?.academicSelection || [],
    roles: initialValues?.nameBased?.roleIds || [],
    studentFilters: initialValues?.nameBased?.studentFilters || [],
    employeeFilters: initialValues?.nameBased?.employeeFilters || [],
    selectedMembers: initialValues?.nameBased?.selectedMembers || initialValues?.selections || [],
    academicTree: initialValues?.academicTree || [],
  },
});
