'use client';

import React, { useState, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { ClearIcon } from '@mui/x-date-pickers';
import { GridSearchIcon } from '@mui/x-data-grid';
import {
  Box,
  Avatar,
  Button,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IStudentInfo } from '../type';
import type { IViewConcessionRequestProps } from '../../ConcessionAdmin/type';

interface ICombinedProps {
  data: any[];
  onRequestConcession?: (student: IStudentInfo) => void;
  onViewConcession?: (student: IViewConcessionRequestProps) => void;
  onViewAllConcession?: (student: IStudentInfo) => void;
}

const StudentConcessionTable: React.FC<ICombinedProps> = ({
  data,
  onRequestConcession,
  onViewConcession,
  onViewAllConcession,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {onRequestConcession && (
          <>
            <MenuItem
              onClick={() => {
                onRequestConcession(row as IStudentInfo);
                pop.onClose();
              }}
            >
              <Add />
              Request Concession
            </MenuItem>
            <MenuItem
              onClick={() => {
                onViewAllConcession?.(row as IStudentInfo);
                pop.onClose();
              }}
            >
              <Iconify icon={GlobalIcons.eye} />
              View Concession
            </MenuItem>
          </>
        )}
      </MenuList>
    ),
    [onRequestConcession, onViewAllConcession]
  );

  return (
    <>
      <Box display="flex" gap={2}>
        <TextField
          variant="outlined"
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            endAdornment: (
              <>
                {searchValue ? (
                  <IconButton
                    size="small"
                    sx={{ mr: '-12px', p: 1 }}
                    onClick={() => setSearchValue('')}
                  >
                    <ClearIcon />
                  </IconButton>
                ) : (
                  <IconButton size="small" sx={{ mr: '-12px', p: 1 }}>
                    <GridSearchIcon />
                  </IconButton>
                )}
              </>
            ),
          }}
          label="Search Student by Name, GR No, Class or Roll No"
          sx={{ width: '100%' }}
        />
        <Button onClick={() => {}} variant="contained" size="small" sx={{ marginTop: 0.5 }}>
          Search
        </Button>
      </Box>
      <CustomizableTable
        tableId="student-concession-table"
        noDataText="No student data found"
        columns={[
          {
            id: 'studentName',
            label: 'Student Name',
            align: 'left',
            sticky: true,
            minWidth: 150,
            render: (value, row) => (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar src={row.avatarUrl} alt={row.studentName} sx={{ width: 32, height: 32 }} />
                <Typography variant="body2">{row.studentName}</Typography>
              </Box>
            ),
          },
          {
            id: 'parentName',
            label: 'Parent Name',
            align: 'left',
            minWidth: 150,
          },
          {
            id: 'email',
            label: 'Email',
            align: 'left',
          },
          {
            id: 'contactNo',
            label: 'Contact No.',
            align: 'left',
          },
          {
            id: 'boardMedium',
            label: 'Board/Medium',
            align: 'left',
            minWidth: 120,
          },
          {
            id: 'classDivision',
            label: 'Class/Division',
            align: 'left',
            minWidth: 120,
          },
          {
            id: 'rollNo',
            label: 'Roll No.',
            align: 'left',
          },
          {
            id: 'grNo',
            label: 'GR No.',
            align: 'left',
          },
          {
            id: 'actions',
            label: 'Actions',
            align: 'left',
            isSort: false,
            isFilter: false,
            sticky: true,
            minWidth: 60,
            render: (value, row) => (
              <ThreeDotsActions
                showThreeDots={!!onRequestConcession}
                placement="right-center"
                showViewIcon={!!onViewConcession}
                handleViewClick={() => onViewConcession?.(row as IViewConcessionRequestProps)}
                actions={(prop) => (onRequestConcession ? actions({ ...prop, row }) : <></>)}
              />
            ),
          },
        ]}
        data={data || []}
      />
    </>
  );
};

export default StudentConcessionTable;
