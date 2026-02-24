'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Box, Card, Button, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import {
  useGetExamRoomsQuery,
  useGetExamDivisionsQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import SeatAllocationTable from './components/SeatAllocationTable';
import SeatAllocationSection from './components/SeatAllocationSection';

import type { IDroppedData, IExamAllocation } from './type';

const SeatAllocation = () => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const openSeatAllocation = useBoolean();
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [room, setRoom] = useState<string>('');
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');

  // const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState<IExamAllocation | null>(null);

  const {
    data: examDivisionsData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamDivisionsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, classId: selectedExam?.classId },
  }); // Update classes when organization changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [droppedData, setDroppedData] = useState<IDroppedData>({ roomId: '', students: [] });
  const {
    data: examRoomsData,
    isLoading: examRoomsLoading,
    isFetching: examRoomsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomsQuery,
    params: { examId: selectedExam?.id, divisionId: division },
  }); // Update classes when organization changes

  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      currentMedium?.educationMediumStages?.flatMap(
        (stage: Organization) => stage.standards || []
      ) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.name || '');
  }, [currentMedium]);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {openSeatAllocation.value ? (
        <CustomBreadcrumbs
          heading="Seat Allocation"
          description="This table lists all scheduled exams eligible for seat allocation. Click 'Allocate Seat' to assign students to exam halls for a specific exam."
          isBack
          onBack={() => {
            // handleClose(null, false);
            openSeatAllocation.onFalse();
          }}
          links={[
            { name: 'Academic', href: '/academic/dashboard' },
            { name: 'Examination', href: '/academic/examination' },
            { name: 'Seat Allocation', href: '/academic/examination/seat-allocation' },
          ]}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Seat Allocation"
          description="This table lists all scheduled exams eligible for seat allocation. Click 'Allocate Seat' to assign students to exam halls for a specific exam."
          links={[
            { name: 'Academic', href: '/academic/dashboard' },
            { name: 'Examination', href: '/academic/examination' },
            { name: 'Seat Allocation' },
          ]}
        />
      )}
      {openSeatAllocation.value ? (
        <CustomDialog
          title="Allocation Details"
          open={openSeatAllocation.value}
          handleClose={openSeatAllocation.onFalse}
          fullScreen
        >
          {/* <SectionCard title="Allocation Details"> */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <PaginatedSearchSelect
                label="Division"
                fetchOptions={async (query) => {
                  const items = examDivisionsData?.data?.divisions || [];
                  const filtered = items.filter((item: any) =>
                    item?.name?.toLowerCase().includes(query.toLowerCase())
                  );
                  return {
                    data: filtered.map((item: any) => ({
                      label: item.name,
                      id: item.name,
                    })),
                    hasMore: false,
                  };
                }}
                value={
                  division
                    ? {
                        label:
                          (examDivisionsData?.data?.divisions || []).find(
                            (d: any) => d.name === division
                          )?.name || division,
                        id: division,
                      }
                    : null
                }
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                getOptionLabel={(option: any) => option?.label || ''}
                renderOption={(prop, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.label}
                  </li>
                )}
                minChars={0}
                isLoading={isLoading || isFetching}
                onChange={(_, value: any) => setDivision(value?.id || '')}
                sx={{ minWidth: '250px', width: '100%' }}
                size="small"
                disabled={!classes}
              />
              <PaginatedSearchSelect
                label="Room"
                fetchOptions={async (query) => {
                  const items = examRoomsData?.data?.rooms || [];
                  const filtered = items.filter((item: any) =>
                    item?.name?.toLowerCase().includes(query.toLowerCase())
                  );
                  return {
                    data: filtered.map((item: any) => ({
                      label: item.name,
                      id: item.id,
                    })),
                    hasMore: false,
                  };
                }}
                value={
                  room
                    ? {
                        label:
                          (examRoomsData?.data?.rooms || []).find((r: any) => r.id === room)
                            ?.name || room,
                        id: room,
                      }
                    : null
                }
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                getOptionLabel={(option: any) => option?.label || ''}
                renderOption={(prop, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.label}
                  </li>
                )}
                minChars={0}
                isLoading={examRoomsLoading || examRoomsFetching}
                onChange={(_, value: any) => setRoom(value?.id || '')}
                sx={{ minWidth: '250px', width: '100%' }}
                size="small"
                disabled={!division}
              />
              <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
                Exam : {selectedExam?.examName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
                variant="outlined"
                size="small"
                onClick={() => {
                  // draftTimetableDialog.onTrue();
                }}
              >
                Cancel
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                variant="contained"
                size="small"
                onClick={() => {
                  // publishTimetableDialog.onTrue();
                }}
              >
                Submit
              </Button>
            </Box>
          </Box>
          {/* </SectionCard> */}
          <SeatAllocationSection
            division={division}
            classRoom={room}
            selectedExam={selectedExam}
            setDroppedData={setDroppedData}
          />
        </CustomDialog>
      ) : (
        <>
          <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1 }}>
            <PaginatedSearchSelect
              label="Class"
              fetchOptions={async (query) => {
                const items = allClass || [];
                const filtered = items.filter((item: any) =>
                  item?.name?.toLowerCase().includes(query.toLowerCase())
                );
                return {
                  data: filtered.map((item: any) => ({
                    label: item.name,
                    id: item.name,
                  })),
                  hasMore: false,
                };
              }}
              value={
                classes
                  ? {
                      label: allClass.find((c: any) => c.name === classes)?.name || classes,
                      id: classes,
                    }
                  : null
              }
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              getOptionLabel={(option: any) => option?.label || ''}
              renderOption={(prop, option: any) => (
                <li {...prop} key={option.id}>
                  {option.label}
                </li>
              )}
              minChars={0}
              onChange={(_, value: any) => setClasses(value?.id || '')}
              sx={{ maxWidth: '250px', width: '100%', pb: 1 }}
              size="small"
            />
          </Card>
          <SeatAllocationTable
            openSeatAllocation={openSeatAllocation}
            onSeatAllocate={(examData) => {
              setSelectedExam(examData);
            }}
            classId={classes}
          />
        </>
      )}
    </Box>
  );
};

export default SeatAllocation;
