import React from 'react';

import { RenderDocuments } from './employee-form-fields/RenderDocuments';

const QualificationAndCertification = ({ employee }: any) => (
  <RenderDocuments employeeId={employee?.id} />
);
export default QualificationAndCertification;
