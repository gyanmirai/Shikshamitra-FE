import React from 'react';
import { BoardScreenStep } from 'src/screens/security/accessControl';

import type { FieldsType } from './types';

function RenderAcademicPermissionFields(props: any) {
  const { formik } = props;

  const setCheckedItem = (value: any) => {
    formik.setFieldValue('academicPermission', value);
  };
  const setSelectedData = (value: any) => {
    formik.setFieldValue('academicPermissionSelectedData', value);
  };

  return (
    <BoardScreenStep
      checkedItem={
        formik?.values?.academicPermission || {
          boards: [],
          mediums: [],
          organizations: [],
          standards: [],
          divisions: [],
        }
      }
      setCheckedItem={setCheckedItem}
      selectedData={
        formik?.values?.academicPermissionSelectedData || {
          boards: [],
          mediums: [],
          organizations: [],
          standards: [],
          divisions: [],
        }
      }
      setSelectedData={setSelectedData}
    />
  );
}

export const AcademicPermissionFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Academic Permission',
    name: 'academicPermission',
    gridProps: { size: { xs: 12, md: 12 }, sx: { height: '100%', width: '100%' } },
    renderComp(props: any) {
      return <RenderAcademicPermissionFields {...props} />;
    },
  },
];
