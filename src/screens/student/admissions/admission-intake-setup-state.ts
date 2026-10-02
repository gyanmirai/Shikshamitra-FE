import { parseApiProblemDetail } from 'src/utils/api-problem-details';

const CONCURRENCY_ERROR_CODE = 'Admissions:Intake:ConcurrencyConflict';

export type AdmissionIntakeSetupListState = 'loading' | 'error' | 'empty' | 'ready';
export type LegacyAdmissionIntakeProfilesState = 'loading' | 'error' | 'empty' | 'ready';

export const getAdmissionIntakeSetupListState = ({
  isLoading,
  isError,
  hasData,
  rowCount,
}: {
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  rowCount: number;
}): AdmissionIntakeSetupListState => {
  if (!hasData && isLoading) return 'loading';
  if (!hasData && isError) return 'error';
  return rowCount === 0 ? 'empty' : 'ready';
};

export const isAdmissionIntakeSetupConcurrencyError = (error: unknown) => {
  const errorCode = parseApiProblemDetail(error).errorCode;
  return typeof errorCode === 'string' && errorCode.replace(/\./g, ':') === CONCURRENCY_ERROR_CODE;
};

export const getLegacyAdmissionIntakeProfilesState = ({
  isLoading,
  isError,
  profileCount,
}: {
  isLoading: boolean;
  isError: boolean;
  profileCount: number;
}): LegacyAdmissionIntakeProfilesState => {
  if (isLoading) return 'loading';
  if (isError) return 'error';
  return profileCount === 0 ? 'empty' : 'ready';
};
