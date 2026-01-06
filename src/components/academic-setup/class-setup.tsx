'use client';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/use-tabs';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';
import {
  useGetClassQuery,
  useAddClassMutation,
  useDeleteClassMutation,
  useUpdateClassMutation,
} from 'src/redux/class/classApi';
import {
  Tab,
  Box,
  Tabs,
  Stack,
  Button,
  MenuList,
  MenuItem,
  TextField,
  Autocomplete,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { Iconify } from '../iconify';
import DivisionSetup from './division-setup';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';
import CustomDialog, { DialogScrollContent } from '../customDialog';

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
        content="Are you sure you want to delete?"
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
            Yes
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

  const formik = useFormik<{
    class: string;
    limit: number;
    shift: string;
  }>({
    initialValues: {
      class: editData ? editData.name : '',
      limit: editData ? editData.ageLowerLimit : null,
      shift: editData ? editData?.shift : '',
    },
    validationSchema: Yup.object().shape({
      class: Yup.string().required('Class is required'),
      shift: Yup.string().required('Shift is required'),
    }),
    onSubmit: async (values) => {
      confirm.onTrue();
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
            shiftId: formik.values.shift,
          },
        }).unwrap();
      } else {
        await addClass({
          name: formik.values.class,
          ageLowerLimit: formik.values.limit,
          educationMediumStageId: organizationId,
          shiftId: formik.values.shift,
        }).unwrap();
      }
      dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };
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
  const { data, isLoading: isShiftLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetShiftsQuery,
  });
  const shiftValue = data?.items?.find((shift: any) => shift.id === formik.values.shift) || null;
  const dispatch = useDispatch();

  return (
    <>
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
      <DialogScrollContent>
        <Stack spacing={2} direction="column">
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
          <Autocomplete
            disabled={isShiftLoading}
            options={data?.items || []}
            value={shiftValue}
            getOptionLabel={(option: any) => {
              const startTime = dayjs(option.startTime, 'HH:mm:ss').format('hh:mm A');
              const endTime = dayjs(option.endTime, 'HH:mm:ss').format('hh:mm A');
              return `${option.shiftName} (${startTime}-${endTime})`;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Shift *"
                placeholder="Search Shift *"
                size="small"
                fullWidth
                sx={{ width: '100%', minWidth: '200px' }}
                error={formik.touched.shift && Boolean(formik.errors.shift)}
                helperText={formik.touched.shift && formik.errors.shift}
              />
            )}
            onChange={(e, value) => {
              formik.setFieldValue('shift', value?.id);
            }}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          size="small"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          loading={isLoading || isUpdateLoading}
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
