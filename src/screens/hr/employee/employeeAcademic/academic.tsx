import React from 'react';

import EmployeeAcademicTabs from './employeeAcademicTabs';

interface EmployeeAcademicProps {
  employee?: any;
}

const EmployeeAcademic = ({ employee }: EmployeeAcademicProps) => (
  <EmployeeAcademicTabs employee={employee} />
);

export default EmployeeAcademic;
