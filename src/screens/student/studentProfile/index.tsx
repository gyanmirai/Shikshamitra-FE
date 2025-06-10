'use client';

import type { RootState } from 'src/redux/store';
import type { UseTabsReturn } from 'src/hooks/use-tabs';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';

import { Box, Tab, Card, Tabs, Paper, Avatar, Dialog, Divider, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { convertBase64Format } from 'src/utils/base64Formate';

import { GenderType } from 'src/enums/gender';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import Finance from './finance';
import Library from './libraray';
import Academic from './academic';
import Document from './document';
import Attendance from './attendance';
import Communication from './communication';
import StudentIDCard from './student-id-card';
import StudentDashboard from './studentDashboard';
import StudentTransportProfile from './transport';
import { StudentInformation } from './information';
import HostelRoomMate from './hostel/hostelRoomMate';

import type { IInquiryData } from '../enrollment/Inquiry';

export interface StudentTabsComponentType {
  tabs?: UseTabsReturn;
  student?: IInquiryData;
}

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    icon: <Iconify icon="ic:round-space-dashboard" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData }) => (
      <StudentDashboard {...props} />
    ),
  },
  {
    value: 'information',
    label: 'Information',
    icon: <Iconify icon="solar:user-id-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData }) => (
      <StudentInformation {...props} />
    ),
  },
  {
    value: 'attendance',
    label: 'Attendance',
    icon: <Iconify icon="solar:bill-list-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData }) => <Attendance {...props} />,
  },
  {
    value: 'academic',
    label: 'Academic',
    icon: <Iconify icon="solar:square-academic-cap-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData }) => <Academic {...props} />,
  },
  // {
  //   value: 'records',
  //   label: 'Records',
  //   icon: <Iconify icon="vaadin:records" width={20} />,
  //   component: (props: { tabs: UseTabsReturn; student: IInquiryData }) => <Records {...props} />,
  // },
  {
    value: 'finance',
    label: 'Finance',
    icon: <Iconify icon="map:finance" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData }) => <Finance {...props} />,
  },
  {
    value: 'documents',
    label: 'Documents',
    icon: <Iconify icon="ion:documents" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData }) => <Document {...props} />,
  },
  {
    value: 'communications',
    label: 'Communications',
    icon: <Iconify icon="maki:communications-tower" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData }) => (
      <Communication {...props} />
    ),
  },
  {
    value: 'transportation',
    label: 'Transportation',
    icon: <Iconify icon="solar:bus-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData }) => (
      <StudentTransportProfile {...props} />
    ),
  },
  {
    value: 'library',
    label: 'Library',
    icon: <Iconify icon="mdi:library" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData }) => <Library {...props} />,
  },
  {
    value: 'hostel',
    label: 'Hostel',
    icon: <Iconify icon="mdi:home-city-outline" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData }) => (
      <HostelRoomMate {...props} />
    ),
  },
];

export function StudentProfile() {
  // Dialog state for student ID card
  const icardDialog = useBoolean();

  // States for managing organization/stage selection
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  // States for managing class/standard selection
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');

  // States for managing division selection
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Effect to update organizations when medium changes
  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  // Effect to update classes when organization changes
  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

  // Effect to update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);
  const [searchParams, setSearchParams] = useSearchParam({
    isSearch: '',
    student: '',
    searchValue: '',
  });
  const tabs = useTabs('dashboard');

  // Find the currently active tab component based on selected tab value
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  // Query hook for fetching filtered student data
  // Returns getStudents function, StudentsData response and loading state
  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Effect to fetch students when division, class and organization are selected
  useEffect(() => {
    if (division && classes && organization) {
      getStudents({
        educationMediumStageId: organization,
        standardId: classes,
        divisionId: division,
      });
    }
  }, [division, classes, organization, getStudents]);

  // Transform students data to include full name
  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  // Find currently selected student based on search params
  const currentStudent: IInquiryData = tableData.find(
    (item: IInquiryData) => item.id === searchParams.student
  );

  // State to track selected students for bulk actions
  const [selectedStudents, setSelectedStudents] = useState<any>([]);

  // Boolean state to control instant notification dialog visibility
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler to open instant notification dialog
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <>
      {currentStudent ? (
        <CustomBreadcrumbs
          heading="Student Profile"
          links={[
            { name: 'Student', href: '/student/enrollment/dashboard' },
            { name: 'Student Records', href: '/student/overview/' },
            { name: 'Student List' },
          ]}
          sx={{ px: 1, mb: 2 }}
          isBack
          onBack={() => setSearchParams({ isSearch: '', student: '', searchValue: '' })}
          description="View and manage comprehensive student information including academics, attendance, finance and more."
        />
      ) : (
        <CustomBreadcrumbs
          heading="Student List"
          links={[
            { name: 'Student', href: '/student/enrollment/dashboard' },
            { name: 'Student Records', href: '/student/overview/' },
            { name: 'Student List' },
          ]}
          sx={{ px: 1, mb: 2 }}
          description="Browse and search through the complete list of enrolled students. Select a student to view their detailed profile."
        />
      )}

      {!currentStudent && (
        <>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <CustomSelect
              options={allOrganization}
              label="Organization"
              value={organization}
              onChange={(val) => setOrganization(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              disabled={!medium}
            />
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClass(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              disabled={!organization}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              disabled={!classes}
            />
          </Box>
          <CustomizableTable
            onSendNotification={handlerSendNotification}
            showCheckbox={selectedStudents.length !== 0}
            tableId="student-list"
            noDataText={<>No Student Data Found </>}
            data={tableData}
            isLoading={isLoading}
            searchFieldProps={{
              placeholder: 'Search by Student Name, Roll No...',
              label: 'Search by Student Name, Roll No...',
              sx: {
                maxWidth: '400px',
                width: '100%',
              },
            }}
            columns={[
              // {
              //   id: 'checkBox',
              //   align: 'left',
              //   minWidth: '60px',
              //   sticky: true,
              //   isSort: false,
              //   isFilter: false,
              //   label: '',
              //   renderColumn() {
              //     return (
              //       <Checkbox
              //         checked={tableData?.length && selectedStudents?.length === tableData?.length}
              //         onChange={(e) => {
              //           if (e.target.checked) {
              //             setSelectedStudents(tableData || []);
              //           } else {
              //             setSelectedStudents([]);
              //           }
              //         }}
              //       />
              //     );
              //   },
              //   render(value, row) {
              //     return (
              //       <Checkbox
              //         checked={selectedStudents.some((i: any) => i.id === row.id)}
              //         onChange={(e) => {
              //           if (e.target.checked) {
              //             setSelectedStudents([...selectedStudents, row]);
              //           } else {
              //             setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
              //           }
              //         }}
              //       />
              //     );
              //   },
              // },
              {
                id: 'name',
                label: 'Student Name',
                sticky: true,
                render: (value, row) => (
                  <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{ width: 32, height: 32, mr: 1 }}
                      src={convertBase64Format(row.profilePicture)}
                      alt={value}
                    />
                    <Typography component="span" fontSize="12px">
                      {value}
                    </Typography>
                  </Box>
                ),
              },
              {
                id: 'rollNo',
                label: 'Roll No',
                render: (value, row) =>
                  value || (
                    <Label variant="soft" color="default">
                      Not Assigned
                    </Label>
                  ),
              },
              {
                id: 'grNoRecord',
                label: 'Gr No',
                render: (value, row) =>
                  value || (
                    <Label variant="soft" color="default">
                      Not Assigned
                    </Label>
                  ),
              },

              // { id: 'organization', label: 'Organization' },
              // { id: 'class', label: 'Class' },
              // { id: 'division', label: 'Division' },
              { id: 'parentContactNumber', label: 'Contact No' },
              {
                id: 'action',
                label: 'Action',
                isSort: false,
                isFilter: false,
                sticky: true,
                minWidth: 80,
                align: 'left',
                render: (value, row) => (
                  <ThreeDotsActions
                    showViewIcon
                    showThreeDots={false}
                    handleViewClick={() => {
                      setSearchParams({
                        student: `${row.id}`,
                        isSearch: 'false',
                        searchValue: row.name,
                      });
                    }}
                  />
                ),
              },
            ]}
          />
        </>
      )}

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}

      {currentStudent && (
        <>
          <Card
            sx={{
              mb: 3,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              boxShadow: 'var(--shadows-4)',
            }}
          >
            <Paper
              sx={{
                p: 1,
                borderBottom: '1px dashed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderLeft: (theme) => `4px solid ${theme.palette.success.main}`,
                borderRadius: 1,
              }}
            >
              <Box display="flex" gap={2} alignItems="center">
                <Avatar
                  src={convertBase64Format(currentStudent?.profilePicture as string)}
                  sx={{ width: 64, height: 64 }}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography fontWeight={500} variant="body2">
                    {currentStudent?.name || '-'}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Gr No.
                  </Typography>
                  <Typography fontWeight={500} variant="body2">
                    {currentStudent?.grNoRecord || '-'}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Roll No.
                  </Typography>
                  <Typography fontWeight={500} variant="body2">
                    {currentStudent?.rollNo || '-'}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Class
                  </Typography>
                  <Typography fontWeight={500} variant="body2">
                    {currentStudent?.standard?.name}-{currentStudent?.division?.name}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Medium
                  </Typography>
                  <Typography fontWeight={500} variant="body2">
                    {currentStudent?.educationMedium?.name || '-'}
                  </Typography>
                </Box>
              </Box>
              {/* <Box display="flex" gap={2} alignItems="center">
                <Button
                  startIcon={<Iconify icon="lineicons:id-card" />}
                  size="small"
                  variant="outlined"
                  onClick={icardDialog.onTrue}
                >
                  View I-card
                </Button>
                <CustomTooltip
                  arrow
                  title={
                    <Box p={1}>
                      <Label variant="soft" color="success">
                        Volunteer
                      </Label>
                      <Label variant="soft" color="warning" sx={{ ml: 1 }}>
                        New
                      </Label>
                      <Label variant="soft" color="info" sx={{ ml: 1 }}>
                        VIP
                      </Label>
                      <Label variant="soft" color="error" sx={{ ml: 1 }}>
                        Good Listener
                      </Label>
                    </Box>
                  }
                >
                  <IconButton sx={{ color: 'primary.main' }}>
                    <Iconify
                      icon="iconamoon:certificate-badge-fill"
                      sx={{ height: '24px', width: '24px' }}
                    />
                  </IconButton>
                </CustomTooltip>
              </Box> */}
            </Paper>
            <Tabs
              value={tabs.value}
              onChange={tabs.onChange}
              sx={{ px: 2, '& .MuiTabs-flexContainer': { gap: 1.5 } }}
              role="tablist"
            >
              {TABS.map((tab) => (
                <Tab
                  sx={{ fontSize: '12px' }}
                  key={tab.value}
                  value={tab.value}
                  icon={tab.icon}
                  label={tab.label}
                  role="tab"
                />
              ))}
            </Tabs>
          </Card>
          <Dialog open={icardDialog.value} onClose={icardDialog.onFalse}>
            <StudentIDCard
              student={{
                name: currentStudent?.name || 'John Doe',
                grNo: currentStudent?.grNoRecord || '-',
                rollNo: currentStudent?.rollNo || '-',
                class: `${currentStudent?.standard?.name}-${currentStudent?.division?.name}`,
                // division: 'Higher Secondary',
                contactNo: currentStudent?.primaryContactNumber || '-',
                email: currentStudent?.email || '-',
                address: currentStudent?.addressLine1 || '-',
                dob: dayjs(currentStudent?.dateOfBirth).format('DD/MM/YYYY') || '-',
                // bloodGroup:  || '-',
                academicYear: currentStudent?.academicYear?.name || '-',
                gender: GenderType[currentStudent?.genderType],
                profilePicture: convertBase64Format(currentStudent?.profilePicture as string) || '',
              }}
            />
          </Dialog>
          {/* <Scrollbar sx={{ flexGrow: 1 }}> */}
          {currentActiveComponent?.component && (
            <currentActiveComponent.component tabs={tabs} student={currentStudent} />
          )}
          {/* </Scrollbar> */}
        </>
      )}
    </>
  );
}
