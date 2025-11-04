import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Button, Typography, DialogActions } from '@mui/material';
import { useGetAvailableRoutesQuery } from 'src/redux/transport/vehicle-management/route-management-api';

interface Student {
  grNo: string;
  name: string;
  class: string;
  division: string;
  stop: string;
  pickupTime: string;
  contactNo: string;
  status: 'Active' | 'Inactive';
}

interface ViewStudentsProps {
  open: boolean;
  onClose: () => void;
  routeData?: any;
}

const ViewStudents: React.FC<ViewStudentsProps> = ({ open, onClose, routeData }) => {
  const { data: mockStudentsData, isLoading: isStudentDataLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAvailableRoutesQuery,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="lg"
      fullWidth
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h5">Assigned Students</Typography>
          <CustomTooltip
            arrow
            placement="right"
            sx={{ textAlign: 'justify' }}
            title="This modal displays all students assigned to a particular route."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
    >
      <Scrollbar sx={{ height: '300px', p: 2 }}>
        <CustomizableTable
          tableId="assigned-students-table"
          noDataText="No Students Found"
          isLoading={isStudentDataLoading}
          columns={[
            {
              id: 'grNo',
              label: 'GR No.',
              align: 'left',
              minWidth: '100px',
              sticky: true,
            },
            {
              id: 'name',
              label: 'Name',
              align: 'left',
              minWidth: '150px',
            },
            {
              id: 'class',
              label: 'Class',
              align: 'left',
              minWidth: '80px',
            },
            {
              id: 'division',
              label: 'Division',
              align: 'left',
              minWidth: '100px',
            },
            {
              id: 'stop',
              label: 'Stop',
              align: 'left',
              minWidth: '130px',
            },
            {
              id: 'pickupTime',
              label: 'Pickup Time',
              align: 'left',
              minWidth: '120px',
            },
            {
              id: 'contactNo',
              label: 'Contact No.',
              align: 'left',
              minWidth: '140px',
            },
            {
              id: 'status',
              label: 'Status',
              align: 'left',
              minWidth: '100px',
              sticky: true,
              filterType: 'enum',
              enumOptions: [
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
              ],
              render(value) {
                return (
                  <Label
                    variant="soft"
                    color={getStatusColor(value) as any}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {value}
                  </Label>
                );
              },
            },
          ]}
          data={mockStudentsData || []}
        />
      </Scrollbar>
      {/* Footer with Cancel button */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<Iconify icon="material-symbols:close" />}
          size="small"
        >
          Cancel
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default ViewStudents;
