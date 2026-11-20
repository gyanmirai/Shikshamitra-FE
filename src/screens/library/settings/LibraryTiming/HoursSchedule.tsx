import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Divider } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';

import { HoursDayFields } from './HoursDayFields';

import type { useLibraryHoursDraft } from './useLibraryHoursDraft';

export function HoursSchedule({
  draft,
  canEdit,
}: {
  draft: ReturnType<typeof useLibraryHoursDraft>;
  canEdit: boolean;
}) {
  const { formik, invalid, setConfirm } = draft;
  return (
    <>
      <Box sx={{ minHeight: 0, flex: 1, overflow: 'auto' }}>
        <FormBusyRegion busy={formik.isSubmitting} label="Saving Library hours">
          <FormSectionCard
            title="Weekly Opening Hours"
            icon={GlobalIcons.clock}
            descriptionTooltip="Set local opening and closing times on open days. Closed and holiday days do not use opening times. Unconfigured days are shown as new draft rows."
          >
            <Stack spacing={2} divider={<Divider />}>
              {formik.values.hours.map((row, index) => (
                <HoursDayFields
                  key={`${row.day}-${index}`}
                  formik={formik}
                  index={index}
                  canEdit={canEdit}
                />
              ))}
            </Stack>
          </FormSectionCard>
        </FormBusyRegion>
      </Box>
      {canEdit && (
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}
        >
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            size="small"
            disabled={!formik.dirty || formik.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            onClick={() => setConfirm('reset')}
          >
            Reset
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            color="inherit"
            size="small"
            loading={formik.isSubmitting}
            disabled={!formik.dirty || invalid}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Save
          </LoadingButton>
        </Stack>
      )}
    </>
  );
}
