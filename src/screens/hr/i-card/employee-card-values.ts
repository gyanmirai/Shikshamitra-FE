import { convertBase64Format } from 'src/utils/base64Formate';

import type { EmployeeICardRow } from './i-card-staff-columns';

export const employeeCardFields = [
  { key: 'photo', label: 'Photo' },
  { key: 'name', label: 'Staff name' },
  { key: 'employeeCode', label: 'Staff code' },
  { key: 'designation', label: 'Designation' },
  { key: 'department', label: 'Department' },
  { key: 'organization', label: 'Organization' },
  { key: 'contactNo', label: 'Contact number' },
  { key: 'bloodGroup', label: 'Blood group' },
  { key: 'validityYear', label: 'Validity year' },
  { key: 'address', label: 'Address' },
  { key: 'schoolName', label: 'School name' },
  { key: 'schoolAddress', label: 'School address' },
];

export function getEmployeeCardPreviewValues(
  identity: { schoolName: string; schoolAddress: string },
  employee?: EmployeeICardRow,
  academicYearName?: string
): Record<string, string | null | undefined> {
  return {
    schoolName: identity.schoolName,
    schoolAddress: identity.schoolAddress,
    name: employee?.fullName,
    employeeCode: employee?.employeeIdentifier,
    designation: employee?.designation,
    department: employee?.department,
    organization: employee?.organizationNames?.join(', '),
    contactNo: employee?.mobileNo,
    bloodGroup: employee?.bloodGroup,
    validityYear: academicYearName,
    address: employee?.address,
  };
}

export function getEmployeeCardPhotoUrl(employee?: EmployeeICardRow) {
  const value = employee?.thumbnailPicture;
  if (!value) return '';
  return value.startsWith('data:') || value.startsWith('http') ? value : convertBase64Format(value);
}
