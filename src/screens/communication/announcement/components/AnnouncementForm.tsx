'use client';

import { FormikProvider } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Close } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useMemo, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Dialog,
  Button,
  Divider,
  Typography,
  IconButton,
  DialogActions,
  DialogContent,
} from '@mui/material';

import SchedulingSection from './form/SchedulingSection';
import { useAnnouncementForm } from '../hooks/useAnnouncementForm';
import BasicInformationSection from './form/BasicInformationSection';
import DeliveryChannelsSection from './form/DeliveryChannelsSection';
import SchoolWiseAnnouncementCard from './SchoolWiseDetails/SchoolWiseAnnouncementPreview';

import type { ISchoolWiseAnnouncementFormProps } from '../type';

const AnnouncementForm: React.FC<ISchoolWiseAnnouncementFormProps> = ({
  initialValues = null,
  isEdit = false,
  onClose,
}) => {
  const theme = useTheme();
  const previewDialog = useBoolean();

  // Custom hook extracting all form logic
  const { formik, isSubmitting } = useAnnouncementForm({ initialValues, isEdit, onClose });

  const handlePreview = useCallback(() => {
    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length === 0) {
        previewDialog.onTrue();
      } else {
        formik.setTouched(
          Object.keys(errors).reduce(
            (acc, key) => {
              acc[key] = true;
              return acc;
            },
            {} as Record<string, boolean>
          )
        );
      }
    });
  }, [formik, previewDialog]);

  // Memoization Justification:
  // Memoizing the form content to avoid re-renders of the wrapper if parent props change unpredictably.
  // The sections themselves are also memoized.
  const formContent = useMemo(
    () => (
      <Box display="flex" flexDirection="column" gap={2} height="100%">
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
          <Grid size={{ xs: 12 }}>
            <BasicInformationSection />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DeliveryChannelsSection />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SchedulingSection />
          </Grid>
        </Scrollbar>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.eye} />}
            onClick={handlePreview}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onClose(null, false)}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            size="small"
            type="submit"
            loading={isSubmitting}
            startIcon={
              <Iconify
                icon={initialValues ? GlobalIcons.edit : GlobalIcons.submit}
                width={initialValues ? 16 : 20}
                height={initialValues ? 16 : 20}
              />
            }
          >
            {initialValues ? 'Update' : 'Submit'}
          </LoadingButton>
        </DialogActions>
      </Box>
    ),
    [isSubmitting, initialValues, handlePreview, onClose]
  );

  return (
    <>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
            {formContent}
          </form>
        </FormikProvider>
      </BackPopUpChecked>

      {/* Preview Dialog - Kept in main file as it is a direct modal related to the form action */}
      <Dialog
        open={previewDialog.value}
        onClose={() => {
          setIsChanges(false);
          previewDialog.onFalse();
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            display: 'flex',
            overflow: 'hidden',
            flexDirection: 'column',
            '& form': { minHeight: 0, display: 'flex', flex: '1 1 auto', flexDirection: 'column' },
          },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" p={1.5}>
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Preview</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Preview of the announcement before publishing."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsChanges(false);
              previewDialog.onFalse();
            }}
            sx={{ color: theme.vars.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </Box>
        <Divider />
        <Scrollbar>
          <DialogContent sx={{ p: 2 }}>
            <SchoolWiseAnnouncementCard formikValues={formik.values} />
          </DialogContent>
        </Scrollbar>
      </Dialog>
    </>
  );
};

export default AnnouncementForm;
