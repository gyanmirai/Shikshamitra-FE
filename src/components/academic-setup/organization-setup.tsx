'use client';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Tab, Box, Tabs, Button, MenuList, MenuItem, CircularProgress } from '@mui/material';
import {
  useGetOrganizationQuery,
  useDeleteOrganizationMutation,
} from 'src/redux/oraganization/oraganization';

import { Iconify } from '../iconify';
import ClassSetup from './class-setup';
import CustomDialog from '../customDialog';
import { OrganizationForm } from './stage-form';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';

export { OrganizationForm } from './stage-form';

export interface IOrganizationSetup {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  educationMediumId: string;
  name: string;
}
interface OrganizationSetupProps {
  mediumId: string;
}

const OrganizationSetup = ({ mediumId }: OrganizationSetupProps) => {
  const { data: organizations, isLoading: isGetLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationQuery,
  });
  const [deleteOrganization, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteOrganizationMutation,
    popupConfig: {
      success: true,
      successMessage: 'Organization deleted Successfully',
    },
  });

  const [currentTabs, setCurrentTabs] = useState<IOrganizationSetup[]>([]);
  const [editData, setEditData] = useState<null | IOrganizationSetup>(null);
  const tabs = useTabs('');
  const modal = useBoolean(false);
  const confirm = useBoolean(false);

  const isInitial = useRef(mediumId);
  useEffect(() => {
    if (organizations?.items) {
      const medium = organizations?.items?.filter(
        (i: IOrganizationSetup) => i.educationMediumId === mediumId
      );
      setCurrentTabs(medium || []);
      if (isInitial.current !== mediumId) {
        tabs.setValue(medium?.[0]?.id);
      }
      isInitial.current = mediumId;
    }
  }, [mediumId, organizations?.items, tabs]);

  const handelAdd = async () => {
    modal.onTrue();
  };

  // const handleSetTeb = (value: Record<string, any>) => {
  //   tabs.setValue(value?.data?.id);
  // };

  const onCloseDialog = () => {
    modal.onFalse();
    setEditData(null);
  };

  const actions = useCallback(
    ({ popover }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            modal.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
      </MenuList>
    ),
    [confirm, modal]
  );

  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            onClick={async () => {
              await deleteOrganization(editData?.id || '');
              confirm.onFalse();
              setEditData(null);
              // isInitial.current = true;
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomDialog
        title={editData ? 'Update Organization' : 'Create Organization'}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        <OrganizationForm mediumId={mediumId} handleClose={onCloseDialog} editData={editData} />
      </CustomDialog>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        boxShadow="var(--shadows-4)"
        py={currentTabs.length ? 0 : 1}
      >
        <Box flexGrow={1} display="flex" alignItems="center">
          {!isGetLoading ? (
            currentTabs.length > 0 && (
              <Tabs
                value={tabs.value}
                onChange={tabs.onChange}
                sx={{
                  mb: 2,
                  '& .MuiTabs-flexContainer': { gap: 2 },
                  flexGrow: 1,
                }}
              >
                {currentTabs.map((tab: IOrganizationSetup) => (
                  <Tab
                    // sx={{ fontSize: '12px' }}
                    key={tab.id}
                    label={
                      <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                        {tab.name}
                        <ThreeDotsActions
                          onClickThreeDots={() => setEditData(tab)}
                          actions={actions}
                        />
                      </Box>
                    }
                    // icon={tab.icon}
                    value={tab.id}
                  />
                ))}
              </Tabs>
            )
          ) : (
            <CircularProgress size={20} />
          )}
        </Box>

        <Button variant="outlined" startIcon={<Add />} size="small" onClick={handelAdd}>
          Organization
        </Button>
      </Box>
      {tabs.value && <ClassSetup organizationId={tabs.value} />}
    </Box>
  );
};

export default OrganizationSetup;
