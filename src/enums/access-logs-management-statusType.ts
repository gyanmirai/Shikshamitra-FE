export enum AccessLogsManagementStatusType {
  Entry,
  Exit,
}

export const AccessLogsManagementStatusTypeOptions = [
  {
    label: 'Entry',
    value: AccessLogsManagementStatusType.Entry,
  },
  {
    label: 'Exit',
    value: AccessLogsManagementStatusType.Exit,
  },
];

export const AccessLogsManagementStatusTypeColors = {
  [AccessLogsManagementStatusType.Entry]: 'success',
  [AccessLogsManagementStatusType.Exit]: 'warning',
};
