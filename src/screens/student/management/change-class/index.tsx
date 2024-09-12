'use client';

import type { Standards } from 'src/types/school';

import React, { useState } from 'react';

import { Box, Button } from '@mui/material';
import { Save, TransferWithinAStationSharp } from '@mui/icons-material';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const ChangeClassScreen = ({ allClass }: any) => {
  const [columClass, setColumnClass] = useState<string>('');

  const [tableData, setTableData] = useState([
    { id: 1, srNo: 1, grNo: 'GR001', name: 'John Doe', division: 'A', class: '' },
    { id: 2, srNo: 2, grNo: 'GR002', name: 'Jane Smith', division: 'B', class: '' },
    { id: 3, srNo: 3, grNo: 'GR003', name: 'Alice Johnson', division: 'A', class: '' },
  ]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
        <Button startIcon={<Save />} variant="outlined">
          Save
        </Button>
        <Button startIcon={<TransferWithinAStationSharp />} variant="outlined">
          Promotion
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'srNo', label: 'Sr. No.' },
          { id: 'grNo', label: 'GR No.' },
          { id: 'name', label: 'Name' },
          { id: 'division', label: 'Division' },
          {
            id: 'class',
            label: 'Class',
            renderColumn(value) {
              return (
                <>
                  &nbsp;
                  <TableClassDropDown
                    allClass={allClass}
                    classes={columClass}
                    onChange={(val: string | string[]) => {
                      setColumnClass(val as string);
                      const newData = tableData.map((item) => ({
                        ...item,
                        class: val as string,
                      }));

                      setTableData(newData);
                    }}
                  />
                </>
              );
            },
            render(value, row) {
              return (
                <TableClassDropDown
                  allClass={allClass}
                  classes={value}
                  onChange={(val: string | string[]) => {
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

  onChange: (val: string | string[]) => void;
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
