import React, { useState } from 'react';

import { Box, Typography } from '@mui/material';

import CustomAccordion from 'src/components/custom-accordian';

const CarriculumDetailedviewDashboardComponent = () => {
  const classData = [
    { className: 'Class 1', subjects: ['Math', 'English', 'Science'] },
    { className: 'Class 2', subjects: ['Math', 'English', 'Science', 'Social Studies'] },
    { className: 'Class 3', subjects: ['Math', 'English', 'Science', 'History'] },
    { className: 'Class 4', subjects: ['Math', 'English', 'Science', 'Geography'] },
    // { className: 'Class 5', subjects: ['Math', 'English', 'Science', 'Environmental Studies'] },
    // { className: 'Class 6', subjects: ['Math', 'English', 'Science', 'Social Studies', 'Computer'] },
    // { className: 'Class 7', subjects: ['Math', 'English', 'Science', 'History', 'Geography'] },
    // { className: 'Class 8', subjects: ['Math', 'English', 'Science', 'Civics', 'Economics'] },
    // { className: 'Class 9', subjects: ['Math', 'English', 'Biology', 'Physics', 'Chemistry'] },
    // { className: 'Class 10', subjects: ['Math', 'English', 'Biology', 'Physics', 'Chemistry', 'Computer Science']
  ];

  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent) => {
    setExpandedPanel(expandedPanel === panel ? false : panel);
  };
  return (
    <Box>
      <Typography sx={{ pt: '20px' }}>Detailed Curriculum View</Typography>
      <Typography sx={{ pb: '20px', pt: '20px' }}>Subject Breakdown</Typography>
      {classData.map((cls, index) => (
        <CustomAccordion
          key={index}
          title={cls.className}
          content={
            <Typography>
              <strong>Subjects:</strong>
              <ul>
                {cls.subjects.map((subject, subIndex) => (
                  <li key={subIndex}>{subject}</li>
                ))}
              </ul>
            </Typography>
          } // JSX content
          expanded={expandedPanel === `panel${index}`}
          onChange={handleAccordionChange(`panel${index}`)}
          isActive={expandedPanel === `panel${index}`}
        />
      ))}
    </Box>
  );
};

export default CarriculumDetailedviewDashboardComponent;
