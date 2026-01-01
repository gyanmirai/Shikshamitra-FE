import React from 'react';
import { AccessControlForm } from 'src/screens/security/accessControl';

import type { FieldsType } from './types';

function RenderAcademicPermissionFields(props: any) {
  const { formik, isMainForm, editData } = props;
  return <AccessControlForm user={editData} />;
}

export const AcademicPermissionFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Academic Permission',
    name: 'academicPermission',
    renderComp(props: any) {
      return <RenderAcademicPermissionFields {...props} />;
    },
  },
];
