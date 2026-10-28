'use client';

import type { Dayjs } from 'dayjs';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type {
  AdmissionPublicInquiryLink,
  CreatedAdmissionPublicInquiryLink,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import { fDate, fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetAdmissionFormsQuery } from 'src/redux/student/admissions/admission-forms-api';
import { useGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import {
  Box,
  Grid,
  Stack,
  Button,
  Drawer,
  Divider,
  MenuItem,
  Skeleton,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  useMediaQuery,
} from '@mui/material';
import {
  useGetAdmissionPublicInquiryLinksQuery,
  useCreateAdmissionPublicInquiryLinkMutation,
  useRevokeAdmissionPublicInquiryLinkMutation,
  useGetAdmissionPublicInquiryLinkOptionsQuery,
  useSetAdmissionPublicInquiryLinkFormMutation,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import { AdmissionTableText } from './admission-table-text';
import { AdmissionQueryError } from './admission-query-error';
import { AdmissionIntakeNotice } from './admission-intake-notice';
import { INQUIRY_SOURCE_OPTIONS } from './inquiry-management/admission-inquiry-list-options';

const publicSources = INQUIRY_SOURCE_OPTIONS.filter((item) =>
  [0, 3, 4, 10, 11, 12].includes(item.value)
);
const formEligibilityHelp =
  'Only published Inquiry forms attached to active inquiry offerings in this admission period are available. Publishing a form alone does not make it available here.';
const noEligibleFormsHelp =
  'Attach a published Inquiry form to an active inquiry offering in this admission period, then refresh offerings.';
const sectionProps = {
  sx: {
    p: 2,
    mb: 0,
    boxShadow: 'none',
    borderColor: 'divider',
    transition: 'none',
    '&:hover': { boxShadow: 'none' },
  },
} as const;

type LinkRow = AdmissionPublicInquiryLink & {
  sourceDisplay: string;
  periodName: string;
  formName: string;
  status: 'Active' | 'Expired' | 'Revoked';
};

type LinkValues = {
  cycleId: string;
  formId: string;
  name: string;
  source: number;
  detail: string;
  expiresAt: Dayjs | null;
};

const linkSchema = Yup.object({
  cycleId: Yup.string().required('Choose a published admission period.'),
  formId: Yup.string().required('Choose a published inquiry form.'),
  name: Yup.string().trim().required('Enter a link name.').max(128),
  source: Yup.number().integer().required(),
  detail: Yup.string().trim().max(512),
  expiresAt: Yup.mixed<Dayjs>()
    .nullable()
    .test(
      'future',
      'Choose a future expiry.',
      (value) => !value || (value.isValid() && value.isAfter(dayjs()))
    ),
});

export function AdmissionPublicInquiryLinks({
  canEdit,
  createOpen,
  onCreateClose,
  initialSetupId,
}: {
  canEdit: boolean;
  createOpen: boolean;
  onCreateClose: () => void;
  initialSetupId?: string | null;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cycleInputRef = useRef<HTMLInputElement>(null);
  const formInputRef = useRef<HTMLInputElement>(null);
  const cycles = useGetAdmissionCyclesQuery({ maxResultCount: 100, skipCount: 0 });
  const forms = useGetAdmissionFormsQuery({ status: 1, purpose: 0, maxResultCount: 100 });
  const links = useGetAdmissionPublicInquiryLinksQuery();
  const [create, createState] = useCreateAdmissionPublicInquiryLinkMutation();
  const [setLinkForm, setLinkFormState] = useSetAdmissionPublicInquiryLinkFormMutation();
  const [revoke, revokeState] = useRevokeAdmissionPublicInquiryLinkMutation();
  const [discardOpen, setDiscardOpen] = useState(false);
  const [formDiscardOpen, setFormDiscardOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<AdmissionPublicInquiryLink | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<AdmissionPublicInquiryLink | null>(null);
  const [viewLink, setViewLink] = useState<LinkRow | null>(null);
  const [optionalOpen, setOptionalOpen] = useState(true);
  const [formMenuOpen, setFormMenuOpen] = useState(false);
  const [createdLinks, setCreatedLinks] = useState<
    Record<string, CreatedAdmissionPublicInquiryLink>
  >({});
  const [copyingLinkId, setCopyingLinkId] = useState<string | null>(null);
  const [createdTableContext, setCreatedTableContext] = useState<
    Pick<IParams, 'page' | 'searchTerm' | 'filters' | 'sorts'> | undefined
  >();
  const [error, setError] = useState('');
  const publishedCycles = (cycles.data?.items ?? []).filter((cycle) => cycle.status === 1);
  const publishedForms = (forms.data?.items ?? []).filter(
    (form) => form.status === 1 && form.purpose === 0
  );
  const formik = useFormik<LinkValues>({
    initialValues: {
      cycleId: '',
      formId: '',
      name: '',
      source: 0,
      detail: '',
      expiresAt: null,
    },
    validationSchema: linkSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        if (
          !routingReady ||
          !linkOptions.some((option) => option.inquiryFormDefinitionId === values.formId)
        ) {
          setError(
            'Choose an inquiry form linked to an active Inquiry or Both Offering in this period. Refresh offerings after updating the configuration.'
          );
          return;
        }
        const result = await create({
          admissionCycleId: values.cycleId,
          counsellorAssignmentProfileId: null,
          inquiryFormDefinitionId: values.formId,
          name: values.name.trim(),
          source: values.source,
          sourceDetail: values.detail.trim() || null,
          expiresAtUtc: values.expiresAt?.toISOString() ?? null,
        }).unwrap();
        setCreatedLinks((current) => ({ ...current, [result.id]: result }));
        setCreatedTableContext({ page: 0, searchTerm: '', filters: [], sorts: [] });
        formik.resetForm();
        onCreateClose();
        shikshaMitraToast.success({
          message: 'Inquiry link created. Copy it from the row actions before leaving this page.',
        });
      } catch (problem) {
        const parsed = parseApiProblemDetail(problem);
        setError(
          parsed.errorCode === 'Admissions.PublicInquiry.OfferingRequired' &&
            (!parsed.detail || parsed.detail === 'One or more business rules were violated.')
            ? 'Attach the inquiry form to an Offering, activate it, and refresh offerings before trying again.'
            : parsed.detail || 'Unable to create the inquiry link.'
        );
        if (parsed.errorCode === 'Admissions.PublicInquiry.OfferingRequired')
          routingOptions.refetch();
      }
    },
  });
  const routingOptions = useGetAdmissionPublicInquiryLinkOptionsQuery(formik.values.cycleId, {
    skip: !createOpen || !formik.values.cycleId,
    refetchOnMountOrArgChange: true,
  });
  const linkOptions = routingOptions.currentData ?? [];
  const routingLoading = routingOptions.isLoading || routingOptions.isFetching;
  const inquiryFormsLoading =
    forms.isLoading || forms.isFetching || (Boolean(formik.values.cycleId) && routingLoading);
  const routingReady =
    Boolean(formik.values.cycleId) &&
    !routingLoading &&
    !routingOptions.isError &&
    routingOptions.currentData !== undefined;
  const availableForms = publishedForms.filter((form) =>
    linkOptions.some((option) => option.inquiryFormDefinitionId === form.id)
  );
  const replacementOptions = useGetAdmissionPublicInquiryLinkOptionsQuery(
    formTarget?.admissionCycleId ?? '',
    { skip: !formTarget, refetchOnMountOrArgChange: true }
  );
  const replacementLoading =
    forms.isLoading ||
    forms.isFetching ||
    replacementOptions.isLoading ||
    replacementOptions.isFetching;
  const replacementReady =
    Boolean(formTarget) &&
    !replacementLoading &&
    !forms.isError &&
    !replacementOptions.isError &&
    replacementOptions.currentData !== undefined;
  const replacementForms = publishedForms.filter((form) =>
    replacementOptions.currentData?.some((option) => option.inquiryFormDefinitionId === form.id)
  );
  const { dirty } = formik;
  const formEditor = useFormik({
    initialValues: { formId: '' },
    validationSchema: Yup.object({
      formId: Yup.string().required('Choose a published inquiry form.'),
    }),
    onSubmit: async (values) => {
      if (!formTarget) return;
      setError('');
      if (!replacementReady || !replacementForms.some((form) => form.id === values.formId)) {
        setError(noEligibleFormsHelp);
        return;
      }
      try {
        await setLinkForm({
          id: formTarget.id,
          concurrencyStamp: formTarget.concurrencyStamp,
          inquiryFormDefinitionId: values.formId,
        }).unwrap();
        formEditor.resetForm();
        setFormTarget(null);
        shikshaMitraToast.success({ message: 'Inquiry form attached to the link.' });
      } catch (problem) {
        setError(parseApiProblemDetail(problem).detail || 'Unable to attach the inquiry form.');
      }
    },
  });

  const openFormEditor = (link: AdmissionPublicInquiryLink) => {
    setError('');
    formEditor.resetForm({ values: { formId: link.inquiryFormDefinitionId ?? '' } });
    setFormTarget(link);
  };
  const closeFormEditor = () => {
    if (setLinkFormState.isLoading) return;
    if (formEditor.dirty) {
      setFormDiscardOpen(true);
      return;
    }
    setFormTarget(null);
    setError('');
  };

  useEffect(() => {
    setFormMenuOpen(false);
    if (createOpen) {
      setOptionalOpen(!isMobile);
      setError('');
    }
  }, [createOpen, isMobile]);

  const discardAndClose = () => {
    setDiscardOpen(false);
    formik.resetForm();
    setError('');
    onCreateClose();
  };
  const closeDrawer = () => {
    if (createState.isLoading) return;
    if (dirty) {
      setDiscardOpen(true);
      return;
    }
    discardAndClose();
  };

  const createLink = async () => {
    const errors = await formik.validateForm();
    formik.setTouched({
      cycleId: true,
      formId: true,
      name: true,
      source: true,
      detail: true,
      expiresAt: true,
    });
    if (errors.name) nameInputRef.current?.focus();
    else if (errors.cycleId) cycleInputRef.current?.focus();
    else if (errors.formId) formInputRef.current?.focus();
    if (Object.keys(errors).length === 0) await formik.submitForm();
  };

  const revokeLink = async (id: string, concurrencyStamp: string) => {
    setError('');
    try {
      await revoke({ id, concurrencyStamp }).unwrap();
      setCreatedLinks((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      shikshaMitraToast.success({ message: 'Inquiry link revoked.' });
      setRevokeTarget(null);
    } catch (problem) {
      setError(parseApiProblemDetail(problem).detail || 'Unable to revoke the inquiry link.');
    }
  };

  const copyLink = async (link: AdmissionPublicInquiryLink) => {
    const token = createdLinks[link.id]?.token;
    if (!token || copyingLinkId) return;
    setCopyingLinkId(link.id);
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/admission-inquiry/${token}`);
      shikshaMitraToast.success({ message: 'Inquiry link copied.' });
    } catch {
      shikshaMitraToast.error({
        message: 'Unable to copy the link. Allow clipboard access and try again.',
      });
    } finally {
      setCopyingLinkId(null);
    }
  };

  const listedLinks = links.currentData ?? [];
  const sessionLinks = Object.values(createdLinks)
    .reverse()
    .map(
      ({ token: _token, ...link }) => listedLinks.find((listed) => listed.id === link.id) ?? link
    );
  const visibleLinks = [...sessionLinks, ...listedLinks.filter((link) => !createdLinks[link.id])];
  const rows: LinkRow[] = visibleLinks.map((link) => {
    const expired = Boolean(link.expiresAtUtc && Date.parse(link.expiresAtUtc) <= Date.now());
    return {
      ...link,
      sourceDisplay: `${INQUIRY_SOURCE_OPTIONS.find((item) => item.value === link.source)?.label ?? 'Source'}${link.sourceDetail ? ` · ${link.sourceDetail}` : ''}`,
      periodName:
        publishedCycles.find((cycle) => cycle.id === link.admissionCycleId)?.name ??
        'Admission period unavailable',
      formName: link.inquiryFormDefinitionId
        ? (publishedForms.find((form) => form.id === link.inquiryFormDefinitionId)?.name ??
          'Inquiry form unavailable')
        : 'Offering inquiry form',
      status: link.isActive ? (expired ? 'Expired' : 'Active') : 'Revoked',
    };
  });
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Link',
      filterType: 'string',
      isFilter: true,
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
      minWidth: 170,
      render: (value) => <AdmissionTableText text={String(value ?? '')} strong />,
    },
    {
      id: 'sourceDisplay',
      label: 'Source',
      filterType: 'string',
      isFilter: true,
      minWidth: 190,
      render: (value) => <AdmissionTableText text={String(value ?? '')} />,
    },
    {
      id: 'periodName',
      label: 'Admission period',
      filterType: 'string',
      isFilter: true,
      minWidth: 180,
      render: (value) => <AdmissionTableText text={String(value ?? '')} />,
    },
    {
      id: 'expiresAtUtc',
      label: 'Expires',
      filterType: 'date',
      isFilter: true,
      minWidth: 150,
      render: (_value, row) => {
        const { expiresAtUtc } = row as LinkRow;
        return (
          <AdmissionTableText
            text={expiresAtUtc ? (fDate(expiresAtUtc, 'DD-MM-YYYY') ?? '—') : 'No expiry'}
            tooltip={expiresAtUtc ? fDateTime(expiresAtUtc) : 'No expiry'}
          />
        );
      },
    },
    {
      id: 'formName',
      label: 'Inquiry form',
      filterType: 'string',
      isFilter: true,
      minWidth: 180,
      render: (value) => <AdmissionTableText text={String(value ?? '')} />,
    },
    {
      id: 'status',
      label: 'Status',
      stickyOnMobile: false,
      filterType: 'enum',
      isFilter: true,
      enumOptions: ['Active', 'Expired', 'Revoked'].map((value) => ({ label: value, value })),
      sticky: true,
      stickyPosition: 'right',
      minWidth: 105,
      render: (_value, row) => {
        const { status } = row as LinkRow;
        return <Label color={status === 'Active' ? 'success' : 'default'}>{status}</Label>;
      },
    },
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
      align: 'right',
      minWidth: 120,
      headerSx: { width: { xs: 76, sm: 120 }, minWidth: { xs: 76, sm: 120 } },
      cellSx: { width: { xs: 76, sm: 120 }, minWidth: { xs: 76, sm: 120 } },
      render: (_value, row) => {
        const link = row as LinkRow;
        return (
          <AdaptiveThreeDotsActions
            mobileDirectActionLimit={0}
            placement="top-right"
            moreLabel={`More actions for ${link.name}`}
            sx={{
              justifyContent: 'flex-end',
              gap: 0.5,
              '& .MuiIconButton-root': {
                width: { xs: 44, sm: 30 },
                height: { xs: 44, sm: 30 },
              },
            }}
            actions={
              link.isActive
                ? [
                    {
                      id: 'copy',
                      label: isMobile ? 'Copy inquiry link' : `Copy inquiry link for ${link.name}`,
                      icon: 'mdi:content-copy',
                      disabled:
                        !createdLinks[link.id]?.token ||
                        link.status !== 'Active' ||
                        Boolean(copyingLinkId),
                      tooltip:
                        link.status !== 'Active'
                          ? 'This inquiry link has expired.'
                          : createdLinks[link.id]?.token
                            ? 'Copy this link before leaving the page. Its full address is only available after creation.'
                            : 'The full address is only available during the session in which this link was created.',
                      onClick: () => copyLink(link),
                    },
                    {
                      id: 'form',
                      label: isMobile ? 'Set inquiry form' : `Set inquiry form for ${link.name}`,
                      icon: 'mdi:form-select',
                      disabled: setLinkFormState.isLoading,
                      onClick: () => openFormEditor(link),
                    },
                    {
                      id: 'revoke',
                      label: isMobile ? 'Revoke link' : `Revoke ${link.name}`,
                      icon: 'mdi:link-variant-off',
                      color: 'error.main',
                      disabled: revokeState.isLoading,
                      onClick: () => setRevokeTarget(link),
                    },
                  ]
                : []
            }
          />
        );
      },
    });
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: 1,
          height: 1,
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {error && !createOpen && (
          <StudentFeedback
            notificationKey="STU-0139"
            presentation="persistent"
            severity="error"
            onClose={() => setError('')}
          >
            {error}
          </StudentFeedback>
        )}
        {links.isError && rows.length > 0 && (
          <AdmissionQueryError onRetry={() => links.refetch()} />
        )}
        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          <CustomizableTable
            tableId="admission-public-inquiry-links"
            tableTitle="Public admission inquiry links"
            wrapperProps={{ sx: { flex: 1, height: 1, minHeight: 0, minWidth: 0 } }}
            tableContainerProps={{ sx: { height: 1 } }}
            columns={columns}
            data={rows}
            errorContent={
              links.isError && rows.length === 0 ? (
                <AdmissionQueryError onRetry={() => links.refetch()} />
              ) : undefined
            }
            {...createdTableContext}
            handleRowClick={(row) => setViewLink(row as LinkRow)}
            rowProps={(row) => ({
              tabIndex: 0,
              sx: { cursor: 'pointer' },
              onKeyDown: (event) => {
                if (
                  event.target === event.currentTarget &&
                  (event.key === 'Enter' || event.key === ' ')
                ) {
                  event.preventDefault();
                  setViewLink(row as LinkRow);
                }
              },
            })}
            isLoading={links.isLoading || (!links.currentData && links.isFetching)}
            isRefreshing={Boolean(links.currentData && links.isFetching)}
            isPagination
            isSearch
            isFilter
            noDataText="No inquiry links yet. Create a link for a website, QR code, or school event."
          />
        </Box>
      </Box>

      <CustomDialog
        open={Boolean(viewLink)}
        handleClose={() => setViewLink(null)}
        title={viewLink ? `Inquiry link: ${viewLink.name}` : 'Inquiry link details'}
        hasForm={false}
        maxWidth="sm"
        paperProps={{ sx: { '& .MuiTypography-h6': { overflowWrap: 'anywhere' } } }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <FormSectionCard
              icon="mdi:link-variant"
              title="Link details"
              descriptionTooltip="Review this link’s source, admission period, form, and availability."
              titleTypographyProps={{
                sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 },
              }}
              action={
                viewLink && (
                  <Label color={viewLink.status === 'Active' ? 'success' : 'default'}>
                    {viewLink.status}
                  </Label>
                )
              }
            >
              <Box
                component="dl"
                sx={{
                  m: 0,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 2,
                }}
              >
                {[
                  { label: 'Source', value: viewLink?.sourceDisplay },
                  {
                    label: 'Expires',
                    value: viewLink?.expiresAtUtc ? fDateTime(viewLink.expiresAtUtc) : 'No expiry',
                  },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ minWidth: 0 }}>
                    <Typography component="dt" variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography
                      component="dd"
                      variant="body2"
                      fontWeight={600}
                      sx={{ m: 0, overflowWrap: 'anywhere' }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </FormSectionCard>
            <FormSectionCard
              icon="mdi:source-branch"
              title="Routing"
              titleTypographyProps={{
                sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 },
              }}
            >
              <Box
                component="dl"
                sx={{
                  m: 0,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 2,
                }}
              >
                {[
                  { label: 'Admission period', value: viewLink?.periodName },
                  { label: 'Inquiry form', value: viewLink?.formName },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ minWidth: 0 }}>
                    <Typography component="dt" variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography
                      component="dd"
                      variant="body2"
                      fontWeight={600}
                      sx={{ m: 0, overflowWrap: 'anywhere' }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </FormSectionCard>
          </Stack>
        </DialogScrollContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            '& .MuiButton-root': { minHeight: { xs: 44, sm: 30 } },
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={() => setViewLink(null)}
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>

      <Drawer
        anchor="right"
        open={createOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: { xs: 1, sm: 440 },
            maxWidth: 1,
            height: '100dvh',
            display: 'flex',
            overflow: 'hidden',
          },
          role: 'dialog',
          'aria-labelledby': 'create-inquiry-link-title',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Typography id="create-inquiry-link-title" variant="h6">
              Create Inquiry Link
            </Typography>
            <CustomTooltip
              title="Share a link for a website, QR code, or event."
              arrow
              placement="right"
            >
              <IconButton size="small" color="info" aria-label="Create inquiry link information">
                <Iconify icon="lucide:info" width={16} />
              </IconButton>
            </CustomTooltip>
          </Stack>
          <IconButton
            size="small"
            aria-label="Close create inquiry link"
            onClick={closeDrawer}
            disabled={createState.isLoading}
            sx={{ width: { xs: 44, sm: 32 }, height: { xs: 44, sm: 32 } }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
          {error && (
            <StudentFeedback notificationKey="STU-0141" presentation="persistent" severity="error">
              {error}
            </StudentFeedback>
          )}
          <SectionCard title="Link details" paperProps={sectionProps} gridProps={{ spacing: 2 }}>
            <Grid size={12}>
              <TextField
                inputRef={nameInputRef}
                fullWidth
                size="small"
                label="Link name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.name && formik.errors.name)}
                helperText={formik.touched.name ? formik.errors.name : undefined}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                size="small"
                label="Source"
                name="source"
                value={formik.values.source}
                onChange={(event) => formik.setFieldValue('source', Number(event.target.value))}
              >
                {publicSources.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </SectionCard>
          <SectionCard
            title="Admission period and form"
            headerContent={
              <CustomTooltip title={formEligibilityHelp}>
                <IconButton
                  size="small"
                  color="info"
                  aria-label="Admission period and form information"
                >
                  <Iconify icon="lucide:info" width={16} />
                </IconButton>
              </CustomTooltip>
            }
            paperProps={sectionProps}
            gridProps={{ spacing: 2 }}
          >
            <Grid size={12}>
              <TextField
                select
                inputRef={cycleInputRef}
                fullWidth
                size="small"
                label="Admission period"
                name="cycleId"
                value={formik.values.cycleId}
                onChange={(event) => {
                  setError('');
                  setFormMenuOpen(false);
                  formik.setValues({
                    ...formik.values,
                    cycleId: event.target.value,
                    formId: '',
                  });
                }}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.cycleId && formik.errors.cycleId)}
                helperText={formik.touched.cycleId ? formik.errors.cycleId : undefined}
              >
                <MenuItem value="">Choose period</MenuItem>
                {publishedCycles.map((cycle) => (
                  <MenuItem key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              {inquiryFormsLoading ? (
                <Stack
                  spacing={0.5}
                  role="status"
                  aria-live="polite"
                  aria-label="Loading published inquiry forms"
                >
                  <Skeleton variant="rounded" height={40} />
                </Stack>
              ) : (
                <TextField
                  select
                  fullWidth
                  required
                  size="small"
                  inputRef={formInputRef}
                  label="Published inquiry form"
                  name="formId"
                  value={formik.values.formId}
                  disabled={!routingReady || forms.isError}
                  SelectProps={{
                    open: formMenuOpen,
                    onOpen: () => {
                      if (availableForms.length === 0) {
                        shikshaMitraToast.info({
                          message: noEligibleFormsHelp,
                        });
                        return;
                      }
                      setFormMenuOpen(true);
                    },
                    onClose: () => setFormMenuOpen(false),
                  }}
                  onChange={(event) => {
                    const formId = event.target.value;
                    formik.setValues({
                      ...formik.values,
                      formId,
                    });
                  }}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.formId && formik.errors.formId)}
                  helperText={formik.touched.formId ? formik.errors.formId : undefined}
                >
                  <MenuItem value="">Choose form</MenuItem>
                  {availableForms.map((form) => (
                    <MenuItem key={form.id} value={form.id}>
                      {form.name} · v{form.version}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Grid>

            {(cycles.isError || forms.isError || routingOptions.isError) && (
              <Grid size={12}>
                <StudentFeedback
                  notificationKey="STU-0144"
                  presentation="toast"
                  severity="error"
                  action={
                    <Button
                      size="small"
                      onClick={() => {
                        if (cycles.isError) cycles.refetch();
                        if (forms.isError) forms.refetch();
                        if (routingOptions.isError) routingOptions.refetch();
                      }}
                    >
                      Retry
                    </Button>
                  }
                >
                  Unable to load admission periods and forms.
                </StudentFeedback>
              </Grid>
            )}
            {routingReady && !forms.isError && availableForms.length === 0 && (
              <Grid size={12}>
                <Button size="small" onClick={() => routingOptions.refetch()}>
                  Refresh offerings
                </Button>
              </Grid>
            )}
            {!cycles.isError &&
              !forms.isError &&
              !cycles.isLoading &&
              !forms.isLoading &&
              publishedCycles.length === 0 && (
                <Grid size={12}>
                  <AdmissionIntakeNotice
                    notificationKey="STU-0145"
                    presentation="inline"
                    severity="info"
                  >
                    Publish an admission period before creating a link.
                  </AdmissionIntakeNotice>
                </Grid>
              )}
          </SectionCard>
          <SectionCard
            title="Optional details"
            paperProps={sectionProps}
            gridProps={{ spacing: 2 }}
            headerContent={
              <IconButton
                size="small"
                aria-label={optionalOpen ? 'Hide optional details' : 'Show optional details'}
                aria-expanded={optionalOpen}
                onClick={() => setOptionalOpen(!optionalOpen)}
                sx={{ width: 44, height: 44 }}
              >
                <Iconify icon={optionalOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
              </IconButton>
            }
          >
            {optionalOpen ? (
              <>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Campaign or event details"
                    name="detail"
                    value={formik.values.detail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>
                <Grid size={12}>
                  <DateTimePicker
                    label="Link expiry"
                    value={formik.values.expiresAt}
                    onChange={(value) => formik.setFieldValue('expiresAt', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: Boolean(formik.touched.expiresAt && formik.errors.expiresAt),
                        helperText:
                          formik.touched.expiresAt && formik.errors.expiresAt
                            ? String(formik.errors.expiresAt)
                            : undefined,
                        onBlur: () => formik.setFieldTouched('expiresAt', true),
                      },
                    }}
                  />
                </Grid>
              </>
            ) : (
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Campaign or event details and link expiry
                </Typography>
              </Grid>
            )}
          </SectionCard>
        </Stack>
        <Divider />
        <Stack
          direction="row"
          spacing={1}
          sx={{ p: 2, '& .MuiButton-root': { minHeight: { xs: 44, sm: 32 } } }}
        >
          <Button
            fullWidth
            size="small"
            variant="outlined"
            onClick={closeDrawer}
            disabled={formik.isSubmitting || createState.isLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            fullWidth
            size="small"
            variant="contained"
            loading={formik.isSubmitting || createState.isLoading}
            disabled={
              inquiryFormsLoading ||
              (Boolean(formik.values.cycleId) &&
                (!routingReady || linkOptions.length === 0 || forms.isError))
            }
            onClick={createLink}
          >
            Create link
          </LoadingButton>
        </Stack>
      </Drawer>
      <Drawer
        anchor="right"
        open={Boolean(formTarget)}
        onClose={closeFormEditor}
        PaperProps={{
          component: 'form',
          onSubmit: formEditor.handleSubmit,
          sx: {
            width: { xs: 1, sm: 440 },
            maxWidth: 1,
            height: '100dvh',
            display: 'flex',
            overflow: 'hidden',
          },
          role: 'dialog',
          'aria-labelledby': 'set-inquiry-form-title',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography id="set-inquiry-form-title" variant="h6">
              Set inquiry form
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formTarget?.name}
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label="Close set inquiry form"
            onClick={closeFormEditor}
            disabled={setLinkFormState.isLoading}
            sx={{ width: { xs: 44, sm: 32 }, height: { xs: 44, sm: 32 } }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
          <AdmissionIntakeNotice notificationKey="STU-0146" presentation="inline" severity="info">
            Future inquiries from this link will use the selected published form. Earlier responses
            keep their saved answers.
          </AdmissionIntakeNotice>
          {error && (
            <StudentFeedback notificationKey="STU-0141" presentation="persistent" severity="error">
              {error}
            </StudentFeedback>
          )}
          {replacementLoading ? (
            <Stack role="status" aria-live="polite" aria-label="Loading published inquiry forms">
              <Skeleton variant="rounded" height={40} />
            </Stack>
          ) : (
            <TextField
              select
              fullWidth
              required
              size="small"
              label="Published inquiry form"
              name="formId"
              value={
                replacementForms.some((form) => form.id === formEditor.values.formId)
                  ? formEditor.values.formId
                  : ''
              }
              disabled={!replacementReady}
              onChange={formEditor.handleChange}
              onBlur={formEditor.handleBlur}
              error={Boolean(formEditor.touched.formId && formEditor.errors.formId)}
              helperText={
                (formEditor.touched.formId && formEditor.errors.formId) ||
                (replacementReady && replacementForms.length === 0
                  ? noEligibleFormsHelp
                  : formEligibilityHelp)
              }
            >
              <MenuItem value="">Choose form</MenuItem>
              {replacementForms.map((form) => (
                <MenuItem key={form.id} value={form.id}>
                  {form.name} · v{form.version}
                </MenuItem>
              ))}
            </TextField>
          )}
          {replacementReady && replacementForms.length === 0 && (
            <Button size="small" onClick={() => replacementOptions.refetch()}>
              Refresh offerings
            </Button>
          )}
          {(forms.isError || replacementOptions.isError) && (
            <Stack spacing={1}>
              <StudentFeedback notificationKey="STU-0148" presentation="toast" severity="error">
                Unable to load published inquiry forms.
              </StudentFeedback>
              <Button
                size="small"
                onClick={() => {
                  if (forms.isError) forms.refetch();
                  if (replacementOptions.isError) replacementOptions.refetch();
                }}
              >
                Retry
              </Button>
            </Stack>
          )}
        </Stack>
        <Divider />
        <Stack
          direction="row"
          spacing={1}
          sx={{ p: 2, '& .MuiButton-root': { minHeight: { xs: 44, sm: 32 } } }}
        >
          <Button
            fullWidth
            size="small"
            variant="outlined"
            onClick={closeFormEditor}
            disabled={setLinkFormState.isLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            fullWidth
            size="small"
            variant="contained"
            type="submit"
            loading={setLinkFormState.isLoading || formEditor.isSubmitting}
            disabled={
              !replacementReady ||
              !replacementForms.some((form) => form.id === formEditor.values.formId)
            }
          >
            Save form
          </LoadingButton>
        </Stack>
      </Drawer>
      <ConfirmDialog
        open={formDiscardOpen}
        onClose={() => setFormDiscardOpen(false)}
        title="Discard form selection?"
        content="The new form selection will not be saved."
        action={
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={() => {
              setFormDiscardOpen(false);
              formEditor.resetForm();
              setFormTarget(null);
              setError('');
            }}
          >
            Discard selection
          </Button>
        }
      />
      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard inquiry link details?"
        content="The link details you entered will be lost."
        action={
          <Button size="small" color="error" variant="contained" onClick={discardAndClose}>
            Discard details
          </Button>
        }
      />
      <ConfirmDialog
        open={Boolean(revokeTarget)}
        onClose={() => !revokeState.isLoading && setRevokeTarget(null)}
        title="Revoke inquiry link?"
        content={`The ${revokeTarget?.name ?? 'selected'} link will stop accepting new inquiries.`}
        action={
          <LoadingButton
            size="small"
            color="error"
            variant="contained"
            loading={revokeState.isLoading}
            onClick={() => {
              if (revokeTarget) revokeLink(revokeTarget.id, revokeTarget.concurrencyStamp);
            }}
          >
            Revoke link
          </LoadingButton>
        }
      />
    </>
  );
}
