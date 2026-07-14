'use client';

import type { Board } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/use-tabs';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { BoardEnum, BoardList } from 'src/enums/board';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import {
  useGetBoardsQuery,
  useAddBoardMutation,
  useDeleteBoardMutation,
  useUpdateBoardMutation,
} from 'src/redux/board/boardApi';
import {
  Tab,
  Box,
  Tabs,
  Grid,
  Stack,
  Alert,
  Button,
  MenuList,
  MenuItem,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { Iconify } from '../iconify';
import MediumSetup from './medium-setup';
import CustomSelect from '../custom-select';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';
import CustomDialog, { DialogScrollContent } from '../customDialog';
import { parseAcademicYearDateForPicker } from './academic-year-date-utils';

import type { EducationMedium } from './medium-setup';

export interface EducationBoard {
  name: string;
  educationalMediums: EducationMedium[];
  educationBoardStages: any[];
  lastModificationTime: string | null;
  lastModifierId: string | null;
  creationTime: string;
  creatorId: string;
  id: string;
  academicYearId: string;
}

interface BoardSetupProps {
  academicYearId: string | number;
}
const BoardSetup = ({ academicYearId }: BoardSetupProps) => {
  const { data: boards, isLoading: isBoardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  const [deleteBoard, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteBoardMutation,
    popupConfig: {
      success: true,
      successMessage: 'Board deleted Successfully',
    },
  });
  const [currentTabs, setCurrentTabs] = useState<EducationBoard[]>([]);
  const [editData, setEditData] = useState<null | EducationBoard>(null);
  const tabs = useTabs('');
  const modal = useBoolean(false);
  const confirm = useBoolean(false);

  const isInitial = useRef<null | string | number>(null);
  useEffect(() => {
    if (boards?.items) {
      const filterItems = boards?.items.filter(
        (i: EducationBoard) => i.academicYearId === academicYearId
      );
      setCurrentTabs(filterItems);
      if (isInitial.current !== academicYearId) {
        tabs.setValue(filterItems?.[0]?.id);
      }
      isInitial.current = academicYearId;
    }
  }, [academicYearId, boards?.items, tabs]);

  const handelAddBoard = async () => {
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
    ({ popover: pop }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              pop.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
            Delete
          </MenuItem>

          <MenuItem
            onClick={() => {
              modal.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
            Edit
          </MenuItem>
        </MenuList>
      </>
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
              await deleteBoard(editData?.id || '');
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
        title={editData ? 'Update Board' : 'Create Board'}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        <BoardForm
          handleClose={onCloseDialog}
          handleSetTeb={handleSetTeb}
          academicYearId={academicYearId}
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
          {!isBoardLoading ? (
            currentTabs.length > 0 && (
              <Tabs
                value={tabs.value}
                onChange={tabs.onChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
                sx={{
                  mb: 2,
                  px: 2,
                  '& .MuiTabs-flexContainer': { gap: 2 },
                }}
              >
                {currentTabs.map((tab: EducationBoard) => (
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
          variant="outlined"
          startIcon={<Add />}
          sx={{ maxWidth: '15%', width: '100%' }}
          size="small"
          onClick={handelAddBoard}
        >
          Board
        </Button>
      </Box>
      {tabs.value && <MediumSetup boardId={tabs.value} />}
    </Box>
  );
};

export default BoardSetup;

interface IBoardForm {
  handleClose: () => void;
  handleSetTeb?: (value: Record<string, any>) => void;
  editData: null | Record<string, any>;
  academicYearId: string | number;
  boards?: Board[];
  /** The parent Academic Year's own date range — board dates must fall within it. */
  academicYear?: { startDate?: string; endDate?: string; name?: string } | null;
}
export const BoardForm = ({
  handleClose,
  handleSetTeb,
  editData,
  academicYearId,
  boards,
  academicYear,
}: IBoardForm) => {
  const confirm = useBoolean();
  const [addBoard, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddBoardMutation,
    popupConfig: {
      success: true,
      successMessage: 'Board added Successfully',
    },
  });
  const [updateBoard, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBoardMutation,
    popupConfig: {
      success: true,
      successMessage: 'Board updated Successfully',
    },
  });

  // Exclude the board being edited from the "already used" count — otherwise
  // editing e.g. GSEB (when CBSE also exists) sees 2 sibling boards and the
  // dropdown ends up with zero options, hiding the current selection.
  const otherBoards = boards?.filter((board: any) => board.id !== editData?.id);

  const boardOptions =
    otherBoards?.length === 2
      ? []
      : otherBoards?.length === 0
        ? BoardList
        : otherBoards?.find((board: any) => board.type === BoardEnum.CBSE)
          ? [
              {
                value: BoardEnum.GSEB,
                label: 'GSEB',
              },
            ]
          : [
              {
                value: BoardEnum.CBSE,
                label: 'CBSE',
              },
            ];

  const yearStart = academicYear?.startDate
    ? parseAcademicYearDateForPicker(academicYear.startDate)
    : null;
  const yearEnd = academicYear?.endDate
    ? parseAcademicYearDateForPicker(academicYear.endDate)
    : null;

  const formik = useFormik({
    initialValues: {
      board: editData ? (editData.type?.toString() ?? '') : '',
      startDate: editData?.startDate
        ? parseAcademicYearDateForPicker(editData.startDate)
        : (null as dayjs.Dayjs | null),
      endDate: editData?.endDate
        ? parseAcademicYearDateForPicker(editData.endDate)
        : (null as dayjs.Dayjs | null),
    },
    validationSchema: Yup.object().shape({
      board: Yup.string().required('Board is required.'),
      startDate: Yup.date()
        .nullable()
        .required('Start Date is required.')
        .typeError('Start Date is required.'),
      endDate: Yup.date()
        .nullable()
        .required('End Date is required.')
        .typeError('End Date is required.')
        .min(Yup.ref('startDate'), 'End Date must be on or after Start Date.'),
    }),
    validateOnMount: false,
    onSubmit: async (values) => {
      confirm.onTrue();
    },
  });

  const handleSubmitClick = (e: any) => {
    formik.setTouched({ board: true, startDate: true, endDate: true });
    formik.handleSubmit(e);
  };
  const onSubmit = async () => {
    try {
      if (editData) {
        await updateBoard({
          id: editData.id,
          body: {
            type: +formik.values.board,
            academicYearId,
            startDate: dateConvertor(formik.values.startDate?.format(dateFormat) || '') || '',
            endDate: dateConvertor(formik.values.endDate?.format(dateFormat) || '') || '',
          },
        }).unwrap();
      } else {
        await addBoard({
          type: +formik.values.board,
          academicYearId,
          startDate: dateConvertor(formik.values.startDate?.format(dateFormat) || '') || '',
          endDate: dateConvertor(formik.values.endDate?.format(dateFormat) || '') || '',
        }).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
        }}
        title={`${editData ? 'Update' : 'Create'}`}
        content={`Are you sure want to ${editData ? 'Update' : 'Create'} Education Board ?`}
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
        <Stack spacing={2.5}>
          {(yearStart || yearEnd) && (
            <Alert
              severity="info"
              variant="outlined"
              icon={<Iconify icon="solar:calendar-bold-duotone" width={18} />}
              sx={{ borderRadius: 1.5, '& .MuiAlert-message': { width: '100%' } }}
            >
              <Typography variant="caption" sx={{ display: 'block' }}>
                This board belongs to academic year{' '}
                <b>
                  {academicYear?.name || `${yearStart?.format('YYYY')}-${yearEnd?.format('YYYY')}`}
                </b>
                .
              </Typography>
            </Alert>
          )}

          <CustomSelect
            fullWidth
            id="board"
            name="board"
            autoFocus
            label="Board Name *"
            value={formik.values.board}
            onChange={(val) => formik.setFieldValue('board', val)}
            error={formik.touched.board && Boolean(formik.errors.board)}
            helperText={((formik.touched.board && formik.errors.board) || '') as string}
            size="small"
            options={boardOptions}
            formControlProps={{
              fullWidth: true,
              sx: {
                maxWidth: 'unset',
              },
            }}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Start Date *"
                value={formik.values.startDate}
                minDate={dayjs(`01-01-${yearStart?.format('YYYY')}`, 'DD-MM-YYYY')}
                maxDate={dayjs(`31-12-${yearEnd?.format('YYYY')}`, 'DD-MM-YYYY')}
                format="DD-MMM-YYYY"
                onChange={(newValue) => {
                  formik.setFieldValue('startDate', newValue);
                  // Revalidate end date when start date changes
                  if (formik.values.endDate) {
                    formik.setFieldTouched('endDate', true, false);
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    helperText: formik.touched.startDate && (formik.errors.startDate as string),
                    error: formik.touched.startDate && Boolean(formik.errors.startDate),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="End Date *"
                value={formik.values.endDate}
                format="DD-MMM-YYYY"
                minDate={dayjs(`01-01-${yearStart?.format('YYYY')}`, 'DD-MM-YYYY')}
                maxDate={dayjs(`31-12-${yearEnd?.format('YYYY')}`, 'DD-MM-YYYY')}
                onChange={(newValue) => {
                  formik.setFieldValue('endDate', newValue);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    helperText: formik.touched.endDate && (formik.errors.endDate as string),
                    error: formik.touched.endDate && Boolean(formik.errors.endDate),
                  },
                }}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          onClick={handleClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading || isUpdateLoading}
          variant="contained"
          size="small"
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={handleSubmitClick}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
