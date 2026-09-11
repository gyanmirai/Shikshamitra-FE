import { Stack } from '@mui/material';
import { RenderDocuments } from 'src/components/studentProfile/form-fields/RenderDocument';

import { StudentAdmissionEvidencePanel } from './student-admission-evidence-panel';

import type { StudentTabsComponentType } from '.';

const Document = (props: StudentTabsComponentType) => (
  <Stack spacing={2}>
    <RenderDocuments id={props?.student?.id} />
    <StudentAdmissionEvidencePanel studentId={props?.student?.id} />
  </Stack>
);
export default Document;
