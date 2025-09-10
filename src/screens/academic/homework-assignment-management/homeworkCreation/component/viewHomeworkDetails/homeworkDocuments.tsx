import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { getFileIconData } from 'src/enums/file-icons-map';
import DocumentCard from 'src/components/preview-document/DocumentCard';
import subjectDocumentsData from 'src/json/academic/curriculum/subjectsDocuments.json';
import { documentsList } from 'src/screens/academic/curriculum-management/subject/component/viewDetailComponents/subjectDocument';

import type { IHomework } from '../../type';

const HomeworkDocuments = ({ homework }: { homework: IHomework | null }) => {
  // State to manage subject documents data
  const [subjectDocuments, setSubjectDocuments] = useState(subjectDocumentsData);
  return (
    <Box>
      <Grid container spacing={2}>
        {documentsList.map((doc: any, index: number) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
            <DocumentCard file={doc} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomeworkDocuments;

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
