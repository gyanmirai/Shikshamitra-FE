'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { channelLabel } from 'src/redux/communication/communicationMappers';
import {
  useGetProviderSettingsQuery,
  useDeleteProviderSettingMutation,
} from 'src/redux/communication/setting/deliveryChannelApi';

import DeliveryChannelTable from './Components/DelieveryChannelTypeTable';
import DeliveryChannelTypeForm from './Components/DeliveryChannelTypeForm';

import type { IProviderSetting } from './type';

const DeliveryChannelTypeCreation = () => {
  const deleteDialog = useBoolean();
  const addDialog = useBoolean();
  const { data: providerSettings, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetProviderSettingsQuery,
    params: { maxResultCount: 200 },
  });
  const [deleteProviderSetting, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteProviderSettingMutation,
  });

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedProviderSetting, setSelectedProviderSetting] = useState<IProviderSetting | null>(
    null
  );
  const dispatch = useDispatch();

  const resetState = () => {
    setTimeout(() => {
      setSelectedProviderSetting(null);
      dispatch(setIsChanges(false));
    }, 200);
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addDialog.onFalse();
      setTimeout(() => {
        setSelectedProviderSetting(null);
      }, 200);
    }
  };

  const handleDelete = async () => {
    if (!selectedProviderSetting) {
      return;
    }

    try {
      await deleteProviderSetting(selectedProviderSetting.id).unwrap();
      shikshaMitraToast.success({
        message: `${selectedProviderSetting.providerName} provider setting deleted successfully`,
      });
    } catch (error: any) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Failed to delete provider setting',
      });
    } finally {
      setSelectedProviderSetting(null);
      deleteDialog.onFalse();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Provider Settings"
        description="Manage channel providers, sender IDs, compliance requirements, fallback order, quotas, and provider status for Communication."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Settings', href: '/communication/setting' },
          { name: 'Provider Settings', href: '/communication/settings/deliveryChannelType' },
        ]}
        action={
          <Button
            onClick={() => addDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Provider Setting
          </Button>
        }
        sx={{ px: 1 }}
      />

      <DeliveryChannelTable
        onDelete={(data) => {
          setSelectedProviderSetting(data);
          deleteDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedProviderSetting(data);
          addDialog.onTrue();
        }}
        onAddProvider={addDialog}
        setEditData={setSelectedProviderSetting}
        data={providerSettings?.items || []}
        isLoading={isLoading}
      />

      <CustomDialog
        open={addDialog.value}
        handleClose={() => handleClose(null, false)}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedProviderSetting ? 'Update Provider Setting' : 'Add Provider Setting'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedProviderSetting
                  ? 'Update provider configuration and compliance controls.'
                  : 'Create a provider setting for WhatsApp, SMS, email, or in-app delivery.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <DeliveryChannelTypeForm
          open={addDialog}
          onClose={handleClose}
          editData={selectedProviderSetting}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedProviderSetting(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete{' '}
            <strong>
              {selectedProviderSetting?.providerName} (
              {channelLabel(selectedProviderSetting?.channel)})
            </strong>
            ?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            disabled={isDeleteLoading}
            onClick={handleDelete}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default DeliveryChannelTypeCreation;
