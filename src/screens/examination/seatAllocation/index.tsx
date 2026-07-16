'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Chip,
  Paper,
  Button,
  Divider,
  Tooltip,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useGetExamRoomsQuery,
  useGetExamDivisionsQuery,
  useSaveSeatAllocationMutation,
  useGetSeatAllocationStudentsQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import SeatAllocationTable from './components/SeatAllocationTable';
import SeatAllocationSection from './components/SeatAllocationSection';

import type { IDroppedData, IExamAllocation } from './type';

const SeatAllocation = () => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const openSeatAllocation = useBoolean();
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [room, setRoom] = useState<string>('');
  // classes stores the selected standard UUID
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');

  const [selectedExam, setSelectedExam] = useState<IExamAllocation | null>(null);
  const [droppedData, setDroppedData] = useState<IDroppedData>({ roomId: '', students: [] });

  const [saveSeatAllocation, { isLoading: isSaving }] = useSaveSeatAllocationMutation();

  const {
    data: examDivisionsData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamDivisionsQuery,
    params: { examId: selectedExam?.examId, standardId: classes },
    options: {
      skip: !selectedExam?.examId || !classes, // Skip the query if examId or classes is not selected
    },
  });

  const {
    data: examRoomsData,
    isLoading: examRoomsLoading,
    isFetching: examRoomsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomsQuery,
    params: { examId: selectedExam?.examId, divisionId: division },
    options: {
      skip: !selectedExam?.examId || !division, // Skip the query if examId or division is not selected
    },
  });

  const { data: seatAllocationStudentsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatAllocationStudentsQuery,
    params: {
      examId: selectedExam?.examId,
      divisionId: division,
    },
    options: {
      skip: !selectedExam?.examId || !division,
    },
  });

  const totalStudents = seatAllocationStudentsData?.totalCount ?? selectedExam?.totalStudents ?? 0;
  const allocatedStudents =
    seatAllocationStudentsData?.items?.filter((student: any) => student.isSeatAllocate).length ??
    selectedExam?.allocatedStudents ??
    0;
  const pendingStudents = Math.max(0, totalStudents - allocatedStudents);
  const allocationProgress =
    totalStudents > 0 ? Math.min(100, Math.round((allocatedStudents / totalStudents) * 100)) : 0;

  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      currentMedium?.educationMediumStages?.flatMap(
        (stage: Organization) => stage.standards || []
      ) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [currentMedium]);

  const handleSubmit = async () => {
    if (!selectedExam?.examId) return;
    await saveSeatAllocation({ examId: selectedExam.examId, body: droppedData });
    openSeatAllocation.onFalse();
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {openSeatAllocation.value ? (
        <CustomBreadcrumbs
          sx={{ mb: 1 }}
          heading="Seating Plan"
          description="This table lists all scheduled exams eligible for seat allocation. Click 'Allocate Seat' to assign students to exam halls for a specific exam."
          isBack
          onBack={() => {
            openSeatAllocation.onFalse();
          }}
          links={[
            { name: 'Academic', href: '/academic/dashboard' },
            { name: 'Examination' },
            { name: 'Seating Plan' },
          ]}
        />
      ) : (
        <CustomBreadcrumbs
          sx={{ mb: 1 }}
          heading="Seating Plan"
          description="This table lists all scheduled exams eligible for seat allocation. Click 'Allocate Seat' to assign students to exam halls for a specific exam."
          links={[
            { name: 'Academic', href: '/academic/dashboard' },
            { name: 'Examination' },
            { name: 'Seating Plan' },
          ]}
        />
      )}
      {openSeatAllocation.value ? (
        <CustomDialog
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h6">
                Seat Allocation
                {selectedExam?.examName ? ` — ${selectedExam.examName}` : ''}
                {selectedExam?.standardName ? ` · ${selectedExam.standardName}` : ''}
              </Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title="Drag and drop students into exam rooms to assign seats. Select a division and room to view available students and room capacity, then submit to save the allocation."
              >
                <Box component="span" sx={{ display: 'inline-flex' }}>
                  <Iconify
                    icon="lucide:info"
                    sx={{ cursor: 'pointer' }}
                    color="info.main"
                    width={18}
                  />
                </Box>
              </CustomTooltip>
            </Box>
          }
          open={openSeatAllocation.value}
          handleClose={openSeatAllocation.onFalse}
          fullScreen
        >
          {/* ── NON-BREAKING: enhanced context strip + stats panel ── */}
          <Box
            sx={{
              px: 2,
              pt: 1.5,
              pb: 0,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Row 1: Context breadcrumb + CTA */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
                mb: 1.5,
              }}
            >
              {/* Context chips strip */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {selectedExam?.examName && (
                  <Chip
                    icon={<Iconify icon="mdi:clipboard-text-outline" width={14} />}
                    label={selectedExam.examName}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                  />
                )}
                {selectedExam?.standardName && (
                  <Chip
                    icon={<Iconify icon="mdi:school-outline" width={14} />}
                    label={selectedExam.standardName}
                    size="small"
                    color="primary"
                    variant="soft"
                    sx={{ fontSize: '0.75rem' }}
                  />
                )}

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                <CustomSelect
                  options={examDivisionsData?.items || []}
                  label="Division"
                  value={division}
                  isLoading={isLoading || isFetching}
                  onChange={(val) => {
                    setDivision(val as string);
                    // Reset dependent state so no stale room selection or allocation data persists
                    setRoom('');
                    setDroppedData({ roomId: '', students: [] });
                  }}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { minWidth: '180px' } }}
                  disabled={!classes}
                />
                <CustomSelect
                  options={examRoomsData?.items || []}
                  label="Room"
                  value={room}
                  isLoading={examRoomsLoading || examRoomsFetching}
                  onChange={(val) => setRoom(val as string)}
                  labelKey="roomName"
                  valueKey="id"
                  formControlProps={{ sx: { minWidth: '180px' } }}
                  disabled={!division}
                />
              </Box>

              {/* CTA buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                <Button
                  startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={openSeatAllocation.onFalse}
                >
                  Cancel
                </Button>
                <Tooltip title={isSaving ? 'Saving…' : 'Save seat allocation'} arrow>
                  <span>
                    <Button
                      startIcon={
                        isSaving ? (
                          <Iconify icon="svg-spinners:ring-resize" width={16} />
                        ) : (
                          <Iconify icon={GlobalIcons.submit} />
                        )
                      }
                      variant="contained"
                      size="small"
                      disabled={isSaving}
                      onClick={handleSubmit}
                    >
                      {isSaving ? 'Saving…' : 'Submit'}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Box>

            {/* Row 2: NON-BREAKING live stats bar */}
            {selectedExam && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  pb: 1.25,
                  flexWrap: 'wrap',
                }}
              >
                {/* Stat chips */}
                {[
                  {
                    label: 'Total',
                    value: totalStudents,
                    color: 'text.primary',
                    icon: 'mdi:account-group-outline',
                  },
                  {
                    label: 'Allocated',
                    value: allocatedStudents,
                    color: 'success.main',
                    icon: 'mdi:check-circle-outline',
                  },
                  {
                    label: 'Pending',
                    value: pendingStudents,
                    color: 'warning.main',
                    icon: 'mdi:clock-outline',
                  },
                ].map((stat) => (
                  <Box key={stat.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Iconify icon={stat.icon} width={16} sx={{ color: stat.color }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {stat.label}:
                    </Typography>
                    <Typography variant="caption" color={stat.color} fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                ))}

                {/* Progress bar */}
                {totalStudents > 0 && (
                  <Box sx={{ flex: 1, minWidth: 120, maxWidth: 280 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 0.25,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Allocation progress
                      </Typography>
                      <Typography variant="caption" color="success.main" fontWeight={700}>
                        {allocationProgress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={allocationProgress}
                      color="success"
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <SeatAllocationSection
            division={division}
            classRoom={room}
            selectedExam={selectedExam}
            setDroppedData={setDroppedData}
          />
        </CustomDialog>
      ) : (
        <>
          <Paper sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1, borderRadius: 2 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            />
          </Paper>
          <SeatAllocationTable
            openSeatAllocation={openSeatAllocation}
            onSeatAllocate={(examData) => {
              setSelectedExam(examData);
              setDivision('');
              setRoom('');
              setDroppedData({ roomId: '', students: [] });
            }}
            classId={classes}
          />
        </>
      )}
    </Box>
  );
};

export default SeatAllocation;
