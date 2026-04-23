import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetChaptersQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import {
  Box,
  Paper,
  Divider,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import type { ISubjectDetail } from '../type';

const chapters = [
  {
    id: 'ch-1',
    title: 'Introduction to Mechanics',
    description:
      "This chapter provides a comprehensive introduction to classical mechanics, covering fundamental concepts of motion, force, and Newton's laws. Students will learn about vectors, scalars, displacement, velocity, acceleration, and the relationships between them. The chapter also covers Newton's three laws of motion and their applications in real-world scenarios, including friction, gravity, and normal forces. Key topics include: Understanding vector operations and their importance in physics; Analyzing motion in one and two dimensions; Calculating displacement, velocity and acceleration; Deep dive into Newton's First Law (Law of Inertia), Second Law (F=ma), and Third Law (Action-Reaction); Study of friction types (static, kinetic) and their effects; Gravitational forces and weight vs mass; Normal forces and their role in contact interactions; Problem-solving techniques using free body diagrams; Real-world applications in vehicle motion, sports physics, and simple machines. The chapter concludes with practical experiments and demonstrations to reinforce theoretical concepts.",
  },
  {
    id: 'ch-2',
    title: 'Work, Energy and Power',
    description:
      'This chapter explores the crucial concepts of work, energy, and power in physics. Students will understand the relationship between work and energy, different forms of energy including kinetic and potential energy, and the principle of conservation of energy. The chapter covers practical applications through problems involving simple machines, energy transformations, and power calculations in mechanical systems.',
  },
  {
    id: 'ch-3',
    title: 'Waves and Sound',
    description:
      'An in-depth study of wave motion and sound phenomena. The chapter begins with basic wave properties including amplitude, frequency, wavelength, and wave speed. Students will learn about different types of waves, wave interference, resonance, and standing waves. The section on sound covers the nature of sound waves, characteristics of sound (pitch, loudness, quality), and applications like musical instruments and the Doppler effect.',
  },
  {
    id: 'ch-4',
    title: 'Light and Optics',
    description:
      'This chapter delves into the nature of light and optical phenomena. Topics include the dual nature of light, reflection and refraction of light, mirrors and lenses, and optical instruments. Students will explore real-world applications through the study of the human eye, microscopes, telescopes, and modern optical technologies. The chapter also introduces wave optics concepts like interference and diffraction.',
  },
  {
    id: 'ch-5',
    title: 'Electricity and Magnetism',
    description:
      "A comprehensive exploration of electrical and magnetic phenomena. The chapter covers electric charges, electric fields, potential difference, and current electricity. Students will learn about Ohm's law, electrical circuits, and electromagnetic induction. The relationship between electricity and magnetism is examined through electromagnetic fields, motors, generators, and transformers. Modern applications in power generation and transmission are also discussed.",
  },
];

const SubjectSyllabus = ({ subject }: { subject: ISubjectDetail }) => {
  const {
    data: _chaptersData,
    isLoading: _isLoading,
    isFetching: _isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersQuery,
    params: { subjectId: subject?.id },
  });

  return (
    <Box sx={{ height: '100%' }}>
      <Scrollbar sx={{ height: '100%', pb: 2 }}>
        {chapters.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {chapters.map((chapter, index) => (
              <Accordion
                key={chapter.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  '&:before': { display: 'none' }, // Remove default divider
                  '&.Mui-expanded': {
                    margin: 0, // Prevent default margin shift
                    boxShadow: 'var(--shadows-3)',
                    borderColor: 'transparent',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                  sx={{
                    minHeight: 64,
                    '& .MuiAccordionSummary-content': { my: 0 },
                    '&.Mui-expanded': {
                      minHeight: 64,
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.04),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        mr: 2,
                      }}
                    >
                      <Iconify icon="mdi:book-open-page-variant" width={24} />
                    </Box>
                    <Box>
                      <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                        Chapter {index + 1}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                        {chapter.title}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 1, pb: 3, px: 3 }}>
                  <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {chapter.description || 'No description provided.'}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.04),
              borderStyle: 'dashed',
            }}
          >
            <Iconify
              icon="solar:notebook-minimalistic-broken"
              width={64}
              sx={{ color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              No chapters available
            </Typography>
            <Typography variant="body2" color="text.disabled">
              There are no syllabus chapters created for this subject yet.
            </Typography>
          </Paper>
        )}
      </Scrollbar>
    </Box>
  );
};

export default SubjectSyllabus;
