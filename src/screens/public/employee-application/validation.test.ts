import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  formatDatePayload,
  emptyWorkExperience,
  type EmployeeApplicationFormValues,
  employeeApplicationValidationSchema,
  buildEmployeeApplicationSubmitPayload,
  getEmployeeApplicationInstitutionDate,
  resolveEmployeeApplicationUploadErrors,
  createEmployeeApplicationInitialValues,
  isAfterEmployeeApplicationInstitutionDate,
} from './validation';

const dateYearsAgo = (years: number) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
};

const dateDaysFromNow = (days: number) => {
  const [year, month, day] = getEmployeeApplicationInstitutionDate().split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
};

const validationPaths = async (values: EmployeeApplicationFormValues) => {
  try {
    await employeeApplicationValidationSchema.validate(values, { abortEarly: false });
    return [];
  } catch (error: any) {
    return (error.inner || []).map((item: any) => item.path);
  }
};

const validValues = (): EmployeeApplicationFormValues => ({
  ...createEmployeeApplicationInitialValues({
    firstName: 'Yagnik',
    middleName: 'Auto',
    lastName: 'Candidate',
    email: 'candidate@example.com',
    mobileNo: '9876543210',
    positionAppliedFor: 'Mathematics Teacher',
    departmentAppliedFor: 'Academics',
  }),
  personalInfo: {
    ...createEmployeeApplicationInitialValues().personalInfo,
    firstName: 'Yagnik',
    middleName: 'Auto',
    lastName: 'Candidate',
    email: 'candidate@example.com',
    mobileNo: '9876543210',
    secondaryMobileNo: '8876543210',
    dateOfBirth: dateYearsAgo(25),
    gender: '1',
    religion: '0',
    casteType: '0',
    familyCaste: 'General',
    maritalStatus: '0',
    department: 'Academics',
    designation: 'Mathematics Teacher',
    qualification: 'M.Sc Mathematics with B.Ed',
    identificationMark1: 'Small mark on left hand',
    address1: 'House 1',
    address2: 'Automation Road',
    country: { name: 'India', isoCode: 'IN' },
    state: { name: 'Gujarat', isoCode: 'GJ', countryCode: 'IN' },
    city: 'Ahmedabad',
    pincode: '380001',
  },
  familyInfo: {
    fatherDetails: {
      ...createEmployeeApplicationInitialValues().familyInfo.fatherDetails,
      name: 'Father Candidate',
      mobileNo: '7876543210',
    },
    motherDetails: createEmployeeApplicationInitialValues().familyInfo.motherDetails,
    spouseDetails: createEmployeeApplicationInitialValues().familyInfo.spouseDetails,
  },
  additionalInfo: {
    personWithDisability: false,
    secondLanguage: 'Gujarati',
    isLibraryMember: true,
    isTransportMember: false,
  },
  workExperiences: [],
});

describe('employee application validation schema', () => {
  it('requires the core personal and address fields', async () => {
    const paths = await validationPaths(createEmployeeApplicationInitialValues());

    expect(paths).toContain('personalInfo.firstName');
    expect(paths).toContain('personalInfo.lastName');
    expect(paths).toContain('personalInfo.email');
    expect(paths).toContain('personalInfo.mobileNo');
    expect(paths).toContain('personalInfo.dateOfBirth');
    expect(paths).toContain('personalInfo.gender');
    expect(paths).toContain('personalInfo.address1');
    expect(paths).toContain('personalInfo.state');
    expect(paths).toContain('personalInfo.city');
  });

  it('rejects invalid Indian mobile numbers', async () => {
    const values = validValues();
    values.personalInfo.mobileNo = '20938740982304';

    const paths = await validationPaths(values);

    expect(paths).toContain('personalInfo.mobileNo');
  });

  it('rejects applicants younger than 18', async () => {
    const values = validValues();
    values.personalInfo.dateOfBirth = dateYearsAgo(10);

    const paths = await validationPaths(values);

    expect(paths).toContain('personalInfo.dateOfBirth');
  });

  it('rejects invalid pincodes', async () => {
    const values = validValues();
    values.personalInfo.pincode = '39501A';

    const paths = await validationPaths(values);

    expect(paths).toContain('personalInfo.pincode');
  });

  it('rejects invalid work experience dates', async () => {
    const values = validValues();
    values.workExperiences = [
      {
        ...emptyWorkExperience(),
        mediumStageName: 'Previous School',
        designation: 'Teacher',
        startDate: '2023-04-01',
        endDate: '2022-03-31',
      },
    ];

    const paths = await validationPaths(values);

    expect(paths).toContain('workExperiences[0].endDate');
  });

  it('requires family caste wherever category is required', async () => {
    const values = validValues();
    values.personalInfo.familyCaste = ' ';

    const paths = await validationPaths(values);

    expect(paths).toContain('personalInfo.familyCaste');
  });

  it('rejects future work experience start and end dates', async () => {
    const values = validValues();
    values.workExperiences = [
      {
        ...emptyWorkExperience(),
        mediumStageName: 'Future School',
        designation: 'Teacher',
        startDate: dateDaysFromNow(1),
        endDate: dateDaysFromNow(2),
      },
    ];

    const paths = await validationPaths(values);

    expect(paths).toContain('workExperiences[0].startDate');
    expect(paths).toContain('workExperiences[0].endDate');
  });

  it('accepts partial family details without optional address fields', async () => {
    const values = validValues();
    values.familyInfo.fatherDetails = {
      name: 'Father Candidate',
      occupation: '',
      mobileNo: '7876543210',
    } as any;

    await expect(
      employeeApplicationValidationSchema.validate(values, { abortEarly: false })
    ).resolves.toBeTruthy();
  });

  it('requires a family member name when any other family detail is entered', async () => {
    const values = validValues();
    values.familyInfo.motherDetails.occupation = 'Teacher';

    const paths = await validationPaths(values);

    expect(paths).toContain('familyInfo.motherDetails.name');
  });

  it('requires organization, designation, and start date for a partial work row', async () => {
    const values = validValues();
    values.workExperiences = [{ ...emptyWorkExperience(), department: 'Academics' }];

    const paths = await validationPaths(values);

    expect(paths).toContain('workExperiences[0].mediumStageName');
    expect(paths).toContain('workExperiences[0].designation');
    expect(paths).toContain('workExperiences[0].startDate');
  });

  it('uses the institution date at the UTC-to-India midnight boundary', () => {
    const reference = '2026-07-25T20:00:00Z';

    expect(getEmployeeApplicationInstitutionDate(reference)).toBe('2026-07-26');
    expect(isAfterEmployeeApplicationInstitutionDate('2026-07-26', reference)).toBe(false);
    expect(isAfterEmployeeApplicationInstitutionDate('2026-07-27', reference)).toBe(true);
  });

  it('omits untouched work rows from the submission payload', () => {
    const values = validValues();
    values.workExperiences = [emptyWorkExperience()];

    expect(buildEmployeeApplicationSubmitPayload(values).workExperiences).toEqual([]);
  });

  it('builds a valid public-safe employee profile payload', async () => {
    const values = validValues();

    await expect(
      employeeApplicationValidationSchema.validate(values, { abortEarly: false })
    ).resolves.toBeTruthy();

    const payload = buildEmployeeApplicationSubmitPayload(values);
    const payloadText = JSON.stringify(payload).toLowerCase();

    expect(payload.personalInfo.designation).toBe('Mathematics Teacher');
    expect(payload.familyInfo.fatherDetails?.name).toBe('Father Candidate');
    expect(payload.additionalInfo.secondLanguage).toBe('Gujarati');
    expect(payloadText).not.toContain('aadhaar');
    expect(payloadText).not.toContain('adhar');
    expect(payloadText).not.toContain('pan');
    expect(payloadText).not.toContain('bpl');
  });

  it('requires both uploads and preserves field-specific selection errors', () => {
    const errors = resolveEmployeeApplicationUploadErrors(
      { resume: 'Resume must be a PDF, DOC, or DOCX file.', photo: null },
      null,
      null
    );

    expect(errors).toEqual({
      resume: 'Resume must be a PDF, DOC, or DOCX file.',
      photo: 'Upload your photo before submitting.',
    });
  });

  it('formats Dayjs objects and valid date strings to YYYY-MM-DD for submission payloads', () => {
    expect(formatDatePayload(dayjs('2002-12-31'))).toBe('2002-12-31');
    expect(formatDatePayload('2002-12-31')).toBe('2002-12-31');
    expect(formatDatePayload(null)).toBeNull();
  });
});
