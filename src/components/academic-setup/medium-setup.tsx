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
import { useDeleteDivisionMutation } from 'src/redux/division/divisionApi';
import { useDeleteClassMutation, useLazyGetClassByIdQuery } from 'src/redux/class/classApi';
import {
  useDeleteOrganizationMutation,
  useLazyGetOrganizationByIdQuery,
} from 'src/redux/oraganization/oraganization';
import {
  useGetMediumQuery,
  useAddMediumMutation,
  useDeleteMediumMutation,
  useUpdateMediumMutation,
  useLazyGetMediumByIdQuery,
} from 'src/redux/medium/mediumApi';

import { Iconify } from '../iconify';
import { ClassForm } from './class-setup';
import CustomDialog from '../customDialog';
import { DivisionForm } from './division-setup';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';
import { CustomAcademicTable } from './academic-table';
import { OrganizationForm } from './organization-setup';

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
  boardId: string;
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
        content="Are you sure want to delete?"
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
            Delete
          </LoadingButton>
        }
      />
      <CustomDialog
        title={editData ? 'Update Medium' : 'Create Medium'}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        <MediumForm
          boardId={boardId}
          handleClose={onCloseDialog}
          handleSetTeb={handleSetTeb}
          editData={editData}
        />
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
                  '& .MuiTabs-flexContainer': { gap: 2 },
                  flexGrow: 1,
                }}
              >
                {currentTabs.map((tab: EducationMedium) => (
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
      {tabs.value && (
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
      )}
    </Box>
  );
};

export default MediumSetup;

interface IMediumForm {
  handleClose: () => void;
  handleSetTeb: (value: Record<string, any>) => void;
  editData: null | Record<string, any>;
  boardId: string;
}
const MediumForm = ({ handleClose, handleSetTeb, editData, boardId }: IMediumForm) => {
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
    onSubmit: async (values) => {
      if (editData) {
        const res = await updateMedium({
          id: editData.id,
          body: {
            name: values.medium,
            educationBoardId: boardId,
          },
        });
        if (!res.error) {
          handleSetTeb(res);
        }
      } else {
        const res = await addMedium({
          name: values.medium,
          educationBoardId: boardId,
        });
        if (!res.error) {
          handleSetTeb(res);
        }
      }
      handleClose();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} p={2}>
      <TextField
        fullWidth
        id="medium"
        name="medium"
        label="Medium Name"
        value={formik.values.medium}
        onChange={formik.handleChange}
        error={formik.touched.medium && Boolean(formik.errors.medium)}
        // @ts-ignore
        helperText={formik.touched.medium && formik.errors.medium}
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
