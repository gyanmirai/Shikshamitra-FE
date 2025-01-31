import { Box, Typography } from '@mui/material';

import { DetailRow } from 'src/screens/communication/announcement/schoolWiseAnnounsement';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import type { TSubjectTable } from '../subject';

interface ViewSubjectProps {
  subject: TSubjectTable | null;
}

export const ViewSubject = ({ subject }: ViewSubjectProps) => (
  <Scrollbar>
    <Box sx={{ p: 3 }}>
      <DetailRow label="Subject Name" value={subject?.subjectName} />
      <DetailRow label="Description" value={subject?.description} />

      <DetailRow label="Class Name" value={subject?.className} />

      <DetailRow label="Subject Color" value={subject?.subjectColor} />

      <DetailRow label="Primary Teacher" value={subject?.primaryTeacher} />

      <DetailRow label="Secondary Teacher" value={subject?.secondaryTeacher} />

      <DetailRow label="Prerequisites" value={subject?.prerequisites} />

      <DetailRow label="Learning Goal" value={subject?.learningGoal} />

      {subject?.documents && subject.documents.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Attached Documents
          </Typography>
          {subject.documents.map((doc: any, index: number) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Iconify icon="mdi:file-document-outline" sx={{ mr: 1 }} />
              <Typography variant="body2">{doc.name}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  </Scrollbar>
);
