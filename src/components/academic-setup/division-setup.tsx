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
  useGetDivisionQuery,
  useAddDivisionMutation,
  useDeleteDivisionMutation,
  useUpdateDivisionMutation,
} from 'src/redux/division/divisionApi';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';

interface IDivision {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  strength: number;
  standardId: string;
}
interface DivisionSetupProps {
  classId: string;
}

const DivisionSetup = ({ classId }: DivisionSetupProps) => {
  const { data: divisions, isLoading: isGetLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDivisionQuery,
  });
  const [deleteDivision, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteDivisionMutation,
    popupConfig: {
      success: true,
      successMessage: 'Division deleted Successfully',
    },
  });

  const [currentTabs, setCurrentTabs] = useState<IDivision[]>([]);
  const [editData, setEditData] = useState<null | IDivision>(null);
  const tabs = useTabs('');
  const modal = useBoolean(false);
  const confirm = useBoolean(false);

  const isInitial = useRef(classId);
  useEffect(() => {
    if (divisions?.items) {
      const medium = divisions?.items?.filter((i: IDivision) => i.standardId === classId);
      setCurrentTabs(medium || []);
      if (isInitial.current !== classId) {
        tabs.setValue(medium?.[0]?.id);
      }
      isInitial.current = classId;
    }
  }, [classId, divisions?.items, tabs]);

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
              await deleteDivision(editData?.id || '');
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
        title={editData ? 'Update Division' : 'Create Division'}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        <DivisionForm classId={classId} handleClose={onCloseDialog} editData={editData} />
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
                {currentTabs.map((tab: IDivision) => (
                  <Tab
                    sx={{ fontSize: '12px' }}
                    key={tab.id}
                    label={
                      <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                        {tab.name} - {tab.strength}
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
          Add Division
        </Button>
      </Box>
    </Box>
  );
};

export default DivisionSetup;

interface IDivisionForm {
  handleClose: () => void;

  editData: null | Record<string, any>;
  classId: string;
}
export const DivisionForm = ({ handleClose, editData, classId }: IDivisionForm) => {
  const [addDivision, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddDivisionMutation,
    popupConfig: {
      success: true,
      successMessage: 'Division added Successfully',
    },
  });
  const [updatedivision, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateDivisionMutation,
    popupConfig: {
      success: true,
      successMessage: 'Division updated Successfully',
    },
  });

  const formik = useFormik({
    initialValues: {
      division: editData ? editData.name : '',
      strength: editData ? editData.strength : '',
    },
    validationSchema: Yup.object().shape({
      division: Yup.string().required('Division is required'),
      strength: Yup.number().required('Strength is required'),
    }),
    onSubmit: async (values) => {
      if (editData) {
        const res = await updatedivision({
          id: editData.id,
          body: {
            name: values.division,
            standardId: classId,
            strength: values.strength,
          },
        });
      } else {
        const res = await addDivision({
          name: values.division,
          standardId: classId,
          strength: values.strength,
        });
      }
      handleClose();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} p={2}>
      <TextField
        fullWidth
        id="division"
        name="division"
        label="Division Name"
        value={formik.values.division}
        onChange={formik.handleChange}
        error={formik.touched.division && Boolean(formik.errors.division)}
        // @ts-ignore
        helperText={formik.touched.division && formik.errors.division}
        size="small"
      />
      <TextField
        fullWidth
        sx={{ mt: 2 }}
        id="strength"
        name="strength"
        type="number"
        label="Strength"
        value={formik.values.strength}
        onChange={formik.handleChange}
        error={formik.touched.strength && Boolean(formik.errors.strength)}
        // @ts-ignore
        helperText={formik.touched.strength && formik.errors.strength}
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
