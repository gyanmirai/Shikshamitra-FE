// Backwards-compat shim. The real implementation lives in ./create-slots.
// Existing imports across the app keep working:
//   import CreateSlotsForm, { getDayLabel } from './createSlotsForm';

export { default } from './create-slots/CreateSlotsForm';
export { getDayLabel } from './create-slots/utils/dayMarks';
