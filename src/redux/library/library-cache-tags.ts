import { libraryChargeType, libraryModuleType } from 'src/redux/tagTypes';

export const libraryInventoryMutationTags = [
  libraryModuleType.books,
  libraryModuleType.copies,
  libraryModuleType.copyLabels,
  libraryModuleType.dashboard,
] as const;
export const libraryReservationMutationTags = [
  libraryModuleType.books,
  libraryModuleType.copies,
  libraryModuleType.bookReservation,
  libraryModuleType.members,
  libraryModuleType.dashboard,
] as const;
export const libraryChargeMutationTags = [
  libraryChargeType.libraryCharge,
  libraryModuleType.memberCharges,
  libraryModuleType.members,
  libraryModuleType.dashboard,
] as const;
export const libraryCirculationMutationTags = [
  ...libraryInventoryMutationTags,
  libraryModuleType.members,
  libraryModuleType.bookIssue,
  libraryModuleType.bookReturn,
  libraryModuleType.bookReservation,
  libraryModuleType.memberCharges,
  libraryModuleType.borrowHistory,
  libraryChargeType.libraryCharge,
  libraryModuleType.libraryNotificationHistory,
] as const;
