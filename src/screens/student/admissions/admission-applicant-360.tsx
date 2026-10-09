'use client';

import type { RootState } from 'src/redux/store';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGetAdmissionApplicant360Query } from 'src/redux/student/admissions/admission-applicants-api';
import {
  Box,
  List,
  Stack,
  Alert,
  Drawer,
  Button,
  Skeleton,
  ListItem,
  IconButton,
  Typography,
  ListItemText,
} from '@mui/material';

import { formatAdmissionReference } from './admission-reference';
import { getAdmissionApplicationStatusLabel } from './application-status';
import { getApplicantName } from './applicant-360/admission-applicant-360-model';
import { ApplicationApplicantNotesDialog } from './application-detail/application-applicant-notes-dialog';
import { ApplicationApplicantIdentityDialog } from './application-detail/application-applicant-identity-dialog';
import {
  getApplicantReturnUrl,
  getApplicantApplicationUrl,
} from './applicant-360/admission-applicant-route';

/** Compatibility entry for saved applicant URLs; application work belongs to the list drawer. */
export default function AdmissionApplicant360Screen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const params = useSearchParams();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Admissions.Applicants.View');
  const canEdit = hasGrantedPermission(permissions, 'Students.Admissions.Applicants.Add');
  const canViewApplications = hasGrantedPermission(
    permissions,
    'Students.Admissions.Applications.View'
  );
  const inquiryId = params.get('inquiryId');
  const returnTo = params.get('returnTo');
  const explicitIdentity = params.get('editIdentity') === '1';
  const identity = useBoolean(explicitIdentity);
  const notes = useBoolean();
  const query = useGetAdmissionApplicant360Query(id, {
    skip: !canView || identity.value || notes.value,
  });
  const data = query.currentData;
  const returnUrl = getApplicantReturnUrl(returnTo, inquiryId);
  const single = data?.applications.length === 1 ? data.applications[0] : undefined;
  useEffect(() => {
    if (
      single &&
      canView &&
      canViewApplications &&
      !identity.value &&
      !notes.value &&
      !explicitIdentity
    )
      router.replace(getApplicantApplicationUrl(returnTo, single.id));
  }, [
    single,
    canView,
    canViewApplications,
    identity.value,
    notes.value,
    explicitIdentity,
    returnTo,
    router,
  ]);
  const close = () => router.replace(returnUrl);
  if (identity.value)
    return (
      <ApplicationApplicantIdentityDialog
        open
        applicantId={id}
        onClose={() => {
          if (explicitIdentity) close();
          else identity.onFalse();
        }}
      />
    );
  if (notes.value)
    return <ApplicationApplicantNotesDialog open applicantId={id} onClose={notes.onFalse} />;

  return (
    <Drawer
      open
      anchor="right"
      onClose={close}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'applicant-route-title',
        sx: {
          width: { xs: '100%', sm: 'min(640px, 96vw)' },
          maxWidth: '100%',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          overscrollBehavior: 'contain',
        },
      }}
    >
      <Stack
        component="header"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Typography id="applicant-route-title" variant="h6">
          {data?.applications.length ? 'Choose Application' : 'Applicant Record'}
        </Typography>
        <IconButton aria-label="Close applicant record" onClick={close}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={1.5} sx={{ p: { xs: 1.5, sm: 2 } }}>
          {!canView ? (
            <Alert severity="warning">You do not have permission to view this applicant.</Alert>
          ) : query.isLoading || (!data && query.isFetching) ? (
            <Stack role="status" aria-label="Loading applicant record" spacing={1}>
              <Skeleton height={48} />
              <Skeleton height={80} />
            </Stack>
          ) : query.isError || !data ? (
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={query.refetch}>
                  Retry
                </Button>
              }
            >
              Applicant record could not be loaded. Try again.
            </Alert>
          ) : (
            <>
              <Typography variant="subtitle1">{getApplicantName(data)}</Typography>
              {data.applications.length ? (
                <>
                  {!canViewApplications ? (
                    <Alert severity="warning">
                      You do not have permission to open admission applications.
                    </Alert>
                  ) : (
                    <List disablePadding>
                      {data.applications.map((application) => (
                        <ListItem key={application.id} disableGutters divider>
                          <ListItemText
                            primary={formatAdmissionReference(application.applicationNumber)}
                            secondary={getAdmissionApplicationStatusLabel(application.status)}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            component={Link}
                            href={getApplicantApplicationUrl(returnTo, application.id)}
                          >
                            Open application
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </>
              ) : (
                <Alert severity="info">
                  No admission application has started. Continue the inquiry and use Move to next
                  stage when it is ready.
                </Alert>
              )}
              {inquiryId && (
                <Button
                  size="small"
                  variant="outlined"
                  component={Link}
                  href={returnUrl}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Manage inquiry
                </Button>
              )}
              {canEdit && (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={data.applications.some((application) =>
                    [10, 11].includes(application.status)
                  )}
                  onClick={identity.onTrue}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Edit identity
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={notes.onTrue}
                sx={{ alignSelf: 'flex-start' }}
              >
                Applicant notes
              </Button>
            </>
          )}
        </Stack>
      </Scrollbar>
      <Box
        component="footer"
        sx={{ p: { xs: 1.5, sm: 2 }, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Button
          size="small"
          variant="outlined"
          onClick={close}
          startIcon={<Iconify icon="mdi:close" />}
        >
          Close
        </Button>
      </Box>
    </Drawer>
  );
}
