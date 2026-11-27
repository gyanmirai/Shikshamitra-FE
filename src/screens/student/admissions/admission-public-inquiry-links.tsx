'use client';

import type { Dayjs } from 'dayjs';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionPublicInquiryLink } from 'src/redux/student/admissions/admission-intake-profiles-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useRef, useState, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useStudentSetupFormState } from 'src/screens/student/setup/embedding';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { useGetAdmissionFormsQuery } from 'src/redux/student/admissions/admission-forms-api';
import { useStudentDrawerExit } from 'src/screens/student/components/use-student-drawer-exit';
import { useGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import {
  Box,
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
  inputLabelClasses,
  outlinedInputClasses,
} from '@mui/material';
import {
  useGetAdmissionPublicInquiryLinksQuery,
  useCreateAdmissionPublicInquiryLinkMutation,
  useRenameAdmissionPublicInquiryLinkMutation,
  useRevokeAdmissionPublicInquiryLinkMutation,
  useGetAdmissionPublicInquiryLinkOptionsQuery,
  useRegenerateAdmissionPublicInquiryLinkMutation,
  useGetAdmissionPublicInquiryLinkCopyTokenMutation,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import { AdmissionTableText } from './admission-table-text';
import { AdmissionQueryError } from './admission-query-error';
import { AdmissionIntakeNotice } from './admission-intake-notice';
import { useAdmissionCloseGuard } from './use-admission-close-guard';
import { ADMISSION_DATE_TIME_FORMAT } from './admission-date-formats';
import { INQUIRY_SOURCE_OPTIONS } from './inquiry-management/admission-inquiry-list-options';

const publicSources = INQUIRY_SOURCE_OPTIONS.filter((item) =>
  [0, 3, 4, 10, 11, 12].includes(item.value)
);
const formEligibilityDescription =
  'Select a published inquiry form linked to an active inquiry offering in this admission period.';
const duplicateLinkNameCode = 'Admissions.PublicInquiryLinkNameExists';
const copyTokenUnavailableCode = 'Admissions.PublicInquiry.CopyTokenUnavailable';
const linkUnavailableCode = 'Admissions.PublicInquiry.LinkUnavailable';
const duplicateLinkNameMessage =
  'An inquiry link with this name already exists. Enter a different name.';
const noEligibleFormsHelp =
  'Create an Admission Offering first if this period has none. Attach a published Inquiry form to an offering that accepts inquiries, activate the offering if needed, then refresh offerings.';
const disabledFieldErrorSx = {
  [`& .${outlinedInputClasses.root}.${outlinedInputClasses.disabled}.${outlinedInputClasses.error} .${outlinedInputClasses.notchedOutline}`]:
    {
      borderColor: 'error.main',
    },
  [`& .${inputLabelClasses.root}.${inputLabelClasses.disabled}.${inputLabelClasses.error}`]: {
    color: 'error.main',
  },
} as const;
const drawerFooterSx = {
  px: 2,
  py: 1.75,
  borderTop: 1,
  borderColor: 'divider',
  flexShrink: 0,
} as const;
const drawerScrollSlots = {
  content: { display: 'flex', flexDirection: 'column', gap: 2, p: 2 },
} as const;

const nextExpiryMinute = () => dayjs().add(1, 'minute').startOf('minute');

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

const linkNameSchema = Yup.string().trim().required('Enter a link name.').max(128);
const linkSchema = Yup.object({
  cycleId: Yup.string().required('Choose a published admission period.'),
  formId: Yup.string().required('Choose a published inquiry form.'),
  name: linkNameSchema,
  source: Yup.number().integer().required('Choose a source.'),
  detail: Yup.string().trim().max(512),
  expiresAt: Yup.mixed<Dayjs>()
    .nullable()
    .test(
      'future',
      'Choose a future expiry.',
      (value) => !value || (value.isValid() && value.isAfter(dayjs()))
    ),
});

function LinkDetailFacts({ fields }: { fields: { label: string; value: string | undefined }[] }) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        columnGap: 2,
        rowGap: 1.25,
      }}
    >
      {fields.map(({ label, value }) => (
        <Box key={label} sx={{ minWidth: 0 }}>
          <Typography component="dt" variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography
            component="dd"
            variant="body2"
            sx={{ m: 0, mt: 0.25, overflowWrap: 'anywhere' }}
          >
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

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
  const links = useGetAdmissionPublicInquiryLinksQuery();
  const [create, createState] = useCreateAdmissionPublicInquiryLinkMutation();
  const [rename, renameState] = useRenameAdmissionPublicInquiryLinkMutation();
  const [revoke, revokeState] = useRevokeAdmissionPublicInquiryLinkMutation();
  const [getCopyToken, copyTokenState] = useGetAdmissionPublicInquiryLinkCopyTokenMutation();
  const [regenerate, regenerateState] = useRegenerateAdmissionPublicInquiryLinkMutation();
  // Older API deployments return only IDs for saved links.
  const needsPeriodLabels = links.currentData?.some((link) => link.admissionCycleName == null);
  const needsFormLabels = links.currentData?.some(
    (link) => link.inquiryFormDefinitionId && link.inquiryFormName == null
  );
  const cycles = useGetAdmissionCyclesQuery(
    { maxResultCount: 100, skipCount: 0 },
    { skip: !createOpen && !needsPeriodLabels }
  );
  const forms = useGetAdmissionFormsQuery(
    { status: 1, purpose: 0, maxResultCount: 100 },
    { skip: !createOpen && !needsFormLabels }
  );
  const [revokeTarget, setRevokeTarget] = useState<AdmissionPublicInquiryLink | null>(null);
  const [regenerateTarget, setRegenerateTarget] = useState<LinkRow | null>(null);
  const [renameTarget, setRenameTarget] = useState<AdmissionPublicInquiryLink | null>(null);
  const [renameError, setRenameError] = useState('');
  const [rejectedName, setRejectedName] = useState<string | null>(null);
  const [expiryMinimum, setExpiryMinimum] = useState<Dayjs | null>(null);
  const [viewLinkId, setViewLinkId] = useState<string | null>(null);
  const [optionalOpen, setOptionalOpen] = useState(true);
  const [formMenuOpen, setFormMenuOpen] = useState(false);
  const [createdLinks, setCreatedLinks] = useState<Record<string, AdmissionPublicInquiryLink>>({});
  const [unreadableLinkStamps, setUnreadableLinkStamps] = useState<Record<string, string>>({});
  const linkActionInFlight = useRef(false);
  const [copyingLinkId, setCopyingLinkId] = useState<string | null>(null);
  const [createdTableContext, setCreatedTableContext] = useState<
    Pick<IParams, 'page' | 'searchTerm' | 'filters' | 'sorts'> | undefined
  >();
  const [error, setError] = useState('');
  const { closing, closeAfterExit, onExited, reopen } = useStudentDrawerExit();
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
        const { token: _token, ...result } = await create({
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
        closeAfterExit(resetAndClose);
        shikshaMitraToast.success({ message: 'Inquiry link created.' });
      } catch (problem) {
        const parsed = parseApiProblemDetail(problem);
        if (parsed.errorCode === duplicateLinkNameCode) {
          setRejectedName(values.name.trim().toUpperCase());
          nameInputRef.current?.focus();
          return;
        }
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
  const linkNameError =
    (formik.touched.name && formik.errors.name) ||
    (rejectedName === formik.values.name.trim().toUpperCase()
      ? duplicateLinkNameMessage
      : undefined);
  const periodError = formik.touched.cycleId ? formik.errors.cycleId : undefined;
  const inquiryFormError = formik.touched.formId ? formik.errors.formId : undefined;
  const sourceError = formik.touched.source ? formik.errors.source : undefined;
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
  const { dirty } = formik;
  const renameEditor = useFormik({
    initialValues: { name: '' },
    validationSchema: Yup.object({ name: linkNameSchema }),
    onSubmit: async ({ name }, helpers) => {
      if (!renameTarget) return;
      setRenameError('');
      try {
        const updated = await rename({
          id: renameTarget.id,
          concurrencyStamp: renameTarget.concurrencyStamp,
          name: name.trim(),
        }).unwrap();
        setCreatedLinks((current) =>
          current[updated.id] ? { ...current, [updated.id]: updated } : current
        );
        renameEditor.resetForm();
        setRenameTarget(null);
        shikshaMitraToast.success({ message: 'Inquiry link renamed.' });
      } catch (problem) {
        const parsed = parseApiProblemDetail(problem);
        if (parsed.errorCode === duplicateLinkNameCode) {
          helpers.setFieldError('name', duplicateLinkNameMessage);
          return;
        }
        setRenameError(parsed.detail || 'Unable to rename the inquiry link.');
      }
    },
  });
  const renameBusy = renameState.isLoading || renameEditor.isSubmitting;
  const renameGuard = useAdmissionCloseGuard(renameEditor.dirty, renameBusy, Boolean(renameTarget));
  const closeRenameEditor = () =>
    renameGuard.requestNavigation(() => {
      renameEditor.resetForm();
      setRenameTarget(null);
      setRenameError('');
    });
  const openRenameEditor = (link: AdmissionPublicInquiryLink) => {
    setRenameError('');
    renameEditor.resetForm({ values: { name: link.name } });
    setRenameTarget(link);
  };
  const renameNameError = renameEditor.touched.name ? renameEditor.errors.name : undefined;

  useStudentSetupFormState({
    dirty:
      createOpen || Boolean(revokeTarget) || Boolean(renameTarget) || Boolean(regenerateTarget),
    busy: createState.isLoading || revokeState.isLoading || renameBusy || regenerateState.isLoading,
  });

  useEffect(() => {
    if (!createOpen) reopen();
  }, [createOpen, reopen]);

  useEffect(() => {
    setFormMenuOpen(false);
    setExpiryMinimum(null);
    if (createOpen) {
      setOptionalOpen(!isMobile);
      setError('');
    }
  }, [createOpen, isMobile]);

  useEffect(() => {
    if (!createOpen || !expiryMinimum) return undefined;
    const timer = window.setTimeout(
      () => setExpiryMinimum(nextExpiryMinute()),
      Math.max(0, expiryMinimum.diff(dayjs()))
    );
    return () => window.clearTimeout(timer);
  }, [createOpen, expiryMinimum]);

  const resetAndClose = () => {
    formik.resetForm();
    setError('');
    setRejectedName(null);
    onCreateClose();
  };
  const createGuard = useAdmissionCloseGuard(dirty, createState.isLoading || closing, createOpen);
  const closeDrawer = () => createGuard.requestNavigation(() => closeAfterExit(resetAndClose));

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
    if (errors.detail || errors.expiresAt) setOptionalOpen(true);
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

  const copyLink = async (link: LinkRow) => {
    if (!canEdit || link.status !== 'Active' || linkActionInFlight.current) return;
    linkActionInFlight.current = true;
    setCopyingLinkId(link.id);
    try {
      let token: string;
      try {
        ({ token } = await getCopyToken(link.id).unwrap());
      } catch (problem) {
        const { errorCode } = parseApiProblemDetail(problem);
        if (errorCode === copyTokenUnavailableCode) {
          setUnreadableLinkStamps((current) => ({ ...current, [link.id]: link.concurrencyStamp }));
          setRegenerateTarget(link);
        } else {
          shikshaMitraToast.error({
            message:
              errorCode === linkUnavailableCode
                ? 'This inquiry link is no longer active.'
                : 'Unable to retrieve the inquiry link. Try again.',
          });
        }
        return;
      }
      const url = new URL(
        `/admission-inquiry/${encodeURIComponent(token)}`,
        window.location.origin
      );
      await navigator.clipboard.writeText(url.href);
      shikshaMitraToast.success({ message: 'Link copied' });
    } catch {
      shikshaMitraToast.error({
        message: 'Unable to copy the link. Allow clipboard access and try again.',
      });
    } finally {
      copyTokenState.reset();
      linkActionInFlight.current = false;
      setCopyingLinkId(null);
    }
  };

  const regenerateLink = async (link: LinkRow) => {
    if (!canEdit || linkActionInFlight.current) return;
    linkActionInFlight.current = true;
    try {
      const updated = await regenerate({
        id: link.id,
        concurrencyStamp: link.concurrencyStamp,
      }).unwrap();
      setCreatedLinks((current) =>
        current[updated.id] ? { ...current, [updated.id]: updated } : current
      );
      setRegenerateTarget(null);
      shikshaMitraToast.success({
        message: 'Inquiry link regenerated. Copy the new link from its actions.',
      });
    } catch (problem) {
      const { errorCode } = parseApiProblemDetail(problem);
      shikshaMitraToast.error({
        message:
          errorCode === linkUnavailableCode
            ? 'This inquiry link is no longer active.'
            : 'Unable to regenerate the inquiry link. Refresh the list and try again.',
      });
      links.refetch();
      setRegenerateTarget(null);
    } finally {
      linkActionInFlight.current = false;
    }
  };

  const getLinkShareAction = (link: LinkRow) => {
    const needsRegeneration =
      link.status === 'Active' &&
      (!link.canCopy || unreadableLinkStamps[link.id] === link.concurrencyStamp);
    const name = needsRegeneration ? 'Regenerate Link' : 'Copy Link';
    return {
      id: needsRegeneration ? 'regenerate' : 'copy',
      name,
      label: needsRegeneration
        ? `Regenerate Inquiry Link For ${link.name}`
        : `Copy Inquiry Link For ${link.name}`,
      icon: needsRegeneration ? GlobalIcons.refresh : 'mdi:content-copy',
      disabled: link.status !== 'Active' || Boolean(copyingLinkId) || regenerateState.isLoading,
      loading: copyingLinkId === link.id,
      tooltip: link.status === 'Expired' ? 'This inquiry link has expired.' : name,
      onClick: needsRegeneration ? () => setRegenerateTarget(link) : () => copyLink(link),
    };
  };

  const listedLinks = links.currentData ?? [];
  const recentLinks = Object.values(createdLinks)
    .reverse()
    .map((link) => listedLinks.find((listed) => listed.id === link.id) ?? link);
  const visibleLinks = [...recentLinks, ...listedLinks.filter((link) => !createdLinks[link.id])];
  const periodNames = new Map(cycles.data?.items.map((cycle) => [cycle.id, cycle.name]));
  const formNames = new Map(publishedForms.map((form) => [form.id, form.name]));
  const rows: LinkRow[] = visibleLinks.map((link) => {
    const expired = Boolean(link.expiresAtUtc && Date.parse(link.expiresAtUtc) <= Date.now());
    const periodName = link.admissionCycleName ?? periodNames.get(link.admissionCycleId);
    const formName = link.inquiryFormDefinitionId
      ? (link.inquiryFormName ?? formNames.get(link.inquiryFormDefinitionId))
      : 'Offering inquiry form';
    return {
      ...link,
      sourceDisplay: `${INQUIRY_SOURCE_OPTIONS.find((item) => item.value === link.source)?.label ?? 'Source'}${link.sourceDetail ? ` · ${link.sourceDetail}` : ''}`,
      periodName:
        periodName ||
        (periodName == null && (cycles.isLoading || cycles.isFetching)
          ? 'Loading admission period…'
          : 'Admission period unavailable'),
      formName:
        formName ||
        (formName == null && (forms.isLoading || forms.isFetching)
          ? 'Loading inquiry form…'
          : 'Inquiry form unavailable'),
      status: link.isActive ? (expired ? 'Expired' : 'Active') : 'Revoked',
    };
  });
  const viewLink = rows.find((row) => row.id === viewLinkId);
  const detailShareAction =
    canEdit && viewLink?.status === 'Active' ? getLinkShareAction(viewLink) : null;
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
      label: 'Admission Period',
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
            text={
              expiresAtUtc
                ? (fDateTime(expiresAtUtc, ADMISSION_DATE_TIME_FORMAT) ?? '—')
                : 'No expiry'
            }
          />
        );
      },
    },
    {
      id: 'formName',
      label: 'Inquiry Form',
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
      minWidth: 100,
      headerSx: { width: { xs: 128, sm: 100 }, minWidth: { xs: 128, sm: 100 } },
      cellSx: { width: { xs: 128, sm: 100 }, minWidth: { xs: 128, sm: 100 } },
      render: (_value, row) => {
        const link = row as LinkRow;
        const renameAction = {
          id: 'rename',
          label: 'Rename Link',
          icon: GlobalIcons.edit,
          disabled: renameBusy,
          onClick: () => openRenameEditor(link),
        };
        return (
          <AdaptiveThreeDotsActions
            directActionLimit={link.isActive ? 1 : 0}
            placement="top-right"
            moreLabel={`More Actions For ${link.name}`}
            sx={{
              justifyContent: 'flex-end',
              gap: 1,
              '& .MuiIconButton-root': {
                width: { xs: 44, sm: 30 },
                height: { xs: 44, sm: 30 },
              },
            }}
            actions={
              link.isActive
                ? [
                    getLinkShareAction(link),
                    renameAction,
                    {
                      id: 'revoke',
                      label: 'Revoke Link',
                      icon: 'mdi:link-variant-off',
                      color: 'error.main',
                      disabled: revokeState.isLoading,
                      onClick: () => setRevokeTarget(link),
                    },
                  ]
                : [renameAction]
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
            tableTitle="Public Admission Inquiry Links"
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
            handleRowClick={(row) => setViewLinkId((row as LinkRow).id)}
            rowProps={(row) => ({
              tabIndex: 0,
              sx: { cursor: 'pointer' },
              onKeyDown: (event) => {
                if (
                  event.target === event.currentTarget &&
                  (event.key === 'Enter' || event.key === ' ')
                ) {
                  event.preventDefault();
                  setViewLinkId((row as LinkRow).id);
                }
              },
            })}
            isLoading={links.isLoading || (!links.currentData && links.isFetching)}
            isRefreshing={Boolean(links.currentData && links.isFetching)}
            refreshIndicator="none"
            isPagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            isSearch
            isFilter
            noDataText="No Inquiry Links Yet. Create a Link for a Website, QR Code, or School Event."
          />
        </Box>
      </Box>

      <CustomDialog
        open={Boolean(viewLink) && !regenerateTarget}
        handleClose={() => setViewLinkId(null)}
        title={viewLink ? `Inquiry Link: ${viewLink.name}` : 'Inquiry Link Details'}
        titleInfo="Review the saved admission period, inquiry form, source and availability of this link."
        titleInfoPlacement="right"
        hasForm={false}
        maxWidth="sm"
        guardUnsavedChanges={false}
        paperProps={{ sx: { '& .MuiTypography-h6': { overflowWrap: 'anywhere' } } }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <FormSectionCard
              icon="mdi:link-variant"
              title="Link Details"
              descriptionTooltip="Review this link’s source, expiry, and current status."
              contentSpacing={1}
              action={
                viewLink && (
                  <Label color={viewLink.status === 'Active' ? 'success' : 'default'}>
                    {viewLink.status}
                  </Label>
                )
              }
            >
              <LinkDetailFacts
                fields={[
                  { label: 'Source', value: viewLink?.sourceDisplay },
                  {
                    label: 'Expires',
                    value: viewLink?.expiresAtUtc
                      ? (fDateTime(viewLink.expiresAtUtc, ADMISSION_DATE_TIME_FORMAT) ?? '—')
                      : 'No expiry',
                  },
                ]}
              />
            </FormSectionCard>
            <FormSectionCard
              icon="mdi:source-branch"
              title="Routing"
              descriptionTooltip="See which admission period and published inquiry form this link uses."
              contentSpacing={1}
            >
              <LinkDetailFacts
                fields={[
                  { label: 'Admission Period', value: viewLink?.periodName },
                  { label: 'Inquiry Form', value: viewLink?.formName },
                ]}
              />
            </FormSectionCard>
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={drawerFooterSx}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
            onClick={() => setViewLinkId(null)}
          >
            Close
          </Button>
          {detailShareAction && (
            <LoadingButton
              variant="contained"
              size="small"
              startIcon={<Iconify icon={detailShareAction.icon} width={18} />}
              loading={detailShareAction.loading}
              disabled={detailShareAction.disabled}
              onClick={detailShareAction.onClick}
            >
              {detailShareAction.name}
            </LoadingButton>
          )}
        </DialogActions>
      </CustomDialog>

      <Drawer
        anchor="right"
        open={createOpen && !closing}
        onClose={closeDrawer}
        onTransitionExited={onExited}
        PaperProps={{
          inert: closing,
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
            <InfoTooltipIcon
              title="Share a Link for a Website, QR Code, or Event."
              label="Create Inquiry Link Information"
            />
          </Stack>
          <IconButton
            size="small"
            aria-label="Close Create Inquiry Link"
            onClick={closeDrawer}
            disabled={createState.isLoading}
            sx={{ width: { xs: 44, sm: 32 }, height: { xs: 44, sm: 32 } }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />
        <Scrollbar slotProps={drawerScrollSlots}>
          {error && (
            <StudentFeedback notificationKey="STU-0141" presentation="persistent" severity="error">
              {error}
            </StudentFeedback>
          )}
          <FormSectionCard
            icon="mdi:link-variant"
            title="Link Details"
            descriptionTooltip="Name the link for administrators and record where inquiries will come from."
          >
            <ShakingTextField error={Boolean(linkNameError)}>
              <TextField
                inputRef={nameInputRef}
                fullWidth
                required
                size="small"
                label="Link Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(linkNameError)}
                helperText={linkNameError}
              />
            </ShakingTextField>
            <ShakingTextField error={Boolean(sourceError)}>
              <TextField
                select
                fullWidth
                required
                size="small"
                label="Source"
                name="source"
                value={formik.values.source}
                onChange={(event) => formik.setFieldValue('source', Number(event.target.value))}
                onBlur={formik.handleBlur}
                error={Boolean(sourceError)}
                helperText={sourceError}
              >
                {publicSources.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </ShakingTextField>
          </FormSectionCard>
          <FormSectionCard
            icon={GlobalIcons.assignedRoute}
            title="Admission Period and Form"
            descriptionTooltip={formEligibilityDescription}
            descriptionTooltipLabel="Admission Period and Form Information"
          >
            <ShakingTextField error={Boolean(periodError)}>
              <TextField
                select
                inputRef={cycleInputRef}
                fullWidth
                required
                size="small"
                label="Admission Period"
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
                error={Boolean(periodError)}
                helperText={periodError}
              >
                <MenuItem value="">Choose Period</MenuItem>
                {publishedCycles.map((cycle) => (
                  <MenuItem key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </MenuItem>
                ))}
              </TextField>
            </ShakingTextField>
            {inquiryFormsLoading ? (
              <Stack
                spacing={0.5}
                role="status"
                aria-live="polite"
                aria-label="Loading Published Inquiry Forms"
              >
                <Skeleton variant="rounded" height={40} />
              </Stack>
            ) : (
              <ShakingTextField error={Boolean(inquiryFormError)}>
                <TextField
                  select
                  fullWidth
                  required
                  size="small"
                  inputRef={formInputRef}
                  label="Published Inquiry Form"
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
                  error={Boolean(inquiryFormError)}
                  helperText={inquiryFormError}
                  sx={disabledFieldErrorSx}
                >
                  <MenuItem value="">Choose Form</MenuItem>
                  {availableForms.map((form) => (
                    <MenuItem key={form.id} value={form.id}>
                      {form.name} · v{form.version}
                    </MenuItem>
                  ))}
                </TextField>
              </ShakingTextField>
            )}

            {(cycles.isError || forms.isError || routingOptions.isError) && (
              <StudentFeedback
                notificationKey="STU-0144"
                presentation="toast"
                severity="error"
                toastAction={
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
            )}
            {routingReady && !forms.isError && availableForms.length === 0 && (
              <Button
                size="small"
                sx={{ alignSelf: 'flex-start' }}
                onClick={() => routingOptions.refetch()}
              >
                Refresh Offerings
              </Button>
            )}
            {!cycles.isError &&
              !forms.isError &&
              !cycles.isLoading &&
              !forms.isLoading &&
              publishedCycles.length === 0 && (
                <AdmissionIntakeNotice
                  notificationKey="STU-0145"
                  presentation="inline"
                  severity="info"
                >
                  Publish an admission period before creating a link.
                </AdmissionIntakeNotice>
              )}
          </FormSectionCard>
          <FormSectionCard
            icon={GlobalIcons.calendar}
            title="Optional Details"
            descriptionTooltip="Add campaign context or set when the link stops accepting inquiries."
            collapsible
            expanded={optionalOpen}
            onExpandedChange={setOptionalOpen}
          >
            <TextField
              fullWidth
              size="small"
              label="Campaign or Event Details"
              name="detail"
              value={formik.values.detail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.detail && formik.errors.detail)}
              helperText={formik.touched.detail ? formik.errors.detail : undefined}
            />
            <DateTimePicker
              label="Link Expiry"
              format="DD/MM/YYYY hh:mm A"
              views={['year', 'month', 'day', 'hours', 'minutes']}
              disablePast
              minDateTime={expiryMinimum ?? nextExpiryMinute()}
              onOpen={() => setExpiryMinimum(nextExpiryMinute())}
              onClose={() => setExpiryMinimum(null)}
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
          </FormSectionCard>
        </Scrollbar>
        <DialogActions sx={drawerFooterSx}>
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
            onClick={closeDrawer}
            disabled={formik.isSubmitting || createState.isLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            color="inherit"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
            loading={formik.isSubmitting || createState.isLoading}
            disabled={
              inquiryFormsLoading ||
              (Boolean(formik.values.cycleId) &&
                (!routingReady || linkOptions.length === 0 || forms.isError))
            }
            onClick={createLink}
          >
            Create Link
          </LoadingButton>
        </DialogActions>
      </Drawer>
      <CustomDialog
        open={Boolean(renameTarget)}
        handleClose={closeRenameEditor}
        title="Rename Inquiry Link"
        titleInfo="Change the name staff see in Admissions. The link address stays the same."
        titleInfoPlacement="right"
        disableClose={renameBusy}
        guardUnsavedChanges={false}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            event.stopPropagation();
            renameEditor.handleSubmit();
          },
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {renameError && (
              <StudentFeedback
                notificationKey="STU-0139"
                presentation="persistent"
                severity="error"
              >
                {renameError}
              </StudentFeedback>
            )}
            <ShakingTextField error={Boolean(renameNameError)}>
              <TextField
                fullWidth
                required
                size="small"
                label="Link Name"
                name="name"
                value={renameEditor.values.name}
                onChange={renameEditor.handleChange}
                onBlur={renameEditor.handleBlur}
                error={Boolean(renameNameError)}
                helperText={renameNameError}
                disabled={renameBusy}
              />
            </ShakingTextField>
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={drawerFooterSx}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            disabled={renameBusy}
            onClick={closeRenameEditor}
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            color="inherit"
            type="submit"
            loading={renameBusy}
            disabled={!renameEditor.dirty}
            startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
      {renameGuard.confirmation}
      {createGuard.confirmation}
      <ConfirmDialog
        open={Boolean(regenerateTarget)}
        onClose={() => setRegenerateTarget(null)}
        title="Regenerate Inquiry Link?"
        icon="warning"
        content={`Regenerating ${regenerateTarget?.name ?? 'this link'} will stop the old address from working. Share the new link wherever you used the old one.`}
        action={
          <LoadingButton
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
            loading={regenerateState.isLoading}
            onClick={() => {
              if (regenerateTarget) regenerateLink(regenerateTarget);
            }}
          >
            Regenerate Link
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={Boolean(revokeTarget)}
        onClose={() => !revokeState.isLoading && setRevokeTarget(null)}
        title="Revoke Inquiry Link?"
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
            Revoke Link
          </LoadingButton>
        }
      />
    </>
  );
}
