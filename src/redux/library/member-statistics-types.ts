export type LibraryOverdueClassification = {
  overdueClassificationAvailable?: boolean;
  unknownDueDateCount?: number;
  overdueAsOfDate?: string | null;
  overdueDateSource?: 'ConfirmedLibraryClock' | 'ExplicitSchoolDate' | 'Unavailable';
  overdueUnavailableReason?: string | null;
};
export type LibraryMemberStatistics = LibraryOverdueClassification & {
  currentIssue: number;
  overdueReturnBooks: number;
  reservedBooks: number;
};
