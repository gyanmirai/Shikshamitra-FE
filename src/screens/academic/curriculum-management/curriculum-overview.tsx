import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Grid, Button, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const CurriculumOverview = () => (
  <Box>
    <Box />
    <Grid2 container spacing={3}>
     <Grid container spacing={3} sx={{pt:"25px",  px:"15px"}}>
     <Grid2 xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography component="span" variant="h6" gutterBottom color="primary.main">
              Curriculum Overview
              </Typography>
              <CustomSelect
                label="class"
                options={ []}
                value=""
              
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  // setClasses(val as string);
                }}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                  }}
                >
                  {['Guj A Grade - 10', 'Guj B Grade - 20'].map((exam, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {exam}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
            </Box>
          </Card>
        </Grid2>
     
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3,  boxShadow: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Curriculum Overview
            </Typography>
            <CustomSelect
              label="Class"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120, bgcolor: 'white' } }}
            />
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ bgcolor: 'white', borderRadius: 1, p: 2, boxShadow: 1 }}
            >
              <Typography component="span" variant="h6">
                Subjects
              </Typography>
              <Typography component="span" variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                12
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ bgcolor: 'white', borderRadius: 1, p: 2, boxShadow: 1 }}
            >
              <Typography component="span" variant="h6">
                Teachers
              </Typography>
              <Typography component="span" variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                12
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ bgcolor: 'white', borderRadius: 1, p: 2, boxShadow: 1 }}
            >
              <Typography component="span" variant="h6">
                Topics Covered
              </Typography>
              <Typography component="span" variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                12
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
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
