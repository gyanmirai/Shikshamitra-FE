import { Box, Card, Link, Typography, IconButton, CardContent } from '@mui/material';

import { DetailRow } from 'src/screens/communication/announcement/components/detailRow';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import type { IViewSubjectProps } from './type';

export const ViewSubject = ({ subject }: IViewSubjectProps) => {
  // Helper to render a single subject card
  const renderSubjectCard = (subj: any, idx: number) => (
    <Card key={subj.id || idx} sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {subj.subjectName}
        </Typography>

        <DetailRow label="Subject Code" value={subj.subjectCode} icon="mdi:code-tags" />
        <DetailRow label="Description" value={subj.description} icon="mdi:text-box-outline" />
        <DetailRow label="Subject Color" value={subj.subjectColor} icon="mdi:palette" />
        <DetailRow label="Primary Teacher" value={subj.primaryTeacher} icon="mdi:account-tie" />
        <DetailRow
          label="Secondary Teacher"
          value={
            Array.isArray(subj.secondaryTeacher)
              ? subj.secondaryTeacher.join(', ')
              : subj.secondaryTeacher || '-'
          }
          icon="mdi:account-group"
        />
        <DetailRow
          label="Prerequisites"
          value={subj.prerequisites}
          icon="mdi:alert-decagram-outline"
        />
        <DetailRow label="Learning Goal" value={subj.learningGoal} icon="mdi:target" />

        {subj.documents && subj.documents.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              <Iconify icon="mdi:file-document-outline" sx={{ mr: 1 }} />
              Attached Documents
            </Typography>
            {subj.documents.map((doc: any, index: number) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                  pl: 1,
                  pr: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="mdi:file-outline" sx={{ mr: 1 }} />
                  <Typography variant="body2">{doc.name}</Typography>
                </Box>
                {doc.url && (
                  <IconButton
                    component={Link}
                    href={doc.url}
                    target="_blank"
                    rel="noopener"
                    download
                    aria-label="Download"
                  >
                    <Iconify icon="mdi:download" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Scrollbar>
      <Box sx={{ p: 3 }}>
        <DetailRow label="Class Name" value={subject?.className} icon="mdi:school-outline" />
        <DetailRow label="Subject Type" value={subject?.subjectType} icon="mdi:book-open-variant" />
        <DetailRow label="Status" value={subject?.status} icon="mdi:check-circle-outline" />

        {(subject?.subjects ?? []).length > 0 && (
          <Box sx={{ mt: 1 }}>{subject?.subjects?.map(renderSubjectCard)}</Box>
        )}
      </Box>
    </Scrollbar>
  );
};
