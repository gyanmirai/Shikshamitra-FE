'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionIntakeProfile } from 'src/redux/student/admissions/admission-intake-profiles-api';

import Link from 'next/link';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { CustomTabs } from 'src/components/custom-tabs';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { Tab, Box, Card, Alert, Stack, Button, Typography, DialogActions } from '@mui/material';
import { useGetAdmissionIntakeProfilesQuery } from 'src/redux/student/admissions/admission-intake-profiles-api';

import { AdmissionTableText } from './admission-table-text';
import { AdmissionPublicInquiryLinks } from './admission-public-inquiry-links';
import {
  profileKindLabel,
  readProfileRules,
  AdmissionIntakeProfileEditor,
} from './admission-intake-profile-editor';

type ProfileRow = AdmissionIntakeProfile & { kindLabel: string; summary: string };

function describeProfile(profile: AdmissionIntakeProfile) {
  const rules = readProfileRules(profile);
  if (!rules) return 'Settings need review';
  if (profile.kind === 0) {
    const followUp = typeof rules.followUpDueInDays === 'number' ? rules.followUpDueInDays : '—';
    const maximum = typeof rules.maxOpenFollowUps === 'number' ? rules.maxOpenFollowUps : '—';
    return `Follow-up after ${followUp} days · Up to ${maximum} open follow-ups`;
  }
  const count = Array.isArray(rules.counsellorUserIds) ? rules.counsellorUserIds.length : 0;
  const maximum =
    typeof rules.maxActiveCasesPerCounsellor === 'number' ? rules.maxActiveCasesPerCounsellor : '—';
  return `${count} counsellor${count === 1 ? '' : 's'} · Limit ${maximum} active cases each`;
}

function getProfileColumns(
  canEdit: boolean,
  onEdit: (profile: AdmissionIntakeProfile) => void
): IColumn[] {
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Profile',
      filterType: 'string',
      sticky: true,
      stickyPosition: 'left',
      minWidth: 180,
      render: (_value, row) => <AdmissionTableText text={(row as ProfileRow).name} strong />,
    },
    {
      id: 'kind',
      label: 'Type',
      filterType: 'enum',
      enumOptions: [
        { value: 0, label: 'Inquiry setup' },
        { value: 1, label: 'Counsellor assignment' },
      ],
      minWidth: 190,
      render: (_value, row) => (
        <Label color={(row as ProfileRow).kind === 0 ? 'info' : 'default'}>
          {(row as ProfileRow).kindLabel}
        </Label>
      ),
    },
    { id: 'code', label: 'Code', filterType: 'string', minWidth: 135, render: (value) => <AdmissionTableText text={String(value ?? '')} /> },
    { id: 'summary', label: 'Configuration', filterType: 'string', minWidth: 270, render: (value) => <AdmissionTableText text={String(value ?? '')} /> },
  ];
  if (canEdit) {
    columns.push({
      id: 'actions',
      label: 'Actions',
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      minWidth: 92,
      align: 'right',
      render: (_value, row) => {
        const profile = row as ProfileRow;
        return (
          <AdaptiveThreeDotsActions
            sx={{
              '& .MuiIconButton-root': {
                minWidth: { xs: 44, sm: 30 },
                minHeight: { xs: 44, sm: 30 },
              },
            }}
            actions={[{ id: 'edit', label: `Edit ${profile.name} ${profile.kindLabel.toLowerCase()}`, icon: 'solar:pen-bold', onClick: () => onEdit(profile) }]}
          />
        );
      },
    });
  }
  return columns;
}

export default function AdmissionIntakeAssignmentScreen() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') === 'links' ? 'links' : 'profiles';
  const granted = useSelector((state: RootState) => state.auth.permissions);
  const canEdit = hasGrantedPermission(granted, 'Students.Admissions.Offerings.Add');
  const profiles = useGetAdmissionIntakeProfilesQuery();
  const [editorProfile, setEditorProfile] = useState<AdmissionIntakeProfile | null | undefined>();
  const [viewProfile, setViewProfile] = useState<ProfileRow | null>(null);
  const [linkCreateOpen, setLinkCreateOpen] = useState(false);
  const rows: ProfileRow[] = (profiles.data ?? []).map((profile) => ({
    ...profile,
    kindLabel: profileKindLabel(profile.kind),
    summary: describeProfile(profile),
  }));
  const columns = getProfileColumns(canEdit, setEditorProfile);
  const basePath = studentPaths.enrollment.settings.intakeAssignment;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Admission Intake & Assignment"
        description="Set inquiry rules and assign one journey counsellor to each student from intake through onboarding."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Admission Setup', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Intake & Assignment' },
        ]}
        action={
          canEdit && (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon={view === 'links' ? 'mdi:link-variant-plus' : 'mdi:plus'} />}
              onClick={() => {
                if (view === 'links') setLinkCreateOpen(true);
                else setEditorProfile(null);
              }}
              sx={{ minHeight: { xs: 44, sm: 36 }, width: { xs: 1, md: 'auto' } }}
            >
              {view === 'links' ? 'Create inquiry link' : 'Add profile'}
            </Button>
          )
        }
      />
      <Card variant="outlined" sx={{ px: 1, flexShrink: 0 }}>
        <CustomTabs
          value={view}
          aria-label="Admission intake settings"
          guardUnsavedChanges={false}
          variant="scrollable"
          scrollButtons="auto"
          slotProps={{ tab: { minHeight: 44 } }}
        >
          <Tab
            component={Link}
            href={basePath}
            value="profiles"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="mdi:account-cog-outline" width={18} />
                <span>Profiles</span>
              </Stack>
            }
            id="intake-profiles-tab"
            aria-controls="intake-profiles-panel"
          />
          <Tab
            component={Link}
            href={`${basePath}?view=links`}
            value="links"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="mdi:link-variant" width={18} />
                <span>Inquiry links</span>
              </Stack>
            }
            id="intake-links-tab"
            aria-controls="intake-links-panel"
          />
        </CustomTabs>
      </Card>
      {view === 'profiles' ? (
        <Box
          id="intake-profiles-panel"
          role="tabpanel"
          aria-labelledby="intake-profiles-tab"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {profiles.isError && !profiles.data ? (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => profiles.refetch()}>
                  Retry
                </Button>
              }
            >
              Unable to load admission profiles.
            </Alert>
          ) : (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <CustomizableTable
                tableId="admission-intake-profiles"
                tableTitle="Admission intake and assignment profiles"
                wrapperProps={{ sx: { height: 1 } }}
                tableContainerProps={{ sx: { height: 1 } }}
                columns={columns}
                data={rows}
                handleRowClick={(row) => setViewProfile(row as ProfileRow)}
                rowProps={(row) => ({
                  tabIndex: 0,
                  sx: { cursor: 'pointer' },
                  onKeyDown: (event) => {
                    if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      setViewProfile(row as ProfileRow);
                    }
                  },
                })}
                isLoading={profiles.isLoading}
                isPagination
                isSearch
                isFilter
                noDataText="No profiles yet. Add an inquiry setup or counsellor assignment profile to begin."
              />
            </Box>
          )}
        </Box>
      ) : (
        <Box
          id="intake-links-panel"
          role="tabpanel"
          aria-labelledby="intake-links-tab"
          sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
        >
          <AdmissionPublicInquiryLinks
            canEdit={canEdit}
            createOpen={linkCreateOpen}
            onCreateClose={() => setLinkCreateOpen(false)}
          />
        </Box>
      )}
      {editorProfile !== undefined && (
        <AdmissionIntakeProfileEditor
          key={editorProfile?.id ?? 'new-profile'}
          profile={editorProfile}
          onClose={() => setEditorProfile(undefined)}
        />
      )}
      <CustomDialog
        open={Boolean(viewProfile)}
        handleClose={() => setViewProfile(null)}
        title={viewProfile ? `Profile: ${viewProfile.name}` : 'Profile details'}
        hasForm={false}
        maxWidth="sm"
      >
        <DialogScrollContent>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Review this admission intake profile and its current configuration.
            </Typography>
            <Typography variant="body2"><strong>Type:</strong> {viewProfile?.kindLabel}</Typography>
            <Typography variant="body2"><strong>Code:</strong> {viewProfile?.code}</Typography>
            <Typography variant="body2"><strong>Configuration:</strong> {viewProfile?.summary}</Typography>
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" size="small" startIcon={<Iconify icon="mdi:close" />} onClick={() => setViewProfile(null)}>Close</Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
}
