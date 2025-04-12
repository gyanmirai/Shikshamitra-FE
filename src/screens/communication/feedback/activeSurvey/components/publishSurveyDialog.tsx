'use client';

import React from 'react';
import dayjs from 'dayjs';

import { Box, Button, Typography, DialogActions, DialogContent } from '@mui/material';

import CustomDialog from 'src/components/customDialog';

import type { IPublishSurveyDialogProps } from '../type';

const PublishSurveyDialog = ({ open, survey, onClose, onPublish }: IPublishSurveyDialogProps) => (
  <CustomDialog
    title="Do you want to Activate this Survey?"
    open={open}
    handleClose={onClose}
    maxWidth="sm"
  >
    <DialogContent>
      {survey && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5">Survey Details</Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2">Title</Typography>
            <Typography>{survey.surveyTitle}</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2">Description</Typography>
            <Typography>{survey.description}</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2">Audience</Typography>
            <Typography>
              {Array.isArray(survey.audience) ? survey.audience.join(', ') : survey.audience}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2">Scheduled Date</Typography>
            <Typography>{dayjs(survey.startDate).format('DD MMM YYYY, hh:mm A')}</Typography>
          </Box>
        </Box>
      )}
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose} variant="outlined" color="error">
        Cancel
      </Button>
      <Button onClick={() => onPublish(survey)} variant="contained" color="primary">
        Publish Now
      </Button>
    </DialogActions>
  </CustomDialog>
);

export default PublishSurveyDialog;
