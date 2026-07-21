'use client';

import React, { useState } from 'react';
import { Box, Grid, Button } from '@mui/material';
import { Save, RestartAlt } from '@mui/icons-material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import eleciveSubjectsData from 'src/json/academic/curriculum/choose-elective-subject.json';

import ElectiveSubjectCard from './components/ElectiveSubjectCard';

const ChooseElectiveSubject = () => {
  // State to track selected subjects for each category
  const [selectedSubjects, setSelectedSubjects] = useState<Record<string, string>>({});

  // State to store elective subjects data from JSON
  const [electiveSubjects] = useState(eleciveSubjectsData);

  /**
   * Handles the selection of a subject for a specific category
   * @param category - The category of the elective subject
   * @param subject - The selected subject name
   */
  const handleSubjectChange = (category: string, subject: string) => {
    setSelectedSubjects((prev) => ({
      ...prev,
      [category]: subject,
    }));
  };

  /**
   * Resets all selected subjects to empty state
   */
  const handleReset = () => {
    setSelectedSubjects({});
  };

  return (
    <Box>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Choose Elective Subjects"
        description="Enable students to select their preferred elective subjects from available options. Teachers and administrators can manage student selections, track enrollment, and ensure balanced distribution across elective courses. View detailed analytics on subject popularity and student preferences."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Choose Elective Subjects' },
        ]}
      />

      <Box display="flex" gap={1} justifyContent="flex-end" mb={2}>
        <Button variant="outlined" startIcon={<RestartAlt />} onClick={handleReset} size="small">
          Reset
        </Button>
        <Button
          startIcon={<Save />}
          variant="contained"
          size="small"
          disabled={Object.values(selectedSubjects).length === 0}
          onClick={() => {}}
        >
          Save
        </Button>
      </Box>

      <Grid container spacing={1} sx={{ mb: 3 }}>
        {electiveSubjects.map((category) => (
          <Grid size={{ xs: 12, md: 4 }} key={category.title}>
            <ElectiveSubjectCard
              title={category.title}
              subjects={category.subjects}
              subjectColor={category.subjectColor}
              selectedSubject={selectedSubjects[category.title] || ''}
              onSubjectChange={(subject) => handleSubjectChange(category.title, subject)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ChooseElectiveSubject;
