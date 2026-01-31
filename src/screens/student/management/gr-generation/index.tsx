'use client';

import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { StudentApi } from 'src/redux/student';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import { Save, Refresh, Grading } from '@mui/icons-material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Chip, Button, TextField, Typography, DialogActions } from '@mui/material';
import { useGetAllStudentGroupQuery } from 'src/redux/student/student-group/student-group';
import {
  useUpdateStudentGrNumberMutation,
  useLazyGetStudentForGrNumberQuery,
} from 'src/redux/student/studentGrNumber/student-gr-number-api';

import type { IInquiryData } from '../../enrollment/Inquiry/type';

const GrNoGenerationScreen = ({ division }: { division: string }) => {
  // State to track if manual GR number generation is enabled
  const [isManual, setIsManual] = useState<boolean>(false);

  // State for confirmation dialogs
  const autoGenerateConfirmDialog = useBoolean();
  const saveConfirmDialog = useBoolean();

  // State to track which rows have been modified (for visual indicator)
  const [modifiedRowIds, setModifiedRowIds] = useState<Set<string>>(new Set());

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

  // State to store and manage the table data of students
  const [tableData, setTableData] = useState<IInquiryData[]>(getStudentData?.data || []);

  // Update table data when student data changes
  useEffect(() => {
    if (getStudentData?.data) {
      setTableData(getStudentData?.data);
      setInitialData(getStudentData?.data);
      setModifiedRowIds(new Set()); // Clear modified rows when data refreshes
    }
  }, [getStudentData]);

  const dispatch = useDispatch();
  const [initialData, setInitialData] = useState<IInquiryData[]>(getStudentData?.data || []);

  // API hooks for fetching and updating student GR numbers
  const [fetchStudents, { isLoading: isStudentGrNumberLoading }] =
    useLazyGetStudentForGrNumberQuery();

  const [updateStudentGrNumbers, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentGrNumberMutation,
  });

  // Handle automatic GR number generation
  const handleAutoGenerate = async () => {
    if (!division) {
      console.error('Division ID is required for GR number generation.');
      return;
    }

    try {
      const result = await fetchStudents(division).unwrap();

      // The API returns an object with data array containing students with grNumber
      if (result?.data && Array.isArray(result.data)) {
        // Find the highest GR number from the response
        const grNumbers = result.data
          .map((student: any) => student.grNumber)
          .filter((num: any) => num !== null && num !== undefined);

        const lastNum = grNumbers.length > 0 ? Math.max(...grNumbers) : 0;

        let currentNum = lastNum;
        const studentsWithoutGr = tableData.filter(
          (s) => s.grNo === null || s.grNo === undefined
        ).length;

        const newModifiedIds = new Set(modifiedRowIds);

        setTableData((prevData) =>
          prevData.map((item) => {
            if (item.grNo === null || item.grNo === undefined) {
              currentNum += 1;
              newModifiedIds.add(item.studentId as string);
              return { ...item, grNo: currentNum };
            }
            return item;
          })
        );

        setModifiedRowIds(newModifiedIds);

        // Show success toast after auto-generation with smart message
        const message =
          studentsWithoutGr === 1
            ? 'Successfully generated 1 GR No.'
            : `Successfully generated ${studentsWithoutGr} GR Nos.`;
        shikshaMitraToast.success({ message });
      }
    } catch (err) {
      console.error('Failed to fetch student data:', err);
      shikshaMitraToast.error({
        message: 'Failed to auto-generate GR numbers',
      });
    }
  };

  // Open confirmation dialog for auto-generate
  const handleAutoGenerateClick = () => {
    autoGenerateConfirmDialog.onTrue();
  };

  // Confirm auto-generate action
  const confirmAutoGenerate = () => {
    autoGenerateConfirmDialog.onFalse();
    handleAutoGenerate();
  };

  // Toggle manual GR number generation mode
  const handleManualToggle = () => {
    setIsManual(true);
  };

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Handle individual GR number changes in manual mode
  const handleGrNumberChange = (id: string, name: string, newValue: number | null) => {
    setTableData((prevData) =>
      prevData.map((item) => (item.studentId === id ? { ...item, grNo: newValue } : item))
    );
    setSelectedStudents([{ studentId: id, name }]);

    // Track modified rows for visual indicator
    setModifiedRowIds((prev) => new Set(prev).add(id));
  };

  // Calculate changes summary for visual feedback before saving
  const changesSummary = useMemo(() => {
    const changes: { studentName: string; oldGrNo: number | null; newGrNo: number | null }[] = [];

    tableData.forEach((current) => {
      const original = initialData.find((item) => item.studentId === current.studentId);
      if (original && original.grNo !== current.grNo) {
        changes.push({
          studentName: current.studentName || current.name || 'Unknown',
          oldGrNo: original.grNo ?? null,
          newGrNo: current.grNo ?? null,
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

  // Save the updated GR numbers to the backend
  const handleSave = async () => {
    saveConfirmDialog.onFalse();
    const requestBody = tableData.map((item) => ({
      studentId: item.studentId,
      grNo: item.grNo ?? item.tempGrNo, // Use new GR No if available, else keep the current one
    }));

    try {
      await updateStudentGrNumbers({ body: requestBody }).unwrap();

      // Smart success message based on count
      const updateCount = changesSummary.length;
      const message =
        updateCount === 1
          ? 'Successfully updated 1 GR No.'
          : `Successfully updated ${updateCount} GR Nos.`;

      shikshaMitraToast.success({ message });
      setInitialData(tableData);
      setIsManual(false);
      setModifiedRowIds(new Set()); // Clear modified rows after save
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (error) {
      console.error('Failed to update GR Numbers:', error);
    }
  };

  // State to track selected students for notifications
  const [selectedStudents, setSelectedStudents] = useState<{ studentId: string; name: string }[]>(
    []
  );
  // Controls the visibility of notification dialog
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler for sending notifications to selected students
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const hasStudentsWithoutGrNo = useMemo(
    () => tableData.some((student) => student.grNo === null || student.grNo === undefined),
    [tableData]
  );

  // Fixed width for GR No. column to prevent layout shifts
  const GR_COLUMN_WIDTH = 180;

  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}
    >
      <BackPopUpChecked initialValues={initialData} currentValues={tableData}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center' }}>
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
            size="small"
            startIcon={<Grading />}
            variant="outlined"
            onClick={handleManualToggle}
          >
            Manual
          </Button>
          <Button
            size="small"
            startIcon={<Refresh />}
            variant="outlined"
            onClick={handleAutoGenerateClick}
            disabled={!hasStudentsWithoutGrNo || isStudentGrNumberLoading}
          >
            {isStudentGrNumberLoading ? 'Loading...' : 'Auto '}
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
      </BackPopUpChecked>

      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        isLoading={isStudentDataLoading || isStudentDataFetching}
        tableId="gr-no-generation-table"
        noDataText={<>No GR No. Data Found </>}
        columns={[
          { id: 'studentName', label: 'Name', align: 'left' },
          {
            id: 'grNo',
            label: 'GR No.',
            align: 'left',
            filterType: 'number',
            isFilter: false,
            isSort: false,
            // Fixed min-width to prevent column shift
            minWidth: GR_COLUMN_WIDTH,
            render(value, row) {
              const isModified = modifiedRowIds.has(row.studentId);

              return (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    // Fixed width container to prevent layout shifts
                    width: GR_COLUMN_WIDTH - 32,
                    minWidth: GR_COLUMN_WIDTH - 32,
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
                      placeholder="Enter GR No."
                      type="number"
                      inputProps={{ min: 0 }}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      value={row.grNo ?? ''}
                      onChange={(e) =>
                        handleGrNumberChange(
                          row.studentId,
                          row.name,
                          e.target.value ? +e.target.value : null
                        )
                      }
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
            This will automatically assign GR numbers to{' '}
            <strong>
              {tableData.filter((s) => s.grNo === null || s.grNo === undefined).length}
            </strong>{' '}
            students who don&apos;t have GR numbers yet.
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
            loading={isStudentGrNumberLoading}
            variant="contained"
            size="small"
            onClick={confirmAutoGenerate}
          >
            Generate
          </LoadingButton>
        </DialogActions>
      </CustomDialog>

      {/* Confirmation Dialog for Save with Changes Summary - Modern UI */}
      <CustomDialog
        open={saveConfirmDialog.value}
        handleClose={saveConfirmDialog.onFalse}
        title="GR Number Changes"
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
                      {change.oldGrNo ?? '-'}
                    </Typography>
                    <Iconify icon="mdi:arrow-right" width={16} sx={{ color: 'text.disabled' }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'success.main',
                        fontWeight: 600,
                      }}
                    >
                      {change.newGrNo ?? '-'}
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

export default GrNoGenerationScreen;
