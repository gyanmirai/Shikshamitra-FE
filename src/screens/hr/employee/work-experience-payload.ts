type LocationOption = {
  name?: string | null;
  isoCode?: string | null;
} | null;

const normalizeLocationOption = (value: LocationOption) => {
  const name = value?.name?.trim();
  const isoCode = value?.isoCode?.trim();

  return name && isoCode ? { name, isoCode } : null;
};

export const buildWorkExperiencePayload = (
  experience: any,
  formatDate: (value: any) => string | null
) => ({
  id: experience.id,
  mediumStageName: experience.mediumStageName ?? '',
  designation: experience.designation,
  department: experience.department,
  country: normalizeLocationOption(experience.country),
  state: normalizeLocationOption(experience.state),
  city: experience.city?.name ?? '',
  startDate: experience.startDate ? formatDate(experience.startDate) : null,
  endDate: experience.endDate ? formatDate(experience.endDate) : null,
});
