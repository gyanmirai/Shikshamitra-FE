import { Box, Card, Grid, Chip, Paper, Divider, Typography, CardContent } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import type { ISubject } from '../type';

const chapters = [
  {
    id: 'ch-1',
    title: 'Introduction to Mechanics',
    description: 'Covers motion, force, and Newton’s laws.',
    documents: [
      { id: 'doc-1', name: 'Lecture Notes.pdf' },
      { id: 'doc-2', name: 'Motion Explained.mp4' },
    ],
  },
  {
    id: 'ch-2',
    title: 'Work and Energy',
    description: 'Understanding energy transfer, power, and conservation laws.',
    documents: [{ id: 'doc-3', name: 'Energy Concepts.docx' }],
  },
  {
    id: 'ch-3',
    title: 'Thermodynamics',
    description: 'Basics of heat, temperature, and thermodynamic laws.',
    documents: [],
  },
];

const SubjectSyllabus = ({ subject }: { subject: ISubject }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <Iconify icon="mdi:book-open-page-variant" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Course Syllabus
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* Chapters Section */}
      {chapters.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Chapters
          </Typography>
          <Grid container spacing={2}>
            {chapters.map((chapter, index) => (
              <Grid item xs={12} md={6} key={chapter.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {`${index + 1}. ${chapter.title}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {chapter.description || 'No description provided.'}
                  </Typography>

                  {/* Documents List */}
                  {chapter.documents?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Documents:
                      </Typography>
                      {chapter.documents.map((doc) => (
                        <Chip
                          key={doc.id}
                          label={doc.name}
                          variant="outlined"
                          icon={<Iconify icon="mdi:file-document-outline" />}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </CardContent>
  </Card>
);

export default SubjectSyllabus;
