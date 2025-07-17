import { Box, Grid, Divider, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import {
  CardActions,
  SectionCard,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';

import RenderLocalAddressFields from './RenderLocalAddressFields';
import RenderPermanentAddressFields from './RenderPermanentAddressFields';
import RenderEmergencyAddressFields from './RenderEmergencyAddressFields';

import type { FieldsType } from './type';

const RenderCommunicationFields = (props: any) => {
  const { formik, isEdit, isMainForm = false } = props;
  const isCommunicationEditable = useBoolean(isMainForm);
  const isLocalAddressEditable = useBoolean(isMainForm);
  const isPermanentAddressEditable = useBoolean(isMainForm);
  const isEmergencyAddressEditable = useBoolean(isMainForm);
  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    await formik?.submitForm?.();
    if (Object.keys(validation).length > 0) return false;

    formik.resetForm({ values: formik.values });
    return undefined;
  };
  const handleCancel = () => {
    formik.resetForm();
  };
  return (
    <Box>
      <SectionCard
        title="Communication"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isCommunicationEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        {/* <Grid item xs={12} sm={4}>
          <PhoneInput
            name="primaryContactNumber"
            disabled={!isCommunicationEditable.value}
            value={formik.values.primaryContactNumber}
            onChange={(value) => {
              formik.setFieldValue('primaryContactNumber', value);
            }}
            label="Primary Contact No."
            error={
              formik.touched.primaryContactNumber && Boolean(formik.errors.primaryContactNumber)
            }
            helperText={formik.touched.primaryContactNumber && formik.errors.primaryContactNumber}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <PhoneInput
            name="secondaryContactNumber"
            disabled={!isCommunicationEditable.value}
            value={formik.values.secondaryContactNumber}
            onChange={(value) => {
              formik.setFieldValue('secondaryContactNumber', value);
            }}
            label="Secondary Contact No."
            error={
              formik.touched.secondaryContactNumber && Boolean(formik.errors.secondaryContactNumber)
            }
            helperText={formik.touched.secondaryContactNumber && formik.errors.secondaryContactNumber}
          />
        </Grid> */}

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            name="parentEmail"
            label="Parent Email"
            type="email"
            disabled={!isCommunicationEditable.value}
            value={formik.values.parentEmail}
            onChange={formik.handleChange}
            error={formik.touched.parentEmail && Boolean(formik.errors.parentEmail)}
            helperText={formik.touched.parentEmail && formik.errors.parentEmail}
            size="small"
            InputProps={{
              startAdornment: (
                <>
                  <Iconify icon="mdi-light:email" />{' '}
                  <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                </>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <PhoneInput
            disabled={!isCommunicationEditable.value}
            name="studentContactNo"
            value={formik.values.studentContactNo}
            onChange={(value) => {
              formik.setFieldValue('studentContactNo', value);
            }}
            label="Student Contact No."
            error={formik.touched.studentContactNo && Boolean(formik.errors.studentContactNo)}
            helperText={formik.touched.studentContactNo && formik.errors.studentContactNo}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            name="studentEmail"
            label="Student Email"
            type="email"
            value={formik.values.studentEmail}
            onChange={formik.handleChange}
            error={formik.touched.studentEmail && Boolean(formik.errors.studentEmail)}
            helperText={formik.touched.studentEmail && formik.errors.studentEmail}
            disabled={!isCommunicationEditable.value}
            size="small"
            InputProps={{
              startAdornment: (
                <>
                  <Iconify icon="mdi-light:email" />{' '}
                  <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                </>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <PhoneInput
            disabled={!isCommunicationEditable.value}
            name="whatsAppContactNo"
            value={formik.values.whatsAppContactNo}
            onChange={(value) => {
              formik.setFieldValue('whatsAppContactNo', value);
            }}
            label="Whatsapp No."
            error={formik.touched.whatsAppContactNo && Boolean(formik.errors.whatsAppContactNo)}
            helperText={formik.touched.whatsAppContactNo && formik.errors.whatsAppContactNo}
          />
        </Grid>
      </SectionCard>
      <SectionCard
        title="Local Address"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isLocalAddressEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12}>
          <RenderLocalAddressFields {...props} isEdit={isLocalAddressEditable.value} />
        </Grid>
      </SectionCard>
      <SectionCard
        title="Permanent Address"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isPermanentAddressEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12}>
          <RenderPermanentAddressFields {...props} isEdit={isPermanentAddressEditable.value} />
        </Grid>
      </SectionCard>
      <SectionCard
        title="Emergency Address"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isEmergencyAddressEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12}>
          <RenderEmergencyAddressFields {...props} isEdit={isEmergencyAddressEditable.value} />
        </Grid>
      </SectionCard>

      {/* <Grid item xs={12}>
          <TextField
            name="remarks"
            label="Remarks"
            multiline
            rows={4}
            fullWidth
            value={formik.values.remarks}
            onChange={formik.handleChange}
            error={formik.touched.remarks && Boolean(formik.errors.remarks)}
            helperText={formik.touched.remarks && formik.errors.remarks}
          />
        </Grid> */}
    </Box>
  );
};

export const communicationFields: FieldsType[] = [
  {
    name: 'commPrimaryContactNumber',
    label: 'Primary Contact No.',
    type: 'text',
    gridProps: { xs: 12, sm: 12, md: 12 },
    otherProps: {},
    renderComp(props) {
      return <RenderCommunicationFields {...props} />;
    },
  },
];
