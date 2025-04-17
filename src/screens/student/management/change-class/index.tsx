'use client';

import type { Standards } from 'src/types/school';

import { useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import { Save } from '@mui/icons-material';
import { Box, Checkbox } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { StudentApi } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useChangeStudentClassMutation } from 'src/redux/student/student-change-class/student-change-class-api';

import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import type { ITableClassDropDownProps } from './type';
import type { IInquiryData } from '../../enrollment/Inquiry';

const ChangeClassScreen = ({
  tableData: studentData,
  isLoading,
  allClass,
  classes,
}: {
  isLoading: boolean;
  tableData: IInquiryData[];
  allClass: Standards[];
  classes: string;
}) => {
  // State to manage selected students for bulk operations and notifications
  const [selectedStudent, setSelectedStudent] = useState<any>([]);

  // State to track the selected class value in the column header dropdown
  const [columClass, setColumnClass] = useState<string>('');

  // State to maintain and update the table data with student information
  const [tableData, setTableData] = useState(studentData || []);

  // Custom hook to manage the visibility state of the notification dialog
  const sendInstantNotificationDialogValue = useBoolean();

  // Redux dispatch hook for triggering actions
  const dispatch = useDispatch();

  // Handler function to toggle the notification dialog visibility
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  // Custom mutation hook for handling class change operations
  const [changeClass, { isLoading: isClassChangLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeStudentClassMutation,
  });

  // Effect hook to update table data when studentData prop changes
  useEffect(() => {
    setTableData(studentData || []);
  }, [studentData]);

  // Handler function to process and save class changes
  const handleSave = async () => {
    try {
      const res = await changeClass({
        studentStandardUpdates: tableData.map((student) => ({
          studentId: student.id,
          standardId: student.standardId,
        })),
      }).unwrap();
      // Invalidate cache to refetch updated data
      dispatch(StudentApi.util.invalidateTags(['Student']));
      shikshaMitraToast.success({ message: 'Class changed successfully' });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  return (
    <Box>
      <BackPopUpChecked initialValues={studentData} currentValues={tableData}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
          <LoadingButton
            loading={isClassChangLoading}
            startIcon={<Save />}
            variant="outlined"
            onClick={handleSave}
          >
            Save
          </LoadingButton>
          {/* <Button
            startIcon={<TransferWithinAStationSharp />}
            variant="outlined"
            disabled={!selectedStudent.length}
          >
            Promotion
          </Button> */}
        </Box>
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudent.length !== 0}
          tableId="change-class-table"
          isLoading={isLoading}
          searchFieldProps={{
            placeholder: 'Search by Sr. No., GR No...',
            label: 'Search by Sr. No., GR No...',
            sx: {
              maxWidth: '400px',
              width: '100%',
            },
          }}
          columns={[
            {
              id: 'checkBox',
              label: ' ',
              isSort: false,
              renderColumn: (value) => (
                <Checkbox
                  checked={tableData.length === selectedStudent.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudent(tableData);
                    } else {
                      setSelectedStudent([]);
                    }
                  }}
                />
              ),
              render(value, row) {
                return (
                  <Checkbox
                    checked={selectedStudent.some((student: any) => student.id === row.id)}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        setSelectedStudent(
                          selectedStudent.filter((student: any) => student.id !== row.id)
                        );
                      } else {
                        setSelectedStudent([...selectedStudent, row]);
                      }
                    }}
                  />
                );
              },
            },
            // { id: 'srNo', label: 'Sr. No.' },
            { id: 'grNoRecord', label: 'GR No.' },
            { id: 'name', label: 'Name' },
            // { id: 'division', label: 'Division' },
            // {
            //   id: 'feeStatus',
            //   label: 'Fee Status',
            //   render(value, row) {
            //     return <Label color={value === 'Paid' ? 'success' : 'warning'}>{value}</Label>;
            //   },
            // },
            // {
            //   id: 'examStatus',
            //   label: 'Exam Status',
            //   render(value, row) {
            //     return <Label color={value === 'Passed' ? 'success' : 'error'}>{value}</Label>;
            //   },
            // },
            {
              id: 'standardId',
              label: '',
              renderColumn(value) {
                return (
                  <TableClassDropDown
                    allClass={allClass}
                    classes={columClass}
                    onChange={(val) => {
                      setColumnClass(val as string);
                      const newData = tableData.map((item) => ({
                        ...item,
                        standardId: val as string,
                      }));

                      setTableData(newData);
                    }}
                  />
                );
              },
              render(value, row) {
                return (
                  <TableClassDropDown
                    allClass={allClass}
                    classes={value}
                    onChange={(val) => {
                      const newData = tableData.map((item) => {
                        if (item.id === row.id) {
                          return {
                            ...item,
                            standardId: val as string,
                          };
                        }
                        return item;
                      });

                      setTableData(newData);
                    }}
                  />
                );
              },
            },
          ]}
          data={tableData || []}
        />{' '}
        {sendInstantNotificationDialogValue.value && (
          <SendInstantNotificationDialog
            open={sendInstantNotificationDialogValue.value}
            onClose={sendInstantNotificationDialogValue.onFalse}
            data={[]}
            userList={selectedStudent}
          />
        )}
      </BackPopUpChecked>
    </Box>
  );
};

export default ChangeClassScreen;

const TableClassDropDown = ({ allClass, classes, onChange }: ITableClassDropDownProps) => (
  <CustomSelect
    options={allClass || []}
    label="Class"
    value={classes}
    onChange={onChange}
    labelKey="name"
    valueKey="id"
    formControlProps={{ sx: { width: '150px', textAlign: 'left' } }}
    onClick={(e) => e.stopPropagation()}
  />
);
