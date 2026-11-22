'use client';

import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { useState, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { Box, Stack, Button, Divider, Typography, IconButton } from '@mui/material';
import { useGetAdmissionCampusQuery } from 'src/redux/student/admissions/admission-campuses-api';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { AdmissionCampusSelect } from './admission-campus-select';
import { useAdmissionCampusOptions } from './use-admission-campus-options';
import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';

import type { AdmissionCampusFetcher } from './use-admission-campus-options';
import type { AdmissionOfferingFilters } from './use-admission-offering-filters';

type AdvancedFilters = Pick<
  AdmissionOfferingFilters,
  'campusId' | 'availabilityStatus' | 'stageId' | 'isActive' | 'configurationStatus'
>;

type Props = {
  cycle: AdmissionCycle | null;
  values: AdmissionOfferingFilters;
  onChange: (changes: Partial<AdmissionOfferingFilters>) => void;
};

const ALL_FILTER_VALUE = '__all__';
const ALL_CAMPUSES = { id: ALL_FILTER_VALUE, name: 'All Campuses', code: '', isActive: true };

const EMPTY_OPTIONAL_FILTERS = {
  campusId: '',
  availabilityStatus: '',
  stageId: '',
  isActive: '',
  configurationStatus: '',
};

const pickAdvancedFilters = (values: AdmissionOfferingFilters): AdvancedFilters => ({
  campusId: values.campusId,
  availabilityStatus: values.availabilityStatus,
  stageId: values.stageId,
  isActive: values.isActive,
  configurationStatus: values.configurationStatus,
});

function CampusFilter({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [empty, setEmpty] = useState(false);
  const selectedCampus = useGetAdmissionCampusQuery(value, { skip: !value });
  const fetchCampuses = useAdmissionCampusOptions();
  const fetchOptions = useCallback<AdmissionCampusFetcher>(
    async (query, page) => {
      const result = await fetchCampuses(query, page);
      if (!query && page === 1) setEmpty(result.data.length === 0);
      return result;
    },
    [fetchCampuses]
  );

  return (
    <AdmissionCampusSelect
      label="Campus"
      valueId={value || ALL_CAMPUSES.id}
      initialOption={value ? selectedCampus.currentData : ALL_CAMPUSES}
      allOption={ALL_CAMPUSES}
      fetchOptions={fetchOptions}
      disabled={empty && !value}
      helperText={empty ? 'No active campuses are configured.' : undefined}
      onChange={(id) => onChange(!id || id === ALL_CAMPUSES.id ? '' : id)}
    />
  );
}

export function AdmissionOfferingMoreFilters({ cycle, values, onChange }: Props) {
  const popover = usePopover();
  const [draft, setDraft] = useState<AdvancedFilters>(() => pickAdvancedFilters(values));
  const activeCount = [
    values.campusId,
    values.availabilityStatus,
    values.stageId,
    values.isActive,
    values.configurationStatus,
  ].filter(Boolean).length;
  const hierarchyQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: cycle?.academicYearId ?? '' },
    { skip: !cycle }
  );
  const { stages } = getAdmissionHierarchyOptions(
    hierarchyQuery.currentData?.items ?? [],
    values.boardId,
    values.mediumId
  );
  const updateDraft = (changes: Partial<AdvancedFilters>) =>
    setDraft((current) => ({ ...current, ...changes }));

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="mdi:filter-variant" />}
        aria-haspopup="dialog"
        aria-expanded={popover.open}
        onClick={(event) => {
          setDraft(pickAdvancedFilters(values));
          popover.onOpen(event);
        }}
      >
        Filters{activeCount > 0 ? ` (${activeCount})` : ''}
      </Button>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          arrow: { placement: 'top-right' },
          paper: {
            sx: { width: 336, maxWidth: 'calc(100vw - 32px)', overflow: 'hidden' },
          },
        }}
      >
        <Box
          role="dialog"
          aria-label="Admission Offering Filters"
          sx={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100dvh - 32px)' }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.25 }}
          >
            <Typography variant="subtitle1">Filters</Typography>
            <IconButton size="small" aria-label="Close Filters" onClick={popover.onClose}>
              <Iconify icon="mdi:close" width={20} />
            </IconButton>
          </Stack>

          <Divider />

          <Stack spacing={1.5} sx={{ p: 2, overflowY: 'auto', minHeight: 0 }}>
            {popover.open && (
              <CampusFilter
                value={draft.campusId}
                onChange={(campusId) => updateDraft({ campusId })}
              />
            )}
            <CustomSelect
              options={[
                { value: ALL_FILTER_VALUE, label: 'All Availability Statuses' },
                { value: '0', label: 'Configuration Incomplete' },
                { value: '1', label: 'Not Open Yet' },
                { value: '2', label: 'Open' },
                { value: '3', label: 'Closed' },
                { value: '4', label: 'Inactive' },
              ]}
              label="Availability"
              value={draft.availabilityStatus || ALL_FILTER_VALUE}
              onChange={(value) =>
                updateDraft({
                  availabilityStatus: value === ALL_FILTER_VALUE ? '' : String(value),
                })
              }
            />
            {hierarchyQuery.isError && (
              <StudentFeedback
                notificationKey="STU-0128"
                presentation="toast"
                severity="error"
                toastAction={
                  <Button size="small" color="inherit" onClick={() => hierarchyQuery.refetch()}>
                    Retry
                  </Button>
                }
              >
                Could not load School level options.
              </StudentFeedback>
            )}
            <CustomSelect
              options={[{ id: ALL_FILTER_VALUE, name: 'All School Levels' }, ...stages]}
              label="School Level"
              labelKey="name"
              valueKey="id"
              value={draft.stageId || ALL_FILTER_VALUE}
              disabled={!values.mediumId || hierarchyQuery.isFetching || hierarchyQuery.isError}
              onChange={(id) =>
                updateDraft({
                  stageId: id === ALL_FILTER_VALUE ? '' : String(id),
                })
              }
            />
            <CustomSelect
              options={[
                { value: ALL_FILTER_VALUE, label: 'All Activity Statuses' },
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              label="Active Status"
              value={draft.isActive || ALL_FILTER_VALUE}
              onChange={(value) =>
                updateDraft({ isActive: value === ALL_FILTER_VALUE ? '' : String(value) })
              }
            />
            <CustomSelect
              options={[
                { value: ALL_FILTER_VALUE, label: 'All Configuration Statuses' },
                { value: '1', label: 'Ready' },
                { value: '0', label: 'Missing Configuration' },
              ]}
              label="Configuration"
              value={draft.configurationStatus || ALL_FILTER_VALUE}
              onChange={(value) =>
                updateDraft({
                  configurationStatus: value === ALL_FILTER_VALUE ? '' : String(value),
                })
              }
            />
          </Stack>

          <Divider />

          <Stack direction="row" spacing={1} sx={{ p: 2 }}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:filter-off-outline" />}
              onClick={() => {
                setDraft((current) => ({ ...current, ...EMPTY_OPTIONAL_FILTERS }));
                onChange({
                  ...EMPTY_OPTIONAL_FILTERS,
                  ...(values.stageId ? { standardId: '' } : {}),
                });
                popover.onClose();
              }}
            >
              Clear
            </Button>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:check" />}
              onClick={() => {
                const stageChanged = draft.stageId !== values.stageId;
                onChange({
                  ...draft,
                  ...(stageChanged ? { standardId: '' } : {}),
                });
                popover.onClose();
              }}
              sx={{
                bgcolor: 'text.primary',
                color: 'background.paper',
                '&:hover': { bgcolor: 'text.secondary' },
              }}
            >
              Apply Filters
            </Button>
          </Stack>
        </Box>
      </CustomPopover>
    </>
  );
}
