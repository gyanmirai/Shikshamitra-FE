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
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
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
  useGetDivisionQuery,
  useAddDivisionMutation,
  useDeleteDivisionMutation,
  useUpdateDivisionMutation,
} from 'src/redux/division/divisionApi';

import { Iconify } from '../iconify';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';
import { PaginatedSearchSelect } from '../paginated-search-select';
import CustomDialog, { DialogScrollContent } from '../customDialog';

interface IDivision {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  strength: number;
  roomNo?: string;
  standardId: string;
}
interface DivisionSetupProps {
  classId: string | number;
}

const DivisionSetup = ({ classId }: DivisionSetupProps) => {
  const dispatch = useDispatch();
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
              await deleteDivision(editData?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
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
                    // sx={{ fontSize: '12px' }}
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
  classId: string | number;
}

interface RoomOption {
  id: string;
  roomName: string;
  buildingName?: string;
  floorName?: string;
}

export const DivisionForm = ({ handleClose, editData, classId }: IDivisionForm) => {
  const confirm = useBoolean();
  const [addDivision, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddDivisionMutation,
    popupConfig: {
      success: true,
      successMessage: 'Division added Successfully',
    },
  });
  const [fetchRooms, { isFetching: isRoomFetching }] = useLazyGetRoomsQuery();
  const [updatedivision, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateDivisionMutation,
    popupConfig: {
      success: true,
      successMessage: 'Division updated Successfully',
    },
  });
  const dispatch = useDispatch();

  /**
   * Memoization Justification:
   * - The paginated autocomplete uses this function as its data-fetch dependency.
   * - Keeping its identity stable prevents the search hook from rebuilding its debounced loader.
   */
  const fetchRoomOptions = useCallback(
    async (query: string, page: number) => {
      const pageSize = 25;
      const response = await fetchRooms({
        filter: query || undefined,
        skipCount: (page - 1) * pageSize,
        maxResultCount: pageSize,
        sorting: 'RoomName asc',
      }).unwrap();

      const items = response?.items ?? [];
      return {
        data: items,
        hasMore: (page - 1) * pageSize + items.length < (response?.totalCount ?? 0),
      };
    },
    [fetchRooms]
  );

  const formik = useFormik({
    initialValues: {
      division: editData ? editData.name : '',
      strength: editData ? editData.strength : '',
      roomId: editData ? editData.roomId : '',
    },
    validationSchema: Yup.object().shape({
      division: Yup.string().required('Division is required'),
      strength: Yup.number().required('Strength is required'),
      roomId: Yup.string().required('Room No is required'),
    }),
    onSubmit: async (values) => {
      confirm.onTrue();
    },
  });
  const onSubmit = async () => {
    try {
      if (editData) {
        await updatedivision({
          id: editData.id,
          body: {
            name: formik.values.division,
            standardId: classId,
            strength: formik.values.strength,
            roomNumber: formik.values.roomId,
          },
        }).unwrap();
      } else {
        await addDivision({
          name: formik.values.division,
          standardId: classId,
          strength: formik.values.strength,
          roomNumber: formik.values.roomId,
        }).unwrap();
      }
      dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
        }}
        title={`${editData ? 'Update Division' : 'Create Division'}`}
        content={
          <>
            {' '}
            Are you sure you want to {editData ? 'Update' : 'Create '}{' '}
            {editData ? (
              editData.name === formik.values.division ? (
                ''
              ) : (
                <>
                  <b>{editData.name}</b> to <b>{formik.values.division}</b>
                </>
              )
            ) : (
              <b>{formik.values.division}</b>
            )}{' '}
            Division ?
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
            id="division"
            name="division"
            label="Division Name *"
            autoFocus
            value={formik.values.division}
            onChange={(e) => {
              const newName = capitalize(e.target.value);
              formik.setFieldValue('division', newName);
            }}
            error={formik.touched.division && Boolean(formik.errors.division)}
            // @ts-ignore
            helperText={formik.touched.division && formik.errors.division}
            size="small"
          />
          <TextField
            fullWidth
            id="strength"
            name="strength"
            type="number"
            label="Strength *"
            value={formik.values.strength}
            onChange={formik.handleChange}
            error={formik.touched.strength && Boolean(formik.errors.strength)}
            // @ts-ignore
            helperText={formik.touched.strength && formik.errors.strength}
            size="small"
          />
          <PaginatedSearchSelect<RoomOption>
            label="Room No *"
            placeholder="Search or scroll to select a room"
            fetchOptions={fetchRoomOptions}
            minChars={0}
            isLoading={isRoomFetching}
            getOptionLabel={(option) =>
              `${option.buildingName} > ${option.floorName} > ${option.roomName}`
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, option) => formik.setFieldValue('roomId', option?.id ?? '')}
            error={formik.touched.roomId && Boolean(formik.errors.roomId)}
            helperText={formik.touched.roomId ? (formik.errors.roomId as string) : undefined}
            size="small"
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button variant="outlined" size="small" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading || isUpdateLoading}
          variant="contained"
          size="small"
          type="submit"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
