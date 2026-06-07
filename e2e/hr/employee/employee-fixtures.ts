export type EmployeeFixture = ReturnType<typeof createEmployeeFixture>;

const randomSuffix = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

const alphaSuffix = (value: string) =>
  value
    .split('')
    .map((digit) => String.fromCharCode(65 + Number(digit)))
    .join('');

export function createEmployeeFixture(prefix = 'Automation Employee') {
  const suffix = randomSuffix();
  const nameSuffix = alphaSuffix(suffix);

  return {
    suffix,
    firstName: prefix,
    middleName: 'Auto',
    lastName: nameSuffix,
    fullName: `${prefix} Auto ${nameSuffix}`,
    email: `e2e.hr.employee.${suffix}@ddvs.test`,
    primaryMobile: `9${suffix.slice(-9).padStart(9, '0')}`,
    secondaryMobile: `8${suffix.slice(-9).padStart(9, '1')}`,
    panNo: `ABCDE${suffix.slice(-4).padStart(4, '0')}F`,
    adharNo: `900${suffix.slice(-9).padStart(9, '0')}`,
    dob: '01-01-1990',
    doj: '01-06-2024',
    familyCaste: 'General',
    addressLine1: 'E2E House 1',
    addressLine2: 'Automation Road',
    addressLine3: 'Regression Area',
    pincode: '380001',
    city: 'Ahmedabad',
    bank: {
      bankName: 'State Bank of India',
      branchName: 'Automation Branch',
      accountHolderName: `${prefix} ${nameSuffix}`,
      accountNumber: `12345${suffix.slice(-9).padStart(9, '0')}`,
      ifscCode: 'SBIN0001234',
      epfNumber: 'AP/12345/1234567',
      uanNumber: '123456789012',
      punchId: `P${suffix.slice(-6)}`,
    },
    family: {
      fatherName: `Father ${suffix}`,
      motherName: `Mother ${suffix}`,
      spouseName: `Spouse ${suffix}`,
      contact: `7${suffix.slice(-9).padStart(9, '2')}`,
      pincode: '380001',
    },
    additional: {
      bplCardNo: `BPL${suffix.slice(-8)}`,
      secondLanguage: 'Hindi',
    },
    workExperience: {
      mediumStageName: `Previous School ${suffix}`,
      department: 'Academics',
      startDate: '01-04-2020',
      endDate: '31-03-2023',
    },
  };
}

export const invalidEmployeeValues = {
  mobile: '12345',
  email: 'not-an-email',
  pincode: '123',
  futureDate: '01-01-2099',
};
