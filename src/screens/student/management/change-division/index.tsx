'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Save } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const ChangeDivisionScreen = () => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const [columDivision, setColumnDivision] = useState<string>('');

  const [tableData, setTableData] = useState([
    { id: 1, srNo: 1, grNo: 'GR001', name: 'John Doe', division: '' },
    { id: 2, srNo: 2, grNo: 'GR002', name: 'Jane Smith', division: '' },
    { id: 3, srNo: 3, grNo: 'GR003', name: 'Alice Johnson', division: '' },
  ]);
  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });
  useEffect(() => {
    if (currentBoard?.id) {
      if (boardData) {
        setAllMediums(boardData?.educationMediums || []);
        setMedium(boardData?.educationMediums?.[0]?.id || '');
      } else {
        getBoard(currentBoard.id);
      }
    } else {
      setAllMediums([]);
      setMedium('');
    }
  }, [boardData, currentBoard?.id, getBoard]);

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  useEffect(() => {
    setAllOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages || []
    );
    setOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages?.[0]?.id || ''
    );
  }, [medium, allMediums]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Change Division"
        links={[{ name: 'Student' }, { name: 'Student Management' }, { name: 'Change Division' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap">
        <CustomSelect
          options={allMediums}
          label="Medium"
          value={medium}
          onChange={(val: string | string[]) => {
            setMedium(val as string);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val: string | string[]) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val: string | string[]) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!organization}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val: string | string[]) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
        />
      </Box>
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
            label: 'Division',
            renderColumn(value) {
              return (
                <>
                  &nbsp;
                  <TableDivisionDropDown
                    allDivision={allDivision}
                    division={columDivision}
                    onChange={(val: string | string[]) => {
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
                  onChange={(val: string | string[]) => {
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

  onChange: (val: string | string[]) => void;
}

const TableDivisionDropDown = ({
  allDivision,
  division,

  onChange,
}: TableDivisionDropDownProps) => (
  <CustomSelect
    options={allDivision}
    label="Division"
    value={division}
    onChange={onChange}
    labelKey="name"
    valueKey="id"
    formControlProps={{ sx: { width: '150px', textAlign: 'left' } }}
    onClick={(e) => e.stopPropagation()}
  />
);
