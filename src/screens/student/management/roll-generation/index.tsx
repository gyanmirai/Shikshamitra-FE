'use client';

import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { StudentApi } from 'src/redux/student';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import { Save, Refresh, Grading } from '@mui/icons-material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Chip, Button, TextField, Typography, DialogActions } from '@mui/material';
import { useGetAllStudentGroupQuery } from 'src/redux/student/student-group/student-group';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import {
  useUpdateStudentRollNumberMutation,
  useLazyGetRollNumberProjectionsQuery,
} from 'src/redux/student/roll-number/roll-number-api';

import type { IInquiryData } from '../../enrollment/Inquiry/type';

const RollNoGenerationScreen = ({ division }: { division: string }) => {
  // State for controlling how students are arranged (e.g., boys first, girls first)
  const [arrangementType, setArrangementType] = useState('');
  // State to store selected students for notifications and bulk actions
  // Each student has a studentId and name property
  const [selectedStudents, setSelectedStudents] = useState<{ studentId: string; name: string }[]>(
    []
  );
  // State to toggle between automatic and manual roll number assignment
  const [isManual, setIsManual] = useState(false);

  // State for controlling the sorting criteria (e.g., by name, by GR number)
  const [arrangeBy, setArrangeBy] = useState('');

  // State to store and manage the student data table
  const [tableData, setTableData] = useState<IInquiryData[]>([]);
  const [initialData, setInitialData] = useState<IInquiryData[]>([]);

  // State to store validation errors for roll numbers
  const [error, setError] = useState<Record<number, string>>({});

  // State for confirmation dialogs
  const autoGenerateConfirmDialog = useBoolean();
  const saveConfirmDialog = useBoolean();

  // State to track which rows have been modified (for visual indicator)
  const [modifiedRowIds, setModifiedRowIds] = useState<Set<string>>(new Set());

  // Redux dispatch hook for dispatching actions
  const dispatch = useDispatch();

  const {
    data: getStudentData,
    isLoading: isStudentDataLoading,
    isFetching: isStudentDataFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllStudentGroupQuery,
    params: division,
    options: {
      skip: !division,
    },
  });

  const [fetchRollNumberProjections, { isLoading: isProjectionsLoading }] =
    useLazyGetRollNumberProjectionsQuery();

  const [updateRollNumbers, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentRollNumberMutation,
  });

  /**
   * Automatically generates roll numbers based on selected arrangement type and criteria
   */
  const handleAutoGenerate = async () => {
    autoGenerateConfirmDialog.onFalse();
    try {
      const result = await fetchRollNumberProjections({
        divisionId: division,
        arrangementType: arrangementType === 'mix' ? 0 : arrangementType === 'boysFirst' ? 1 : 2,
        arrangementBy: arrangeBy === 'firstName' ? 0 : 1,
      }).unwrap();

      if (result?.data && Array.isArray(result.data)) {
        const studentsWithoutRollNo = tableData.filter(
          (s) => s.rollNo === null || s.rollNo === undefined
        ).length;

        // Track newly generated roll numbers
        const newModifiedIds = new Set(modifiedRowIds);
        result.data.forEach((student: any) => {
          const original = initialData.find((item) => item.studentId === student.studentId);
          if (original && original.rollNo !== student.rollNo) {
            newModifiedIds.add(student.studentId);
          }
        });

        setTableData(result.data);
        setModifiedRowIds(newModifiedIds);

        // Show success toast with smart message
        const message =
          studentsWithoutRollNo === 1
            ? 'Successfully generated 1 Roll No.'
            : `Successfully generated ${studentsWithoutRollNo} Roll Nos.`;
        shikshaMitraToast.success({ message });
      } else {
        shikshaMitraToast.error({
          message: 'Invalid response from server',
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch roll number projections:', err);
      shikshaMitraToast.error({
        message: err?.data?.message || 'Failed to generate roll numbers',
      });
    }
  };

  // Open confirmation dialog for auto-generate
  const handleAutoGenerateClick = () => {
    autoGenerateConfirmDialog.onTrue();
  };

  // Update table data when student data changes
  useEffect(() => {
    if (getStudentData?.data) {
      setTableData(getStudentData.data);
      setInitialData(getStudentData.data);
      setModifiedRowIds(new Set()); // Clear modified rows when data refreshes
    }
  }, [getStudentData]);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const hasStudentsWithoutRollNo = useMemo(
    () => tableData.some((student) => student.rollNo === null || student.rollNo === undefined),
    [tableData]
  );

  // Handle roll number change for a specific student
  const handleRollNoChange = (studentId: string, name: string, newValue: number | null) => {
    // Update the roll number for the specified student
    const updatedData = tableData.map((item) =>
      item.studentId === studentId ? { ...item, rollNo: newValue } : item
    );

    // Check for duplicate roll numbers
    const rollNumbers = updatedData.map((item) => item.rollNo);
    const duplicateRolls = rollNumbers.filter(
      (num, idx) => num && rollNumbers.indexOf(num) !== idx
    );

    // Set error message if duplicate roll number is found
    setError((prevError) => ({
      ...prevError,
      [studentId]: duplicateRolls.includes(newValue) ? 'Duplicate Roll No!' : '',
    }));

    setSelectedStudents([{ studentId, name }]);

    // Track modified rows for visual indicator
    setModifiedRowIds((prev) => new Set(prev).add(studentId));

    // Update the table data with new roll numbers
    setTableData(updatedData);
  };

  // Toggle manual roll number generation mode
  const handleManualToggle = () => {
    setIsManual(true);
  };

  // Calculate changes summary for visual feedback before saving
  const changesSummary = useMemo(() => {
    const changes: { studentName: string; oldRollNo: number | null; newRollNo: number | null }[] =
      [];

    tableData.forEach((current) => {
      const original = initialData.find((item) => item.studentId === current.studentId);
      if (original && original.rollNo !== current.rollNo) {
        changes.push({
          studentName: current.studentName || current.name || 'Unknown',
          oldRollNo: original.rollNo ?? null,
          newRollNo: current.rollNo ?? null,
        });
      }
    });

    return changes;
  }, [tableData, initialData]);

  // Open save confirmation dialog with changes summary
  const handleSaveClick = () => {
    if (changesSummary.length > 0) {
      saveConfirmDialog.onTrue();
    } else {
      handleSave();
    }
  };

  // Save updated roll numbers to the server
  const handleSave = async () => {
    saveConfirmDialog.onFalse();
    if (!division) {
      console.error('Division ID is required.');
      return;
    }

    // Prepare request body with student IDs and roll numbers
    const requestBody = tableData.map((item) => ({
      studentId: item.studentId,
      rollNo: item.rollNo,
    }));

    try {
      await updateRollNumbers({ divisionId: division, body: requestBody }).unwrap();

      // Smart success message based on count
      const updateCount = changesSummary.length;
      const message =
        updateCount === 1
          ? 'Successfully updated 1 Roll No.'
          : `Successfully updated ${updateCount} Roll Nos.`;

      shikshaMitraToast.success({ message });
      setInitialData(tableData);
      setIsManual(false);
      setModifiedRowIds(new Set()); // Clear modified rows after save
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (err) {
      console.error('Failed to update Roll Numbers:', err);
    }
  };

  const sendInstantNotificationDialogValue = useBoolean();

  // Handler for opening notification dialog
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  // Fixed width for Roll No. column to prevent layout shifts
  const ROLL_COLUMN_WIDTH = 180;

  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}
    >
      <BackPopUpChecked initialValues={initialData} currentValues={tableData}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mb={2}>
          <Box display="flex" gap={2} ml={1}>
            <CustomSelect
              options={[
                { id: 'mix', name: 'Mix' },
                { id: 'boysFirst', name: 'Boys First' },
                { id: 'girlsFirst', name: 'Girls First' },
              ]}
              label="Arrangement Type"
              value={arrangementType}
              onChange={(val) => setArrangementType(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { width: '250px' } }}
            />
            <CustomSelect
              options={[
                { id: 'firstName', name: 'First Name' },
                { id: 'lastName', name: 'Last Name' },
              ]}
              label="Arrangement By"
              value={arrangeBy}
              onChange={(val) => setArrangeBy(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { width: '250px' } }}
              disabled={!arrangementType}
            />
          </Box>

          {arrangeBy && (
            <Box display="flex" gap={2} alignItems="center">
              {/* Visual indicator for pending changes */}
              {changesSummary.length > 0 && (
                <Chip
                  label={`${changesSummary.length} change${changesSummary.length > 1 ? 's' : ''} pending`}
                  color="warning"
                  size="small"
                  variant="outlined"
                />
              )}
              <Button
                startIcon={<Grading />}
                variant="outlined"
                onClick={handleManualToggle}
                size="small"
              >
                Manual
              </Button>
              <Button
                size="small"
                startIcon={<Refresh />}
                variant="outlined"
                onClick={handleAutoGenerateClick}
                disabled={
                  isProjectionsLoading ||
                  !hasStudentsWithoutRollNo ||
                  !arrangementType ||
                  !arrangeBy
                }
              >
                {isProjectionsLoading ? 'Loading...' : 'Auto '}
              </Button>
              <LoadingButton
                startIcon={<Save />}
                variant="contained"
                onClick={handleSaveClick}
                loading={isSaving}
                disabled={!isChanges}
                size="small"
              >
                Save
              </LoadingButton>
            </Box>
          )}
        </Box>

        {arrangeBy && (
          <CustomizableTable
            onSendNotification={handlerSendNotification}
            isLoading={isStudentDataLoading || isStudentDataFetching}
            showCheckbox={selectedStudents.length !== 0}
            noDataText={<>No Roll Generation Data Found </>}
            tableId="roll-no-generation-table"
            columns={[
              { id: 'grNo', label: 'GR No.', filterType: 'number' },
              { id: 'name', label: 'Name' },
              {
                id: 'rollNo',
                label: 'Roll No.',
                isFilter: false,
                isSort: false,
                minWidth: ROLL_COLUMN_WIDTH,
                align: 'left',
                render(value, row) {
                  const isModified = modifiedRowIds.has(row.studentId);

                  return (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        // Fixed width container to prevent layout shifts
                        width: ROLL_COLUMN_WIDTH - 32,
                        minWidth: ROLL_COLUMN_WIDTH - 32,
                        // Subtle gray background for modified rows
                        backgroundColor: isModified ? 'action.hover' : 'transparent',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        mx: -1,
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      {isManual ? (
                        <TextField
                          size="small"
                          variant="standard"
                          placeholder="Enter Roll No."
                          type="number"
                          value={row.rollNo ?? ''}
                          inputProps={{ min: 0 }}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          onChange={(e) =>
                            handleRollNoChange(
                              row.studentId,
                              row.name,
                              e.target.value ? +e.target.value : null
                            )
                          }
                          error={Boolean(error[row.studentId])}
                          helperText={error[row.studentId]}
                          sx={{
                            // Fixed width to prevent shake during input
                            width: '100%',
                            '& .MuiInputBase-input': {
                              py: 0.5,
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="body2">{value ?? '-'}</Typography>
                      )}
                    </Box>
                  );
                },
              },
            ]}
            data={tableData || []}
          />
        )}

        {sendInstantNotificationDialogValue.value && (
          <SendInstantNotificationDialog
            open={sendInstantNotificationDialogValue.value}
            onClose={sendInstantNotificationDialogValue.onFalse}
            data={[]}
            userList={selectedStudents}
          />
        )}
      </BackPopUpChecked>

      {/* Confirmation Dialog for Auto Generate - Using CustomDialog */}
      <CustomDialog
        open={autoGenerateConfirmDialog.value}
        handleClose={autoGenerateConfirmDialog.onFalse}
        title="Confirm Auto Generate"
        maxWidth="xs"
        hasForm={false}
      >
        <DialogScrollContent>
          <Typography variant="body2" color="text.secondary">
            This will automatically assign Roll numbers to{' '}
            <strong>
              {tableData.filter((s) => s.rollNo === null || s.rollNo === undefined).length}
            </strong>{' '}
            students who don&apos;t have Roll numbers yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Do you want to continue?
          </Typography>
        </DialogScrollContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
            size="small"
            onClick={autoGenerateConfirmDialog.onFalse}
          >
            Cancel
          </Button>
          <LoadingButton
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            loading={isProjectionsLoading}
            variant="contained"
            size="small"
            onClick={handleAutoGenerate}
          >
            Generate
          </LoadingButton>
        </DialogActions>
      </CustomDialog>

      {/* Confirmation Dialog for Save with Changes Summary - Modern UI */}
      <CustomDialog
        open={saveConfirmDialog.value}
        handleClose={saveConfirmDialog.onFalse}
        title="Roll Number Changes"
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
                      {change.oldRollNo ?? '-'}
                    </Typography>
                    <Iconify icon="mdi:arrow-right" width={16} sx={{ color: 'text.disabled' }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'success.main',
                        fontWeight: 600,
                      }}
                    >
                      {change.newRollNo ?? '-'}
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
            loading={isSaving}
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

export default RollNoGenerationScreen;
