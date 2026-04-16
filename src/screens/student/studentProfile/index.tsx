'use client';

import type { RootState } from 'src/redux/store';
import type { UseTabsReturn } from 'src/hooks/use-tabs';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import calculateAge from 'src/utils/calculate-age';
import { useMemo, useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { GenderType, GenderOptions } from 'src/enums/gender';
import { convertBase64Format } from 'src/utils/base64Formate';
import { LoadingScreen } from 'src/components/loading-screen';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';
import { useGetStudentByIdQuery, useLazyGetStudentsByDivisionQuery } from 'src/redux/student';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Avatar,
  Divider,
  MenuList,
  MenuItem,
  Typography,
} from '@mui/material';

import Finance from './finance';
import Library from './libraray';
import Academic from './academic';
import Document from './document';
import Attendance from './attendance';
import Communication from './communication';
import StudentCalendar from './StudentCalendar';
import StudentDashboard from './studentDashboard';
import StudentTransportProfile from './transport';
import { StudentInformation } from './information';
import ChangeStudentStatusForm from './change-status-form';

import type { IInquiryData } from '../enrollment/Inquiry/type';

export interface StudentTabsComponentType {
  tabs?: UseTabsReturn;
  student?: any;
  refetch?: any;
}

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    icon: <Iconify icon="lucide:layout-dashboard" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData; refetch: any }) => (
      <StudentDashboard {...props} />
    ),
  },
  {
    value: 'information',
    label: 'Information',
    icon: <Iconify icon="et:documents" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData; refetch: any }) => (
      <StudentInformation {...props} />
    ),
  },
  {
    value: 'attendance',
    label: 'Attendance',
    icon: <Iconify icon="solar:calendar-mark-outline" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData; refetch: any }) => (
      <Attendance {...props} />
    ),
  },
  {
    value: 'academic',
    label: 'Academic',
    icon: <Iconify icon="solar:square-academic-cap-2-broken" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData; refetch: any }) => (
      <Academic {...props} />
    ),
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
    icon: <Iconify icon="lucide:landmark" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData; refetch: any }) => (
      <Finance {...props} />
    ),
  },
  {
    value: 'documents',
    label: 'Documents',
    icon: <Iconify icon="solar:document-text-outline" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData; refetch: any }) => (
      <Document {...props} />
    ),
  },
  {
    value: 'communications',
    label: 'Communications',
    icon: <Iconify icon="fluent-mdl2:office-chat" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData; refetch: any }) => (
      <Communication {...props} />
    ),
  },
  {
    value: 'transportation',
    label: 'Transportation',
    icon: <Iconify icon="gis:route" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData; refetch: any }) => (
      <StudentTransportProfile {...props} />
    ),
  },
  {
    value: 'library',
    label: 'Library',
    icon: <Iconify icon="ph:books-light" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData; refetch: any }) => (
      <Library {...props} />
    ),
  },
  {
    value: 'calender',
    label: 'Calendar',
    icon: <Iconify icon="radix-icons:calendar" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: IInquiryData; refetch: any }) => (
      <StudentCalendar {...props} />
    ),
  },
  // {
  //   value: 'hostel',
  //   label: 'Hostel',
  //   icon: <Iconify icon="mdi:home-city-outline" width={20} />,
  //   component: (props: { tabs: UseTabsReturn; student: IInquiryData; refetch: any }) => (
  //     <HostelRoomMate {...props} />
  //   ),
  //   disibled: true,
  // },
];

export function StudentProfile() {
  // Dialog state for student ID card

  // States for managing organization/stage selection
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  // States for managing class/standard selection
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');

  // States for managing division selection
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const { currentMedium: medium, currentYear: year } = useSelector(
    (state: RootState) => state.globalState
  );

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

  const { getAllParams, setParam: setSearchParams } = useCustomSearchParams({ student: '' });
  const searchParams = getAllParams();

  // Query hook for fetching filtered student data
  // Returns getStudents function, StudentsData response and loading state
  const [getStudents, { data: StudentsData, isLoading, isFetching }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetStudentsByDivisionQuery,
  });

  useEffect(() => {
    if (division && classes && organization) {
      getStudents(division);
    }
  }, [division, classes, organization, getStudents]);

  // Transform students data to include full name
  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.lastName} ${item.firstName} ${item.middleName}`,
        genderLabel: GenderType[item.gender],
        age: calculateAge(item.dateOfBirth),
        address:
          [item.addressLine1, item.addressLine2, item.addressLine3].filter(Boolean).join(', ') ||
          item.address ||
          '-',
        RTE: item?.studentAdditionalDetails?.rightToEducation ? 'Yes' : 'No',
        dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
      })) || [],
    [StudentsData?.items]
  );

  console.log('tableData--->', tableData);

  // Find currently selected student based on search params
  const currentStudent: boolean = !!searchParams?.student;

  // State to track selected students for bulk actions
  const [selectedStudents] = useState<any>([]);

  // Boolean state to control instant notification dialog visibility
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler to open instant notification dialog
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  // State to control status change dialog
  const statusDialog = useBoolean();
  const [selectedStudentForStatus, setSelectedStudentForStatus] = useState<any>(null);

  const handleCloseStatus = () => {
    statusDialog.onFalse();
    setSelectedStudentForStatus(null);
    getStudents({
      academicMediumId: medium?.id,
      standardId: classes,
      divisionId: division,
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          // backgroundColor: 'background.default',
        }}
      >
        {currentStudent ? (
          <CustomBreadcrumbs
            heading="Student Profile"
            links={[
              { name: 'Student', href: '/student/dashboard' },
              { name: 'Student Records', href: '/student/dashboard' },
              { name: 'Student Profile', href: '/student/dashboard' },
            ]}
            isBack
            onBack={() => setSearchParams('student', '')}
            description="View and manage comprehensive student information including academics, attendance, finance and more."
          />
        ) : (
          <CustomBreadcrumbs
            heading="Student List"
            links={[
              { name: 'Student', href: '/student/dashboard' },
              { name: 'Student Records', href: '/student/dashboard' },
              { name: 'Student List', href: '/student/dashboard' },
            ]}
            description="Browse and search through the complete list of enrolled students. Select a student to view their detailed profile."
          />
        )}
      </Box>

      {/* <Box sx={{ flex: 1, overflow: 'auto', height: '100%' }}> */}
      {!currentStudent && (
        <>
          <Paper
            elevation={2}
            sx={{
              display: 'flex',
              borderRadius: 2,
              gap: 1,
              flexWrap: 'wrap',
              alignItems: 'center',
              px: 1,
              py: 1,
              mb: 1,
            }}
          >
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
          </Paper>

          <CustomizableTable
            onSendNotification={handlerSendNotification}
            tableTitle="Student List"
            showCheckbox={selectedStudents.length !== 0}
            tableId="student-list"
            noDataText={<>No Student Data Found </>}
            data={tableData}
            isLoading={isLoading || isFetching}
            columns={[
              {
                id: 'name',
                label: 'Student Name',
                sticky: true,
                minWidth: '14vw',
                align: 'left',
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
                label: 'Roll No.',
                minWidth: '6vw',
                align: 'left',
                filterType: 'number',
                render: (value, row) => value || '-',
              },
              {
                id: 'grNo',
                label: 'Gr No.',
                minWidth: '6vw',
                align: 'left',
                render: (value, row) => value || '-',
              },

              {
                id: 'genderLabel',
                label: 'Gender',
                minWidth: '6vw',
                align: 'left',
                filterType: 'enum',
                enumOptions: GenderOptions,
              },
              {
                id: 'dobValue',
                label: 'Date of Birth',
                minWidth: '10vw',
                align: 'left',
                filterType: 'date',
              },
              { id: 'age', label: 'Age', minWidth: '8vw', align: 'left', filterType: 'number' },
              { id: 'address', label: 'Address', minWidth: '14vw', align: 'left' },
              { id: 'email', label: 'Email', minWidth: '8vw', align: 'left' },
              // { id: 'class', label: 'Class' },
              // { id: 'division', label: 'Division' },
              {
                id: 'parentContactNumber',
                label: 'Parent Contact No.',
                minWidth: '12vw',
                align: 'left',
              },
              {
                id: 'RTE',
                label: 'RTE',
                minWidth: '6vw',
                align: 'left',
                filterType: 'enum',
                enumOptions: [
                  { label: 'Yes', value: 'Yes' },
                  { label: 'No', value: 'No' },
                ],
              },
              {
                id: 'action',
                label: 'Action',
                isSort: false,
                isFilter: false,
                sticky: true,
                minWidth: 50,
                align: 'left',
                render: (value, row) => (
                  <ThreeDotsActions
                    placement="right-top"
                    showViewIcon
                    showThreeDots
                    handleViewClick={() => {
                      setSearchParams('student', row.studentId);
                    }}
                    actions={({ popover: pop }) => (
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            pop.onClose();
                            statusDialog.onTrue();
                            setSelectedStudentForStatus(row);
                          }}
                        >
                          <Iconify
                            icon="mdi:form-dropdown"
                            sx={{ height: '16px', width: '16px', mr: 1 }}
                          />
                          Change Status
                        </MenuItem>
                      </MenuList>
                    )}
                  />
                ),
              },
            ]}
          />
          <CustomDialog
            open={statusDialog.value}
            handleClose={handleCloseStatus}
            title="Change Status"
          >
            {selectedStudentForStatus && (
              <ChangeStudentStatusForm
                handleClose={handleCloseStatus}
                studentId={selectedStudentForStatus.id}
                studentName={selectedStudentForStatus.name}
                status={selectedStudentForStatus.status}
              />
            )}
          </CustomDialog>
        </>
      )}

      {currentStudent && <StudentProfileView />}
      {/* </Box> */}
    </Box>
  );
}

const StudentProfileView = () => {
  const tabs = useTabs('dashboard');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBackClick, setIsBackClick] = useState(false);

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === tabs.value),
    [tabs.value]
  );
  const { getAllParams } = useCustomSearchParams();
  const searchParams = getAllParams();
  const {
    data: currentStudent,
    isLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentByIdQuery,
    params: searchParams?.student,
    options: { skip: !searchParams?.student },
  });

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const scrollContainer = document.querySelector('[data-scroll-container]');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <>
      <Paper
        sx={{
          mb: 1,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          boxShadow: 'var(--shadows-4)',
        }}
      >
        <Paper
          sx={{
            py: isScrolled ? 0.5 : 0.75,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeft: (theme) => `4px solid ${theme.vars.palette.success.main}`,
            borderRadius: 1,
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Box
            display="flex"
            gap={isScrolled ? 1.5 : 2}
            alignItems="center"
            sx={{ transition: 'gap 0.3s ease-in-out' }}
          >
            {!isScrolled && (
              <Avatar
                src={convertBase64Format(currentStudent?.profilePicture)}
                alt={`${currentStudent?.firstName} ${currentStudent?.lastName}`}
                sx={{
                  width: 40,
                  height: 40,
                  transition: 'all 0.3s ease-in-out',
                  opacity: isScrolled ? 0 : 1,
                }}
              />
            )}
            <Box sx={{ transition: 'all 0.3s ease-in-out' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: isScrolled ? '10px' : '12px',
                  transition: 'font-size 0.3s ease-in-out',
                }}
              >
                Name
              </Typography>
              <Typography
                fontWeight={500}
                variant="body2"
                sx={{
                  fontSize: isScrolled ? '12px' : '14px',
                  transition: 'font-size 0.3s ease-in-out',
                }}
              >
                {currentStudent?.lastName || 'Patel'} {currentStudent?.firstName || 'Ananya'}{' '}
                {currentStudent?.middleName || 'Kumar'}
              </Typography>
            </Box>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ my: isScrolled ? '6px' : '8px', transition: 'margin 0.3s ease-in-out' }}
            />
            <Box sx={{ transition: 'all 0.3s ease-in-out' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: isScrolled ? '10px' : '12px',
                  transition: 'font-size 0.3s ease-in-out',
                }}
              >
                Gr No.
              </Typography>
              <Typography
                fontWeight={500}
                variant="body2"
                sx={{
                  fontSize: isScrolled ? '12px' : '14px',
                  transition: 'font-size 0.3s ease-in-out',
                }}
              >
                {currentStudent?.grNoRecord || '2025000001'}
              </Typography>
            </Box>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ my: isScrolled ? '6px' : '8px', transition: 'margin 0.3s ease-in-out' }}
            />
            <Box sx={{ transition: 'all 0.3s ease-in-out' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: isScrolled ? '10px' : '12px',
                  transition: 'font-size 0.3s ease-in-out',
                }}
              >
                Roll No.
              </Typography>
              <Typography
                fontWeight={500}
                variant="body2"
                sx={{
                  fontSize: isScrolled ? '12px' : '14px',
                  transition: 'font-size 0.3s ease-in-out',
                }}
              >
                {currentStudent?.rollNo || '1'}
              </Typography>
            </Box>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ my: isScrolled ? '6px' : '8px', transition: 'margin 0.3s ease-in-out' }}
            />
            <Box sx={{ transition: 'all 0.3s ease-in-out' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: isScrolled ? '10px' : '12px',
                  transition: 'font-size 0.3s ease-in-out',
                }}
              >
                Class
              </Typography>
              <Typography
                fontWeight={500}
                variant="body2"
                sx={{
                  fontSize: isScrolled ? '12px' : '14px',
                  transition: 'font-size 0.3s ease-in-out',
                }}
              >
                {currentStudent?.standard?.name || '10'}-{currentStudent?.division?.name || 'A'}
              </Typography>
            </Box>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ my: isScrolled ? '6px' : '8px', transition: 'margin 0.3s ease-in-out' }}
            />
            <Box sx={{ transition: 'all 0.3s ease-in-out' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: isScrolled ? '10px' : '12px',
                  transition: 'font-size 0.3s ease-in-out',
                }}
              >
                Medium
              </Typography>
              <Typography
                fontWeight={500}
                variant="body2"
                sx={{
                  fontSize: isScrolled ? '12px' : '14px',
                  transition: 'font-size 0.3s ease-in-out',
                }}
              >
                {currentStudent?.educationMedium?.name || 'English'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Paper>
      <Paper elevation={2} sx={{ px: 2, mb: 1 }}>
        <Tabs
          value={tabs.value}
          onChange={(...rest) => {
            const newIndex = TABS.findIndex((tab) => tab.value === rest[1]);
            if (currentIndex > newIndex) {
              setIsBackClick(true);
            } else {
              setIsBackClick(false);
            }
            tabs.onChange(...rest);
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 2 } }}
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
      </Paper>

      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{ sx: { p: 0, minHeight: 0 } }}
      >
        <Box sx={{ height: '100%' }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              tabs={tabs}
              student={currentStudent}
              refetch={refetch}
            />
          )}
        </Box>
      </FormSlider>
    </>
  );
};
