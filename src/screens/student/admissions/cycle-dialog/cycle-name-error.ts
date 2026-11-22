export function getCycleNameError(code?: string) {
  switch (code) {
    case 'Admissions.CycleNameAlreadyExists':
      return 'An admission cycle with this name already exists. Enter a different name.';
    case 'Admissions.ArchivedCycleNameAlreadyExists':
      return 'An archived admission cycle with this name already exists. Enter a different name.';
    default:
      return undefined;
  }
}
