import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import { Box, Grid, Card, Button, Tooltip, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeDashboardCard } from 'src/screens/hr/dashboard/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

import { CalendarView } from 'src/sections/calendar/view';

const assignmentData = [
  {
    title: 'Math Assignment 1',
    pending: 10,
    status: 'Completed',
    lastDate: '2024-12-10',
  },
  {
    title: 'Science Experiment Report',
    pending: 17,
    status: 'Review',
    lastDate: '2024-12-15',
  },
  {
    title: 'History Project',
    pending: 18,
    status: 'Pending',
    lastDate: '2024-12-20',
  },
  {
    title: 'English Essay',
    pending: 20,
    status: 'Review',
    lastDate: '2024-12-25',
  },
  {
    title: 'Geography Map Work',
    pending: 8,
    status: 'Completed',
    lastDate: '2024-12-30',
  },
];

const Dashboard = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes, setSearchParams]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Homework And Assignment' },
          { name: 'Dashboard' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <DashBoardQuickAction
            actions={[
              {
                icon: 'mdi:plus',
                label: 'Homework/Assignment',
                href: '/academic/homework-assignment-management/homeworkCreation',
                color: 'primary',
              },
              {
                icon: 'mdi:assignment',
                label: 'Submission',
                href: '/academic/homework-assignment-management/studentSubmissions',
                color: 'warning',
              },
              {
                icon: 'mdi:arrow-right',
                label: 'Assign Grade',
                href: '/academic/homework-assignment-management/gradingAndFeedback',
                color: 'secondary',
              },
            ]}
          />
        }
      />
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            // formik.setFieldValue('class', selectedClass?.name || '');
            setSearchParams?.({
              classId: val as string,
            });
            setDivisionOptions(selectedClass?.divisions || []);
          }}
          value={classes}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Division"
          disabled={!classes}
          labelKey="name"
          valueKey="id"
          options={divisionOptions}
          value={division}
          onChange={(val) => {
            // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
            // formik.setFieldValue('division', selectedDivision?.name || '');
            setDivision(val as string);
          }}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
      </Box>
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={4}>
          <EmployeeDashboardCard
            title="Total Assignments"
            icon="material-symbols:assignment"
            value={35}
            labels={[
              { name: 'Active : 10', color: 'info' },
              { name: 'Pending : 10', color: 'warning' },
              { name: 'Completed : 15', color: 'primary' },
            ]}
            color="primary.main"
            // href="/academic/homework-assignment-management/?tab=homeworkCreation"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <EmployeeDashboardCard
            title="Total Homeworks"
            icon="material-symbols:assignment"
            value={35}
            labels={[
              { name: 'Active : 10', color: 'info' },
              { name: 'Pending : 10', color: 'warning' },
              { name: 'Completed : 15', color: 'primary' },
            ]}
            color="primary.main"
            // href="/academic/homework-assignment-management/?tab=homeworkCreation"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <EmployeeDashboardCard
            title="Upcoming Grade Publish"
            icon="material-symbols:grade"
            value="Algebra Assignment"
            // labels={[
            //   { name: 'Active : 10', color: 'info' },
            //   { name: 'Pending : 10', color: 'warning' },
            //   { name: 'Completed : 15', color: 'primary' },
            // ]}
            color="primary.main"
            // href="/academic/homework-assignment-management/?tab=homeworkCreation"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: 'flex',
              p: 3,
              width: '100%',
              height: '100%',
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle1' }}>Pending Assignment Submissions</Box>
              <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                    height: '300px',
                    m: 0.5,
                  }}
                >
                  {assignmentData.map((assignment, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      fullWidth
                      sx={{
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                      onMouseEnter={() => setHoveredResource(assignment.title)}
                      onMouseLeave={() => setHoveredResource(null)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{assignment.title}</Typography>{' '}
                        <Label color="warning" sx={{ ml: 1, px: 1, py: 0.5 }}>
                          {`${assignment.pending}`}
                        </Label>{' '}
                        {hoveredResource === assignment.title && (
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 2,
                              color: 'text.secondary',
                            }}
                          >
                            Last Date : {assignment.lastDate}
                          </Typography>
                        )}
                      </Box>
                      {hoveredResource === assignment.title && (
                        <Tooltip title="Send Reminder">
                          <Iconify
                            icon="mdi:bell"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            sx={{
                              position: 'absolute',
                              right: 10,
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }}
                          />
                        </Tooltip>
                      )}
                    </Button>
                  ))}
                </Box>
              </Scrollbar>
            </Box>{' '}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: 'flex',
              p: 3,
              width: '100%',
              height: '100%',
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle1' }}>Pending Homeworks</Box>
              <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                    height: '300px',
                    m: 0.5,
                  }}
                >
                  {assignmentData.map((assignment, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      fullWidth
                      sx={{
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                      onMouseEnter={() => setHoveredResource(assignment.title)}
                      onMouseLeave={() => setHoveredResource(null)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{assignment.title}</Typography>
                        <Label color="warning" sx={{ ml: 1, px: 1, py: 0.5 }}>
                          {`${assignment.pending}`}
                        </Label>{' '}
                        {hoveredResource === assignment.title && (
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 2,
                              color: 'text.secondary',
                            }}
                          >
                            Last Date : {assignment.lastDate}
                          </Typography>
                        )}
                      </Box>
                      {hoveredResource === assignment.title && (
                        <Tooltip title="Send Reminder">
                          <Iconify
                            icon="mdi:bell"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            sx={{
                              position: 'absolute',
                              right: 10,
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }}
                          />
                        </Tooltip>
                      )}
                    </Button>
                  ))}
                </Box>
              </Scrollbar>
            </Box>{' '}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: 'flex',
              p: 3,
              width: '100%',
              height: '100%',
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle1' }}>Pending Grade Assign</Box>
              <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                    height: '300px',
                    m: 0.5,
                  }}
                >
                  {assignmentData.map((assignment, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      fullWidth
                      sx={{
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                      onMouseEnter={() => setHoveredResource(assignment.title)}
                      onMouseLeave={() => setHoveredResource(null)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{assignment.title}</Typography>
                        <Label color="warning" sx={{ ml: 1, px: 1, py: 0.5 }}>
                          {`${assignment.pending}`}
                        </Label>{' '}
                        {hoveredResource === assignment.title && (
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 2,
                              color: 'text.secondary',
                            }}
                          >
                            Publish Date : {assignment.lastDate}
                          </Typography>
                        )}
                      </Box>
                      {hoveredResource === assignment.title && (
                        <Tooltip title="Send Reminder">
                          <Iconify
                            icon="mdi:bell"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            sx={{
                              position: 'absolute',
                              right: 10,
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }}
                          />
                        </Tooltip>
                      )}
                    </Button>
                  ))}
                </Box>
              </Scrollbar>
            </Box>{' '}
          </Card>
        </Grid>
      </Grid>
      {/* <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: 'flex',
              p: 3,
              width: '100%',
              height: '100%',
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle1' }}>Pending Homework</Box>
              <Scrollbar sx={{ mt: 1.5 }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                    height: '150px',
                    m: 0.5,
                  }}
                >
                  {assignmentData.map((assignment, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      fullWidth
                      sx={{
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                      onMouseEnter={() => setHoveredResource(assignment.title)}
                      onMouseLeave={() => setHoveredResource(null)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{assignment.title}</Typography>
                        {hoveredResource === assignment.title && (
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 2,
                              color: 'warning.main',
                            }}
                          >
                            Last Date : {assignment.lastDate}
                          </Typography>
                        )}
                      </Box>
                      {hoveredResource === assignment.title && (
                        <Tooltip title="Send Reminder">
                          <Iconify
                            icon="mdi:bell"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            sx={{
                              position: 'absolute',
                              right: 10,
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }}
                          />
                        </Tooltip>
                      )}
                    </Button>
                  ))}
                </Box>
              </Scrollbar>
            </Box>{' '}
          </Card>
        </Grid> */}
      <Typography variant="h6" gutterBottom color="text.primary" sx={{ mt: 2 }}>
        Welcome, [John Doe]
      </Typography>
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: 'flex',
              p: 3,
              width: '100%',
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle1' }}>Pending Assignments</Box>
              <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                    height: '300px',
                    m: 0.5,
                  }}
                >
                  {assignmentData.map((assignment, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      fullWidth
                      sx={{
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                      onMouseEnter={() => setHoveredResource(assignment.title)}
                      onMouseLeave={() => setHoveredResource(null)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{assignment.title}</Typography>
                        {hoveredResource === assignment.title && (
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 2,
                              color: 'text.secondary',
                            }}
                          >
                            Deadline : {assignment.lastDate}
                          </Typography>
                        )}
                      </Box>
                    </Button>
                  ))}
                </Box>
              </Scrollbar>
            </Box>{' '}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: 'flex',
              p: 3,
              width: '100%',
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle1' }}>Completed Assignments</Box>
              <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                    height: '300px',
                    m: 0.5,
                  }}
                >
                  {assignmentData.map((assignment, index) => (
                    <Tooltip
                      key={index}
                      title={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                assignment.status === 'Completed'
                                  ? 'green'
                                  : assignment.status === 'Review'
                                    ? 'yellow'
                                    : 'red',
                              fontWeight: 'bold',
                            }}
                          >
                            Status: {assignment.status.toUpperCase()}
                          </Typography>
                          {assignment.status === 'Completed' && (
                            <Typography variant="body2">Grade : A</Typography>
                          )}
                        </Box>
                      }
                      placement="right"
                      arrow
                    >
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                          justifyContent: 'space-between',
                          position: 'relative',
                          overflow: 'hidden',
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography>{assignment.title}</Typography>
                        </Box>
                      </Button>
                    </Tooltip>
                  ))}
                </Box>
              </Scrollbar>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: 'flex',
              p: 3,
              width: '100%',
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle1' }}>Pending Homeowrk</Box>
              <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                    height: '300px',
                    m: 0.5,
                  }}
                >
                  {assignmentData.map((assignment, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      fullWidth
                      sx={{
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                      onMouseEnter={() => setHoveredResource(assignment.title)}
                      onMouseLeave={() => setHoveredResource(null)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{assignment.title}</Typography>
                        {hoveredResource === assignment.title && (
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 2,
                              color: 'text.secondary',
                            }}
                          >
                            Deadline : {assignment.lastDate}
                          </Typography>
                        )}
                      </Box>
                    </Button>
                  ))}
                </Box>
              </Scrollbar>
            </Box>{' '}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: 'flex',
              p: 3,
              width: '100%',
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle1' }}>Completed Homeworks</Box>
              <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                    height: '300px',
                    m: 0.5,
                  }}
                >
                  {assignmentData.map((assignment, index) => (
                    <Tooltip
                      key={index}
                      title={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                assignment.status === 'Completed'
                                  ? 'green'
                                  : assignment.status === 'Review'
                                    ? 'yellow'
                                    : 'red',
                              fontWeight: 'bold',
                            }}
                          >
                            Status: {assignment.status.toUpperCase()}
                          </Typography>
                          {assignment.status === 'Completed' && (
                            <Typography variant="body2">Grade : A</Typography>
                          )}
                        </Box>
                      }
                      placement="right"
                      arrow
                    >
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                          justifyContent: 'space-between',
                          position: 'relative',
                          overflow: 'hidden',
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography>{assignment.title}</Typography>
                        </Box>
                      </Button>
                    </Tooltip>
                  ))}
                </Box>
              </Scrollbar>
            </Box>
          </Card>
        </Grid>
      </Grid>
      <Box
        sx={{
          width: '80%',
          height: '60%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          ml: '10%',
        }}
      >
        <CalendarView />
      </Box>
    </Box>
    // <Box sx={{ flexGrow: 1 }}>
    //   <Box display="flex" gap={2} alignItems="center">
    //     <CustomSelect options={[]} value="" onChange={() => {}} label="Organization" />
    //     <CustomSelect options={[]} value="" onChange={() => {}} label="Class" />
    //   </Box>
    //   <Grid container spacing={4} sx={{ mt: 2 }}>
    //     {/* Header Section */}
    //     <Grid item xs={12}>
    //       <Typography variant="h4" gutterBottom color="text.primary">
    //         Welcome, [John Doe]
    //       </Typography>
    //     </Grid>

    //     {/* Total Assignments */}
    //     <Grid item xs={3}>
    //       <Card sx={{ backgroundColor: blue[50], borderRadius: 2 }}>
    //         <CardContent>
    //           <Typography variant="h6" color={blue[800]} gutterBottom>
    //             Total Assignments
    //           </Typography>
    //           <Typography variant="body1" color="black">
    //             35 Assignments
    //           </Typography>
    //           <Typography variant="body2" color="black">
    //             Active: 10
    //           </Typography>
    //           <Typography variant="body2" color="black">
    //             Pending: 15
    //           </Typography>
    //           <Typography variant="body2" color="black">
    //             Overdue: 10
    //           </Typography>
    //         </CardContent>
    //       </Card>
    //     </Grid>

    //     {/* Submissions Pending */}
    //     <Grid item xs={3}>
    //       <Card sx={{ backgroundColor: yellow[50], borderRadius: 2 }}>
    //         <CardContent>
    //           <Typography
    //             variant="h6"
    //             color={theme.palette.mode === 'dark' ? yellow[200] : yellow[800]}
    //             gutterBottom
    //           >
    //             Submissions Pending
    //           </Typography>
    //           <Typography variant="body1" color="black">
    //             7 Pending Submissions
    //           </Typography>
    //         </CardContent>
    //       </Card>
    //     </Grid>

    //     {/* Grading Queue */}
    //     <Grid item xs={3}>
    //       <Card sx={{ backgroundColor: green[50], borderRadius: 2 }}>
    //         <CardContent>
    //           <Typography
    //             variant="h6"
    //             color={theme.palette.mode === 'dark' ? green[200] : green[800]}
    //             gutterBottom
    //           >
    //             Grading Queue
    //           </Typography>
    //           <Typography variant="body1" color="black">
    //             12 Assignments to Grade
    //           </Typography>
    //         </CardContent>
    //       </Card>
    //     </Grid>

    //     {/* Upcoming Deadlines */}
    //     <Grid item xs={3}>
    //       <Card sx={{ backgroundColor: red[50], borderRadius: 2 }}>
    //         <CardContent>
    //           <Typography
    //             variant="h6"
    //             color={theme.palette.mode === 'dark' ? red[200] : red[800]}
    //             gutterBottom
    //           >
    //             Upcoming Deadlines
    //           </Typography>
    //           <Typography variant="body2" color="black">
    //             Math Assignment - Due Oct 5
    //           </Typography>
    //           <Typography variant="body2" color="black">
    //             Science Assignment - Due Oct 10
    //           </Typography>
    //           <Typography variant="body2" color="black">
    //             English Assignment - Due Oct 15
    //           </Typography>
    //         </CardContent>
    //       </Card>
    //     </Grid>

    //     {/* Submission Status */}
    //     <Grid item xs={6}>
    //       <Card sx={{ backgroundColor: grey[50], borderRadius: 2 }}>
    //         <CardContent>
    //           <Typography variant="h6" color="text.primary" gutterBottom>
    //             Submission Status
    //           </Typography>
    //           <List>
    //             <ListItem>
    //               <Avatar sx={{ bgcolor: green[500], mr: 2 }} />
    //               <Typography color="black">Math Assignment 1 - Due 10-10-2024</Typography>
    //             </ListItem>
    //             <Divider />
    //             <ListItem>
    //               <Avatar sx={{ bgcolor: yellow[500], mr: 2 }} />
    //               <Typography color="black">Math Assignment 2 - Due 02-10-2024</Typography>
    //             </ListItem>
    //             <Divider />
    //             <ListItem>
    //               <Avatar sx={{ bgcolor: red[500], mr: 2 }} />
    //               <Typography color="black">Math Assignment 3 - Due 30-09-2024</Typography>
    //             </ListItem>
    //           </List>
    //         </CardContent>
    //       </Card>
    //     </Grid>

    //     {/* To-Do List */}
    //     <Grid item xs={6}>
    //       <Card sx={{ backgroundColor: blue[50], borderRadius: 2 }}>
    //         <CardContent>
    //           <Typography
    //             variant="h6"
    //             color={theme.palette.mode === 'dark' ? blue[200] : blue[800]}
    //             gutterBottom
    //           >
    //             To-Do List
    //           </Typography>
    //           <List>
    //             <ListItem>
    //               <Checkbox />
    //               <Typography color="black">Complete Math Assignment Before 10-10-2024</Typography>
    //             </ListItem>
    //             <Divider />
    //             <ListItem>
    //               <Checkbox />
    //               <Typography color="black">
    //                 Complete Science Assignment Before 10-10-2024
    //               </Typography>
    //             </ListItem>
    //           </List>
    //         </CardContent>
    //       </Card>
    //     </Grid>

    //     {/* Parent Dashboard */}
    //     <Grid item xs={12}>
    //       <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
    //         <Typography variant="h5" gutterBottom>
    //           Parent Dashboard
    //         </Typography>
    //         <Typography variant="body1">Welcome, [Parents Name]</Typography>
    //         <Typography variant="body2">John Doe Grade 05</Typography>
    //       </Paper>
    //     </Grid>

    //     {/* Assignment Overview */}
    //     <Grid item xs={6}>
    //       <Card sx={{ backgroundColor: grey[50], borderRadius: 2 }}>
    //         <CardContent>
    //           <Typography variant="h6" color="black" gutterBottom>
    //             Assignment Overview
    //           </Typography>
    //           <List>
    //             <ListItem>
    //               <Avatar sx={{ bgcolor: green[500], mr: 2 }} />
    //               <Typography color="black">Math Assignment 1 - Due 10-10-2024</Typography>
    //             </ListItem>
    //             <Divider />
    //             <ListItem>
    //               <Avatar sx={{ bgcolor: yellow[500], mr: 2 }} />
    //               <Typography color="black">Math Assignment 2 - Due 02-10-2024</Typography>
    //             </ListItem>
    //             <Divider />
    //             <ListItem>
    //               <Avatar sx={{ bgcolor: red[500], mr: 2 }} />
    //               <Typography color="black">Math Assignment 3 - Due 30-09-2024</Typography>
    //             </ListItem>
    //           </List>
    //         </CardContent>
    //       </Card>
    //     </Grid>

    //     {/* Upcoming Deadlines */}
    //     <Grid item xs={6}>
    //       <Card sx={{ backgroundColor: red[50], borderRadius: 2 }}>
    //         <CardContent>
    //           <Typography
    //             variant="h6"
    //             color={theme.palette.mode === 'dark' ? red[200] : red[800]}
    //             gutterBottom
    //           >
    //             Upcoming Deadlines
    //           </Typography>
    //           <Typography variant="body2" color="text.secondary">
    //             Math Assignment 1 - Due in 10 days
    //           </Typography>
    //           <Typography variant="body2" color="text.secondary">
    //             Math Assignment 2 - Due in 3 days
    //           </Typography>
    //           <Typography variant="body2" color="text.secondary">
    //             Math Assignment 3 - Due in 3 days
    //           </Typography>
    //         </CardContent>
    //       </Card>
    //     </Grid>
    //   </Grid>
    // </Box>
  );
};

export default Dashboard;

// interface DashboardCardProps {
//   title: string;
//   icon: string;
//   value?: number | string;
//   labels?: { name: string; color: LabelColor }[];
//   color: string;
//   href?: string;
//   searchParams?: Record<string, string>;
// }

// const HomeworkDashboardCard = ({
//   title,
//   icon,
//   value,
//   labels = [],
//   href = '',
//   color,
//   searchParams = {},
// }: DashboardCardProps) => {
//   const url = new URL(href, window.location.origin);
//   Object.entries(searchParams).forEach(([key, val]) => {
//     if (val) {
//       url.searchParams.set(key, val);
//     }
//   });

//   return (
//     <Box component={Link} href={url.toString()} sx={{ textDecoration: 'none' }}>
//       <Card
//         sx={{
//           height: '100%',
//           transition: 'all 0.3s ease',
//           '&:hover': {
//             boxShadow: 'var(--shadows-8)',
//             scale: 1.03,
//           },
//         }}
//       >
//         <CardContent
//           sx={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             height: '100%',
//           }}
//         >
//           <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
//             <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
//               <Box sx={{ typography: 'subtitle1' }}>{title}</Box>
//               {/* <Typography variant="h6">Total Employees</Typography> */}
//             </Box>
//             {typeof value === 'number' && (
//               <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{fNumber(value)}</Box>
//             )}
//             {typeof value === 'string' && (
//               <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{value}</Box>
//             )}
//             {/* <Typography variant="h4">{stats.totalEmployees}</Typography> */}
//             <Box
//               sx={{
//                 mt: 1.5,
//                 mb: 1,
//                 typography: 'subtitle2',
//                 display: 'flex',
//                 gap: 1,
//                 flexWrap: 'wrap',
//               }}
//             >
//               {labels.map((label, index) => (
//                 <Label color={label.color || 'success'}>{label.name}</Label>
//               ))}
//             </Box>
//           </Box>
//           <Iconify icon={icon} sx={{ width: 50, height: 50, color }} />
//           {/* <Typography variant="body2"></Typography> */}
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };
