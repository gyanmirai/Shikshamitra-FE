'use client';

import { Box, Stack, MenuItem, TextField, Typography } from '@mui/material';

import { AdmissionInquiryChannel } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { usePipelineWorkspaceWorkspace } from './pipeline-workspace-context';

const channels = Object.values(AdmissionInquiryChannel).filter(
  (value): value is AdmissionInquiryChannel => typeof value === 'number'
);

export function PipelineQuickInquiryDetails() {
  const { state: controllerState, actions, meta } = usePipelineWorkspaceWorkspace();
  const {
    academicMediumId,
    admissionYearStandardsLoading,
    availableSourceOptions,
    boardInputRef,
    boardOptions,
    channelInputRef,
    inquirySourceInputRef,
    inquiryTypeInputRef,
    mediumInputRef,
    mediumOptions,
    quickForm,
    quickFormSubmitted,
    quickInquiryOptions,
    quickInquiryOptionsUnavailable,
    routeInputRef,
    selectedQuickInquiryRoute,
    selectedStandard,
    setDuplicateReviewed,
    setQuickForm,
    standardOptions,
    targetStandardInputRef,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Admission context
      </Typography>
      <Stack spacing={1}>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
          <TextField
            required
            select
            fullWidth
            inputRef={channelInputRef}
            name="channel"
            label="Inquiry channel"
            value={quickForm.channel}
            disabled={quickInquiryOptionsUnavailable}
            error={quickFormSubmitted && quickForm.channel === ''}
            helperText={
              quickFormSubmitted && quickForm.channel === ''
                ? 'Select an active inquiry channel.'
                : 'How the family contacted the school.'
            }
            onChange={(event) => {
              setQuickForm((current) => ({
                ...current,
                channel:
                  event.target.value === ''
                    ? ''
                    : (Number(event.target.value) as AdmissionInquiryChannel),
                inquirySourceId: '',
              }));
            }}
          >
            {quickInquiryOptions.channels.map((channel) => (
              <MenuItem key={channel.value} value={channel.value}>
                {channel.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required={availableSourceOptions.length > 0}
            select
            fullWidth
            inputRef={inquirySourceInputRef}
            name="inquirySourceId"
            label="Inquiry source"
            value={quickForm.inquirySourceId}
            disabled={quickInquiryOptionsUnavailable || quickForm.channel === ''}
            error={
              quickFormSubmitted && availableSourceOptions.length > 0 && !quickForm.inquirySourceId
            }
            helperText={
              quickFormSubmitted && availableSourceOptions.length > 0 && !quickForm.inquirySourceId
                ? 'Select where this inquiry came from.'
                : availableSourceOptions.length
                  ? 'Available for the selected channel.'
                  : 'No separate source is configured for this channel.'
            }
            onChange={(event) =>
              setQuickForm((current) => ({
                ...current,
                inquirySourceId: event.target.value,
              }))
            }
          >
            {availableSourceOptions.map((source) => (
              <MenuItem key={source.id} value={source.id}>
                {source.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required={quickInquiryOptions.inquiryTypes.length > 0}
            select
            fullWidth
            inputRef={inquiryTypeInputRef}
            name="inquiryTypeId"
            label="Inquiry type"
            value={quickForm.inquiryTypeId}
            disabled={quickInquiryOptionsUnavailable}
            error={
              quickFormSubmitted &&
              quickInquiryOptions.inquiryTypes.length > 0 &&
              !quickForm.inquiryTypeId
            }
            helperText={
              quickFormSubmitted &&
              quickInquiryOptions.inquiryTypes.length > 0 &&
              !quickForm.inquiryTypeId
                ? 'Select the inquiry type.'
                : quickInquiryOptions.inquiryTypes.length
                  ? 'Used for filtering and reporting.'
                  : 'No inquiry types are configured.'
            }
            onChange={(event) =>
              setQuickForm((current) => ({
                ...current,
                inquiryTypeId: event.target.value,
              }))
            }
          >
            {quickInquiryOptions.inquiryTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
          <TextField
            required
            select
            fullWidth
            inputRef={boardInputRef}
            name="academicBoardId"
            label="Board"
            value={quickForm.academicBoardId}
            disabled={admissionYearStandardsLoading}
            error={quickFormSubmitted && !quickForm.academicBoardId}
            helperText={
              quickFormSubmitted && !quickForm.academicBoardId
                ? 'Select the board.'
                : 'Available in the published Admission Year Setup.'
            }
            onChange={(event) => {
              setQuickForm((current) => ({
                ...current,
                academicBoardId: event.target.value,
                academicMediumId: '',
                targetStandardId: '',
              }));
              setDuplicateReviewed(false);
            }}
          >
            {boardOptions.map((board) => (
              <MenuItem key={board.id} value={board.id}>
                {board.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required
            select
            fullWidth
            inputRef={mediumInputRef}
            name="academicMediumId"
            label="Medium"
            value={quickForm.academicMediumId}
            disabled={!quickForm.academicBoardId || admissionYearStandardsLoading}
            error={quickFormSubmitted && !quickForm.academicMediumId}
            helperText={
              quickFormSubmitted && !quickForm.academicMediumId
                ? 'Select the medium.'
                : 'Available for the selected board.'
            }
            onChange={(event) => {
              setQuickForm((current) => ({
                ...current,
                academicMediumId: event.target.value,
                targetStandardId: '',
              }));
              setDuplicateReviewed(false);
            }}
          >
            {mediumOptions.map((medium) => (
              <MenuItem key={medium.id} value={medium.id}>
                {medium.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required
            select
            fullWidth
            inputRef={targetStandardInputRef}
            name="targetStandardId"
            label="Standard"
            value={quickForm.targetStandardId}
            disabled={!quickForm.academicMediumId || admissionYearStandardsLoading}
            error={quickFormSubmitted && !quickForm.targetStandardId}
            helperText={
              quickFormSubmitted && !quickForm.targetStandardId
                ? 'Select the target standard.'
                : selectedStandard
                  ? selectedStandard.mediumStageName
                  : 'Available for the selected board and medium.'
            }
            onChange={(event) => {
              setQuickForm((current) => ({
                ...current,
                targetStandardId: event.target.value,
              }));
              setDuplicateReviewed(false);
            }}
          >
            {standardOptions.map((standard) => (
              <MenuItem key={standard.standardId} value={standard.standardId}>
                {standard.standardName}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
          <TextField
            required
            select
            fullWidth
            inputRef={routeInputRef}
            name="intendedRouteDefinitionId"
            label="Admission pathway"
            value={quickForm.intendedRouteDefinitionId}
            disabled={quickInquiryOptionsUnavailable}
            error={quickFormSubmitted && !selectedQuickInquiryRoute}
            helperText={
              quickFormSubmitted && !selectedQuickInquiryRoute
                ? 'Select an admission pathway.'
                : selectedQuickInquiryRoute?.version
                  ? `Published admission-type version ${selectedQuickInquiryRoute.version}.`
                  : 'Allowed by the published Admission Year Setup.'
            }
            onChange={(event) => {
              setQuickForm((current) => ({
                ...current,
                intendedRouteDefinitionId: event.target.value,
              }));
              setDuplicateReviewed(false);
            }}
          >
            {quickInquiryOptions.routes.map((route) => (
              <MenuItem key={route.id} value={route.id}>
                {route.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>
    </Box>
  );
}
