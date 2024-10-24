import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Button, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

const CarriculumnDashboardOverviewComponent = () => (
  <>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: '20px', pb: '20px' }}>
      <Button variant="contained" onClick={() => {}}>
        Create New Curriculum
      </Button>
    </Box>

    <Grid2 container spacing={3} alignItems="stretch">
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
              Total Curriculum
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
                  {['20 curriculumn'].map((exam, index) => (
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
      {/* <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Total Curriculum
            </Typography>
            <CustomSelect
              label="class"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>

          <Box sx={{ mt: 2 }} display="flex" flexDirection="column" alignItems="start">
            <Box display="flex" alignItems="flex-start">
              <Typography
                sx={{ fontSize: '32px', lineHeight: '32px', pr: 1, pt: '5px' }}
                gutterBottom
              >
                •
              </Typography>
              <Typography sx={{ fontSize: '32px' }} gutterBottom>
                20
              </Typography>
            </Box>

            <Typography sx={{ pl: '20px', mt: '-10px', fontSize: '14px' }}>Curriculums</Typography>
          </Box>
        </Card>
      </Grid2> */}
      {/* <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Typography component="span" sx={{ fontSize: '20px', fontWeight: '600' }} gutterBottom>
            Subjects/Streams Managed
          </Typography>

          <Box display="flex" alignItems="flex-start">
            <Typography sx={{ fontSize: '14px', lineHeight: '14px', pr: 1 }} gutterBottom>
              •
            </Typography>
            <Typography sx={{ fontSize: '14px' }} gutterBottom>
              08 Subject Managed
            </Typography>
          </Box>
        </Card>
      </Grid2> */}
      <Grid2 xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography component="span" variant="h6" gutterBottom color="warning.main">
              Subjects/Streams Managed
              </Typography>
              {/* <CustomSelect
                label="class"
                options={ []}
                value=""
              
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  // setClasses(val as string);
                }}
                formControlProps={{ sx: { minWidth: 120 } }}
              /> */}
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
                  {['08 Subject Managed'].map((exam, index) => (
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
      {/* <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Typography component="span" sx={{ fontSize: '20px', fontWeight: '600' }} gutterBottom>
            Grade Levels Managed
          </Typography>

          <Box display="flex" alignItems="flex-start">
            <Typography sx={{ fontSize: '14px', lineHeight: '14px', pr: 1 }} gutterBottom>
              •
            </Typography>
            <Typography sx={{ fontSize: '14px' }} gutterBottom>
              08 Subject Managed
            </Typography>
          </Box>
        </Card>
      </Grid2> */}
      <Grid2 xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography component="span" variant="h6" gutterBottom color="error.main">
              Grade Levels Managed
              </Typography>
              {/* <CustomSelect
                label="class"
                options={ []}
                value=""
              
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  // setClasses(val as string);
                }}
                formControlProps={{ sx: { minWidth: 120 } }}
              /> */}
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
                  {['08 Grade Managed'].map((exam, index) => (
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
    </Grid2>
  </>
);
export default CarriculumnDashboardOverviewComponent;
