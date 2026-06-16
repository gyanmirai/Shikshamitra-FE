import * as Yup from 'yup';

export type EmployeeApplicationLocation = {
  name: string;
  isoCode: string;
  countryCode?: string;
};

export type EmployeeApplicationFamilyMemberValues = {
  name: string;
  occupation: string;
  mobileNo: string;
  address1: string;
  address2: string;
  address3: string;
  country: EmployeeApplicationLocation | null;
  state: EmployeeApplicationLocation | null;
  city: string;
  pincode: string;
};

export type EmployeeApplicationWorkExperienceValues = {
  mediumStageName: string;
  designation: string;
  department: string;
  country: EmployeeApplicationLocation | null;
  state: EmployeeApplicationLocation | null;
  city: string;
  startDate: string;
  endDate: string;
};

export type EmployeeApplicationFormValues = {
  personalInfo: {
    firstName: string;
    middleName: string;
    shortName: string;
    lastName: string;
    email: string;
    mobileNo: string;
    secondaryMobileNo: string;
    dateOfBirth: string;
    gender: string;
    religion: string;
    casteType: string;
    familyCaste: string;
    maritalStatus: string;
    bloodGroup: string;
    isTeaching: boolean;
    department: string;
    designation: string;
    qualification: string;
    identificationMark1: string;
    address1: string;
    address2: string;
    address3: string;
    country: EmployeeApplicationLocation | null;
    state: EmployeeApplicationLocation | null;
    city: string;
    pincode: string;
  };
  familyInfo: {
    fatherDetails: EmployeeApplicationFamilyMemberValues;
    motherDetails: EmployeeApplicationFamilyMemberValues;
    spouseDetails: EmployeeApplicationFamilyMemberValues;
  };
  additionalInfo: {
    personWithDisability: boolean;
    secondLanguage: string;
    isLibraryMember: boolean;
    isTransportMember: boolean;
  };
  workExperiences: EmployeeApplicationWorkExperienceValues[];
};

export type PublicApplicationSeed = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  mobileNo?: string;
  positionAppliedFor?: string;
  departmentAppliedFor?: string;
};

const indiaLocation: EmployeeApplicationLocation = {
  name: 'India',
  isoCode: 'IN',
};

export const emptyFamilyMember = (): EmployeeApplicationFamilyMemberValues => ({
  name: '',
  occupation: '',
  mobileNo: '',
  address1: '',
  address2: '',
  address3: '',
  country: null,
  state: null,
  city: '',
  pincode: '',
});

export const emptyWorkExperience = (): EmployeeApplicationWorkExperienceValues => ({
  mediumStageName: '',
  designation: '',
  department: '',
  country: null,
  state: null,
  city: '',
  startDate: '',
  endDate: '',
});

export const createEmployeeApplicationInitialValues = (
  application?: PublicApplicationSeed
): EmployeeApplicationFormValues => ({
  personalInfo: {
    firstName: application?.firstName || '',
    middleName: application?.middleName || '',
    shortName: '',
    lastName: application?.lastName || '',
    email: application?.email || '',
    mobileNo: application?.mobileNo || '',
    secondaryMobileNo: '',
    dateOfBirth: '',
    gender: '',
    religion: '',
    casteType: '',
    familyCaste: '',
    maritalStatus: '',
    bloodGroup: '',
    isTeaching: true,
    department: application?.departmentAppliedFor || '',
    designation: application?.positionAppliedFor || '',
    qualification: '',
    identificationMark1: '',
    address1: '',
    address2: '',
    address3: '',
    country: indiaLocation,
    state: null,
    city: '',
    pincode: '',
  },
  familyInfo: {
    fatherDetails: emptyFamilyMember(),
    motherDetails: emptyFamilyMember(),
    spouseDetails: emptyFamilyMember(),
  },
  additionalInfo: {
    personWithDisability: false,
    secondLanguage: '',
    isLibraryMember: false,
    isTransportMember: false,
  },
  workExperiences: [],
});

const trimString = (value?: string | null) => (value || '').trim();

const requiredLocationSchema = (label: string) =>
  Yup.object({
    name: Yup.string().trim().required(`${label} is required.`).max(128),
    isoCode: Yup.string().trim().required(`${label} code is required.`).max(3),
  })
    .nullable()
    .required(`${label} is required.`);

const optionalLocationSchema = (label: string) =>
  Yup.mixed<EmployeeApplicationLocation>()
    .nullable()
    .test(
      'complete-optional-location',
      `${label} must include name and code.`,
      function optionalLocation(value) {
        if (!value || typeof value !== 'object') return true;

        const name = trimString(value.name);
        const isoCode = trimString(value.isoCode);

        if (!name && !isoCode) return true;
        if (!name || !isoCode) return this.createError();
        if (name.length > 128) {
          return this.createError({ message: `${label} must be at most 128 characters.` });
        }
        if (isoCode.length > 3) {
          return this.createError({ message: `${label} code must be at most 3 characters.` });
        }

        return true;
      }
    );

const indianMobileSchema = (requiredMessage?: string) => {
  const schema = Yup.string()
    .trim()
    .matches(/^[6-9]\d{9}$/, {
      message: 'Mobile number must be 10 digits starting with 6-9.',
      excludeEmptyString: true,
    });

  return requiredMessage ? schema.required(requiredMessage) : schema.notRequired();
};

const pincodeSchema = Yup.string()
  .trim()
  .max(10)
  .matches(/^$|^\d{6}$/, 'Pincode must be 6 digits.');

const dateOfBirthSchema = Yup.string()
  .required('Date of birth is required.')
  .test('past-date', 'Date of birth must be in the past.', (value) => {
    if (!value) return false;
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Number.isFinite(date.getTime()) && date < today;
  })
  .test('adult', 'Applicant must be at least 18 years old.', (value) => {
    if (!value) return false;
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const birthdayThisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
    if (today < birthdayThisYear) age -= 1;
    return age >= 18;
  });

const familyMemberSchema = (label: string) =>
  Yup.object({
    name: Yup.string().trim().max(256),
    occupation: Yup.string().trim().max(256),
    mobileNo: indianMobileSchema(),
    address1: Yup.string().trim().max(512),
    address2: Yup.string().trim().max(512),
    address3: Yup.string().trim().max(512),
    country: optionalLocationSchema(`${label} country`),
    state: optionalLocationSchema(`${label} state`),
    city: Yup.string().trim().max(128),
    pincode: pincodeSchema,
  }).test('name-when-present', `${label} name is required.`, (value, context) => {
    if (!value || isEmptyFamilyMember(value as EmployeeApplicationFamilyMemberValues)) return true;
    if (value.name?.trim()) return true;
    return context.createError({ path: `${context.path}.name` });
  });

export const employeeApplicationValidationSchema = Yup.object({
  personalInfo: Yup.object({
    firstName: Yup.string().trim().required('First name is required.').max(256),
    middleName: Yup.string().trim().max(256),
    shortName: Yup.string().trim().max(128),
    lastName: Yup.string().trim().required('Last name is required.').max(256),
    email: Yup.string()
      .trim()
      .required('Email is required.')
      .email('Enter a valid email.')
      .max(256),
    mobileNo: indianMobileSchema('Mobile number is required.'),
    secondaryMobileNo: indianMobileSchema().test(
      'different-mobile',
      'Secondary mobile number must be different from the primary mobile number.',
      function secondaryDifferent(value) {
        const primary = this.parent.mobileNo;
        return !value || !primary || value.replace(/\D/g, '') !== primary.replace(/\D/g, '');
      }
    ),
    dateOfBirth: dateOfBirthSchema,
    gender: Yup.string().required('Gender is required.').oneOf(['1', '2']),
    religion: Yup.string().trim().required('Religion is required.').max(128),
    casteType: Yup.string().required('Category is required.').oneOf(['0', '1', '2', '3']),
    familyCaste: Yup.string().trim().max(128),
    maritalStatus: Yup.string().required('Marital status is required.').oneOf(['0', '1', '2', '3']),
    bloodGroup: Yup.string().oneOf(['', '1', '2', '3', '4', '5', '6', '7', '8']),
    isTeaching: Yup.boolean().required(),
    department: Yup.string().trim().max(256),
    designation: Yup.string().trim().max(256),
    qualification: Yup.string().trim().max(512),
    identificationMark1: Yup.string().trim().max(256),
    address1: Yup.string().trim().required('Address line 1 is required.').max(512),
    address2: Yup.string().trim().required('Address line 2 is required.').max(512),
    address3: Yup.string().trim().max(512),
    country: requiredLocationSchema('Country'),
    state: requiredLocationSchema('State'),
    city: Yup.string().trim().required('City is required.').max(128),
    pincode: pincodeSchema,
  }),
  familyInfo: Yup.object({
    fatherDetails: familyMemberSchema('Father'),
    motherDetails: familyMemberSchema('Mother'),
    spouseDetails: familyMemberSchema('Spouse'),
  }),
  additionalInfo: Yup.object({
    personWithDisability: Yup.boolean().required(),
    secondLanguage: Yup.string().trim().max(50),
    isLibraryMember: Yup.boolean().required(),
    isTransportMember: Yup.boolean().required(),
  }),
  workExperiences: Yup.array().of(
    Yup.object({
      mediumStageName: Yup.string().trim().max(256),
      designation: Yup.string().trim().max(256),
      department: Yup.string().trim().max(256),
      country: optionalLocationSchema('Country'),
      state: optionalLocationSchema('State'),
      city: Yup.string().trim().max(128),
      startDate: Yup.string(),
      endDate: Yup.string().test(
        'end-after-start',
        'End date must be on or after start date.',
        function endAfterStart(value) {
          const { startDate } = this.parent;
          if (!value || !startDate) return true;
          return new Date(value) >= new Date(startDate);
        }
      ),
    }).test('complete-work-row', 'Complete or remove this work experience.', (value, context) => {
      const row = value as EmployeeApplicationWorkExperienceValues | undefined;
      if (!row || isEmptyWorkExperience(row)) {
        return context.createError({
          path: `${context.path}.mediumStageName`,
          message:
            'Remove empty work experience rows or complete organization, designation, and start date.',
        });
      }

      if (!row.mediumStageName?.trim()) {
        return context.createError({
          path: `${context.path}.mediumStageName`,
          message: 'Organization is required.',
        });
      }
      if (!row.designation?.trim()) {
        return context.createError({
          path: `${context.path}.designation`,
          message: 'Designation is required.',
        });
      }
      if (!row.startDate) {
        return context.createError({
          path: `${context.path}.startDate`,
          message: 'Start date is required.',
        });
      }

      return true;
    })
  ),
});

export const validateResumeFile = (file: File | null) => {
  if (!file) return null;
  const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
  if (!['.pdf', '.doc', '.docx'].includes(extension)) {
    return 'Resume must be a PDF, DOC, or DOCX file.';
  }
  if (file.size > 10 * 1024 * 1024) {
    return 'Resume must be 10MB or smaller.';
  }
  return null;
};

export const validatePhotoFile = (file: File | null) => {
  if (!file) return null;
  const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
  if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
    return 'Photo must be an image file.';
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'Photo must be 5MB or smaller.';
  }
  return null;
};

export const isEmptyFamilyMember = (member: EmployeeApplicationFamilyMemberValues) =>
  !trimString(member.name) &&
  !trimString(member.occupation) &&
  !trimString(member.mobileNo) &&
  !trimString(member.address1) &&
  !trimString(member.address2) &&
  !trimString(member.address3) &&
  !trimString(member.city) &&
  !trimString(member.pincode) &&
  !member.country &&
  !member.state;

export const isEmptyWorkExperience = (experience: EmployeeApplicationWorkExperienceValues) =>
  !trimString(experience.mediumStageName) &&
  !trimString(experience.designation) &&
  !trimString(experience.department) &&
  !trimString(experience.city) &&
  !experience.startDate &&
  !experience.endDate &&
  !experience.country &&
  !experience.state;

const emptyToNull = (value?: string | null) => {
  const trimmed = trimString(value);
  return trimmed || null;
};

const nullableNumber = (value: string) => (value === '' ? null : Number(value));

const locationPayload = (location: EmployeeApplicationLocation | null) =>
  location && trimString(location.name) && trimString(location.isoCode)
    ? { name: location.name, isoCode: location.isoCode }
    : null;

const familyMemberPayload = (member: EmployeeApplicationFamilyMemberValues) =>
  isEmptyFamilyMember(member)
    ? null
    : {
        name: emptyToNull(member.name),
        occupation: emptyToNull(member.occupation),
        mobileNo: emptyToNull(member.mobileNo),
        address1: emptyToNull(member.address1),
        address2: emptyToNull(member.address2),
        address3: emptyToNull(member.address3),
        country: locationPayload(member.country),
        state: locationPayload(member.state),
        city: emptyToNull(member.city),
        pincode: emptyToNull(member.pincode),
      };

export const buildEmployeeApplicationSubmitPayload = (values: EmployeeApplicationFormValues) => ({
  personalInfo: {
    firstName: values.personalInfo.firstName.trim(),
    middleName: emptyToNull(values.personalInfo.middleName),
    shortName: emptyToNull(values.personalInfo.shortName),
    lastName: values.personalInfo.lastName.trim(),
    email: values.personalInfo.email.trim(),
    mobileNo: values.personalInfo.mobileNo.trim(),
    secondaryMobileNo: emptyToNull(values.personalInfo.secondaryMobileNo),
    dateOfBirth: values.personalInfo.dateOfBirth || null,
    gender: nullableNumber(values.personalInfo.gender),
    religion: values.personalInfo.religion.trim(),
    casteType: nullableNumber(values.personalInfo.casteType),
    familyCaste: emptyToNull(values.personalInfo.familyCaste),
    maritalStatus: nullableNumber(values.personalInfo.maritalStatus),
    bloodGroup: nullableNumber(values.personalInfo.bloodGroup),
    isTeaching: values.personalInfo.isTeaching,
    department: emptyToNull(values.personalInfo.department),
    designation: emptyToNull(values.personalInfo.designation),
    qualification: emptyToNull(values.personalInfo.qualification),
    identificationMark1: emptyToNull(values.personalInfo.identificationMark1),
    address1: values.personalInfo.address1.trim(),
    address2: values.personalInfo.address2.trim(),
    address3: emptyToNull(values.personalInfo.address3),
    country: locationPayload(values.personalInfo.country),
    state: locationPayload(values.personalInfo.state),
    city: values.personalInfo.city.trim(),
    pincode: emptyToNull(values.personalInfo.pincode),
  },
  familyInfo: {
    fatherDetails: familyMemberPayload(values.familyInfo.fatherDetails),
    motherDetails: familyMemberPayload(values.familyInfo.motherDetails),
    spouseDetails: familyMemberPayload(values.familyInfo.spouseDetails),
  },
  additionalInfo: {
    personWithDisability: values.additionalInfo.personWithDisability,
    secondLanguage: emptyToNull(values.additionalInfo.secondLanguage),
    isLibraryMember: values.additionalInfo.isLibraryMember,
    isTransportMember: values.additionalInfo.isTransportMember,
  },
  workExperiences: values.workExperiences.map((experience) => ({
    mediumStageName: experience.mediumStageName.trim(),
    designation: experience.designation.trim(),
    department: emptyToNull(experience.department),
    country: locationPayload(experience.country),
    state: locationPayload(experience.state),
    city: emptyToNull(experience.city),
    startDate: experience.startDate || null,
    endDate: experience.endDate || null,
  })),
});
