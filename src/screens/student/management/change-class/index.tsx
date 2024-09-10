'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Save, TransferWithinAStationSharp } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const ChangeClassScreen = () => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [columClass, setColumnClass] = useState<string>('');

  const [tableData, setTableData] = useState([
    { id: 1, srNo: 1, grNo: 'GR001', name: 'John Doe', division: 'A', class: '' },
    { id: 2, srNo: 2, grNo: 'GR002', name: 'Jane Smith', division: 'B', class: '' },
    { id: 3, srNo: 3, grNo: 'GR003', name: 'Alice Johnson', division: 'A', class: '' },
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

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Change Class"
        links={[{ name: 'Student' }, { name: 'Student Management' }, { name: 'Change Class' }]}
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
      </Box>
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
    options={allClass}
    label="Class"
    value={classes}
    onChange={onChange}
    labelKey="name"
    valueKey="id"
    formControlProps={{ sx: { width: '150px', textAlign: 'left' } }}
    onClick={(e) => e.stopPropagation()}
  />
);
