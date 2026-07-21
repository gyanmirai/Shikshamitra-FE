'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Chip,
  Button,
  Switch,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { CurriculumForm } from './components/CurriculumForm';
import { useCurriculumOverview } from './hooks/useCurriculumOverview';

const CurriculumOverview = (props: TabComponentType) => {
  const { setSearchParams } = props;
  const {
    curriculumTableData,
    selectedCurriculum,
    isEdit,
    open,
    pendingStatusChange,
    confirmPublishDialog,
    handleCloseDialog,
    handleEditCurriculum,
    confirmStatusChange,
    handleSubmit,
    handleStatusChange,
    handleOpenAdd,
  } = useCurriculumOverview();

  /**
   * Memoization Justification:
   * Prevents re-creating table column definitions on every render.
   * Ensures stable render functions for cells, avoiding unexpected switch/chip resets.
   */
  const columns = useMemo(
    () => [
      { id: 'className', label: 'Class', minWidth: '100px', align: 'left' as const },
      { id: 'curriculumName', label: 'Curriculum Name', minWidth: '200px', align: 'left' as const },
      {
        id: 'startDate',
        label: 'Start Date',
        minWidth: '130px',
        align: 'left' as const,
        render: (value: any) => (
          <Typography fontSize="12px" gutterBottom>
            {dayjs(value).format('DD MMM YYYY')}
          </Typography>
        ),
      },
      {
        id: 'endDate',
        label: 'End Date',
        minWidth: '130px',
        align: 'left' as const,
        render: (value: any) => (
          <Typography fontSize="12px" gutterBottom>
            {dayjs(value).format('DD MMM YYYY')}
          </Typography>
        ),
      },
      {
        id: 'subjects',
        label: 'Subjects',
        render: (value: any, row: any) =>
          row.subjects.map((subj: any, index: number) => (
            <Chip
              key={`${subj.name}-${index}`}
              size="small"
              label={subj.name}
              variant="outlined"
              sx={{ m: 0.1 }}
            />
          )),
      },
      {
        id: 'status',
        label: 'Publish',
        render: (value: string, row: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch
              size="small"
              checked={value === 'Publish'}
              onChange={() => handleStatusChange(row.id, value)}
            />
          </Box>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        isSort: false,
        render: (value: any, row: any) => (
          <ThreeDotsActions
            placement="right-top"
            showEditIcon
            showThreeDots={false}
            handleEditClick={() => handleEditCurriculum(row)}
          />
        ),
      },
    ],
    [handleStatusChange, handleEditCurriculum]
  );

  return (
    <Box>
      {open ? (
        <>
          <CustomBreadcrumbs
            sx={{ mb: 1 }}
            heading="Curriculum Overview"
            links={[
              { name: 'Academics' },
              { name: 'Curriculum' },
              { name: 'Curriculum Overview' },
              { name: 'Curriculum Form' },
            ]}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={handleCloseDialog}
              >
                Back
              </Button>
            }
          />
          <CurriculumForm
            setSearchParams={setSearchParams}
            onSubmit={handleSubmit}
            onClose={handleCloseDialog}
            isEdit={isEdit}
            data={selectedCurriculum}
          />
        </>
      ) : (
        <>
          <CustomBreadcrumbs
            sx={{ mb: 1 }}
            heading="Curriculum Overview"
            links={[{ name: 'Academics' }, { name: 'Curriculum' }, { name: 'Curriculum Overview' }]}
            action={
              <Button startIcon={<Add />} variant="contained" size="small" onClick={handleOpenAdd}>
                Curriculum
              </Button>
            }
          />
          <CustomizableTable
            tableId="curriculum-overview-table"
            columns={columns}
            data={curriculumTableData}
          />
        </>
      )}

      <CustomDialog
        title="Confirm Publication"
        open={confirmPublishDialog.value}
        handleClose={confirmPublishDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.newValue === 'Publish' ? 'Publish' : 'Unpublish'}{' '}
            this Subject?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default CurriculumOverview;
