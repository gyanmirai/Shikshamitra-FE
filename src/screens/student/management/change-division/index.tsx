'use client';

import type { Division } from 'src/types/school';

import React, { useState } from 'react';

import { Save } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const ChangeDivisionScreen = ({ allDivision }: any) => {
  const [columDivision, setColumnDivision] = useState<string>('');

  const [tableData, setTableData] = useState([
    { id: 1, srNo: 1, grNo: 'GR001', name: 'John Doe', division: '' },
    { id: 2, srNo: 2, grNo: 'GR002', name: 'Jane Smith', division: '' },
    { id: 3, srNo: 3, grNo: 'GR003', name: 'Alice Johnson', division: '' },
  ]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
        <Button startIcon={<Save />} variant="outlined">
          Save
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'srNo', label: 'Sr. No.' },
          { id: 'grNo', label: 'GR No.' },
          { id: 'name', label: 'Name' },
          {
            id: 'division',
            label: '',
            isSort: false,
            renderColumn(value) {
              return (
                <>
                  &nbsp;
                  <TableDivisionDropDown
                    allDivision={allDivision}
                    division={columDivision}
                    onChange={(val) => {
                      setColumnDivision(val as string);
                      const newData = tableData.map((item) => ({
                        ...item,
                        division: val as string,
                      }));

                      setTableData(newData);
                    }}
                  />
                </>
              );
            },
            render(value, row) {
              return (
                <TableDivisionDropDown
                  allDivision={allDivision}
                  division={value}
                  onChange={(val) => {
                    const newData = tableData.map((item) => {
                      if (item.id === row.id) {
                        return {
                          ...item,
                          division: val as string,
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

export default ChangeDivisionScreen;

interface TableDivisionDropDownProps {
  allDivision: Division[];
  division: string;

  onChange: (val: string | string[] | number | number[]) => void;
}

const TableDivisionDropDown = ({
  allDivision,
  division,

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
