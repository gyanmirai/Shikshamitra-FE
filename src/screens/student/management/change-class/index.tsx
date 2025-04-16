'use client';

import React, { useState } from 'react';

import { Box, Button, Checkbox } from '@mui/material';
import { Save, TransferWithinAStationSharp } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import type { TableClassDropDownProps } from './type';

const initialData = [
  {
    id: 1,
    srNo: 1,
    grNo: 'GR001',
    name: 'John Doe',
    division: 'A',
    class: '',
    feeStatus: 'Paid',
    examStatus: 'Passed',
  },
  {
    id: 2,
    srNo: 2,
    grNo: 'GR002',
    name: 'Jane Smith',
    division: 'B',
    class: '',
    feeStatus: 'Pending',
    examStatus: 'Failed',
  },
  {
    id: 3,
    srNo: 3,
    grNo: 'GR003',
    name: 'Alice Johnson',
    division: 'A',
    class: '',
    feeStatus: 'Paid',
    examStatus: 'Passed',
  },
];

const ChangeClassScreen = ({ allClass }: any) => {
  // State to store selected students for bulk actions
  const [selectedStudent, setSelectedStudent] = useState<any>([]);

  // State to store selected class column value
  const [columClass, setColumnClass] = useState<string>('');

  // Initial table data with student information
  const [tableData, setTableData] = useState([
    {
      id: 1,
      srNo: 1,
      grNo: 'GR001',
      name: 'John Doe',
      division: 'A',
      class: '',
      feeStatus: 'Paid',
      examStatus: 'Passed',
    },
    {
      id: 2,
      srNo: 2,
      grNo: 'GR002',
      name: 'Jane Smith',
      division: 'B',
      class: '',
      feeStatus: 'Pending',
      examStatus: 'Failed',
    },
    {
      id: 3,
      srNo: 3,
      grNo: 'GR003',
      name: 'Alice Johnson',
      division: 'A',
      class: '',
      feeStatus: 'Paid',
      examStatus: 'Passed',
    },
  ]);

  // Boolean state to control notification dialog visibility
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler to show notification dialog
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <Box>
      <BackPopUpChecked initialValues={initialData} currentValues={tableData}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
          <Button startIcon={<Save />} variant="outlined">
            Save
          </Button>
          <Button
            startIcon={<TransferWithinAStationSharp />}
            variant="outlined"
            disabled={!selectedStudent.length}
          >
            Promotion
          </Button>
        </Box>
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudent.length !== 0}
          tableId="change-class-table"
          searchFieldProps={{
            placeholder: 'Search by Sr. No., GR No., Name, Fee Status, Exam Status',
            label: 'Search by Sr. No., GR No., Name, Fee Status, Exam Status',
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
            { id: 'srNo', label: 'Sr. No.' },
            { id: 'grNo', label: 'GR No.' },
            { id: 'name', label: 'Name' },
            // { id: 'division', label: 'Division' },
            {
              id: 'feeStatus',
              label: 'Fee Status',
              render(value, row) {
                return <Label color={value === 'Paid' ? 'success' : 'warning'}>{value}</Label>;
              },
            },
            {
              id: 'examStatus',
              label: 'Exam Status',
              render(value, row) {
                return <Label color={value === 'Passed' ? 'success' : 'error'}>{value}</Label>;
              },
            },
            {
              id: 'class',
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
                        class: val as string,
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
                            class: val as string,
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
          data={tableData}
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

const TableClassDropDown = ({ allClass, classes, onChange }: TableClassDropDownProps) => (
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
