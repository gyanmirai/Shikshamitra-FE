import { RenderDocuments } from './RenderDocuments';

import type { FieldsType } from './types';

export const CertificateFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Certificate Name',
    name: 'certificateName',
    placeholder: 'Enter Certificate Name',
    renderComp(props) {
      return <RenderDocuments employeeId={props.formik.values.employeeId} />;
    },
  },
];
