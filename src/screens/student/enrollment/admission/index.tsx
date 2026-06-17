'use client';

import type { RootState } from 'src/redux/store';
import type { Standards } from 'src/types/school';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { EntranceExamStatusType } from 'src/enums/entranceExam-type';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { GenderType } from 'src/enums/gender';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import calculateAge from 'src/utils/calculate-age';
import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DocumentType } from 'src/enums/documnet-type';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import sortQueryString from 'src/utils/sort-query-string';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { EntranceExamStatusTypeColors } from 'src/enums/entranceExam-type';
import { RegistrationStatusType } from 'src/enums/registration-status-type';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { useGetStudentDocumentsQuery } from 'src/redux/student/registration/registration-api';
import { useGetStudentDocumentTypeQuery } from 'src/redux/student/document-type/document-type-api';
import { useGetEntranceExamByStudentIdQuery } from 'src/redux/student/entrance-exam/entrance-exam-api';
import {
  useGetStudentAdmissionQuery,
  useGetDivisionForStandardQuery,
  useChangeAdmissionStatusMutation,
  useAssignDivisionTOStudentMutation,
} from 'src/redux/student/admission/admission-api';
import {
  Box,
  Tab,
  Card,
  Tabs,
  Grid,
  Stack,
  Paper,
  Radio,
  Button,
  Dialog,
  Divider,
  Checkbox,
  MenuList,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  RadioGroup,
  Autocomplete,
  DialogActions,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { CommunicationForm } from '../follow-up';
import RegisterForm from '../register/register-form';
import { ViewDocuments } from '../register/RenderDocument';
import FeeStructureAssignmentForm from './FeeStructureAssignmentForm';

import type { IInquiryData } from '../Inquiry/type';

const AdmissionScreen = () => {
  const tabs = useTabs(RegistrationStatusType.Pending);
  const dialogForAssignFeeStructure = useBoolean();
  const divisionDialog = useBoolean();
  const statusDialog = useBoolean();
  const followUpDialog = useBoolean();
  const [open, setOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const [editData, setEditData] = useState<IInquiryData | null>(null);
  // Get the isChanges state from the Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Get the dispatch function from the Redux store
  const dispatch = useDispatch();
  // Query state for pagination and sorting
  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const {
    data: admissionData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentAdmissionQuery,
    params: {
      AcademicMediumId: currentMedium?.id,
      approvalStatus: tabs.value,
      ...query,
    },
  });
  // Persist the last-known count per tab so badges don't reset to 0 when switching
  const [tabCounts, setTabCounts] = useState<Record<string | number, number>>({});
  useEffect(() => {
    if (!isFetching && admissionData?.items !== undefined) {
      setTabCounts((prev) => ({
        ...prev,
        [tabs.value]: admissionData.items.length,
      }));
    }
  }, [admissionData?.items, tabs.value, isFetching]);

  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: RegistrationStatusType.Pending,
        count: tabCounts[RegistrationStatusType.Pending] ?? 0,
        color: 'warning',
      },
      {
        label: 'Approved',
        value: RegistrationStatusType.Approved,
        count: tabCounts[RegistrationStatusType.Approved] ?? 0,
        color: 'success',
      },
      {
        label: 'Rejected',
        value: RegistrationStatusType.Rejected,
        count: tabCounts[RegistrationStatusType.Rejected] ?? 0,
        color: 'error',
      },
    ],
    [tabCounts]
  );

  // Reset form and close dialog
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dialogForAssignFeeStructure.onFalse();
      setEditData(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      dialogForAssignFeeStructure.onFalse();
      setEditData(null);
    }
  };

  const handleFormClose = (_e?: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setEditData(null);
      setOpen(false);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setEditData(null);
      setOpen(false);
    }
  };

  const tableData = useMemo(
    () =>
      admissionData?.items?.map((item: IInquiryData) => ({
        ...item,
        id: item.studentId,
        dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
        ageValue: calculateAge(dayjs(item.dateOfBirth).format()),
        doiValue: item.dateOfInquiry ? dayjs(item.dateOfInquiry).format('DD-MM-YYYY') : '-',
        studentName: [item.lastName, item.firstName, item.middleName].filter(Boolean).join(' '),
        secondaryContactNo: item.secondaryContactNumber || undefined,
        genderValue: GenderType[item?.gender as any],
        remarks: item?.remarks || '-',
      })) || [],
    [admissionData?.items]
  );

  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    setSelectedStudents([]);
    // Reset pagination and sorting so the new tab always starts from page 1
    setQuery({ sorting: '', skipCount: 0, maxResultCount: 10 });
    tabs.onChange(event, newValue);
  };

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'checkBox',
        align: 'center',
        minWidth: '60px',
        isSort: false,
        sticky: true,
        isFilter: false,
        label: '',
        renderColumn() {
          return (
            <Checkbox
              checked={tableData?.length && selectedStudents?.length === tableData?.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedStudents(tableData || []);
                } else {
                  setSelectedStudents([]);
                }
              }}
            />
          );
        },
        render(value, row) {
          return (
            <Checkbox
              checked={selectedStudents.some((i: any) => i.id === row.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedStudents([...selectedStudents, row]);
                } else {
                  setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                }
              }}
            />
          );
        },
      },
      {
        id: 'studentName',
        label: 'Student Name',
        minWidth: '160px',
        align: 'left',
        sticky: true,
      },
      // { id: 'educationBoard.name', label: 'Board', align: 'left' },
      // { id: 'educationMedium.name', label: 'Medium', align: 'left' },
      { id: 'standard', label: 'Class', align: 'left' },
      { id: 'division', label: 'Division', align: 'left' },
      {
        id: 'dobValue',
        label: 'Date of Birth',
        minWidth: '130px',
        align: 'left',
        isFilter: true,
        filterType: 'date',
      },
      {
        id: 'age',
        label: 'Age',
        align: 'left',
        isFilter: true,
        filterType: 'number',
        render: (value, row) =>
          value && value !== '-' ? (
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
          ) : (
            <Typography variant="inherit">{value || '-'}</Typography>
          ),
      },
      { id: 'genderValue', label: 'Gender', align: 'left' },
      { id: 'formNo', label: 'Form No', minWidth: '110px', align: 'left', filterType: 'number' },
      {
        id: 'inquiryNo',
        label: 'Inquiry No.',
        minWidth: '120px',
        isFilter: true,
        filterType: 'string',
        align: 'left',
      },

      {
        id: 'doiValue',
        label: 'Date of Inquiry',
        minWidth: '140px',
        align: 'left',
        isDateRangeFilter: true,
        filterType: 'date',
      },
      {
        id: 'remarks',
        label: 'Remarks',
        minWidth: '180px',
        align: 'left',
        render: (value) => value || '-',
      },
      {
        id: 'address',
        label: 'Address',
        minWidth: '180px',
        align: 'left',
        render: (value, row) =>
          value && value !== '-' ? (
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
          ) : (
            <Typography variant="inherit">{value || '-'}</Typography>
          ),
      },
      {
        id: 'primaryContactNo',
        label: 'Primary Contact No.',
        minWidth: '185px',
        align: 'left',
      },
      {
        id: 'secondaryContactNo',
        label: 'Secondary Contact No.',
        minWidth: '220px',
        align: 'left',
      },
      {
        id: 'previousSchool',
        label: 'Previous School',
        minWidth: '170px',
        align: 'left',
        render: (value, row) =>
          value && value !== '-' ? (
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
          ) : (
            <Typography variant="inherit">{value || '-'}</Typography>
          ),
      },
      {
        id: 'inquiryPreference',
        label: 'Inquiry Preference',
        minWidth: '200px',
        align: 'left',
      },
      {
        id: 'actions',
        label: 'Actions',
        isSort: false,
        align: 'left',
        isFilter: false,
        sticky: true,
        minWidth: 70,
        render(value, row) {
          return (
            <ThreeDotsActions
              showEditIcon
              handleEditClick={() => {
                setEditData(row as IInquiryData);
                setOpen(true);
              }}
              // handleViewClick={() => {
              //   setEditData(row as IInquiryData);
              //   openDetails.onTrue();
              // }}
              actions={({ popover }) => (
                <MenuList>
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      divisionDialog.onTrue();
                      setEditData(row as IInquiryData);
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="fluent-mdl2:assign" sx={{ height: '16px', width: '16px' }} />
                    Assign Division
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      dialogForAssignFeeStructure.onTrue();
                      setEditData(row as IInquiryData);
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="tdesign:money" />
                    Assign Fee Structure
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      followUpDialog.onTrue();
                      setEditData(row as IInquiryData);
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="clarity:note-edit-line" color="default.main" />
                    Note
                  </MenuItem>
                </MenuList>
              )}
              placement="right-top"
            />
          );
        },
      },
    ],
    [dialogForAssignFeeStructure, divisionDialog, followUpDialog, selectedStudents, tableData]
  );

  const links = open
    ? [
        { name: 'Student', href: '/student/dashboard/' },
        { name: 'Student Enrollment', href: '/student/dashboard/' },
        { name: 'Admission', href: '/student/dashboard/' },
        { name: 'Update Details' },
      ]
    : [
        { name: 'Student', href: '/student/dashboard/' },
        { name: 'Student Enrollment', href: '/student/dashboard/' },
        { name: 'Admission' },
      ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Admission"
        links={links}
        isBack={open}
        onBack={handleFormClose}
        description={
          open
            ? 'Update admission, personal, and contact details of the selected student across multiple tabs.'
            : 'Manage students admissions, review applications and approve or reject them as needed.'
        }
      />

      {open ? (
        <Card sx={{ height: '100%', mt: 1 }}>
          <RegisterForm editData={editData as any} handleClose={handleFormClose} />
        </Card>
      ) : (
        <>
          <Paper
            elevation={2}
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              px: 2,

              mb: 1,
              borderRadius: '15px',
            }}
          >
            <Tabs
              value={tabs.value}
              onChange={handleTabChange}
              sx={{
                '& .MuiTabs-flexContainer': { gap: 2 },
                flexGrow: 1,
              }}
            >
              {TABS.map((tab) => (
                <Tab
                  sx={{ fontSize: '12px' }}
                  key={tab.value}
                  label={
                    <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                      {tab.label}{' '}
                      <Label
                        // variant={tab.value === EmployeeAttendanceStatus.All ? 'filled' : 'soft'}
                        color={(tab?.color as LabelColor) || 'default'}
                      >
                        {tab.count}
                      </Label>
                    </Box>
                  }
                  // icon={tab.icon}
                  value={tab.value}
                />
              ))}
            </Tabs>

            <Button
              variant="contained"
              size="small"
              disabled={!selectedStudents.length}
              onClick={statusDialog.onTrue}
              startIcon={<Iconify icon="mdi:exchange" />}
              sx={{ px: '32px' }}
            >
              Change Status
            </Button>
          </Paper>
          <CustomizableTable
            tableTitle="Admission"
            onSendNotification={handlerSendNotification}
            showCheckbox={selectedStudents.length !== 0}
            tableId="student-enrollment-admission-table"
            noDataText={<>No Students Admission Data Found</>}
            isLoading={isLoading || isFetching}
            columns={columns}
            serverSide
            onServerSort={(column, sortData) => {
              setQuery((prev) => ({
                ...prev,
                sorting: sortQueryString(sortData),
              }));
            }}
            onServerPagination={(page: number, rowsPerPage: number) => {
              setQuery((prev) => ({
                ...prev,
                skipCount: page * rowsPerPage,
                maxResultCount: rowsPerPage,
              }));
            }}
            data={tableData || []}
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
      <CustomDialog
        open={dialogForAssignFeeStructure.value}
        handleClose={dialogForAssignFeeStructure.onFalse}
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
        <FeeStructureAssignmentForm student={editData} handleClose={handleClose} />
      </CustomDialog>

      <CustomDialog
        open={divisionDialog.value}
        handleClose={() => {
          divisionDialog.onFalse();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Assign Division</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Assign students to specific divisions based on their selected class."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AssignDivisionForm
          handleClose={divisionDialog.onFalse}
          standard={editData?.standard}
          studentID={editData?.studentId}
          division={editData?.divisionId}
          selectedStudent={editData}
        />
      </CustomDialog>
      <CustomDialog
        open={statusDialog.value}
        handleClose={statusDialog.onFalse}
        // title="Change Status"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Change Status</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Update the admission status of selected students to Pending, Approved, or Rejected for enrollment tracking and processing."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ChangeStatusForm
          handleClose={() => {
            setSelectedStudents([]);
            statusDialog.onFalse();
          }}
          tabValue={tabs.value}
          selectedStudents={selectedStudents}
          tableData={tableData}
        />
      </CustomDialog>

      <CustomDialog
        open={followUpDialog.value}
        handleClose={() => {
          setEditData(null);
          followUpDialog.onFalse();
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Notes</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Maintain a detailed record of student communication, parent interactions, and critical admission updates."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <CommunicationForm
          handleCloseDialog={() => {
            setEditData(null);
            followUpDialog.onFalse();
          }}
          selectedStudent={editData as any}
          studentEnrollmentId={(editData as IInquiryData)?.id || ''}
        />
      </CustomDialog>
      {/* <CustomDialog
        open={openDetails.value}
        handleClose={() => {
          setEditData(null);
          openDetails.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Student Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View a student’s entrance exam result, submitted documents, and take action on the admission application."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <StudentDetails
          tabValue={tabs.value}
          editData={editData}
          onClose={() => {
            setEditData(null);
            openDetails.onFalse();
          }}
        />
      </CustomDialog> */}
    </Box>
  );
};

export default AdmissionScreen;

const StudentDetails = ({ tabValue, editData, onClose }: any) => {
  const [changeStatus, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeAdmissionStatusMutation,
  });
  const [selectedStatus, setSelectedStatus] = useState<RegistrationStatusType | null>(null);

  const handleSave = async () => {
    if (selectedStatus === null) return;

    const payload = {
      items: [
        {
          studentId: editData.studentId,
          action: selectedStatus,
          remarks: '',
        },
      ],
    };

    await changeStatus(payload).unwrap();
    shikshaMitraToast.success({
      message: `${editData.firstName} ${editData.lastName} moved to ${RegistrationStatusType[selectedStatus]}`,
    });
    onClose();
  };

  return (
    <>
      <DialogScrollContent>
        <Typography variant="subtitle2" color="text.secondary">
          Name :{' '}
          {`${editData?.lastName || ''} ${editData?.firstName || ''} ${editData?.middleName || ''}`}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Class : {editData?.standard?.name} {editData?.division?.name}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Contact : {editData?.primaryContactNumber || '-'}
        </Typography>

        <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
        <EntranceExamSections editData={editData} />
        <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
        <DocumentsSections editData={editData} />
        <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
        <>
          <RadioGroup
            row
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(Number(e.target.value) as RegistrationStatusType)}
          >
            {tabValue !== RegistrationStatusType.Approved && (
              <FormControlLabel
                value={RegistrationStatusType.Approved}
                control={<Radio />}
                label="Approve Application"
              />
            )}
            {tabValue !== RegistrationStatusType.Rejected && (
              <FormControlLabel
                value={RegistrationStatusType.Rejected}
                control={<Radio />}
                label="Reject Application"
              />
            )}
            {tabValue !== RegistrationStatusType.Pending && (
              <FormControlLabel
                value={RegistrationStatusType.Pending}
                control={<Radio />}
                label="Pending"
              />
            )}
          </RadioGroup>

          {selectedStatus === RegistrationStatusType.Rejected && (
            <TextField
              label="Remarks"
              multiline
              rows={4}
              fullWidth
              sx={{ my: 2 }}
              // value={remarks}
              // onChange={(e) => setRemarks(e.target.value)}
            />
          )}

          {/* {showRemarks && <TextField label="Remarks" multiline rows={4} fullWidth sx={{ my: 2 }} />} */}
        </>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={async () => {
            onClose();
          }}
        >
          Cancel
        </Button>
        <SubmitButton
          variant="contained"
          loading={isLoading}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={handleSave}
          buttonText="Save"
        />
      </DialogActions>
    </>
  );
};

const EntranceExamSections = ({ editData }: any) => {
  const exam = useBoolean(true);
  const { data: entranceExamData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamByStudentIdQuery,
    params: editData?.studentId,
    options: {
      skip: !editData?.studentId,
    },
  });
  // const theme = useTheme();
  const examData = useMemo(
    () =>
      entranceExamData
        ? {
            ...entranceExamData,
            date: dayjs(entranceExamData?.examDate).format('DD-MM-YYYY'),
            examTime: `${dayjs(entranceExamData?.entranceExamSlot?.startDate).format('hh:mm A')} to ${dayjs(
              entranceExamData?.entranceExamSlot?.endDate
            ).format('hh:mm A')}`,
            name: `${entranceExamData?.studentEnrollment?.firstName} ${entranceExamData?.studentEnrollment?.lastName}`,
            medium: entranceExamData?.studentEnrollment?.educationMedium?.name,
            class: entranceExamData?.studentEnrollment?.standard?.name,
            status:
              entranceExamData?.marksObtained === null
                ? 'Pending'
                : entranceExamData?.marksObtained >= entranceExamData?.passingMark
                  ? 'Pass'
                  : 'Fail',
            percentage:
              entranceExamData?.marksObtained === null || entranceExamData?.totalMarks === 0
                ? 0
                : +(
                    ((entranceExamData?.marksObtained ?? 0) / (entranceExamData?.totalMarks ?? 1)) *
                    100
                  ).toFixed(2),
            obtainMarks: entranceExamData?.marksObtained ?? '-',
          }
        : {},
    [entranceExamData]
  );
  const color = EntranceExamStatusTypeColors[
    examData.status as EntranceExamStatusType
  ] as LabelColor;
  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ typography: 'subtitle2' }}
      >
        Entrance Exam Information
        <IconButton size="small" onClick={exam.onToggle}>
          <Iconify
            icon={exam.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
          />
        </IconButton>
      </Stack>

      {entranceExamData ? (
        <Stack spacing={2} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 100, color: 'text.secondary', mr: 2 }}>
              Status
            </Box>
            <Label color={color}>{examData?.status}</Label>
          </Stack>
          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 100, color: 'text.secondary', mr: 2 }}>
              Date
            </Box>
            {dayjs(editData?.examDate).format('DD/MM/YYYY')}
          </Stack>

          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 100, color: 'text.secondary', mr: 2 }}>
              Obtained Marks
            </Box>
            {examData?.obtainMarks || 0}/{examData?.totalMarks || 0}
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={2} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
          <Box component="span" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            No Entrance Exam Found
          </Box>
        </Stack>
      )}
    </Stack>
  );
};

const DocumentsSections = ({ editData }: any) => {
  const document = useBoolean(true);
  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentTypeQuery,
  });

  const { data: employeeDocuments } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentsQuery,
    params: { studentId: editData?.studentId },
    options: { skip: !editData?.studentId },
  });

  const tableData = useMemo(
    () =>
      documents?.items?.map((item: any) => ({
        ...item,
        statusVal: employeeDocuments?.find(
          (doc: any) =>
            doc.isUploaded &&
            (doc.documentTypeId === item.id || doc.documentTypeName === item.documentName)
        )
          ? 'Uploaded'
          : 'Not Uploaded',
        docType: item.documentTypes.map((ite: number) => DocumentType[ite]).join(', '),
        statusColor: employeeDocuments?.find(
          (doc: any) =>
            doc.isUploaded &&
            (doc.documentTypeId === item.id || doc.documentTypeName === item.documentName)
        )
          ? 'success'
          : 'warning',
        uploadDocument: employeeDocuments?.find(
          (doc: any) =>
            doc.isUploaded &&
            (doc.documentTypeId === item.id || doc.documentTypeName === item.documentName)
        ),
      })) || [],
    [documents?.items, employeeDocuments]
  );
  const viewDialog = useBoolean();
  const [docId, setDocId] = useState<null | string>(null);
  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ typography: 'subtitle2' }}
      >
        Documents
        <IconButton size="small" onClick={document.onToggle}>
          <Iconify
            icon={document.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
          />
        </IconButton>
      </Stack>

      {document.value && (
        <Stack spacing={3} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
          {isLoading ? (
            <CircularProgress size={20} />
          ) : tableData.length ? (
            tableData?.map((item: any) => (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ typography: 'caption', textTransform: 'capitalize' }}
              >
                <Box component="span" sx={{ color: 'text.secondary', mr: 2 }}>
                  {item.documentName}
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Label color={item.uploadDocument ? 'success' : 'warning'}>
                    {item.uploadDocument ? 'Uploaded' : 'Pending'}
                  </Label>
                  <IconButton disabled={!item.uploadDocument} sx={{ p: 0 }}>
                    <Iconify
                      icon="ri:eye-line"
                      onClick={() => {
                        setDocId(item.uploadDocument.uploadedDocumentId || item.uploadDocument.id);
                        viewDialog.onTrue();
                      }}
                    />
                  </IconButton>
                  <IconButton disabled={!item.uploadDocument} sx={{ p: 0 }}>
                    <Iconify icon="mingcute:download-line" />
                  </IconButton>
                </Box>
              </Stack>
            ))
          ) : (
            <Stack spacing={2} sx={{ borderRadius: 1, bgcolor: 'background.neutral' }}>
              <Box component="span" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                No Documents Found
              </Box>
            </Stack>
          )}
        </Stack>
      )}
      <Dialog open={viewDialog.value} onClose={viewDialog.onFalse}>
        <ViewDocuments id={editData?.studentId} docId={docId} />
      </Dialog>
    </Stack>
  );
};

const AssignDivisionForm = ({
  handleClose,
  standard,
  studentID,
  division,
  selectedStudent,
}: {
  handleClose: () => void;
  standard?: Standards;
  studentID?: string;
  division?: string;
  selectedStudent?: IInquiryData | null;
}) => {
  const [selectedDivision, setSelectedDivision] = useState('');

  // Fetch standard details with divisions based on student's standardId
  const { data: standardData, isLoading: isLoadingStandard } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDivisionForStandardQuery,
    params: selectedStudent?.standardId,
    options: {
      skip: !selectedStudent?.standardId,
    },
  });

  const [assignDivision, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignDivisionTOStudentMutation,
  });
  const formik = useFormik<{
    division: string;
    standardName: string;
  }>({
    initialValues: {
      division: division || '',
      standardName: standardData?.name || standard?.name || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      division: Yup.string().required('Division is required'),
    }),
    onSubmit: async (values) => {
      try {
        await assignDivision({
          studentId: studentID as string,
          body: {
            divisionId: values.division,
          },
        }).unwrap();
        shikshaMitraToast.success({
          message: `Division "${selectedDivision}" has been successfully assigned to ${selectedStudent?.firstName} ${selectedStudent?.lastName}.`,
        });
        handleClose();
      } catch (error) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    const divisions = standardData?.divisions || standard?.divisions || [];
    const div = divisions.find((item: any) => item.id === formik.values.division);
    setSelectedDivision(div?.name || '');
  }, [standardData?.divisions, standard?.divisions, formik.values.division]);

  return (
    <>
      <DialogScrollContent>
        {/* <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'Background.neutral',
            gap: 2,
          }}
        > */}
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              value={formik.values.standardName}
              label="Standard"
              disabled
              size="small"
              fullWidth
            />
          </Grid>
          <Grid size={12}>
            <CustomSelect
              autoFocus
              options={standardData?.divisions || standard?.divisions || []}
              value={formik.values.division}
              onChange={(val) => {
                formik.setFieldValue('division', val);
              }}
              label="Division *"
              valueKey="id"
              labelKey="name"
              isLoading={isLoadingStandard}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              error={formik.touched.division && Boolean(formik.errors.division)}
              helperText={(formik.touched.division && formik.errors.division) as string}
            />
          </Grid>
        </Grid>
        {/* </Box> */}
      </DialogScrollContent>
      <DialogActions>
        <CancelButton onClick={handleClose} />
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.assigned} />}
          loading={isLoading}
          type="submit"
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          variant="contained"
          size="small"
        >
          Assign
        </LoadingButton>
      </DialogActions>
    </>
  );
};

interface ChangeStatusFormProps {
  handleClose: () => void;
  tabValue?: any; // Add correct type if `tabValue` is needed, or remove if unused
  selectedStudents: any[];
  tableData: any[];
}

const ChangeStatusForm: React.FC<ChangeStatusFormProps> = ({
  handleClose,
  tabValue,
  selectedStudents,
  tableData,
}: ChangeStatusFormProps) => {
  const [changeStatus, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeAdmissionStatusMutation,
  });
  const formik = useFormik<{
    status: RegistrationStatusType;
    remarks: string;
  }>({
    initialValues: {
      status: tabValue ?? RegistrationStatusType.Pending,
      remarks: '',
    },
    validationSchema: Yup.object({
      status: Yup.number().required('Status is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (values.status === RegistrationStatusType.Approved) {
          const hasDivisions = selectedStudents.every((selected) => {
            const freshStudent = tableData.find((t) => t.studentId === selected.studentId);
            return !!(freshStudent?.divisionId || selected.divisionId);
          });
          if (!hasDivisions) {
            shikshaMitraToast.error({
              message: 'Please assign a division to all selected students before approving.',
            });
            return;
          }
        }
        await changeStatus({
          body: selectedStudents.map((i: any) => ({
            studentId: i.studentId,
            action: values.status,
            remarks: values.remarks,
          })),
        }).unwrap();
        shikshaMitraToast.success({
          message: `${selectedStudents.length} admission marked as ${RegistrationStatusType[values.status]} on ${dayjs().format('DD-MM-YYYY')}.`,
        });
        handleClose();
      } catch (error) {
        console.error(error);
      }
    },
  });

  const options = [
    {
      label: 'Approved',
      value: RegistrationStatusType.Approved,
      description: 'Approve the student admission',
    },
    {
      label: 'Pending',
      value: RegistrationStatusType.Pending,
      description: 'Keep the admission pending',
    },
    {
      label: 'Rejected',
      value: RegistrationStatusType.Rejected,
      description: 'Reject the student admission',
    },
  ];

  return (
    <>
      <DialogScrollContent>
        <Stack spacing={2}>
          <Autocomplete
            options={options}
            value={options.find((opt) => opt.value === formik.values.status) ?? undefined}
            onChange={(_, newValue) => {
              formik.setFieldValue('status', newValue?.value ?? null);
              formik.setFieldTouched('status', true, false);
            }}
            onBlur={() => formik.setFieldTouched('status', true)}
            size="small"
            disableClearable
            getOptionLabel={(option) => String(option.label)}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
              >
                {option.label}
                <Box sx={{ marginLeft: 'auto' }}>
                  <CustomTooltip title={option.description} placement="right">
                    <IconButton
                      size="small"
                      sx={{
                        color:
                          option.value === RegistrationStatusType.Approved
                            ? 'success.main'
                            : option.value === RegistrationStatusType.Rejected
                              ? 'error.main'
                              : 'warning.main',
                      }}
                    >
                      <Iconify icon="mdi:information" width={20} />
                    </IconButton>
                  </CustomTooltip>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Select Status *"
                fullWidth
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={
                  formik.touched.status && formik.errors.status ? String(formik.errors.status) : ''
                }
              />
            )}
          />
          <TextField
            fullWidth
            label="Remarks"
            name="remarks"
            value={formik.values.remarks}
            onChange={formik.handleChange}
            multiline
            rows={4}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={handleClose}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.edit} width={16} height={16} />}
          loading={isLoading}
          disabled={!formik.dirty}
          variant="contained"
          type="submit"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Update
        </LoadingButton>
      </DialogActions>
    </>
  );
};
