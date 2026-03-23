'use client';

import type { Division } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { Save } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { StudentApi, useChangeDivisionMutation } from 'src/redux/student';
import { Box, Chip, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetAllStudentGroupQuery } from 'src/redux/student/student-group/student-group';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import type { TableDivisionDropDownProps } from './type';
import type { IInquiryData } from '../../enrollment/Inquiry/type';

// Fixed width for Division column to prevent layout shifts
const DIVISION_COLUMN_WIDTH = 180;

const ChangeDivisionScreen = ({
  allDivision,
  division,
}: {
  allDivision: Division[];
  division: string;
}) => {
  // State to manage table data
  const [tableData, setTableData] = useState<IInquiryData[]>([]);
  const [initialData, setInitialData] = useState<IInquiryData[]>([]);

  // State to track which rows have been modified (for visual indicator)
  const [modifiedRowIds, setModifiedRowIds] = useState<Set<string>>(new Set());

  // State for confirmation dialog
  const saveConfirmDialog = useBoolean();

  // Redux dispatch hook for dispatching actions
  const dispatch = useDispatch();

  // Fetch student data using the same query as GR and Roll generation
  const {
    data: getStudentData,
    isLoading: isStudentDataLoading,
    isFetching: isStudentDataFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllStudentGroupQuery,
    params: { division },
    options: {
      skip: !division,
    },
  });

  // Update table data when student data changes
  useEffect(() => {
    if (getStudentData?.data) {
      setTableData(getStudentData.data);
      setInitialData(getStudentData.data);
      setModifiedRowIds(new Set()); // Clear modified rows when data refreshes
    }
  }, [getStudentData]);

  // Mutation hook for changing student division
  const [changeDivision, { isLoading: isChangeDivisionLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeDivisionMutation,
  });

  // Select isChanges from confirmPopup state to track if there are unsaved changes
  // This is used to enable/disable the save button
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Calculate changes summary for visual feedback before saving
  const changesSummary = useMemo(() => {
    const changes: {
      studentName: string;
      oldDivision: string | null;
      newDivision: string | null;
    }[] = [];

    tableData.forEach((current) => {
      const original = initialData.find((item) => item.studentId === current.studentId);
      if (original && original.divisionId !== current.divisionId) {
        const oldDivisionName = allDivision.find((d) => d.id === original.divisionId)?.name ?? '-';
        const newDivisionName = allDivision.find((d) => d.id === current.divisionId)?.name ?? '-';
        changes.push({
          studentName: current.studentName || current.name || 'Unknown',
          oldDivision: oldDivisionName,
          newDivision: newDivisionName,
        });
      }
    });

    return changes;
  }, [tableData, initialData, allDivision]);

  // Open save confirmation dialog with changes summary
  const handleSaveClick = () => {
    if (changesSummary.length > 0) {
      saveConfirmDialog.onTrue();
    } else {
      handleSave();
    }
  };

  // Handle save button click to update student divisions
  const handleSave = async () => {
    saveConfirmDialog.onFalse();
    try {
      const updatedStudents = tableData.filter((student) =>
        modifiedRowIds.has(student.studentId as string)
      );

      await changeDivision(
        updatedStudents.map((student) => ({
          studentId: student.studentId,
          divisionId: student.divisionId,
        }))
      ).unwrap();

      // Smart success message based on count
      const updateCount = changesSummary.length;
      const message =
        updateCount === 1
          ? 'Successfully updated division for 1 student'
          : `Successfully updated division for ${updateCount} students`;

      shikshaMitraToast.success({ message });
      setInitialData(tableData);
      setModifiedRowIds(new Set()); // Clear modified rows after save

      // Invalidate cache to refetch updated data
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // State to track selected students for bulk actions
  // Each student has an id and name property
  const [selectedStudents, setSelectedStudents] = useState<{ id: string; name: string }[]>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler for sending notifications to selected students
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}
    >
      <BackPopUpChecked initialValues={initialData} currentValues={tableData}>
        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center', mb: 1 }}
        >
          {/* Visual indicator for pending changes */}
          {changesSummary.length > 0 && (
            <Chip
              label={`${changesSummary.length} change${changesSummary.length > 1 ? 's' : ''} pending`}
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
          <LoadingButton
            loading={isChangeDivisionLoading}
            startIcon={<Save />}
            variant="contained"
            onClick={handleSaveClick}
            size="small"
            disabled={!isChanges}
          >
            Save
          </LoadingButton>
        </Box>
        <CustomizableTable
          tableTitle="Change Division"
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          tableId="change-division-table"
          noDataText={<>No Student Data Found </>}
          isLoading={isStudentDataLoading || isStudentDataFetching}
          columns={[
            { id: 'grNo', label: 'GR No.', filterType: 'number' },
            { id: 'studentName', label: 'Name' },
            {
              id: 'divisionId',
              label: 'Division',
              isFilter: false,
              isSort: false,
              minWidth: DIVISION_COLUMN_WIDTH,
              render(value, row) {
                const isModified = modifiedRowIds.has(row.studentId);

                return (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      // Fixed width container to prevent layout shifts
                      width: DIVISION_COLUMN_WIDTH - 32,
                      minWidth: DIVISION_COLUMN_WIDTH - 32,
                      // Subtle gray background for modified rows
                      backgroundColor: isModified ? 'action.hover' : 'transparent',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      mx: -1,
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableDivisionDropDown
                      allDivision={allDivision}
                      division={value}
                      currentDivision={division}
                      onChange={(val) => {
                        const newData = tableData.map((item) => {
                          if (item.studentId === row.studentId) {
                            return {
                              ...item,
                              divisionId: val as string,
                            };
                          }
                          return item;
                        });

                        // Track modified rows for visual indicator
                        setModifiedRowIds((prev) => new Set(prev).add(row.studentId));
                        setSelectedStudents([{ id: row.studentId, name: row.name }]);
                        setTableData(newData as IInquiryData[]);
                      }}
                    />
                  </Box>
                );
              },
            },
          ]}
          data={tableData}
        />{' '}
        {sendInstantNotificationDialogValue.value && (
          <SendInstantNotificationDialog
            open={sendInstantNotificationDialogValue.value}
            onClose={sendInstantNotificationDialogValue.onFalse}
            data={[]}
            userList={selectedStudents}
          />
        )}
      </BackPopUpChecked>

      {/* Confirmation Dialog for Save with Changes Summary - Modern UI */}
      <CustomDialog
        open={saveConfirmDialog.value}
        handleClose={saveConfirmDialog.onFalse}
        title="Division Changes"
        maxWidth="sm"
        hasForm={false}
      >
        <DialogScrollContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            You are about to save the following changes:
          </Typography>
          <Scrollbar sx={{ maxHeight: 320 }}>
            <Box sx={{ borderRadius: 2 }}>
              {changesSummary.map((change, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    px: 2,
                    mt: index === 0 ? 0 : 0.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.light',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      {change.studentName}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textDecoration: 'line-through',
                        opacity: 0.7,
                      }}
                    >
                      {change.oldDivision ?? '-'}
                    </Typography>
                    <Iconify icon="mdi:arrow-right" width={16} sx={{ color: 'text.disabled' }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'success.main',
                        fontWeight: 600,
                      }}
                    >
                      {change.newDivision ?? '-'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Scrollbar>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 2.5,
              py: 1.5,
            }}
          >
            <Typography variant="body2" color="text.primary">
              Total students to update
            </Typography>
            <Typography variant="body2" color="primary.main">
              {changesSummary.length}
            </Typography>
          </Box>
        </DialogScrollContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
            size="small"
            onClick={saveConfirmDialog.onFalse}
          >
            Cancel
          </Button>
          <LoadingButton
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            loading={isChangeDivisionLoading}
            variant="contained"
            size="small"
            onClick={handleSave}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default ChangeDivisionScreen;

const TableDivisionDropDown = ({
  allDivision,
  division,
  currentDivision,
  onChange,
}: TableDivisionDropDownProps) => (
  <CustomSelect
    options={allDivision?.filter((d) => d.id !== currentDivision) || []}
    label=""
    value={division}
    onChange={onChange}
    labelKey="name"
    valueKey="id"
    formControlProps={{ sx: { width: '100%', textAlign: 'left' } }}
    onClick={(e) => e.stopPropagation()}
  />
);
