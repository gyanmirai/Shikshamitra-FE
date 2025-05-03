export enum AccessLogsManagementSecurityStatusType {
  Used,
  Pending,
}

export const AccessLogsManagementSecurityStatusTypeOptions = [
  {
    label: 'Used',
    value: AccessLogsManagementSecurityStatusType.Used,
  },
  {
    label: 'Pending',
    value: AccessLogsManagementSecurityStatusType.Pending,
  },
];

export const AccessLogsManagementSecurityStatusTypeColor = {
  [AccessLogsManagementSecurityStatusType.Used]: 'success',
  [AccessLogsManagementSecurityStatusType.Pending]: 'warning',
};
