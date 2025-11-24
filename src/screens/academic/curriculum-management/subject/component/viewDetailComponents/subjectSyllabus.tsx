import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';

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

const SubjectSyllabus = ({ subject }: { subject: ISubjectDetail }) => (
  <Box sx={{ height: '100%', overflow: 'hidden' }}>
    {/* <Scrollbar ref={ref}> */}
    <Box sx={{ height: '100%', overflow: 'auto', pb: 2 }}>
      {chapters.length > 0 ? (
        chapters.map((chapter, index) => (
          <Accordion
            key={chapter.id}
            sx={{
              mb: 2,
              borderRadius: 1,
              overflow: 'visible',
              boxShadow: 3,
              '&::before': {
                display: 'none', // hides the ::before line
              },
            }}
          >
            <AccordionSummary
              expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
              aria-controls={`chapter-${chapter.id}-content`}
              id={`chapter-${chapter.id}-header`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify icon="mdi:book-open-variant" sx={{ mr: 1.5 }} />
                <Typography variant="subtitle2">{`${index + 1}. ${chapter.title}`}</Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0 }}>
              <Scrollbar sx={{ height: '90px', pr: 2 }}>
                <Typography variant="body2" pl={5} textAlign="justify">
                  {chapter.description || 'No description provided.'}
                </Typography>
              </Scrollbar>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No chapters available for this subject.
        </Typography>
      )}
    </Box>
    {/* </Scrollbar> */}
  </Box>
);

export default SubjectSyllabus;
