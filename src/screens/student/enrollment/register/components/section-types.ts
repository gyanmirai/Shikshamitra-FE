import type { SxProps } from '@mui/material';
import type { UseBooleanReturn } from 'src/hooks/useBoolean';
// Shared value contracts for the General form
export interface CountryValue {
  name: string;
  isoCode: string;
}
export interface StateValue {
  name: string;
  isoCode: string;
}
export interface CityValue {
  name: string;
}

export interface GeneralFormValues {
  inquiryNo: string;
  formNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: any | null; // Dayjs instance or null
  age: string;
  gender: number | string | undefined;
  adharNo: string;
  religion: number | string | undefined;
  familyCast: string;
  castCategory: number | string | null | undefined;
  motherTongue: number | string | undefined;
  nationality: string;
  birthPlace: string;
  primaryContactNumber: string;
  secondaryContactNumber: string;
  email: string;
  userId: string | null;
  id: string | null;
  medium: string;
  board: string;
  academicYear: string;
  class: string;
  previousSchool: string;
  photo: string;
  city: CityValue;
  state: StateValue;
  country: CountryValue;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  pinCode: string;
  inquiryPreference: string | null;
  apparId: string;
  panNo: string;
  lastClassPassed: string;
}

export type FormikLike<TValues> = {
  validateField(arg0: string): unknown;
  values: TValues;
  touched: Record<string, unknown>;
  errors: Record<string, unknown>;
  handleBlur: (e?: unknown) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFieldValue: (field: string, value: unknown, shouldValidate?: boolean) => void;
  setFieldTouched: (field: string, touched?: boolean, shouldValidate?: boolean) => void;
  resetForm: (nextState?: unknown) => void;
  isSubmitting: boolean;
  submitForm?: () => Promise<unknown>;
  validateForm: () => Promise<Record<string, unknown>>;
  getFieldProps?: (name: string) => Record<string, unknown>;
};

export interface SectionProps {
  formik: FormikLike<GeneralFormValues>;
  isMainForm?: boolean;
  isEdit: UseBooleanReturn;
  onSave: () => Promise<void | false | undefined>;
  onCancel: () => void;
  headerSx?: SxProps;
}
