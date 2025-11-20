import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { useGetZoneBasedFeeDataQuery } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import AddZoneForm from './AddZoneForm';

interface IZoneData {
  zoneName: string;
  feeAmount: number;
  assignedStops: number;
  color?: string;
}

interface ZoneBasedModelProps {
  formik: any;
}

const ZoneBasedModel: React.FC<ZoneBasedModelProps> = ({ formik }) => {
  const addZone = useBoolean();
  const deleteZone = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const [editData, setEditData] = useState<IZoneData | null>(null);
  const [selectedZone, setSelectedZone] = useState<IZoneData | null>(null);

  const { isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetZoneBasedFeeDataQuery,
  });

  // Sync API data to Formik on initial load
  // useEffect(() => {
  //   if (zoneBasedFeeData && Array.isArray(zoneBasedFeeData)) {
  //     formik.setFieldValue('zones', zoneBasedFeeData);
  //   }
  // }, [zoneBasedFeeData]);

  // ---------------------- Handlers ----------------------

  const handleEdit = (row: IZoneData) => {
    setEditData(row);
    addZone.onTrue();
  };

  const handleDelete = (row: IZoneData) => {
    setSelectedZone(row);
    deleteZone.onTrue();
  };

  const handleDeleteConfirm = () => {
    const updatedZones = (formik.values.zones || []).filter(
      (z: IZoneData) => z.zoneName !== selectedZone?.zoneName
    );
    formik.setFieldValue('zones', updatedZones);
    deleteZone.onFalse();
    setSelectedZone(null);
    shikshaMitraToast.success({
      message: `Zone: ${selectedZone?.zoneName} deleted successfully`,
    });
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addZone.onFalse();
      setEditData(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addZone.onFalse();
      setEditData(null);
    }
  };

  const handleZoneSubmit = (newZone: IZoneData) => {
    const existingZones = formik.values.zones || [];

    if (editData) {
      // Update existing zone
      const updatedZones = existingZones.map((z: IZoneData) =>
        z.zoneName === editData.zoneName ? newZone : z
      );
      formik.setFieldValue('zones', updatedZones);
    } else {
      // Add new zone
      formik.setFieldValue('zones', [...existingZones, newZone]);
    }

    addZone.onFalse();
    setEditData(null);
    dispatch(setIsChanges(false));
  };

  // ---------------------- Render ----------------------

  return (
    <>
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="primary">
            Configure Zone-Based Model
          </Typography>
          <Button
            startIcon={<Add />}
            variant="contained"
            size="small"
            onClick={() => {
              setEditData(null);
              addZone.onTrue();
            }}
          >
            Zone
          </Button>
        </Box>

        <CustomizableTable
          tableId="zone-based-fee-table"
          isLoading={isLoading}
          noDataText={
            <>
              No Zone data found
              <Box
                onClick={() => {
                  addZone.onTrue();
                  setEditData(null);
                }}
                color="primary.main"
                fontWeight={600}
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Add New Zone
              </Box>
            </>
          }
          columns={[
            {
              id: 'zoneName',
              label: 'Zone Name',
              align: 'left',
              render: (value, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SubjectColorIndicator color={row.color} />
                  <Typography variant="caption" fontSize="13px">
                    {value}
                  </Typography>
                </Box>
              ),
            },
            {
              id: 'feeAmount',
              label: 'Fee Amount (₹)',
              align: 'left',
              filterType: 'number',
              render(value) {
                return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
              },
            },
            {
              id: 'assignedStops',
              label: 'Assigned Stops',
              align: 'left',
              filterType: 'number',
              render: (value) => `${value} stops`,
            },
            {
              id: 'action',
              label: 'Actions',
              align: 'left',
              isSort: false,
              isFilter: false,
              sticky: true,
              minWidth: 80,
              render: (value, row) => (
                <ThreeDotsActions
                  showThreeDots={false}
                  showEditIcon
                  handleEditClick={() => handleEdit(row as IZoneData)}
                  showDeleteIcon
                  handleDeleteClick={() => handleDelete(row as IZoneData)}
                />
              ),
            },
          ]}
          data={formik.values.zones || []}
        />
      </Box>

      {/* Add/Edit Zone Modal */}
      <CustomDialog
        open={addZone.value}
        handleClose={() => handleClose(null, false)}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{editData ? 'Edit Zone' : 'Add New Zone'}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal is used to create a new transport zone by entering the zone name, specifying the fee amount, selecting the stops that belong to this zone, and assigning a color for easy identification."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AddZoneForm
          open={addZone}
          onClose={handleClose}
          editData={editData}
          onSubmit={handleZoneSubmit}
        />
      </CustomDialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteZone.value}
        onClose={() => {
          setSelectedZone(null);
          deleteZone.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete zone <strong>{selectedZone?.zoneName}</strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" size="small" onClick={handleDeleteConfirm}>
            Yes
          </Button>
        }
      />
    </>
  );
};

export default ZoneBasedModel;
