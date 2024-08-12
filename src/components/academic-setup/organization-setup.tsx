'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Tab,
  Box,
  Tabs,
  Button,
  MenuList,
  MenuItem,
  TextField,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetOrganizationQuery,
  useAddOrganizationMutation,
  useDeleteOrganizationMutation,
  useUpdateOrganizationMutation,
} from 'src/redux/oraganization/oraganization';

import { Iconify } from '../iconify';
import ClassSetup from './class-setup';
import CustomDialog from '../customDialog';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';

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

  const handleSetTeb = (value: Record<string, any>) => {
    tabs.setValue(value?.data?.id);
  };

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
        content="Are you sure want to delete?"
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
            Delete
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
                    sx={{ fontSize: '12px' }}
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

interface IOrganizationForm {
  handleClose: () => void;
  editData: null | Record<string, any>;
  mediumId: string;
}
export const OrganizationForm = ({ handleClose, editData, mediumId }: IOrganizationForm) => {
  const [addOrganization, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddOrganizationMutation,
    popupConfig: {
      success: true,
      successMessage: 'Organization added Successfully',
    },
  });
  const [updateOrganization, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateOrganizationMutation,
    popupConfig: {
      success: true,
      successMessage: 'Organization updated Successfully',
    },
  });

  const formik = useFormik({
    initialValues: {
      organization: editData ? editData.name : '',
    },
    validationSchema: Yup.object().shape({
      organization: Yup.string().required('Organization is required'),
    }),
    onSubmit: async (values) => {
      if (editData) {
        const res = await updateOrganization({
          id: editData.id,
          body: {
            name: values.organization,
            educationMediumId: mediumId,
          },
        });
      } else {
        const res = await addOrganization({
          name: values.organization,
          educationMediumId: mediumId,
        });
      }
      handleClose();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} p={2}>
      <TextField
        fullWidth
        id="board"
        name="organization"
        label="Organization Name"
        value={formik.values.organization}
        onChange={formik.handleChange}
        error={formik.touched.organization && Boolean(formik.errors.organization)}
        // @ts-ignore
        helperText={formik.touched.organization && formik.errors.organization}
        size="small"
      />
      <DialogActions>
        <Button variant="outlined" size="small" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading || isUpdateLoading}
          type="submit"
          variant="contained"
          size="small"
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
