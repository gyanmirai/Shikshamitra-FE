import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import NewTimetable from './new-timetable';

interface Division {
  id: number;
  division: string;
  status: string;
  createdAt: Dayjs | null;
}

interface ClassData {
  id: number;
  className: string;
  divisions: Division[];
}

interface timeTable {
  items: ClassData[];
}

const dummyClassData = {
  items: [
    {
      id: 1,
      className: '1',
      divisions: [
        {
          id: 101,
          division: 'A',
          status: 'Not Create', // Division A has been published
          createdAt: null,
        },
        {
          id: 102,
          division: 'B',
          status: 'Pending', // Division B is awaiting approval or publication
          createdAt: dayjs('2024-02-20'),
        },
        {
          id: 103,
          division: 'C',
          status: 'Publish', // Division B is awaiting approval or publication
          createdAt: dayjs('2024-01-23'),
        },
      ],
    },
    {
      id: 2,
      className: '2',
      divisions: [
        {
          id: 201,
          division: 'A',
          status: 'Not Create', // Division A has not yet been created
          createdAt: null, // No createdAt date since it's not created
        },
        {
          id: 202,
          division: 'B',
          status: 'Publish', // Division C is published
          createdAt: dayjs('2024-03-12'),
        },
      ],
    },
    {
      id: 3,
      className: '3',
      divisions: [
        {
          id: 301,
          division: 'A',
          status: 'Not Create', // Division B is not created
          createdAt: null,
        },
      ],
    },
  ],
};

const CurrentTimetable = (props: TabComponentType) => {
  const [timeTableData, setTimeTableData] = useState(dummyClassData);
  const [selectedRow, setSelectedRow] = useState<any>();
  const dialog = useBoolean();
  const { searchParams, setSearchParams } = props;
  const [isEdit, setIsEdit] = useState(false);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [selectedClassData, setSelectedClassData] = useState<Division[] | null>(null);

  useEffect(() => {
    if (classData?.items?.length) {
      if (!searchParams?.classId) {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
      }
      const classes = classData.items.find((c: any) => c.id === searchParams?.classId);
      const filteredData = timeTableData?.items?.find((item) => item.className === classes?.name);
      console.log('filtered data----', filteredData);

      setSelectedClassData(filteredData?.divisions || []);
    }
  }, [searchParams?.classId, classData, setSearchParams, timeTableData?.items]);

  const handleCloseDialog = () => {
    dialog.onFalse();
    setSelectedRow(null);
    setIsEdit(false);
  };

  return (
    <Box>
      <CustomSelect
        label="Class"
        name="class"
        isLoading={isLoading}
        options={classData?.items || []}
        valueKey="id"
        labelKey="name"
        formControlProps={{ sx: { width: '200px' } }}
        value={searchParams?.classId || ''}
        onChange={(value) => {
          setSearchParams?.({
            classId: value as string,
          });
        }}
      />
      <Grid2 container spacing={3}>
        {selectedClassData && (
          <CustomizableTable
            tableId="timetable-table"
            columns={[
              // {
              //   id: 'className',
              //   label: 'Class',
              //   render: (value, row) => {
              //     const classes = classData.items.find((c: any) => c.id === searchParams.classId);
              //     return (
              //       <Typography fontSize="12px" gutterBottom>
              //         {classes?.name}
              //       </Typography>
              //     );
              //   },
              // },
              { id: 'division', label: 'division' },
              {
                id: 'createdAt',
                label: 'Created At',
                render: (value, row) =>
                  value === null ? (
                    '-'
                  ) : (
                    <Typography fontSize="12px" gutterBottom>
                      {dayjs(value).format('DD MMM YYYY')}
                    </Typography>
                  ),
              },
              {
                id: 'status',
                label: 'Status',
                render(value, row) {
                  return (
                    <Label
                      color={
                        value === 'Pending'
                          ? 'warning'
                          : value === 'Not Create'
                            ? 'error'
                            : value === 'Publish'
                              ? 'success'
                              : 'default'
                      }
                    >
                      {value}
                    </Label>
                  );
                },
              },
              {
                id: 'action',
                label: 'Action',
                isSort: false,
                render: (value, row) => (
                  <ThreeDotsActions
                    placement="right-top"
                    actions={({ popover: pop }) => (
                      <MenuList>
                        {row.status === 'Pending' && (
                          <MenuItem
                            onClick={() => {
                              // setSelectedSubject(row as any);
                              // setIsEdit(true);
                              // dialog.onTrue();
                            }}
                          >
                            <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                            Edit
                          </MenuItem>
                        )}

                        {row.status === 'Not Create' && (
                          <MenuItem
                            onClick={() => {
                              // setSelectedSubject(row as any);
                              setIsEdit(false);
                              setSelectedRow(row);
                              dialog.onTrue();
                            }}
                          >
                            <Iconify icon="mdi:plus" sx={{ height: '16px', width: '16px' }} />
                            Create New Timetable
                          </MenuItem>
                        )}

                        {row.status === 'Publish' && (
                          <MenuItem
                            onClick={() => {
                              setIsEdit(true);
                              setSelectedRow(row);
                              dialog.onTrue();
                            }}
                          >
                            <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                            Edit
                          </MenuItem>
                        )}
                      </MenuList>
                    )}
                  />
                ),
              },
            ]}
            data={selectedClassData}
          />
        )}
      </Grid2>
      <CustomDialog
        maxWidth="lg"
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Timetable' : 'Create Timetable'}
      >
        <NewTimetable
          selectedClass={searchParams?.classId || ''}
          selectedDivision={selectedRow?.division}
          isEdit={isEdit}
        />
      </CustomDialog>
    </Box>
  );
};

export default CurrentTimetable;
