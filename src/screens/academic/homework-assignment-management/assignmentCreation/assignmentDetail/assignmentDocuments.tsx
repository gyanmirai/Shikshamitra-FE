import { useState } from 'react';

import { Box, Grid } from '@mui/material';

import { getFileIconData } from 'src/enums/file-icons-map';
import subjectDocumentsData from 'src/json/academic/curriculum/subjectsDocuments.json';
import { documentsList } from 'src/screens/academic/curriculum-management/subject/component/viewDetailComponents/subjectDocument';

import { Iconify } from 'src/components/iconify';
import DocumentCard from 'src/components/preview-document/DocumentCard';

import type { IAssignment } from '../type';

const AssignmentDocuments = ({ assignment }: { assignment: IAssignment | null }) => {
  // State to manage subject documents data
  const [subjectDocuments, setSubjectDocuments] = useState(subjectDocumentsData);
  return (
    <Box>
      <Grid container spacing={2}>
        {documentsList.map((doc: any, index: number) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <DocumentCard file={doc} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AssignmentDocuments;

export const FileIcon = ({ fileName }: { fileName: string }) => {
  const { icon, color } = getFileIconData(fileName);

  return (
    <Iconify
      icon={icon}
      sx={{
        height: 40,
        width: 40,
        color,
      }}
    />
  );
};
