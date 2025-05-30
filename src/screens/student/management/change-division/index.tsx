'use client';

import type { Division } from 'src/types/school';

import { useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import { Save } from '@mui/icons-material';
import { Box, Checkbox } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { StudentApi, useChangeDivisionMutation } from 'src/redux/student';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import type { TableDivisionDropDownProps } from './type';
import type { IInquiryData } from '../../enrollment/Inquiry';

const initialData = [
  { id: 1, srNo: 1, grNo: 'GR001', name: 'John Doe', division: '' },
  { id: 2, srNo: 2, grNo: 'GR002', name: 'Jane Smith', division: '' },
  { id: 3, srNo: 3, grNo: 'GR003', name: 'Alice Johnson', division: '' },
];

const ChangeDivisionScreen = ({
  tableData: studentData,
  isLoading,
  allDivision,
  division,
}: {
  isLoading: boolean;
  tableData: IInquiryData[];
  allDivision: Division[];
  division: string;
}) => {
  // State to manage table data
  const [tableData, setTableData] = useState<IInquiryData[]>(studentData);
  const dispatch = useDispatch();

  // Update table data when studentData changes
  useEffect(() => {
    setTableData(studentData);
  }, [studentData]);

  // Mutation hook for changing student division
  const [changeDivision, { isLoading: isChangeDivisionLoading, data }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeDivisionMutation,
  });

  // Handle save button click to update student divisions
  const handelSave = async () => {
    try {
      const res = await changeDivision({
        studentDivisionUpdates: tableData
          .filter((student) => !!student.divisionId) // Filter students with division assigned
          .map((student) => ({
            studentId: student.id,
            divisionId: student.divisionId,
          })),
      }).unwrap();
      // Invalidate cache to refetch updated data
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // State to track selected students for bulk actions
  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler for sending notifications to selected students
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <Box>
      <BackPopUpChecked initialValues={studentData} currentValues={tableData}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
          <LoadingButton
            loading={isChangeDivisionLoading}
            startIcon={<Save />}
            variant="outlined"
            onClick={handelSave}
            size="small"
          >
            Save
          </LoadingButton>
        </Box>
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          tableId="change-division-table"
          noDataText={<>No Student Data Found </>}
          searchFieldProps={{
            placeholder: 'Search by GR No. or Name...',
            label: 'Search',
            sx: {
              maxWidth: '400px',
              width: '100%',
            },
          }}
          columns={[
            {
              id: 'checkBox',
              align: 'left',
              minWidth: '60px',
              sticky: true,
              isSort: false,
              isFilter: false,
              label: '',
              renderColumn() {
                return (
                  <Checkbox
                    checked={!!tableData?.length && selectedStudents?.length === tableData?.length}
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
            { id: 'grNoRecord', label: 'GR No.' },
            { id: 'name', label: 'Name' },
            {
              id: 'divisionId',
              label: 'Division',
              isFilter: false,
              isSort: false,
              render(value, row) {
                return (
                  <TableDivisionDropDown
                    allDivision={allDivision}
                    division={value}
                    currentDivision={division}
                    onChange={(val) => {
                      const newData = tableData.map((item) => {
                        if (item.id === row.id) {
                          return {
                            ...item,
                            divisionId: val as string,
                          };
                        }
                        return item;
                      });

                      setTableData(newData as IInquiryData[]);
                    }}
                  />
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
    options={allDivision || []}
    label="Division"
    value={division}
    onChange={onChange}
    labelKey="name"
    valueKey="id"
    formControlProps={{ sx: { width: '150px', textAlign: 'left' } }}
    onClick={(e) => e.stopPropagation()}
  />
);
