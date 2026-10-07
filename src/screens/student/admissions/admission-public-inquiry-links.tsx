'use client';

import type { Dayjs } from 'dayjs';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionPublicInquiryLink } from 'src/redux/student/admissions/admission-intake-profiles-api';

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
  Alert,
  Stack,
  Button,
  Drawer,
  Divider,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  useMediaQuery,
} from '@mui/material';
import {
  useGetAdmissionIntakeSetupsQuery,
  useGetAdmissionPublicInquiryLinksQuery,
  useCreateAdmissionPublicInquiryLinkMutation,
  useRevokeAdmissionPublicInquiryLinkMutation,
  useGetAdmissionPublicInquiryLinkOptionsQuery,
  useSetAdmissionPublicInquiryLinkFormMutation,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import { AdmissionTableText } from './admission-table-text';
import { AdmissionIntakeNotice } from './admission-intake-notice';
import { INQUIRY_SOURCE_OPTIONS } from './inquiry-management/admission-inquiry-list-options';

const publicSources = INQUIRY_SOURCE_OPTIONS.filter((item) =>
  [0, 3, 4, 10, 11, 12].includes(item.value)
);
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
  setupId: string;
  formId: string;
  name: string;
  source: number;
  detail: string;
  expiresAt: Dayjs | null;
};

const linkSchema = Yup.object({
  cycleId: Yup.string().required('Choose a published admission period.'),
  setupId: Yup.string().required('Choose an admission intake setup.'),
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
  const setupInputRef = useRef<HTMLInputElement>(null);
  const appliedInitialSetup = useRef<string | null>(null);
  const formInputRef = useRef<HTMLInputElement>(null);
  const cycles = useGetAdmissionCyclesQuery({ maxResultCount: 100, skipCount: 0 });
  const setups = useGetAdmissionIntakeSetupsQuery(undefined, {
    skip: !createOpen,
    refetchOnMountOrArgChange: true,
  });
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
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');
  const publishedCycles = (cycles.data?.items ?? []).filter((cycle) => cycle.status === 1);
  const publishedForms = (forms.data?.items ?? []).filter(
    (form) => form.status === 1 && form.purpose === 0
  );
  const allSetups = setups.data ?? [];
  const setupsLoading = setups.isLoading || setups.isFetching;
  const formik = useFormik<LinkValues>({
    initialValues: {
      cycleId: '',
      setupId: '',
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
        const setup = (setups.data ?? []).find((item) => item.id === values.setupId);
        if (!setup) {
          setError(
            'The selected admission intake setup is no longer available. Choose another setup.'
          );
          return;
        }
        if (
          !routingReady ||
          !linkOptions.some(
            (option) =>
              option.counsellorAssignmentProfileId === setup.counsellorAssignmentProfileId &&
              option.inquiryFormDefinitionId === values.formId
          )
        ) {
          setError(
            'Choose a setup and inquiry form linked to the same active Inquiry or Both Offering in this period. Refresh offerings after updating the configuration.'
          );
          return;
        }
        const result = await create({
          admissionCycleId: values.cycleId,
          counsellorAssignmentProfileId: setup.counsellorAssignmentProfileId,
          inquiryFormDefinitionId: values.formId,
          name: values.name.trim(),
          source: values.source,
          sourceDetail: values.detail.trim() || null,
          expiresAtUtc: values.expiresAt?.toISOString() ?? null,
        }).unwrap();
        setNewUrl(`${window.location.origin}/admission-inquiry/${result.token}`);
        formik.resetForm();
        appliedInitialSetup.current = null;
        onCreateClose();
        shikshaMitraToast.success({ message: 'Inquiry link created. Copy it now.' });
      } catch (problem) {
        const parsed = parseApiProblemDetail(problem);
        setError(
          parsed.errorCode === 'Admissions.InquiryCounsellorInvalid'
            ? 'The selected admission period needs an active offering that accepts inquiries, with access for at least one counsellor and the fallback manager in this setup. Activate/configure the offering or choose another period, then retry.'
            : parsed.errorCode === 'Admissions.PublicInquiry.OfferingRequired'
              ? parsed.detail && parsed.detail !== 'One or more business rules were violated.'
                ? parsed.detail
                : 'No active Inquiry or Both Offering in this period matches the selected setup and form. Attach both to the same Offering, activate it, then refresh offerings and retry.'
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
  const routingReady =
    Boolean(formik.values.cycleId) &&
    !routingLoading &&
    !routingOptions.isError &&
    routingOptions.currentData !== undefined;
  const availableForms = publishedForms.filter((form) =>
    linkOptions.some((option) => option.inquiryFormDefinitionId === form.id)
  );
  const availableSetups = !formik.values.cycleId
    ? allSetups
    : allSetups.filter((setup) =>
        linkOptions.some(
          (option) =>
            option.counsellorAssignmentProfileId === setup.counsellorAssignmentProfileId &&
            (!formik.values.formId || option.inquiryFormDefinitionId === formik.values.formId)
        )
      );
  const setupPlaceholder = setupsLoading
    ? 'Loading intake setups…'
    : setups.isError
      ? 'Unable to load intake setups'
      : routingLoading && formik.values.cycleId
        ? 'Loading compatible setups…'
        : availableSetups.length === 0
          ? allSetups.length === 0
            ? 'No active intake setups'
            : 'No matching intake setups'
          : 'Choose setup';
  const { dirty } = formik;
  const formEditor = useFormik({
    initialValues: { formId: '' },
    validationSchema: Yup.object({
      formId: Yup.string().required('Choose a published inquiry form.'),
    }),
    onSubmit: async (values) => {
      if (!formTarget) return;
      setError('');
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
    if (createOpen) {
      setOptionalOpen(!isMobile);
      setError('');
    }
  }, [createOpen, isMobile]);

  useEffect(() => {
    if (
      createOpen &&
      initialSetupId &&
      appliedInitialSetup.current !== initialSetupId &&
      (setups.data ?? []).some((setup) => setup.id === initialSetupId)
    ) {
      formik.setFieldValue('setupId', initialSetupId, false);
      appliedInitialSetup.current = initialSetupId;
    }
  }, [createOpen, initialSetupId, setups.data, formik]);

  const discardAndClose = () => {
    setDiscardOpen(false);
    formik.resetForm();
    appliedInitialSetup.current = null;
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
      setupId: true,
      formId: true,
      name: true,
      source: true,
      detail: true,
      expiresAt: true,
    });
    if (errors.name) nameInputRef.current?.focus();
    else if (errors.cycleId) cycleInputRef.current?.focus();
    else if (errors.formId) formInputRef.current?.focus();
    else if (errors.setupId) setupInputRef.current?.focus();
    if (Object.keys(errors).length === 0) await formik.submitForm();
  };

  const revokeLink = async (id: string, concurrencyStamp: string) => {
    setError('');
    try {
      await revoke({ id, concurrencyStamp }).unwrap();
      shikshaMitraToast.success({ message: 'Inquiry link revoked.' });
      setRevokeTarget(null);
    } catch (problem) {
      setError(parseApiProblemDetail(problem).detail || 'Unable to revoke the inquiry link.');
    }
  };

  const rows: LinkRow[] = (links.data ?? []).map((link) => {
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
      minWidth: 190,
      render: (value) => <AdmissionTableText text={String(value ?? '')} />,
    },
    {
      id: 'periodName',
      label: 'Admission period',
      filterType: 'string',
      minWidth: 180,
      render: (value) => <AdmissionTableText text={String(value ?? '')} />,
    },
    {
      id: 'expiresAtUtc',
      label: 'Expires',
      filterType: 'dateTime',
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
      minWidth: 180,
      render: (value) => <AdmissionTableText text={String(value ?? '')} />,
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum',
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
      minWidth: 104,
      headerSx: { width: { xs: 76, sm: 104 }, minWidth: { xs: 76, sm: 104 } },
      cellSx: { width: { xs: 76, sm: 104 }, minWidth: { xs: 76, sm: 104 } },
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
        {error && !createOpen && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {newUrl && (
          <Alert
            severity="success"
            action={
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:content-copy" />}
                onClick={() => navigator.clipboard.writeText(newUrl)}
              >
                Copy link
              </Button>
            }
          >
            Copy this link now. Its full address is shown only once.
            <TextField
              fullWidth
              size="small"
              aria-label="New inquiry link"
              value={newUrl}
              sx={{ mt: 1 }}
              slotProps={{ input: { readOnly: true } }}
            />
          </Alert>
        )}
        {links.isError && !links.data ? (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => links.refetch()}>
                Retry
              </Button>
            }
          >
            Unable to load inquiry links.
          </Alert>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <CustomizableTable
              tableId="admission-public-inquiry-links"
              tableTitle="Public admission inquiry links"
              wrapperProps={{ sx: { height: 1 } }}
              tableContainerProps={{ sx: { height: 1 } }}
              columns={columns}
              data={rows}
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
              isLoading={links.isLoading}
              isPagination
              isSearch
              isFilter
              noDataText="No inquiry links yet. Create a link for a website, QR code, or school event."
            />
          </Box>
        )}
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
              Create inquiry link
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
          {error && <Alert severity="error">{error}</Alert>}
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
          <SectionCard title="Routing" paperProps={sectionProps} gridProps={{ spacing: 2 }}>
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
                  formik.setValues({
                    ...formik.values,
                    cycleId: event.target.value,
                    formId: '',
                    setupId: '',
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
              <TextField
                select
                fullWidth
                required
                size="small"
                inputRef={formInputRef}
                label="Published inquiry form"
                name="formId"
                value={formik.values.formId}
                disabled={!routingReady || availableForms.length === 0}
                onChange={(event) => {
                  const formId = event.target.value;
                  const setup = allSetups.find((item) => item.id === formik.values.setupId);
                  const keepSetup = linkOptions.some(
                    (option) =>
                      option.inquiryFormDefinitionId === formId &&
                      option.counsellorAssignmentProfileId === setup?.counsellorAssignmentProfileId
                  );
                  formik.setValues({
                    ...formik.values,
                    formId,
                    setupId: keepSetup ? formik.values.setupId : '',
                  });
                }}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.formId && formik.errors.formId)}
                helperText={
                  formik.touched.formId && formik.errors.formId
                    ? formik.errors.formId
                    : !formik.values.cycleId
                      ? 'Choose an admission period to load linked inquiry forms.'
                      : 'Forms linked to active Inquiry or Both Offerings in this period.'
                }
              >
                <MenuItem value="">Choose form</MenuItem>
                {availableForms.map((form) => (
                  <MenuItem key={form.id} value={form.id}>
                    {form.name} · v{form.version}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                select
                inputRef={setupInputRef}
                fullWidth
                size="small"
                label="Admission intake setup"
                name="setupId"
                value={formik.values.setupId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={
                  setupsLoading ||
                  setups.isError ||
                  routingLoading ||
                  routingOptions.isError ||
                  availableSetups.length === 0
                }
                InputLabelProps={{ shrink: true }}
                SelectProps={{ displayEmpty: true }}
                error={Boolean(formik.touched.setupId && formik.errors.setupId)}
                helperText={formik.touched.setupId ? formik.errors.setupId : undefined}
              >
                <MenuItem value="">{setupPlaceholder}</MenuItem>
                {availableSetups.map((setup) => (
                  <MenuItem key={setup.id} value={setup.id}>
                    {setup.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {(cycles.isError || setups.isError || forms.isError || routingOptions.isError) && (
              <Grid size={12}>
                <Alert
                  severity="error"
                  action={
                    <Button
                      size="small"
                      onClick={() => {
                        if (cycles.isError) cycles.refetch();
                        if (setups.isError) setups.refetch();
                        if (forms.isError) forms.refetch();
                        if (routingOptions.isError) routingOptions.refetch();
                      }}
                    >
                      Retry
                    </Button>
                  }
                >
                  Unable to load routing options.
                </Alert>
              </Grid>
            )}
            {routingReady && linkOptions.length === 0 && (
              <Grid size={12}>
                <Alert
                  severity="info"
                  action={
                    <Button size="small" onClick={() => routingOptions.refetch()}>
                      Refresh offerings
                    </Button>
                  }
                >
                  No compatible inquiry Offering is available in this period. In Admission
                  offerings, attach an active intake setup and a published Inquiry form to the same
                  Offering, then activate it with Inquiry or Both entry mode. Your account also
                  needs access to that Offering.
                </Alert>
              </Grid>
            )}
            {!cycles.isError &&
              !setups.isError &&
              !forms.isError &&
              !cycles.isLoading &&
              !setupsLoading &&
              !forms.isLoading &&
              (publishedCycles.length === 0 ||
                (setups.data ?? []).length === 0 ||
                publishedForms.length === 0) && (
                <Grid size={12}>
                  <AdmissionIntakeNotice
                    severity="info"
                    action={
                      allSetups.length === 0 ? (
                        <Button size="small" onClick={() => setups.refetch()}>
                          Refresh setups
                        </Button>
                      ) : undefined
                    }
                  >
                    {publishedCycles.length === 0
                      ? 'Publish an admission period before creating a link.'
                      : publishedForms.length === 0
                        ? 'Publish an Inquiry form before creating a link.'
                        : 'No active admission intake setup is available. Create one in the Admission intake setups tab before creating a link.'}
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
              Boolean(formik.values.cycleId) &&
              (!routingReady || linkOptions.length === 0 || setups.isError || forms.isError)
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
          <AdmissionIntakeNotice severity="info">
            Future inquiries from this link will use the selected published form. Earlier responses
            keep their saved answers.
          </AdmissionIntakeNotice>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            fullWidth
            required
            size="small"
            label="Published inquiry form"
            name="formId"
            value={formEditor.values.formId}
            onChange={formEditor.handleChange}
            onBlur={formEditor.handleBlur}
            error={Boolean(formEditor.touched.formId && formEditor.errors.formId)}
            helperText={formEditor.touched.formId ? formEditor.errors.formId : undefined}
          >
            <MenuItem value="">Choose form</MenuItem>
            {publishedForms.map((form) => (
              <MenuItem key={form.id} value={form.id}>
                {form.name} · v{form.version}
              </MenuItem>
            ))}
          </TextField>
          {forms.isError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => forms.refetch()}>
                  Retry
                </Button>
              }
            >
              Unable to load published inquiry forms.
            </Alert>
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
