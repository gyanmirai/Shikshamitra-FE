import { Box, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import type { ISubject } from '../type';

const chapters = [
  {
    id: 'ch-1',
    title: 'Introduction to Mechanics',
    description:
      "This chapter provides a comprehensive introduction to classical mechanics, covering fundamental concepts of motion, force, and Newton's laws. Students will learn about kinematics, including displacement, velocity, and acceleration, followed by dynamics and the relationship between force and motion. The chapter explores Newton's three laws of motion in detail, with real-world applications and problem-solving techniques. Vector analysis and free-body diagrams are introduced as essential tools for understanding mechanical systems. Through hands-on experiments and demonstrations, students will gain practical experience in measuring and analyzing motion, forces, and their interactions. The chapter also covers important mathematical tools including vector algebra, differential calculus basics, and graphical analysis methods. Special attention is given to common misconceptions in mechanics and strategies to overcome them. The chapter concludes with advanced topics like circular motion, gravitation, and an introduction to mechanical waves.",
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
    description:
      'This chapter delves deep into the concepts of work, energy, and their interrelationships. Students will explore different forms of energy including kinetic, potential, and mechanical energy, along with the principle of conservation of energy. The chapter covers work-energy theorem, power calculations, and energy transformations in various physical systems. Practical applications include analyzing simple machines, understanding energy efficiency, and solving complex problems involving energy conservation. Special attention is given to conservative and non-conservative forces and their role in energy transfer processes. The chapter extensively covers mechanical advantage in simple machines, including levers, pulleys, and inclined planes, with real-world examples from construction and engineering. Students will learn to analyze energy transformations in complex systems, including friction and air resistance effects. Advanced topics include elastic potential energy, gravitational potential energy in non-uniform fields, and the relationship between work and energy in rotating systems. The chapter concludes with modern applications in renewable energy systems and energy storage technologies.',
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
    description:
      'This comprehensive chapter introduces the fundamental principles of thermodynamics and their applications. Students will study the behavior of matter and energy at different scales, from molecular to macroscopic levels. Topics include temperature measurement, heat transfer mechanisms (conduction, convection, and radiation), and the laws of thermodynamics. The chapter covers ideal gas laws, heat engines, entropy, and thermodynamic processes. Practical applications include understanding heat pumps, refrigeration cycles, and thermal efficiency in real-world systems. Special emphasis is placed on problem-solving techniques and the interpretation of PV diagrams. The chapter explores advanced concepts including statistical mechanics, quantum effects in thermal systems, and the microscopic interpretation of entropy. Students will learn about real gas behavior, phase transitions, and critical phenomena. Extensive coverage is given to modern applications in power generation, including steam cycles, internal combustion engines, and gas turbines. Environmental considerations are addressed through discussions of global warming, greenhouse effects, and sustainable energy technologies. The chapter concludes with an introduction to non-equilibrium thermodynamics and irreversible processes in nature.',
    documents: [],
  },
];

const SubjectSyllabus = ({ subject }: { subject: ISubject }) => (
  // <Card>
  //   <CardContent sx={{ p: 2, pb: 0 }}>
  <Box>
    {chapters.length > 0 ? (
      chapters.map((chapter, index) => (
        <Accordion
          key={chapter.id}
          sx={{
            mb: 2,
            borderRadius: 1, // optional, round corners
            boxShadow: 3, // optional, adds shadow
          }}
        >
          <AccordionSummary
            expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            aria-controls={`chapter-${chapter.id}-content`}
            id={`chapter-${chapter.id}-header`}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Iconify icon="mdi:book-open-variant" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">{`${index + 1}. ${chapter.title}`}</Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <Scrollbar sx={{ height: '150px' }}>
              <Typography variant="body2" pl={5}>
                {chapter.description || 'No description provided.'}
              </Typography>
            </Scrollbar>

            {/* {chapter.documents?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Documents ({chapter.documents.length})
                  </Typography>
                  <DocumentList documents={chapter.documents} onDownload={() => {}} />
                </Box>
              )} */}
          </AccordionDetails>
        </Accordion>
      ))
    ) : (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        No chapters available for this subject.
      </Typography>
    )}
  </Box>
  //   </CardContent>
  // </Card>
);

export default SubjectSyllabus;
