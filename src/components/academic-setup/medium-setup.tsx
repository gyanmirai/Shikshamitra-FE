'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import { useRef, useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
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

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetMediumQuery,
  useAddMediumMutation,
  useDeleteMediumMutation,
  useUpdateMediumMutation,
} from 'src/redux/medium/mediumApi';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';
import { CustomStyling } from '../tree-view/custom-styling';

export interface EducationMedium {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  educationBoardId: string;
  standards: any[];
}

interface MediumSetupProps {
  boardId: string | number;
}

const MediumSetup = ({ boardId }: MediumSetupProps) => {
  const { data: mediums, isLoading: isGetLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMediumQuery,
  });
  const [deleteMedium, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteMediumMutation,
    popupConfig: {
      success: true,
      successMessage: 'Medium deleted Successfully',
    },
  });

  const [currentTabs, setCurrentTabs] = useState<EducationMedium[]>([]);
  const [editData, setEditData] = useState<null | EducationMedium>(null);
  const tabs = useTabs('');
  const modal = useBoolean(false);
  const confirm = useBoolean(false);

  const isInitial = useRef(boardId);
  useEffect(() => {
    if (mediums?.items) {
      const medium = mediums?.items?.filter((i: EducationMedium) => i.educationBoardId === boardId);
      setCurrentTabs(medium || []);
      if (isInitial.current !== boardId) {
        tabs.setValue(medium?.[0]?.id);
      }
      isInitial.current = boardId;
    }
  }, [boardId, mediums?.items, tabs]);

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
        content="Are you sure you want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            onClick={async () => {
              await deleteMedium(editData?.id || '');
              confirm.onFalse();
              tabs.setValue('');
              setEditData(null);
              // isInitial.current = true;
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomDialog
        title={editData ? 'Update Medium' : 'Create Medium'}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        <MediumForm boardId={boardId} handleClose={onCloseDialog} editData={editData} />
      </CustomDialog>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        boxShadow="var(--shadows-4)"
        py={currentTabs.length ? 0 : 1}
      >
        <Box flexGrow={1} display="flex" alignItems="center" maxWidth="85%" width="100%">
          {!isGetLoading ? (
            currentTabs.length > 0 && (
              <Tabs
                value={tabs.value}
                onChange={tabs.onChange}
                sx={{
                  mb: 2,
                  px: 2,
                  '& .MuiTabs-flexContainer': { gap: 2 },
                  flexGrow: 1,
                }}
              >
                {currentTabs.map((tab: EducationMedium) => (
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

        <Button
          sx={{ maxWidth: '15%', width: '100%' }}
          variant="outlined"
          startIcon={<Add />}
          size="small"
          onClick={handelAdd}
        >
          Medium
        </Button>
      </Box>
      {/* {tabs.value && (
        <CustomAcademicTable
          id={tabs.value}
          deleteMutation={useDeleteOrganizationMutation}
          formComp={({ editData: data, onCloseDialog: handleClose, id }: any) => (
            <OrganizationForm editData={data} handleClose={handleClose} mediumId={id} />
          )}
          getLazyQuery={useLazyGetMediumByIdQuery}
          name="Organization"
          dataKey="educationMediumStages"
          isParent
          children={{
            id: 'class',
            name: 'Class',
            limitOfAge: 'ageLowerLimit',
            deleteMutation: useDeleteClassMutation,
            getLazyQuery: useLazyGetOrganizationByIdQuery,
            formComp: ({ editData: data, onCloseDialog: handleClose, id }: any) => (
              <ClassForm editData={data} handleClose={handleClose} organizationId={id} />
            ),
            dataKey: 'standards',
            children: {
              id: 'division',
              name: 'Division',
              deleteMutation: useDeleteDivisionMutation,
              getLazyQuery: useLazyGetClassByIdQuery,
              formComp: ({ editData: data, onCloseDialog: handleClose, id }: any) => (
                <DivisionForm editData={data} handleClose={handleClose} classId={id} />
              ),
              dataKey: 'divisions',
            },
          }}
        />
      )} */}
      <CustomStyling />
    </Box>
  );
};

export default MediumSetup;

interface IMediumForm {
  handleClose: () => void;
  editData: null | Record<string, any>;
  boardId: string | number;
}
export const MediumForm = ({ handleClose, editData, boardId }: IMediumForm) => {
  const confirm = useBoolean();
  const [addMedium, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddMediumMutation,
    popupConfig: {
      success: true,
      successMessage: 'Medium added Successfully',
    },
  });
  const [updateMedium, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateMediumMutation,
    popupConfig: {
      success: true,
      successMessage: 'Medium updated Successfully',
    },
  });

  const formik = useFormik({
    initialValues: {
      medium: editData ? editData.name : '',
    },
    validationSchema: Yup.object().shape({
      medium: Yup.string().required('Medium is required'),
    }),
    onSubmit: (values) => {
      confirm.onTrue();
    },
  });

  const onSubmit = async () => {
    try {
      if (editData) {
        const res = await updateMedium({
          id: editData.id,
          body: {
            name: formik.values.medium,
            educationBoardId: boardId,
          },
        }).unwrap();
      } else {
        const res = await addMedium({
          name: formik.values.medium,
          educationBoardId: boardId,
        }).unwrap();
      }
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
        }}
        title={`${editData ? 'Update Medium' : 'Create Medium'}`}
        content={
          <>
            {' '}
            Are you sure you want to {editData ? 'Update' : 'Create '}{' '}
            {editData ? (
              editData.name === formik.values.medium ? (
                ''
              ) : (
                <>
                  <b>{editData.name}</b> to <b>{formik.values.medium}</b>
                </>
              )
            ) : (
              <b>{formik.values.medium}</b>
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
          id="medium"
          name="medium"
          label="Medium Name"
          autoFocus
          value={formik.values.medium}
          onChange={(e) => {
            const newName = capitalize(e.target.value);
            formik.setFieldValue('medium', newName);
          }}
          error={formik.touched.medium && Boolean(formik.errors.medium)}
          // @ts-ignore
          helperText={formik.touched.medium && formik.errors.medium}
          size="small"
        />
        <DialogActions sx={{ p: 0 }}>
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
