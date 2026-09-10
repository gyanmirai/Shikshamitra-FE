'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import HeadSelector from 'src/screens/finance/components/HeadSelector';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  usePutAccountHeadMutation,
  usePostAccountHeadMutation,
} from 'src/redux/finance/accountHeadApi';

import { getAccountHeadInitialValues } from './AccountHeadInitialValues';
import { AccountHeadValidationSchema } from './AccountHeadValidationSchema';

import type { IAccountHeadFormProps } from './type';

const HEAD_TYPES = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'].map((value) => ({
  value,
  label: value,
}));

const AccountHeadForm = ({ onClose, editData }: IAccountHeadFormProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [createHead, createState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostAccountHeadMutation,
  });
  const [updateHead, updateState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutAccountHeadMutation,
  });

  const formik = useFormik({
    initialValues: getAccountHeadInitialValues(editData),
    validationSchema: AccountHeadValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const body = {
        ...values,
        parentAccountHeadId: values.parentAccountHeadId || null,
        concurrencyStamp: editData ? values.concurrencyStamp : null,
      };
      try {
        if (editData) await updateHead({ id: editData.id, body }).unwrap();
        else await createHead({ academicYearId: currentYear?.id, body }).unwrap();
        shikshaMitraToast.success({
          message: `Account head ${editData ? 'updated' : 'created'} successfully`,
        });
        onClose(null, true);
      } catch {
        shikshaMitraToast.error({
          message: `Failed to ${editData ? 'update' : 'create'} account head`,
        });
      }
    },
  });

  const field = (
    name: keyof typeof formik.values,
    label: string,
    props: Record<string, any> = {}
  ) => (
    <ShakingTextField error={Boolean(formik.touched[name] && formik.errors[name])}>
      <TextField
        fullWidth
        size="small"
        name={name}
        label={label}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(formik.touched[name] && formik.errors[name])}
        helperText={(formik.touched[name] && formik.errors[name]) as string}
        {...props}
      />
    </ShakingTextField>
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          <Grid size={12}>{field('headName', 'Head Name *')}</Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomSelect
              label="Head Type *"
              options={HEAD_TYPES}
              value={formik.values.headType}
              onChange={(value) => formik.setFieldValue('headType', value)}
              formControlProps={{ fullWidth: true, size: 'small' }}
              error={Boolean(formik.touched.headType && formik.errors.headType)}
              helperText={(formik.touched.headType && formik.errors.headType) as string}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <HeadSelector
              label="Parent Account Head"
              value={formik.values.parentAccountHeadId}
              headType={(formik.values.headType || undefined) as any}
              excludeId={editData?.id}
              onChange={(value) => formik.setFieldValue('parentAccountHeadId', value)}
            />
          </Grid>
          <Grid size={12}>{field('notes', 'Notes', { multiline: true, minRows: 3 })}</Grid>
        </Grid>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={editData ? GlobalIcons.edit : GlobalIcons.submit} />}
          variant="contained"
          size="small"
          loading={createState.isLoading || updateState.isLoading}
          onClick={() => formik.handleSubmit()}
        >
          {editData ? 'Update' : 'Create'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AccountHeadForm;
