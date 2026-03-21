import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
// Components
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Button, Typography, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

// Custom Hook
import { useInquiryForm } from './hooks/useInquiryForm';
// Sub-components
import { InquiryPreferenceForm } from '../setting/inquiryPreference';
import { InquiryDetails } from './components/form-sections/InquiryDetails';
import { AddressDetails } from './components/form-sections/AddressDetails';
import { ContactInformation } from './components/form-sections/ContactInformation';
import { BasicStudentDetails } from './components/form-sections/BasicStudentDetails';

// Types
import type { IInquiryResponse } from './type';

/**
 * InquiryForm Component
 *
 * Refactored main component for Student Inquiry.
 * Orchestrates the form using `useInquiryForm` hook and renders split sections.
 *
 * @param handleClose - Close handler
 * @param editData - Data to edit
 */
const InquiryForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: IInquiryResponse | null;
}) => {
  const { formik, data, loading, actions } = useInquiryForm(handleClose, editData);
  const { values, handleSubmit, initialValues } = formik;
  const { isAddLoading, isUpdateLoading } = loading;

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <Box
        display="flex"
        component="form"
        onSubmit={handleSubmit}
        flexDirection="column"
        height="100%"
      >
        <Scrollbar
          sx={{
            p: 2,
            height: '100%',
            '& .simplebar-wrapper': {
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {/* Section 1: Basic Student Details */}
          <BasicStudentDetails
            formik={formik}
            data={{
              academicYear: data.academicYear,
              boards: data.boards,
              board: data.board,
              classes: data.classes,
            }}
            loading={{
              yearLoading: loading.yearLoading,
              boardLoading: loading.boardLoading,
              classLoading: loading.classLoading,
              isGetLoading: loading.isGetLoading,
            }}
            actions={{
              getClassByMedium: actions.getClassByMedium,
            }}
          />

          {/* Section 2: Inquiry Details */}
          <InquiryDetails
            formik={formik}
            data={{ inquiryPreference: data.inquiryPreference }}
            loading={{
              inquiryPrefrenceLoading: loading.inquiryPrefrenceLoading,
              isGetLoading: loading.isGetLoading,
            }}
            actions={{ dialog: actions.dialog }}
          />

          {/* Section 3: Contact Information */}
          <ContactInformation formik={formik} loading={{ isGetLoading: loading.isGetLoading }} />

          {/* Section 4: Address Details */}
          <AddressDetails formik={formik} loading={{ isGetLoading: loading.isGetLoading }} />
        </Scrollbar>

        <DialogActions sx={{ flexShrink: 0, p: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={handleClose}
            size="small"
          >
            Cancel
          </Button>
          {!editData && (
            <LoadingButton
              loading={isAddLoading && actions.isSaveAndNewRef.current}
              variant="outlined"
              onClick={() => {
                actions.isSaveAndNewRef.current = true;
                handleSubmit();
              }}
              startIcon={<Iconify icon="eva:plus-fill" />}
              size="small"
            >
              Save & New
            </LoadingButton>
          )}
          <LoadingButton
            loading={isUpdateLoading || (isAddLoading && !actions.isSaveAndNewRef.current)}
            type="submit"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            size="small"
            onClick={() => {
              actions.isSaveAndNewRef.current = false;
            }}
          >
            {editData ? 'Update' : 'Submit'}
          </LoadingButton>
        </DialogActions>
      </Box>

      <CustomDialog
        open={actions.dialog.value}
        handleClose={actions.dialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Inquiry Preference</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Configure and manage inquiry preferences to categorize and track student inquiries effectively."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <InquiryPreferenceForm handleClose={actions.dialog.onFalse} editData={null} />
      </CustomDialog>
    </BackPopUpChecked>
  );
};

export default InquiryForm;
