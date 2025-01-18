'use client';

import type { Standards } from 'src/types/school';

import React, { useState } from 'react';

import { Box, Button, Checkbox } from '@mui/material';
import { Save, TransferWithinAStationSharp } from '@mui/icons-material';

import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const ChangeClassScreen = ({ allClass }: any) => {
  const [selectedStudent, setSelectedStudent] = useState<any>([]);
  const [columClass, setColumnClass] = useState<string>('');

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
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
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
        tableId="change-class-table"
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
      />
    </Box>
  );
};

export default ChangeClassScreen;

interface TableClassDropDownProps {
  allClass: Standards[];
  classes: string;

  onChange: (val: string | string[] | number | number[]) => void;
}

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
