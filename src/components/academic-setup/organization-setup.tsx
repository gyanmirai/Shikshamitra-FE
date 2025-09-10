'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import { getBase64String } from 'src/utils/get-base64-string';
import { convertBase64Format } from 'src/utils/base64Formate';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  Tab,
  Box,
  Tabs,
  Stack,
  Button,
  MenuList,
  MenuItem,
  TextField,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  useGetOrganizationQuery,
  useAddOrganizationMutation,
  useDeleteOrganizationMutation,
  useUpdateOrganizationMutation,
} from 'src/redux/oraganization/oraganization';

import { Iconify } from '../iconify';
import ClassSetup from './class-setup';
import CustomDialog from '../customDialog';
import UploadButton from '../upload-button';
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

interface IOrganizationForm {
  handleClose: () => void;
  editData: null | Record<string, any>;
  mediumId: string;
}
export const OrganizationForm = ({ handleClose, editData, mediumId }: IOrganizationForm) => {
  const confirm = useBoolean();
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

  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      organization: editData ? editData.name : '',
      banner: editData ? editData?.bannerPicture : null,
    },
    validationSchema: Yup.object().shape({
      organization: Yup.string().required('Organization is required'),
    }),
    onSubmit: async (values) => {
      confirm.onTrue();
    },
  });
  const onSubmit = async () => {
    try {
      if (editData) {
        await updateOrganization({
          id: editData.id,
          body: {
            name: formik.values.organization,
            educationMediumId: mediumId,
            bannerPicture: formik.values.banner,
          },
        }).unwrap();
      } else {
        await addOrganization({
          name: formik.values.organization,
          educationMediumId: mediumId,
          bannerPicture: formik.values.banner,
        }).unwrap();
      }
      dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };
  console.log(formik.values.banner || '');
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
        }}
        title={`${editData ? 'Update Organization' : 'Create Organization'}`}
        content={
          <>
            {' '}
            Are you sure you want to {editData ? 'Update' : 'Create '}{' '}
            {editData ? (
              editData.name === formik.values.organization ? (
                ''
              ) : (
                <>
                  <b>{editData.name}</b> to <b>{formik.values.organization}</b>
                </>
              )
            ) : (
              <b>{formik.values.organization}</b>
            )}{' '}
            Medium ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading || isUpdateLoading}
            // color="error"
            onClick={onSubmit}
          >
            Confirm
          </LoadingButton>
        }
      />
      <Stack spacing={2} direction="column" p={2}>
        <TextField
          fullWidth
          id="board"
          name="organization"
          label="Organization Name"
          autoFocus
          value={formik.values.organization}
          onChange={(e) => {
            const newName = capitalize(e.target.value);
            formik.setFieldValue('organization', newName);
          }}
          error={formik.touched.organization && Boolean(formik.errors.organization)}
          // @ts-ignore
          helperText={formik.touched.organization && formik.errors.organization}
          size="small"
        />
        <UploadButton
          variant="outlined"
          onChange={async (e) => {
            const base64: string = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.readAsDataURL(e.target.files[0]);
              reader.onload = () => {
                resolve(reader.result as string);
              };
            });
            formik.setFieldValue('banner', getBase64String(base64));
          }}
        >
          Upload Banner
        </UploadButton>
        {formik.values.banner && (
          <Box
            component="img"
            src={convertBase64Format(formik.values.banner)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '5px',
            }}
          />
        )}
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
      </Stack>
    </Box>
  );
};
