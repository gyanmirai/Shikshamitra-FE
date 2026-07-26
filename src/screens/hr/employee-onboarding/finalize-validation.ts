import type { Dayjs } from 'dayjs';
import type { ReligionType } from 'src/enums/religion';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Yup from 'yup';

export type FinalizeFormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: Dayjs | null;
  gender: string;
  religion: ReligionType | '';
  casteType: string;
  familyCaste: string;
  maritalStatus: string;
  bloodGroup: string;
  email: string;
  mobileNo: string;
  secondaryMobileNo: string;
  panNo: string;
  adharNo: string;
  doj: string;
  isTeaching: boolean;
  department: string;
  designation: string;
  qualification: string;
  identificationMark1: string;
  roleId: string;
  shiftId: string;
  academicPermissionStageIds: string;
  address1: string;
  address2: string;
  address3: string;
  countryName: string;
  countryIsoCode: string;
  stateName: string;
  stateIsoCode: string;
  city: string;
  pinCode: string;
  useSubmittedPhoto: boolean;
  attachResumeAsDocument: boolean;
};

const validateIndianMobile = (value?: string | null) => {
  if (!value) return false;
  const stripped = value.replace(/\s/g, '');
  const normalized = stripped.includes('+') ? stripped : `+91${stripped}`;
  return /^\+91[6-9][0-9]{9}$/.test(normalized);
};

export const finalizeEmployeeFieldsSchema = Yup.object({
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  middleName: Yup.string().nullable(),
  dob: Yup.mixed().nullable(),
  gender: Yup.string().nullable(),
  religion: Yup.mixed().required('Religion is required'),
  casteType: Yup.string().required('Category is required'),
  familyCaste: Yup.string().trim().required('Family Caste is required'),
  maritalStatus: Yup.string().nullable(),
  bloodGroup: Yup.string().nullable(),
  email: Yup.string()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email')
    .required('Email is required'),
  mobileNo: Yup.string()
    .test('valid-indian-mobile', 'Primary Contact No. is not valid', (value) =>
      validateIndianMobile(value)
    )
    .required('Primary Contact No. is required'),
  secondaryMobileNo: Yup.string()
    .nullable()
    .test('valid-indian-mobile', 'Secondary Contact No. is not valid', (value) => {
      if (!value) return true;
      return validateIndianMobile(value);
    })
    .test('unique', 'Secondary Contact No. cannot be same as primary', function unique(value) {
      const { mobileNo } = this.parent;
      if (!value || !mobileNo) return true;
      const strip = (mobile: string) => mobile.replace(/\s/g, '').replace(/^\+91/, '');
      return strip(value) !== strip(mobileNo);
    }),
  adharNo: Yup.string()
    .required('Aadhaar number is required')
    .matches(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits'),
  panNo: Yup.string()
    .required('PAN number is required')
    .test(
      'pan-format',
      'PAN must be in format: AAAAA9999A (5 letters, 4 digits, 1 letter)',
      (value) => !!value && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)
    ),
  doj: Yup.string().required('Date of Joining is required'),
  isTeaching: Yup.boolean(),
  department: Yup.string().nullable(),
  designation: Yup.string().nullable(),
  qualification: Yup.string().nullable(),
  identificationMark1: Yup.string().nullable(),
  roleId: Yup.string().required('Role is required'),
  shiftId: Yup.string().required('Shift is required'),
  address1: Yup.string().required('Building No./Flat/House No. is required'),
  address2: Yup.string().required('Area/Locality/Road Name is required'),
  address3: Yup.string().nullable(),
  countryName: Yup.string().required('Country is required'),
  countryIsoCode: Yup.string().nullable(),
  stateName: Yup.string().required('State is required'),
  stateIsoCode: Yup.string().nullable(),
  city: Yup.string().required('City is required'),
  pinCode: Yup.string()
    .nullable()
    .test(
      'pincode',
      'PIN Code must be exactly 6 digits',
      (value) => !value || /^\d{6}$/.test(value)
    ),
  academicPermissionStageIds: Yup.string().nullable(),
  useSubmittedPhoto: Yup.boolean(),
  attachResumeAsDocument: Yup.boolean(),
});

export const validateFinalizeEmployeeValues = async (
  values: FinalizeFormState
): Promise<FormikErrors<FinalizeFormState>> => {
  try {
    await finalizeEmployeeFieldsSchema.validate(values, { abortEarly: false });
    return {};
  } catch (error) {
    if (!(error instanceof Yup.ValidationError)) {
      throw error;
    }

    const errors: FormikErrors<FinalizeFormState> = {};
    error.inner.forEach((validationError) => {
      const path = validationError.path as keyof FinalizeFormState | undefined;
      if (path && !errors[path]) {
        errors[path] = validationError.message as never;
      }
    });
    return errors;
  }
};

type FinalizeEmployeeValidationTarget = {
  values: FinalizeFormState;
  setTouched: (
    touched: FormikTouched<FinalizeFormState>,
    shouldValidate?: boolean
  ) => Promise<unknown> | unknown;
  setErrors: (errors: FormikErrors<FinalizeFormState>) => void;
};

export const applyFinalizeEmployeeValidation = async (
  target: FinalizeEmployeeValidationTarget
): Promise<FormikErrors<FinalizeFormState>> => {
  const allFields = Object.keys(finalizeEmployeeFieldsSchema.fields) as (keyof FinalizeFormState)[];
  const touchedAll = allFields.reduce<FormikTouched<FinalizeFormState>>(
    (touched, field) => ({ ...touched, [field]: true }),
    {}
  );

  await target.setTouched(touchedAll, false);
  const errors = await validateFinalizeEmployeeValues(target.values);
  target.setErrors(errors);
  return errors;
};
