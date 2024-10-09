import React, { useState } from 'react';

import { Box, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import CustomAccordion from 'src/components/custom-accordian';

const CarriculumContentviewDashboardComponent = () => {
  const classData = [
    {
      className: 'Class 1',
      subjects: [
        {
          name: 'Math',
          chapters: [
            'Chapter 1: Numbers',
            'Chapter 2: Addition',
            'Chapter 3: Subtraction',
            'Chapter 4: Shapes',
            'Chapter 5: Measurement',
          ],
        },
        {
          name: 'English',
          chapters: [
            'Chapter 1: Alphabets',
            'Chapter 2: Simple Sentences',
            'Chapter 3: Basic Grammar',
            'Chapter 4: Short Stories',
            'Chapter 5: Poems',
          ],
        },
      ],
    },
    {
      className: 'Class 2',
      subjects: [
        {
          name: 'Math',
          chapters: [
            'Chapter 1: Multiplication',
            'Chapter 2: Division',
            'Chapter 3: Fractions',
            'Chapter 4: Geometry',
            'Chapter 5: Time and Money',
          ],
        },
        {
          name: 'English for class 2',
          chapters: [
            'Chapter 1: Reading Comprehension',
            'Chapter 2: Writing Sentences',
            'Chapter 3: Nouns and Pronouns',
            'Chapter 4: Vocabulary Building',
            'Chapter 5: Poems',
          ],
        },
        {
          name: 'Science',
          chapters: [
            'Chapter 1: Living Things',
            'Chapter 2: Plants',
            'Chapter 3: Animals',
            'Chapter 4: The Human Body',
            'Chapter 5: Environment',
          ],
        },
      ],
    },
    {
      className: 'Class 3',
      subjects: [
        {
          name: 'Math for class 3',
          chapters: [
            'Chapter 1: Multiplication',
            'Chapter 2: Division',
            'Chapter 3: Fractions',
            'Chapter 4: Geometry',
            'Chapter 5: Time and Money',
          ],
        },
        {
          name: 'English',
          chapters: [
            'Chapter 1: Reading Comprehension',
            'Chapter 2: Writing Sentences',
            'Chapter 3: Nouns and Pronouns',
            'Chapter 4: Vocabulary Building',
            'Chapter 5: Poems',
          ],
        },
        {
          name: 'Science',
          chapters: [
            'Chapter 1: Living Things',
            'Chapter 2: Plants',
            'Chapter 3: Animals',
            'Chapter 4: The Human Body',
            'Chapter 5: Environment',
          ],
        },
      ],
    },
    {
      className: 'Class 4',
      subjects: [
        {
          name: 'Phycis',
          chapters: [
            'Chapter 1: Multiplication',
            'Chapter 2: Division',
            'Chapter 3: Fractions',
            'Chapter 4: Geometry',
            'Chapter 5: Time and Money',
          ],
        },

        {
          name: 'Science',
          chapters: [
            'Chapter 1: Living Things',
            'Chapter 2: Plants',
            'Chapter 3: Animals',
            'Chapter 4: The Human Body',
            'Chapter 5: Environment',
          ],
        },
      ],
    },
  ];

  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);
  const [selectedClass, setSelectedClass] = useState<string>('Class 1'); // Default to Class 1

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent) => {
    setExpandedPanel(expandedPanel === panel ? false : panel); // Toggle the accordion expansion
  };

  const handleClassSelectChange = (value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    setSelectedClass(selectedValue);
    setExpandedPanel(false);
  };

  const selectedClassData = classData.find((cls) => cls.className === selectedClass);

  return (
    <Box >
      <Typography variant="h6" gutterBottom>
        Content Overview
      </Typography>
      <Box pb="15px" />
      <CustomSelect
        label="Class"
        options={classData.map((cls) => ({ value: cls.className, label: cls.className }))}
        value={selectedClass}
        onChange={handleClassSelectChange}
        formControlProps={{ sx: { minWidth: 120 } }}
      />

      <Box sx={{ pb: '20px', pt: '20px' }} />
      {selectedClassData &&
        selectedClassData.subjects.map((subject, subIndex) => (
          <CustomAccordion
            key={subIndex}
            title={subject.name}
            content={
              <Box>
                <ul>
                  {subject.chapters.map((chapter, chapterIndex) => (
                    <li style={{ color: "black", fontSize: "14px" }} key={chapterIndex}>{chapter}</li>
                  ))}
                </ul>
              </Box>
            }
            expanded={expandedPanel === `panel${subIndex}`}
            onChange={handleAccordionChange(`panel${subIndex}`)}
            isActive={expandedPanel === `panel${subIndex}`}
          />
        ))}
      <Box sx={{ pt: '50px' }} />
    </Box>
  );
};

export default CarriculumContentviewDashboardComponent;
