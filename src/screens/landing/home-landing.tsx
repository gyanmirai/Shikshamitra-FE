import type { StackProps } from '@mui/material/Stack';

import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { ICONS } from 'src/layouts/config-nav-dashboard';
import { navSectionClasses } from 'src/components/nav-section';
import { varFade, MotionViewport } from 'src/components/animate';

import { SectionTitle } from './section-title';
import { CircleSvg, FloatLine, FloatPlusIcon } from './svg-elements';

// import { SectionTitle } from './components/section-title';
// import { CircleSvg, FloatLine, FloatPlusIcon } from './components/svg-elements';

// ----------------------------------------------------------------------

export function HomeMinimal({ sx, ...other }: StackProps) {
  const renderLines = (
    <>
      <FloatPlusIcon sx={{ top: 72, left: 72 }} />
      <FloatPlusIcon sx={{ bottom: 72, left: 72 }} />
      <FloatLine sx={{ top: 80, left: 0 }} />
      <FloatLine sx={{ bottom: 80, left: 0 }} />
      <FloatLine vertical sx={{ top: 0, left: 80 }} />
    </>
  );

  const renderDescription = (
    <>
      <SectionTitle
        caption="Visualizing Success"
        title="What's in"
        txtGradient="Shikshamitra?"
        sx={{ mb: { xs: 5, md: 8 }, textAlign: { xs: 'center', md: 'left' } }}
      />

      <Stack
        spacing={6}
        sx={{
          width: '100%',
          mx: { xs: 'auto', md: 'unset' },
        }}
      >
        <Grid container rowSpacing="48px">
          {ITEMS.map((item) => (
            <Grid size={{ xs: 12, md: 6 }} key={item.title}>
              <Box
                component={m.div}
                key={item.title}
                variants={varFade({ distance: 24 }).inUp}
                gap={3}
                display="flex"
              >
                {/* <SvgColor src={item.icon as any} sx={{ width: 40, height: 40 }} /> */}
                <Box
                  component="span"
                  className={navSectionClasses.item.icon}
                  sx={{
                    span: {
                      width: 40,
                      height: 40,
                    },
                  }}
                >
                  {item.icon}
                </Box>
                <Stack spacing={1}>
                  <Typography variant="h5" component="h6">
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      maxWidth: '336px',
                      width: '100%',
                    }}
                  >
                    {item.description}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </>
  );

  // const renderImg = (
  //   <Stack
  //     component={m.div}
  //     variants={varFade({ distance: 24 }).inRight}
  //     alignItems="center"
  //     justifyContent="center"
  //     sx={{ height: 1, position: 'relative' }}
  //   >
  //     <Box
  //       sx={{
  //         left: 0,
  //         width: 720,
  //         borderRadius: 2,
  //         position: 'absolute',
  //         bgcolor: 'background.default',
  //         boxShadow: (theme) =>
  //           `-40px 40px 80px 0px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
  //         [stylesMode.dark]: {
  //           boxShadow: (theme) =>
  //             `-40px 40px 80px 0px ${varAlpha(theme.vars.palette.common.blackChannel, 0.16)}`,
  //         },
  //       }}
  //     >
  //       <Box
  //         component="img"
  //         alt="Home Chart"
  //         src={`${CONFIG.site.basePath}/assets/images/home/home-chart.webp`}
  //         sx={{ width: 720 }}
  //       />
  //     </Box>
  //   </Stack>
  // );

  return (
    <Stack
      component="section"
      sx={{
        overflow: 'hidden',
        position: 'relative',
        py: { xs: 10, md: 20 },
        ...sx,
      }}
      {...other}
    >
      <MotionViewport>
        {renderLines}

        <Container sx={{ position: 'relative' }}>
          <Grid container columnSpacing={{ xs: 0, md: 8 }} sx={{ position: 'relative', zIndex: 9 }}>
            <Grid size={12}>{renderDescription}</Grid>

            {/* <Grid md={6} lg={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              {renderImg}
            </Grid> */}
          </Grid>

          <CircleSvg variants={varFade().in as any} sx={{ display: { xs: 'none', md: 'block' } }} />
        </Container>
      </MotionViewport>
    </Stack>
  );
}

// ----------------------------------------------------------------------

const ITEMS = [
  {
    icon: ICONS.student,
    title: 'Student Management',
    description: 'Student admission, Enrollment, Attendance,I-Card, Certificates.',
  },
  {
    icon: ICONS.academic,
    title: 'Academic Management',
    description:
      'Curriculum, Subject, Timetable, Activity, Learning Management, Grading, Homework.',
  },
  {
    icon: ICONS.examination,
    title: 'Examination Management',
    description: 'Schedule Exam, Grading, Assessments, Quiz Management, Student Performance.',
  },
  {
    icon: ICONS.hr,
    title: 'HR&Staff Management',
    description: 'Staff Management, Payroll Management,attendance and Reports',
  },
  {
    icon: ICONS.finance,
    title: 'Finance Management',
    description: 'Fee Management, Fee Collection, Budgeting,Income-Expense Tracking.',
  },
  {
    icon: ICONS.communication,
    title: 'Communication Management',
    description: 'Direct Communicate, Announcement, Events Management, Meetings, Feedback&Surveys.',
  },
  {
    icon: ICONS.library,
    title: 'Library Management',
    description: 'Book Management, Member Management, Circulation, Reports',
  },
  {
    icon: ICONS.transport,
    title: 'Transport Management',
    description: 'Routes Management, Vehicle Management,Real-time Bus Tracking.',
  },
  {
    icon: ICONS.hostel,
    title: 'Hostel Management',
    description: 'Hostel Configuration, Student Allocation,Fee Management, Maintenance.',
  },
  {
    icon: ICONS.security,
    title: 'Security Management',
    description: 'Role Management, Role Assignment and Access Control.',
  },
  {
    icon: ICONS.school,
    title: 'Institute Setup',
    description: 'Institute Information and Academic Setup.',
  },
  {
    icon: ICONS.dashboard,
    title: 'Real-Time Dashboards',
    description: 'Real-time dashboards Provide Live, Interactive Displays of Key Metrics and Data.',
  },
];
