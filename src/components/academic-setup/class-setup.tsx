'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import { useDispatch } from 'react-redux';
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

import { boardApi } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetClassQuery,
  useAddClassMutation,
  useDeleteClassMutation,
  useUpdateClassMutation,
} from 'src/redux/class/classApi';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';
import DivisionSetup from './division-setup';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';

interface IClassSetup {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  academicYearId: string;
  educationBoardId: string;
  educationMediumId: string;
  educationMediumStageId: string;
}
interface ClassSetupProps {
  organizationId: string | number;
}

const ClassSetup = ({ organizationId }: ClassSetupProps) => {
  const { data: classes, isLoading: isGetLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [deleteClass, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteClassMutation,
    popupConfig: {
      success: true,
      successMessage: 'Class deleted Successfully',
    },
  });

  const [currentTabs, setCurrentTabs] = useState<IClassSetup[]>([]);
  const [editData, setEditData] = useState<null | IClassSetup>(null);
  const tabs = useTabs('');
  const modal = useBoolean(false);
  const confirm = useBoolean(false);

  const isInitial = useRef(organizationId);
  useEffect(() => {
    if (classes?.items) {
      const medium = classes?.items?.filter(
        (i: IClassSetup) => i.educationMediumStageId === organizationId
      );
      setCurrentTabs(medium || []);
      if (isInitial.current !== organizationId) {
        tabs.setValue(medium?.[0]?.id);
      }
      isInitial.current = organizationId;
    }
  }, [organizationId, classes?.items, tabs]);

  const handelAdd = () => {
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
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            onClick={async () => {
              await deleteClass(editData?.id || '');
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
        title={editData ? 'Update Class' : 'Create Class'}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        <ClassForm
          handleClose={onCloseDialog}
          editData={editData}
          organizationId={organizationId}
        />
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
                {currentTabs.map((tab: IClassSetup) => (
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
          Add Class
        </Button>
      </Box>
      {tabs.value && <DivisionSetup classId={tabs.value} />}
    </Box>
  );
};

export default ClassSetup;

interface IClassForm {
  handleClose: () => void;
  editData: null | Record<string, any>;
  organizationId: string | number;
}
export const ClassForm = ({ handleClose, editData, organizationId }: IClassForm) => {
  const confirm = useBoolean();
  const [addClass, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddClassMutation,
    popupConfig: {
      success: true,
      successMessage: 'Class added Successfully',
    },
  });
  const [updateClass, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateClassMutation,
    popupConfig: {
      success: true,
      successMessage: 'Class updated Successfully',
    },
  });
  const dispatch = useDispatch();

  const formik = useFormik<{
    class: string;
    limit: number;
  }>({
    initialValues: {
      class: editData ? editData.name : '',
      limit: editData ? editData.ageLowerLimit : 5,
    },
    validationSchema: Yup.object().shape({
      class: Yup.string().required('Class is required'),
    }),
    onSubmit: async (values) => {
      confirm.onFalse();
    },
  });

  const onSubmit = async () => {
    try {
      if (editData) {
        await updateClass({
          id: editData.id,
          body: {
            name: formik.values.class,
            ageLowerLimit: formik.values.limit,
            educationMediumStageId: organizationId,
          },
        }).unwrap();
      } else {
        await addClass({
          name: formik.values.class,
          ageLowerLimit: formik.values.limit,
          educationMediumStageId: organizationId,
        }).unwrap();
      }
      dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
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
        title={`${editData ? 'Update Standard' : 'Create Standard'}`}
        content={
          <>
            {' '}
            Are you sure you want to {editData ? 'Update' : 'Create '} Standard
            {editData ? (
              editData.name === formik.values.class ? (
                ''
              ) : (
                <>
                  <b> {editData.name}</b> to <b> {formik.values.class}</b>
                </>
              )
            ) : (
              <b> {formik.values.class}</b>
            )}{' '}
            ?
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
          id="class"
          name="class"
          autoFocus
          label="Class Name"
          value={formik.values.class}
          onChange={(e) => {
            const newName = capitalize(e.target.value);
            formik.setFieldValue('class', newName);
          }}
          error={formik.touched.class && Boolean(formik.errors.class)}
          helperText={formik.touched.class && formik.errors.class}
          size="small"
        />
        <TextField
          fullWidth
          id="limitOfAge"
          name="limit"
          label="Limit Of Age"
          type="number"
          value={formik.values.limit}
          onChange={formik.handleChange}
          error={formik.touched.limit && Boolean(formik.errors.limit)}
          helperText={formik.touched.limit && formik.errors.limit}
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
