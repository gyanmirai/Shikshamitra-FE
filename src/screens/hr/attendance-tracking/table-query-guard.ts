/** Query changes must never replace the row context of an open adjustment or save. */
export const isRegisterQueryLocked = (state: {
  editRow: unknown;
  bulkOpen: boolean;
  isAdjusting: boolean;
  isBulkAdjusting: boolean;
}) => Boolean(state.editRow || state.bulkOpen || state.isAdjusting || state.isBulkAdjusting);
