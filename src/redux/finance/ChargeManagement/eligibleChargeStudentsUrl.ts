import type { IEligibleChargeStudentsParams } from './chargeApi';

export const buildEligibleChargeStudentsUrl = ({
  academicYearId,
  boardId,
  educationMediumId,
  classIds,
  divisionIds,
  ...filters
}: IEligibleChargeStudentsParams): string => {
  const params = new URLSearchParams();
  params.set('academicYearId', academicYearId);
  params.set('boardId', boardId);
  params.set('educationMediumId', educationMediumId);
  classIds.forEach((id) => params.append('classIds', id));
  divisionIds?.forEach((id) => params.append('divisionIds', id));
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return `/charges/eligible-students?${params.toString()}`;
};
