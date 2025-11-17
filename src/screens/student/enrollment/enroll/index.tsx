'use client';

import { toast } from 'sonner';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Button, Checkbox, MenuItem, MenuList, DialogActions } from '@mui/material';

interface Data {
  tempGR: string;
  name: string;
  class: string;
  batch: string;
  enrollmentDate: string;
  status: string;
  action: string;
  division: string;
}

const data: Data[] = [
  {
    tempGR: 'TG001',
    name: 'John Doe',
    class: '10th',
    batch: '2023-24',
    enrollmentDate: '2023-08-15',
    status: 'Active',
    action: 'Edit',
    division: 'A',
  },
  {
    tempGR: 'TG004',
    name: 'John Doe1',
    class: '10th',
    batch: '2023-24',
    enrollmentDate: '2023-08-15',
    status: 'Active',
    action: 'Edit',
    division: '-',
  },
  {
    tempGR: 'TG002',
    name: 'Jane Smith',
    class: '9th',
    batch: '2023-24',
    enrollmentDate: '2023-08-14',
    status: 'Pending',
    action: 'Edit',
    division: '-',
  },
  {
    tempGR: 'TG003',
    name: 'Mike Johnson',
    class: '11th',
    batch: '2023-24',
    enrollmentDate: '2023-08-16',
    status: 'Active',
    action: 'Edit',
    division: 'B',
  },
];

const EnrollScreen = () => {
  const dialog = useBoolean();
  const [selectedItem, setSelectedItem] = useState<Data[]>([]);
  const actions = useCallback(
    ({ popover: pop }: any, row: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              //   confirm.onTrue();
              pop.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="material-symbols:person-cancel" sx={{ height: '20px', width: '20px' }} />
            Reject
          </MenuItem>

          <MenuItem
            onClick={() => {
              //   modal.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon="line-md:confirm-circle-filled" sx={{ height: '20px', width: '20px' }} />
            Confirm
          </MenuItem>
          <MenuItem
            onClick={() => {
              dialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify
              icon="material-symbols:assignment-add"
              sx={{ height: '20px', width: '20px' }}
            />
            Assign Division
          </MenuItem>
        </MenuList>
      </>
    ),
    [dialog]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Enrollment"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Enrollment' }]}
        sx={{ mb: 2 }}
        action={
          <Button
            size="small"
            variant="contained"
            disabled={!selectedItem.length}
            onClick={dialog.onTrue}
          >
            {' '}
            Assign Division{' '}
          </Button>
        }
      />
      <CustomizableTable
        tableId="student-enrollment-enroll-table"
        columns={[
          {
            id: 'checkBox',
            label: '',
            isSort: false,
            minWidth: 30,
            renderColumn(value) {
              return (
                <Checkbox
                  checked={selectedItem.length === data.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const isEveryStudentClassSame = data.every(
                        (item) => item.class === data[0].class
                      );
                      if (isEveryStudentClassSame) {
                        setSelectedItem(data);
                      } else {
                        toast.error('All students must be of same class');
                      }
                    } else {
                      setSelectedItem([]);
                    }
                  }}
                />
              );
            },
            render(value, row) {
              return (
                <Checkbox
                  checked={selectedItem.some((item) => item.tempGR === row.tempGR)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const isEveryStudentClassSame = selectedItem.length
                        ? selectedItem.every((item) => item.class === row.class)
                        : true;
                      if (isEveryStudentClassSame) {
                        setSelectedItem((pre) => [...pre, row as Data]);
                      } else {
                        toast.error('Selected students must be of same class');
                      }
                    } else {
                      setSelectedItem((pre) => pre.filter((item) => item.tempGR !== row.tempGR));
                    }
                  }}
                />
              );
            },
          },
          { id: 'tempGR', label: 'Temp GR' },
          { id: 'name', label: 'Name' },
          { id: 'class', label: 'Class' },
          { id: 'division', label: 'Division' },
          { id: 'batch', label: 'Batch' },
          { id: 'enrollmentDate', label: 'Enrollment Date' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return <Label color={value === 'Active' ? 'success' : 'warning'}>{value}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions placement="right-top" actions={(prop) => actions(prop, row)} />
              );
            },
          },
        ]}
        data={data}
      />{' '}
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Assign Division">
        <Box sx={{ p: 2, bgcolor: 'Background.neutral' }}>
          <CustomSelect
            options={[]}
            value=""
            onChange={() => {}}
            label="Division"
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
        </Box>
        <DialogActions>
          <Button onClick={dialog.onFalse}>Cancel</Button>
          <Button onClick={dialog.onFalse} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default EnrollScreen;
