import { Box, Card, Paper, Divider, Typography, CardContent } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import DocumentList from './documentList';

import type { ISubject } from '../type';

const chapters = [
  {
    id: 'ch-1',
    title: 'Introduction to Mechanics',
    description: 'Covers motion, force, and Newton',
    documents: [
      {
        id: 'doc-1',
        name: 'Lecture Notes.pdf',
        type: 'pdf',
        url: 'https://example.com/files/lecture-notes.pdf',
        size: '2.4 MB',
        date: 'May 10, 2025',
      },
      {
        id: 'doc-2',
        name: 'Motion Explained.mp4',
        type: 'video',
        url: 'https://example.com/files/motion-explained.mp4',
        size: '45.2 MB',
        date: 'May 12, 2025',
      },
    ],
  },
  {
    id: 'ch-2',
    title: 'Work and Energy',
    description: 'Understanding energy transfer, power, and conservation laws.',
    documents: [
      {
        id: 'doc-3',
        name: 'Energy Concepts.docx',
        type: 'document',
        url: 'https://example.com/files/energy-concepts.docx',
        size: '1.8 MB',
        date: 'May 15, 2025',
      },
      {
        id: 'doc-4',
        name: 'Energy Diagram.png',
        type: 'image',
        url: 'https://example.com/files/energy-diagram.png',
        size: '840 KB',
        date: 'May 18, 2025',
      },
    ],
  },
  {
    id: 'ch-3',
    title: 'Thermodynamics',
    description: 'Basics of heat, temperature, and thermodynamic laws.',
    documents: [],
  },
];

const SubjectSyllabus = ({ subject }: { subject: ISubject }) => (
  <Card>
    <CardContent sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Chapters
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Chapters Section */}
      {chapters.length > 0 ? (
        chapters.map((chapter, index) => (
          <Paper key={chapter.id} elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'background.neutral' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Iconify icon="mdi:book-open-variant" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">{`${index + 1}. ${chapter.title}`}</Typography>
            </Box>

            <Typography variant="body2" sx={{ ml: 3, mb: 2 }}>
              {chapter.description || 'No description provided.'}
            </Typography>

            {/* Documents List */}
            {chapter.documents?.length > 0 && (
              <Box sx={{ ml: 3 }}>
                <DocumentList documents={chapter.documents} onDownload={() => {}} />
              </Box>
            )}
          </Paper>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No chapters available for this subject.
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default SubjectSyllabus;
