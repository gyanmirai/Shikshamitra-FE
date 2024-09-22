import React from 'react';

import { Box, Card, Typography } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const CurriculumOverview = () => (
  <Box>
    <Grid2 container spacing={3}>
      <Grid2 xs={12} md={6} lg={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Curriculum Overview
            </Typography>
            <CustomSelect
              label="class"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box component="ul" sx={{ pl: 2, listStyleType: 'disc' }}>
              <Box component="li">Guj A Grade - 10 </Box>
              <Box component="li">Guj B Grade - 20</Box>
            </Box>
          </Box>
        </Card>
      </Grid2>
      <Grid2 xs={12} md={6} lg={6}>
        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Curriculum Overview
            </Typography>
            <CustomSelect
              label="class"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>

          <Box sx={{ mt: 2 }} display="flex" gap={2}>
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              alignItems="center"
              justifyContent="center"
            >
              <Typography component="span" variant="h5">
                {' '}
                Subjects{' '}
              </Typography>
              <Typography component="span" variant="h3">
                {' '}
                12{' '}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              alignItems="center"
              justifyContent="center"
            >
              <Typography component="span" variant="h5">
                {' '}
                Teachers{' '}
              </Typography>
              <Typography component="span" variant="h3">
                {' '}
                12{' '}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              alignItems="center"
              justifyContent="center"
            >
              <Typography component="span" variant="h5">
                {' '}
                Topic Covered{' '}
              </Typography>
              <Typography component="span" variant="h3">
                {' '}
                12{' '}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid2>
      <Grid2 xs={12}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography component="span" variant="h6" gutterBottom>
            Class-wise Curriculum Grid
          </Typography>
          <CustomSelect
            label="class"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 120 } }}
          />
        </Box>
        <CustomizableTable
          columns={[
            { id: 'grade', label: 'Grade' },
            { id: 'maths', label: 'Maths' },
            { id: 'science', label: 'Science' },
            { id: 'english', label: 'English' },
            { id: 'gujarati', label: 'Gujarati' },
          ]}
          data={[
            {
              grade: '1st',
              maths: 'Numbers',
              science: 'Plants',
              english: 'Alphabets',
              gujarati: 'વર્ણમાળા',
            },
            {
              grade: '2nd',
              maths: 'Addition',
              science: 'Animals',
              english: 'Grammar',
              gujarati: 'શબ્દો',
            },
            {
              grade: '3rd',
              maths: 'Multiplication',
              science: 'Human Body',
              english: 'Comprehension',
              gujarati: 'વાક્યો',
            },
            {
              grade: '4th',
              maths: 'Fractions',
              science: 'Environment',
              english: 'Writing',
              gujarati: 'નિબંધ',
            },
            {
              grade: '5th',
              maths: 'Geometry',
              science: 'Matter',
              english: 'Literature',
              gujarati: 'કવિતા',
            },
          ]}
        />
      </Grid2>
    </Grid2>
  </Box>
);

export default CurriculumOverview;
