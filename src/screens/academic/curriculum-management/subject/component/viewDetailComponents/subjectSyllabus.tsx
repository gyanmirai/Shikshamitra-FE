import { useState } from 'react';

import {
  Box,
  Stack,
  Button,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';

import type { ISubjectDetail } from '../type';

const chapters = [
  {
    id: 'ch-1',
    title: 'Introduction to Mechanics',
    description:
      "This chapter provides a comprehensive introduction to classical mechanics, covering fundamental concepts of motion, force, and Newton's laws...",
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
  // ... other chapters
];

const SubjectSyllabus = ({ subject }: { subject: ISubjectDetail }) => {
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [chapterContents, setChapterContents] = useState(
    chapters.reduce(
      (acc, chapter) => ({
        ...acc,
        [chapter.id]: chapter.description,
      }),
      {}
    )
  );

  const handleEdit = (chapterId: string) => {
    setEditingChapter(chapterId);
  };

  const handleSave = (chapterId: string) => {
    setEditingChapter(null);
    // Here you would typically make an API call to save the updated content
  };

  const handleCancel = (chapterId: string) => {
    setEditingChapter(null);
    // Reset content to original
    setChapterContents((prev) => ({
      ...prev,
      [chapterId]: chapters.find((ch) => ch.id === chapterId)?.description || '',
    }));
  };

  const handleContentChange = (chapterId: string, newContent: string) => {
    setChapterContents((prev) => ({
      ...prev,
      [chapterId]: newContent,
    }));
  };

  return (
    <Box>
      {chapters.length > 0 ? (
        chapters.map((chapter, index) => (
          <Accordion
            key={chapter.id}
            sx={{
              mb: 2,
              borderRadius: 1,
              boxShadow: 3,
            }}
          >
            <AccordionSummary
              expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
              aria-controls={`chapter-${chapter.id}-content`}
              id={`chapter-${chapter.id}-header`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Iconify icon="mdi:book-open-variant" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">{`${index + 1}. ${chapter.title}`}</Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                {editingChapter === chapter.id ? (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Iconify icon={GlobalIcons.cancel} />}
                      onClick={(e) => {
                        handleCancel(chapter.id);
                        e.stopPropagation();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Iconify icon={GlobalIcons.submit} />}
                      onClick={(e) => {
                        handleSave(chapter.id);
                        e.stopPropagation();
                      }}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Iconify icon="solar:pen-bold" />}
                    onClick={(e) => {
                      handleEdit(chapter.id);
                      e.stopPropagation();
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Stack>
            </AccordionSummary>

            <AccordionDetails>
              <Editor
                content={chapter.description}
                editable={editingChapter !== chapter.id}
                onChange={(content) => handleContentChange(chapter.id, content)}
              />
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No chapters available for this subject.
        </Typography>
      )}
    </Box>
  );
};

export default SubjectSyllabus;
