const toSelectedStudent = (student: any) => ({
  id: student.id,
  memberType: 0,
  memberId: student.id,
  userId: student.userId ?? null,
  displayName:
    student.studentName ||
    [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
  standardName: student.standardName,
  divisionName: student.divisionName,
  identifier: student.rollNo?.toString() || student.grNo?.toString(),
  status: student.status,
});

const toSelectedEmployee = (employee: any) => ({
  id: employee.id,
  memberType: 1,
  memberId: employee.id,
  userId: employee.userId ?? null,
  displayName:
    employee.employeeName ||
    [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(' '),
  employeeCode: employee.employeeCode,
  identifier: employee.employeeCode,
  roleName: employee.roleName,
  department: employee.department,
  designation: employee.designation,
  mobileNo: employee.mobileNo,
  email: employee.email,
  employeeStatusType: employee.employeeStatusType,
});

const hydrateSelectedMembers = (initialValues: any) => {
  const selectedMembers =
    initialValues?.nameBased?.selectedMembers || initialValues?.selections || [];
  const students = initialValues?.nameBased?.students || [];
  const employees = initialValues?.nameBased?.employees || [];

  const hydrated = [...students.map(toSelectedStudent), ...employees.map(toSelectedEmployee)];

  selectedMembers.forEach((member: any) => {
    if (!hydrated.some((item) => item.memberId === member.memberId)) {
      hydrated.push({
        ...member,
        userId: member.userId ?? null,
      });
    }
  });

  return hydrated;
};

export const getGroupInitialValues = (initialValues: any): any => ({
  id: initialValues?.id || '',
  name: initialValues?.name || initialValues?.groupName || '',
  description: initialValues?.description || '',
  ruleBased: {
    academicRules:
      initialValues?.ruleBased?.academicRules || initialValues?.ruleBased?.academicSelection || [],
    roles: initialValues?.ruleBased?.roleIds || [],
    studentFilters: initialValues?.ruleBased?.studentFilters || [],
    employeeFilters: initialValues?.ruleBased?.employeeFilters || [],
    academicTree: initialValues?.ruleBased?.academicTree || [],
  },
  nameBased: {
    academicRules:
      initialValues?.nameBased?.academicRules || initialValues?.nameBased?.academicSelection || [],
    roles: initialValues?.nameBased?.roleIds || [],
    studentFilters: initialValues?.nameBased?.studentFilters || [],
    employeeFilters: initialValues?.nameBased?.employeeFilters || [],
    selectedMembers: hydrateSelectedMembers(initialValues),
    academicTree: initialValues?.academicTree || [],
  },
});
