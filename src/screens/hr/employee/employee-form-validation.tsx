import dayjs from 'dayjs';
import * as Yup from 'yup';

const MIN_DOB = dayjs('1947-01-01');
const MAX_DOJ = dayjs().add(1, 'year').endOf('day');
const MAX_PHOTO_SIZE_BYTES = 3 * 1024 * 1024;

const getBase64SizeInBytes = (value: string) => {
  const base64Data = value.includes(',') ? value.split(',')[1] : value;
  const normalizedBase64 = base64Data.replace(/\s/g, '');
  const padding = normalizedBase64.endsWith('==') ? 2 : normalizedBase64.endsWith('=') ? 1 : 0;

  return Math.floor((normalizedBase64.length * 3) / 4) - padding;
};

const normalizeIndianMobile = (value?: string | null) => {
  if (!value) return '';
  const stripped = value.replace(/\s/g, '');

  return stripped.startsWith('+91') ? stripped.slice(3) : stripped;
};

const isValidPincode = (value?: string | null) => !value || /^\d{6}$/.test(value);

type PersonalInformationValidationOptions = {
  requirePhoto?: boolean;
  requireIdentity?: boolean;
};

const profilePhotoValidation = ({
  requirePhoto = true,
}: PersonalInformationValidationOptions = {}) => {
  const schema = Yup.string().test('fileSize', 'Photo size must be less than 3MB', (value) => {
    if (!value) return true;
    try {
      return getBase64SizeInBytes(value) <= MAX_PHOTO_SIZE_BYTES;
    } catch {
      return false;
    }
  });

  return requirePhoto ? schema.required('Profile Photo is required') : schema.nullable();
};

const aadhaarValidation = ({ requireIdentity = true }: PersonalInformationValidationOptions = {}) =>
  Yup.string()
    .nullable()
    .test('aadhaar-required', 'Aadhaar number is required', (value) => {
      if (!requireIdentity) return true;
      return !!value;
    })
    .test('aadhaar-format', 'Aadhaar number must be 12 digits', (value) => {
      if (!value) return !requireIdentity;
      return /^\d{12}$/.test(value);
    });

const panValidation = ({ requireIdentity = true }: PersonalInformationValidationOptions = {}) =>
  Yup.string()
    .nullable()
    .test('pan-required', 'PAN number is required', (value) => {
      if (!requireIdentity) return true;
      return !!value;
    })
    .test(
      'pan-format',
      'PAN must be in format: AAAAA9999A (5 letters, 4 digits, 1 letter)',
      (value) => {
        if (!value) return !requireIdentity;
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
      }
    );

export const getPersonalInformationValidationSchema = (
  options: PersonalInformationValidationOptions = {}
) =>
  Yup.object({
    photo: profilePhotoValidation(options),
    //   code: Yup.string().required('Code is required'),
    lastName: Yup.string().required('Last Name is required'),
    firstName: Yup.string().required('First Name is required'),
    middleName: Yup.string().nullable(),
    shortName: Yup.string(),
    // employeeStatusType: Yup.number().required('Employee status type is required'),
    //   subject: Yup.array().required('Subject is required'),
    dob: Yup.mixed()
      .test(
        'is-valid-dayjs',
        'Date of Birth is required',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        `Date of Birth is not valid`,
        (value) =>
          value && dayjs(value as string | number | Date).isAfter(MIN_DOB.subtract(1, 'day'))
      )
      .test(
        'max-date',
        `Date of Birth is not valid`,
        (value) => value && dayjs(value as string | number | Date).isBefore(dayjs())
      )
      .required('Date of Birth is required'),
    // dob: Yup.date().nullable().required('Date of birth is required'),
    familyCast: Yup.string().required('Family Caste is required'),
    castType: Yup.string().required('Category is required'),
    gender: Yup.string().required('Gender is required'),
    religion: Yup.string().required('Religion is required'),
    maritalStatus: Yup.string().required('Marital Status is required'),
    bloodGroup: Yup.string().nullable(),
    adharNo: aadhaarValidation(options),
    panNo: panValidation(options),
    mobileNo: Yup.string()
      .test('valid-indian-mobile', 'Primary Contact No. is not valid', (value) => {
        if (!value) return false;
        const stripped = value.replace(/\s/g, '');
        const normalized = stripped.includes('+') ? stripped : `+91${stripped}`;
        return /^\+91[6-9][0-9]{9}$/.test(normalized);
      })
      .required('Primary Contact No. is required'),
    secondaryMobileNo: Yup.string()
      .nullable()
      .test('valid-indian-mobile', 'Secondary Contact No. is not valid', (value) => {
        if (!value) return true;
        const stripped = value.replace(/\s/g, '');
        const normalized = stripped.includes('+') ? stripped : `+91${stripped}`;
        return /^\+91[6-9][0-9]{9}$/.test(normalized);
      })
      .test(
        'unique',
        'Secondary Contact No. cannot be same as primary contact no.',
        // eslint-disable-next-line func-names
        function (value) {
          return (
            !value || normalizeIndianMobile(value) !== normalizeIndianMobile(this.parent.mobileNo)
          );
        }
      ),
    email: Yup.string()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email')
      .required('Email is required'),
    // email: Yup.string().email('Invalid email').required('Email is required'),
    department: Yup.string(),
    // designation: Yup.string(),
    dateOfJoining: Yup.mixed()
      .test(
        'is-valid-dayjs',
        'Date of Joining is required',
        (value) => value && dayjs(value as any).isValid()
      )
      .test('max-date', 'Date of Joining cannot be more than 1 year in the future', (value) => {
        if (!value) return true;
        return dayjs(value as any).isBefore(MAX_DOJ);
      })
      .required('Date of Joining is required'),
    employeeGroup: Yup.string().required('Employee Group is required'),
    // qualification: Yup.string(),
    role: Yup.string().required('Role is required'),
    //   identificationMark1: Yup.string().required('Identification mark is required'),
    addressLine1: Yup.string().required('Building No./Flat/House No. is required'),
    addressLine2: Yup.string().required('Area/Locality/Road Name is required'),
    addressLine3: Yup.string().nullable(),
    country: Yup.object()
      .shape({ name: Yup.string().required('Country is required') })
      .default(() => ({ name: '' }))
      .required('Country is required'),

    city: Yup.object()
      .shape({ name: Yup.string().required('City is required') })
      .default(() => ({ name: '' }))
      .required('City is required'),
    state: Yup.object()
      .shape({ name: Yup.string().required('State is required') })
      .default(() => ({ name: '' }))
      .required('State is required'),
    pincode: Yup.string().test('picode', 'Must be exactly 6 numbers', isValidPincode),
    shift: Yup.string().required('Shift is required'),
    //   employeeId: Yup.string().required('Employee ID is required'),
  });

export const personalInformationValidationSchema = getPersonalInformationValidationSchema({
  requirePhoto: true,
  requireIdentity: true,
});

const familyInformationValidationSchema = Yup.object({
  fatherName: Yup.string().nullable(),
  //   fatherOccupation: Yup.string().required('Father occupation is required'),
  fatherContactNo: Yup.string()
    .nullable()
    .test('valid-indian-mobile', 'Mobile No. is not valid', (value) => {
      if (!value) return true;
      const stripped = value.replace(/\s/g, '');
      const normalized = stripped.includes('+') ? stripped : `+91${stripped}`;
      return /^\+91[6-9][0-9]{9}$/.test(normalized);
    }),
  // fatherAddress1: Yup.string(),
  // fatherAddress2: Yup.string(),

  // fatherAddress3: Yup.string(),
  // fatherCountry: Yup.object(),
  // fatherState: Yup.object(),
  // fatherCity: Yup.object(),
  fatherPinCode: Yup.string()
    .test('pincode', 'Must be exactly 6 numbers', isValidPincode)
    .nullable(),
  motherName: Yup.string().nullable(),
  //   motherOccupation: Yup.string().required('Mother occupation is required'),
  motherContactNo: Yup.string()
    .nullable()
    .test('valid-indian-mobile', 'Mobile No. is not valid', (value) => {
      if (!value) return true;
      const stripped = value.replace(/\s/g, '');
      const normalized = stripped.includes('+') ? stripped : `+91${stripped}`;
      return /^\+91[6-9][0-9]{9}$/.test(normalized);
    }),
  // motherAddress1: Yup.string(),
  // motherAddress2: Yup.string(),
  // motherAddress3: Yup.string(),
  // motherCountry: Yup.object(),
  // motherState: Yup.object(),
  // motherCity: Yup.object(),
  motherPinCode: Yup.string()
    .test('pincode', 'Must be exactly 6 numbers', isValidPincode)
    .nullable(),
  spouseName: Yup.string().nullable(),
  //   spouseOccupation: Yup.string().required('Spouse occupation is required'),
  spouseContactNo: Yup.string()
    .nullable()
    .test('valid-indian-mobile', 'Mobile No. is not valid', (value) => {
      if (!value) return true;
      const stripped = value.replace(/\s/g, '');
      const normalized = stripped.includes('+') ? stripped : `+91${stripped}`;
      return /^\+91[6-9][0-9]{9}$/.test(normalized);
    }),
  // spouseAddress1: Yup.string(),
  // spouseAddress2: Yup.string(),
  // spouseAddress3: Yup.string(),

  // spouseCountry: Yup.object(),
  // spouseState: Yup.object(),
  // spouseCity: Yup.object(),
  spousePinCode: Yup.string()
    .test('pincode', 'Must be exactly 6 numbers', isValidPincode)
    .nullable(),
});

const additionalDetailsValidationSchema = Yup.object({
  bplCardNo: Yup.string().nullable(),
  personWithDisability: Yup.string().nullable(),
  secondLanguage: Yup.string().nullable(),
  libraryMember: Yup.boolean(),
  transportMember: Yup.boolean(),
});

export const workExperienceValidationSchema = Yup.object({
  experiences: Yup.array().of(
    Yup.object({
      mediumStageName: Yup.string().required('Organization Name is required'),
      // organizationAddress: Yup.string(),
      country: Yup.object().shape({
        name: Yup.string(),
        isoCode: Yup.string(),
      }),
      state: Yup.object().shape({
        name: Yup.string(),
        isoCode: Yup.string(),
      }),
      city: Yup.object().shape({
        name: Yup.string(),
      }),
      startDate: Yup.mixed()
        .test(
          'is-valid-dayjs',
          'Start Date is required',
          (value) => value && dayjs(value as any).isValid()
        )
        .required('Start date is required'),
      endDate: Yup.mixed()
        .nullable()
        .test('is-valid-dayjs', 'End Date is required', (value) =>
          value ? dayjs(value as any).isValid() : true
        )
        // eslint-disable-next-line func-names
        .test('toDate', 'End Date must be greater than start date', function () {
          const { startDate, endDate } = this.parent as any;
          if (startDate && endDate) {
            return dayjs(endDate).isAfter(dayjs(startDate));
          }
          return true;
        }),
      department: Yup.string(),
      // designation: Yup.string().required('Designation is required'),
    })
  ),
});

export const payrollValidationSchema = Yup.object({
  bankName: Yup.string()
    .required('Bank name is required')
    .max(100, 'Bank name must be at most 100 characters'),

  branchName: Yup.string().nullable().max(100, 'Branch name must be at most 100 characters'),

  accountHolderName: Yup.string()
    .required('Account holder name is required')
    .matches(/^[a-zA-Z\s.]+$/, {
      message: 'Only letters and spaces allowed',
      excludeEmptyString: true,
    })
    .max(100, 'Account holder name must be at most 100 characters'),

  accountNumber: Yup.string()
    .required('Account number is required')
    .matches(/^\d+$/, {
      message: 'Account number must contain only digits',
      excludeEmptyString: true,
    })
    .min(9, 'Account number must be at least 9 characters')
    .max(18, 'Account number must be at most 18 digits'),
  ifscCode: Yup.string()
    .required('IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
      message:
        'IFSC code must follow the format: 4 uppercase letters, a zero, then 6 alphanumeric characters (e.g., SBIN0001234)',
      excludeEmptyString: true,
    }),

  pfType: Yup.string().nullable(),

  epfNumber: Yup.string()
    .nullable()
    .matches(/^[A-Z]{2}\/\d{5}\/\d{7}$/, 'Invalid EPF number format(Ex: AP/12345/1234567)'),

  uanNumber: Yup.string()
    .nullable()
    .matches(/^\d{12}$/, 'UAN must be exactly 12 digits'),

  basicSalary: Yup.number()
    .nullable()
    .typeError('Basic salary must be a number')
    .min(0, 'Basic salary cannot be negative'),

  punchId: Yup.string().nullable().max(50, 'Punch ID must be at most 50 characters'),

  // --------------------
  // TDS
  // --------------------
  tdsPercentage: Yup.number()
    .nullable()
    .typeError('TDS percentage must be a number')
    .min(0, 'TDS percentage cannot be negative')
    .max(100, 'TDS percentage cannot exceed 100'),

  tdsAmount: Yup.number()
    .nullable()
    .typeError('TDS amount must be a number')
    .min(0, 'TDS amount cannot be negative'),
  policyOverridePayrollPolicyId: Yup.string().when('policyOverrideEnabled', {
    is: true,
    then: (schema) => schema.required('Payroll policy is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  policyOverrideAttendancePolicyId: Yup.string().when('policyOverrideEnabled', {
    is: true,
    then: (schema) => schema.required('Attendance policy is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  policyOverrideLeavePolicyId: Yup.string().when('policyOverrideEnabled', {
    is: true,
    then: (schema) => schema.required('Leave policy is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  policyOverrideEffectiveFrom: Yup.string().when('policyOverrideEnabled', {
    is: true,
    then: (schema) => schema.required('Effective from date is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  // earningComponents: Yup.array().of(
  //   Yup.object({
  //     name: Yup.string().required('Name is required'),
  //     type: Yup.string().required('Type is required'),
  //     // eslint-disable-next-line func-names
  //     amount: Yup.string().test('amount', 'Amount is required', function () {
  //       if (this.parent.type === 'Fixed') {
  //         return false;
  //       }
  //       return true;
  //     }),
  //   })
  // ),
  // deductionComponents: Yup.array().of(
  //   Yup.object({
  //     name: Yup.string().required('Name is required'),
  //     type: Yup.string().required('Type is required'),
  //     // eslint-disable-next-line func-names
  //     amount: Yup.string().test('amount', 'Amount is required', function () {
  //       if (this.parent.type === 'Fixed') {
  //         return false;
  //       }
  //       return true;
  //     }),
  //   })
  // ),
});

export const reportingManagerValidationSchema = Yup.object({
  reportingManager: Yup.string().required('Reporting manager is required'),
});

export const validations = [
  personalInformationValidationSchema,
  familyInformationValidationSchema,
  additionalDetailsValidationSchema,
  Yup.object({}),
  workExperienceValidationSchema,
  payrollValidationSchema,
  reportingManagerValidationSchema,
  Yup.object({}),
];
export const infoValidations = [
  getPersonalInformationValidationSchema({
    requirePhoto: false,
    requireIdentity: false,
  }),
  familyInformationValidationSchema,
  additionalDetailsValidationSchema,
  workExperienceValidationSchema,
  Yup.object({}),
  reportingManagerValidationSchema,
];
