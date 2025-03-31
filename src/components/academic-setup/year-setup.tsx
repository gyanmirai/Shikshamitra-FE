'use client';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Select,
  Button,
  MenuList,
  MenuItem,
  InputLabel,
  FormControl,
  DialogActions,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetYearQuery,
  useAddYearMutation,
  useDeleteYearMutation,
  useUpdateYearMutation,
} from 'src/redux/year/yearApi';

import { Iconify } from '../iconify';
import BoardSetup from './board-setup';
import CustomDialog from '../customDialog';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';

interface AcademicYear {
  id: string;
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
  name: string;
  startDate?: string;
  endDate?: string;
}

const YearSetup = () => {
  const { data: years } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
    options: {
      refetchOnMountOrArgChange: true,
    },
  });

  const [deleteYear, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteYearMutation,
    popupConfig: {
      success: true,
      successMessage: 'Academic Year deleted Successfully',
    },
  });
  const [currentTabs, setCurrentTabs] = useState<AcademicYear[]>([]);
  const [editData, setEditData] = useState<null | AcademicYear>(null);
  const tabs = useTabs('');
  const modal = useBoolean(false);
  const confirm = useBoolean(false);

  // const isInitial = useRef<null | string>(null);
  useEffect(() => {
    if (years?.items?.length) {
      const filterItems = years?.items;
      setCurrentTabs(filterItems);
      tabs.setValue(years?.items?.[0]?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years?.items]);

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
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            onClick={async () => {
              await deleteYear(editData?.id || '');
              confirm.onFalse();
              tabs.setValue('');
              setEditData(null);
              //   isInitial.current = true;
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <CustomDialog
        title={editData ? 'Update Year' : 'Create Year'}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        <YearForm handleClose={onCloseDialog} handleSetTeb={handleSetTeb} editData={editData} />
      </CustomDialog>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        // boxShadow="var(--shadows-4)"

        py={1}
      >
        {/* <Box flexGrow={1} display="flex" alignItems="center" maxWidth="85%" width="100%">
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
                {currentTabs.map((tab: AcademicYear) => (
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
        </Box> */}
        {/* @ts-ignore */}
        <Box display="flex" alignIItems="center" gap={2}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="academic-year-select-label" size="small">
              Academic Year
            </InputLabel>
            <Select
              labelId="academic-year-select-label"
              id="academic-year-select"
              value={tabs.value}
              label="Academic Year"
              onChange={(e) => tabs.setValue(e.target.value)}
              size="small"
            >
              {currentTabs.map((tab: AcademicYear) => (
                <MenuItem key={tab.id} value={tab.id}>
                  {tab.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ThreeDotsActions
            onClickThreeDots={(e) => {
              // e.stopPropagation();
              const data = currentTabs.find((item: any) => item.id === tabs.value);
              setEditData(data as AcademicYear);
            }}
            actions={actions}
          />
        </Box>

        <Button
          sx={{ maxWidth: '15%', width: '100%' }}
          variant="outlined"
          startIcon={<Add />}
          size="small"
          onClick={handelAdd}
        >
          Academic Year
        </Button>
      </Box>
      {tabs.value && <BoardSetup academicYearId={tabs.value} />}
    </Box>
  );
};

export default YearSetup;

interface IYearForm {
  handleClose: () => void;
  handleSetTeb: (value: Record<string, any>) => void;
  editData: null | Record<string, any>;
}
const YearForm = ({ handleClose, handleSetTeb, editData }: IYearForm) => {
  const [addYear, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddYearMutation,
    popupConfig: {
      success: true,
      successMessage: 'Academic Year added Successfully',
      // error: true,
    },
  });
  const [updateYear, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateYearMutation,
    popupConfig: {
      success: true,
      successMessage: 'Academic Year updated Successfully',
    },
  });

  const formik = useFormik({
    initialValues: {
      startDate: editData
        ? dayjs(editData.startDate)
        : dayjs().year(dayjs().year()).month(2).date(1),
      endDate: editData
        ? dayjs(editData.endDate)
        : dayjs()
            .year(dayjs().year() + 1)
            .month(1)
            .endOf('month'),
    },
    validationSchema: Yup.object().shape({
      startDate: Yup.date().required('Start Date is required'),
      endDate: Yup.date().required('End Date is required'),
    }),
    onSubmit: async (values) => {
      if (editData) {
        const res = await updateYear({
          id: editData.id,
          body: {
            name: `${values.startDate.format('YYYY')}-${values.endDate.format('YYYY')}`,
            startDate: dateConvertor(values.startDate.format(dateFormat)),
            endDate: dateConvertor(values.endDate.format(dateFormat)),
          },
        });
        if (!res.error) {
          handleSetTeb(res);
        }
      } else {
        const res = await addYear({
          name: `${values.startDate.format('YYYY')}-${values.endDate.format('YYYY')}`,
          startDate: dateConvertor(values.startDate.format(dateFormat)),
          endDate: dateConvertor(values.endDate.format(dateFormat)),
        });
        if (!res.error) {
          handleSetTeb(res);
        }
      }
      handleClose();
    },
  });
  return (
    <Box component="form" p={1} onSubmit={formik.handleSubmit}>
      <DatePicker
        label="Start Date"
        name="startDate"
        value={formik.values.startDate}
        format="DD/MM/YYYY"
        onChange={(newValue) => formik.setFieldValue('startDate', newValue)}
        slotProps={{
          textField: {
            size: 'small',
            helperText: formik.touched.startDate && (formik.errors.startDate as string),
            error: formik.touched.startDate && Boolean(formik.errors.startDate),
          },
        }}
      />
      &nbsp;&nbsp;
      <DatePicker
        label="End Date"
        name="endDate"
        value={formik.values.endDate}
        format="DD/MM/YYYY"
        onChange={(newValue) => formik.setFieldValue('endDate', newValue)}
        slotProps={{
          textField: {
            size: 'small',
            helperText: formik.touched.endDate && (formik.errors.endDate as string),
            error: formik.touched.endDate && Boolean(formik.errors.endDate),
          },
        }}
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
