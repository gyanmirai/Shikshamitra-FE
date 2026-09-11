'use client';

import type { RootState } from 'src/redux/store';
import type { UseTabsReturn } from 'src/hooks/use-tabs';
import type { Division, Standards, Organization } from 'src/types/school';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import calculateAge from 'src/utils/calculate-age';
import { useMemo, useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Label, LabelColor } from 'src/components/label';
import CustomTooltip from 'src/components/custom-tooltip';
import { GenderType, GenderOptions } from 'src/enums/gender';
import { convertBase64Format } from 'src/utils/base64Formate';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetStudentsByDivisionQuery } from 'src/redux/student';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Paper, Avatar, MenuList, MenuItem, Typography } from '@mui/material';
import FeeStructureAssignmentForm from 'src/screens/finance/FeeStructureAssign/Components/StudentFeeStructureAssignmentForm';
import {
  StudentStatusOptions,
  RegistrationStatusType,
  RegistrationStatusTypeColor,
} from 'src/enums/registration-status-type';

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
import { StudentProfileView } from './student-profile-view';
import { StudentProfileDataBoundary } from './student-profile-data-boundary';

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
    component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile; refetch: any }) => (
      <StudentDashboard {...props} />
    ),
  },
  {
    value: 'information',
    label: 'Information',
    icon: <Iconify icon="et:documents" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile; refetch: any }) => (
      <StudentInformation {...props} />
    ),
  },
  {
    value: 'attendance',
    label: 'Attendance',
    icon: <Iconify icon="solar:calendar-mark-outline" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile; refetch: any }) => (
      <Attendance {...props} />
    ),
  },
  {
    value: 'academic',
    label: 'Academic',
    icon: <Iconify icon="solar:square-academic-cap-2-broken" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile; refetch: any }) => (
      <Academic {...props} />
    ),
  },
  // {
  //   value: 'records',
  //   label: 'Records',
  //   icon: <Iconify icon="vaadin:records" width={20} />,
  //   component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile }) => <Records {...props} />,
  // },
  {
    value: 'finance',
    label: 'Finance',
    icon: <Iconify icon="lucide:landmark" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile; refetch: any }) => (
      <Finance {...props} />
    ),
  },
  {
    value: 'documents',
    label: 'Documents',
    icon: <Iconify icon="solar:document-text-outline" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile; refetch: any }) => (
      <Document {...props} />
    ),
  },
  {
    value: 'communications',
    label: 'Communications',
    icon: <Iconify icon="fluent-mdl2:office-chat" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile; refetch: any }) => (
      <Communication {...props} />
    ),
  },
  {
    value: 'transportation',
    label: 'Transportation',
    icon: <Iconify icon="gis:route" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile; refetch: any }) => (
      <StudentTransportProfile {...props} />
    ),
  },
  {
    value: 'library',
    label: 'Library',
    icon: <Iconify icon="ph:books-light" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile; refetch: any }) => (
      <Library {...props} />
    ),
  },
  {
    value: 'calender',
    label: 'Calendar',
    icon: <Iconify icon="radix-icons:calendar" width={20} />,
    component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile; refetch: any }) => (
      <StudentCalendar {...props} />
    ),
  },
  // {
  //   value: 'hostel',
  //   label: 'Hostel',
  //   icon: <Iconify icon="mdi:home-city-outline" width={20} />,
  //   component: (props: { tabs: UseTabsReturn; student: StudentRecordProfile; refetch: any }) => (
  //     <HostelRoomMate {...props} />
  //   ),
  //   disibled: true,
  // },
];

const mapStudentRecordStatus = (item: any) => {
  if (item?.operationalStatus === 0) return RegistrationStatusType.Active;
  if (item?.operationalStatus === 1) return RegistrationStatusType.Left;
  if (item?.operationalStatus === 2) return RegistrationStatusType.Inactive;
  if (item?.status === 6) return RegistrationStatusType.Active;
  if (item?.status === 7) return RegistrationStatusType.Inactive;
  if (item?.status === 8) return RegistrationStatusType.Left;
  return item?.status ?? RegistrationStatusType.Active;
};

export function StudentProfile() {
  // Dialog state for student ID card
  const statusDialog = useBoolean();
  const dialogForAssignFeeStructure = useBoolean();
  const [selectedStudentForStatus, setSelectedStudentForStatus] = useState<any>(null);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<any>(null);

  // States for managing organization/stage selection
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  // States for managing class/standard selection
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');

  // States for managing division selection
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

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

  const selectedOrganization = useMemo(
    () => medium?.educationMediumStages?.find((item: any) => item?.id === organization),
    [medium?.educationMediumStages, organization]
  );
  const selectedClass = useMemo(
    () => selectedOrganization?.standards?.find((item: any) => item?.id === classes),
    [classes, selectedOrganization?.standards]
  );
  const selectedDivision = useMemo(
    () => selectedClass?.divisions?.find((item: any) => item?.id === division),
    [division, selectedClass?.divisions]
  );
  const resolvedDivision = selectedDivision?.id || '';
  const shouldFetchStudents = Boolean(
    medium?.id && selectedOrganization?.id && selectedClass?.id && resolvedDivision
  );
  const {
    data: StudentsData,
    isLoading,
    isFetching,
  } = useGetStudentsByDivisionQuery(resolvedDivision, {
    skip: !shouldFetchStudents,
  });

  // Transform students data to include full name
  const tableData = useMemo(() => {
    if (!shouldFetchStudents) return [];

    return (
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
        status: mapStudentRecordStatus(item),
      })) || []
    );
  }, [shouldFetchStudents, StudentsData?.items]);

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

  const handleCloseStatus = () => {
    statusDialog.onFalse();
    setSelectedStudentForStatus(null);
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
              {
                id: 'age',
                label: 'Age',
                minWidth: '8vw',
                align: 'left',
                filterType: 'number',
                render: (value, row) => (
                  <CustomTooltip title={value} arrow sx={{ textAlign: 'justify' }}>
                    <Typography
                      variant="inherit"
                      noWrap
                      sx={{
                        maxWidth: 150,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {value}
                    </Typography>
                  </CustomTooltip>
                ),
              },
              {
                id: 'address',
                label: 'Address',
                minWidth: '14vw',
                align: 'left',
                render: (value, row) => (
                  <CustomTooltip title={value} arrow sx={{ textAlign: 'justify' }}>
                    <Typography
                      variant="inherit"
                      noWrap
                      sx={{
                        maxWidth: 150,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {value}
                    </Typography>
                  </CustomTooltip>
                ),
              },
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
                id: 'status',
                label: 'Status',
                minWidth: '6vw',
                align: 'left',
                sticky: true,
                filterType: 'enum',
                enumOptions: StudentStatusOptions,
                render(value, row) {
                  const status = row.status as RegistrationStatusType;
                  const color = RegistrationStatusTypeColor[status] as LabelColor;
                  return <Label color={color}>{RegistrationStatusType[status] ?? '-'}</Label>;
                },
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
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            pop.onClose();
                            setSelectedStudentForFee(row);
                            dialogForAssignFeeStructure.onTrue();
                          }}
                        >
                          <Iconify
                            icon="tdesign:money"
                            sx={{ height: '16px', width: '16px', mr: 1 }}
                          />
                          Assign Fee Structure
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

          <CustomDialog
            open={dialogForAssignFeeStructure.value}
            handleClose={() => {
              dialogForAssignFeeStructure.onFalse();
              setSelectedStudentForFee(null);
            }}
            title={
              <Box display="flex" flexDirection="row" gap={1} alignItems="center">
                <Typography variant="h5">Assign Fee Structure</Typography>
                <CustomTooltip
                  arrow
                  placement="right"
                  sx={{ textAlign: 'justify' }}
                  title="Assign a fee structure to the student based on their selected class for accurate fee management and billing."
                >
                  <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
                </CustomTooltip>
              </Box>
            }
            maxWidth="md"
          >
            {selectedStudentForFee && (
              <FeeStructureAssignmentForm
                student={selectedStudentForFee as any}
                handleClose={() => {
                  dialogForAssignFeeStructure.onFalse();
                  setSelectedStudentForFee(null);
                }}
              />
            )}
          </CustomDialog>
        </>
      )}

      {currentStudent && (
        <StudentProfileDataBoundary studentId={searchParams.student}>
          {(student, refetch) => (
            <StudentProfileView student={student} refetch={refetch} sections={TABS} />
          )}
        </StudentProfileDataBoundary>
      )}
      {/* </Box> */}
    </Box>
  );
}
