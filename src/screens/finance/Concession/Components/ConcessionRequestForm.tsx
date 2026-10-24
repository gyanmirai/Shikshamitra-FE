'use client';

import type { RootState } from 'src/redux/store';
import type {
  ConcessionDraftCommand,
  ConcessionRequestContext,
  ConcessionRequestPreview,
} from 'src/redux/finance/ConcessionManagement/types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useGetStudentsByScopeQuery } from 'src/redux/student';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { FormSectionCard, FormSectionHeader } from 'src/components/form-section-card';
import { isFinanceAdministratorSession } from 'src/utils/finance-admin-auto-approval';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Alert,
  Button,
  Skeleton,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';
import {
  useGetConcessionRequestByIdQuery,
  useCreateConcessionDraftMutation,
  useCreateConcessionRequestMutation,
  useSubmitConcessionRequestMutation,
  useUpdateConcessionRequestMutation,
  usePreviewConcessionRequestMutation,
  useGetConcessionRequestContextQuery,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import ConcessionDocumentList from './ConcessionDocumentList';
import ConcessionPolicyFields from './ConcessionPolicyFields';
import ValueEntryStep from './ConcessionSteps/ValueEntryStep';
import ConcessionRequestWorkspace from './ConcessionRequestWorkspace';
import {
  concessionErrorMessage,
  validateConcessionInstallments,
} from './concessionValueValidation';

import type { IConcessionFormProps } from '../type';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ValueEntry = { basedOn: 0 | 1; amount: number | string; netAmount: number };

const FEE_STRUCTURE_ASSIGNMENT_REQUIRED = 'Finance:Concession:010029';
const FEE_STRUCTURE_ASSIGNMENT_MESSAGE =
  'No fee structure is assigned to this student for the selected academic year. Assign a fee structure before creating a concession request.';

type RequestContextError = {
  data?: {
    errorCode?: string;
    detail?: string;
    message?: string;
  };
};

type FormValues = {
  boardId: string;
  boardName: string;
  mediumId: string;
  mediumName: string;
  standardId: string;
  standardName: string;
  divisionId: string;
  divisionName: string;
  studentId: string;
  studentName: string;
  selectedStudent: any;
  concessionPolicyId: string;
  concessionPolicyVersionId: string;
  concessionTypeId: string;
  concessionTypeDocuments: any[];
  selectedFeeHeads: Record<string, string[]>;
  valueEntries: Record<string, Record<string, ValueEntry>>;
  dueFeeEntries: Record<string, number | string>;
  concessionRequestId: string;
  remarks: string;
};

// ---------------------------------------------------------------------------
// Module-level helpers (no React deps)
// ---------------------------------------------------------------------------

function buildInitialValues(
  detailData?: any,
  defaults?: {
    boardId?: string;
    mediumId?: string;
    standardId?: string;
    divisionId?: string;
    studentId?: string;
    studentName?: string;
    concessionTypeId?: string;
  }
): FormValues {
  if (detailData) {
    const typeId = detailData.concessionTypeId;
    const selectedFeeHeads: Record<string, string[]> = {};
    const valueEntries: Record<string, Record<string, ValueEntry>> = {};

    selectedFeeHeads[typeId] = [];
    valueEntries[typeId] = {};

    (detailData.feeHeadConcessions || []).forEach((fh: any) => {
      selectedFeeHeads[typeId].push(fh.feeHeadId);
      valueEntries[typeId][fh.feeHeadId] = {
        basedOn: fh.basedOn,
        amount: fh.amount,
        netAmount: fh.netAmount,
      };
    });

    const docs =
      detailData.submittedDocuments?.map((d: any) => ({
        documentId: d.documentId,
        url: d.url,
        status: d.status,
        fileName: d.fileName,
      })) || [];

    return {
      boardId: detailData.boardId || '',
      boardName: detailData.boardName || '',
      mediumId: detailData.educationMediumId || '',
      mediumName: detailData.educationMediumName || '',
      standardId: detailData.standardId || '',
      standardName: detailData.standardName || '',
      divisionId: detailData.divisionId || '',
      divisionName: detailData.divisionName || '',
      studentId: detailData.studentId || '',
      studentName: detailData.studentName || '',
      selectedStudent: null,
      concessionPolicyId: detailData.concessionPolicyId || '',
      concessionPolicyVersionId: detailData.concessionPolicyVersionId || '',
      concessionTypeId: typeId || '',
      concessionTypeDocuments: [{ concessionTypeId: typeId, documents: docs }],
      selectedFeeHeads,
      valueEntries,
      dueFeeEntries: Object.fromEntries(
        (detailData.dueFeeConcessions || []).map((line: any) => [line.dueFeeId, line.amount])
      ),
      concessionRequestId: detailData.concessionRequestId || detailData.id || '',
      remarks: detailData.remarks || '',
    };
  }

  return {
    boardId: defaults?.boardId || '',
    boardName: '',
    mediumId: defaults?.mediumId || '',
    mediumName: '',
    standardId: defaults?.standardId || '',
    standardName: '',
    divisionId: defaults?.divisionId || '',
    divisionName: '',
    studentId: defaults?.studentId || '',
    studentName: defaults?.studentName || '',
    selectedStudent: null,
    concessionPolicyId: '',
    concessionPolicyVersionId: '',
    concessionTypeId: defaults?.concessionTypeId || '',
    concessionTypeDocuments: [],
    selectedFeeHeads: {},
    valueEntries: {},
    dueFeeEntries: {},
    concessionRequestId: '',
    remarks: '',
  };
}

const validationSchema = Yup.object({
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  standardId: Yup.string().required('Class is required'),
  divisionId: Yup.string().required('Division is required'),
  studentId: Yup.string().required('Student is required'),
  concessionPolicyId: Yup.string().required('Concession policy is required'),
  concessionPolicyVersionId: Yup.string().required('Concession policy version is required'),
  concessionTypeId: Yup.string().required('Concession type is required'),
});

const buildFeeHeadConcessions = (values: FormValues) => {
  const typeId = values.concessionTypeId;
  return (values.selectedFeeHeads[typeId] || []).map((feeHeadId) => {
    const entry = values.valueEntries[typeId]?.[feeHeadId] || { basedOn: 0, amount: 0 };
    return { feeHeadId, basedOn: entry.basedOn, amount: Number(entry.amount) };
  });
};

const buildDueFeeConcessions = (values: FormValues, context?: ConcessionRequestContext) => {
  const selectedHeads = new Set(values.selectedFeeHeads[values.concessionTypeId] || []);
  return (context?.eligibleDueFees || [])
    .filter(
      (line) => selectedHeads.has(line.feeHeadId) && Number(values.dueFeeEntries[line.dueFeeId]) > 0
    )
    .map((line) => ({
      dueFeeId: line.dueFeeId,
      feeHeadId: line.feeHeadId,
      amount: Number(values.dueFeeEntries[line.dueFeeId]),
    }));
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ConcessionRequestForm: React.FC<IConcessionFormProps> = ({
  onClose,
  onBusyChange,
  student,
  editData,
  defaultBoardId = '',
  defaultMediumId = '',
  defaultStandardId = '',
  defaultDivisionId = '',
}) => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const isAdminCreator = isFinanceAdministratorSession(session);
  const [adminConfirmation, setAdminConfirmation] = useState<{
    snapshot: string;
    studentName: string;
    amount: number;
    autoCreateRefund: boolean;
    concessionType: string;
    policyName: string;
  } | null>(null);
  const confirmedAdminSnapshotRef = useRef<string | null>(null);
  const isEditMode = !!editData?.id;
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const concessionPermissions = financePermissions.fees.concessionActions;
  const adminCanApprove = hasGrantedPermission(permissions, concessionPermissions.approve);
  const canSaveDraft = hasGrantedPermission(
    permissions,
    isEditMode ? concessionPermissions.edit : concessionPermissions.add
  );
  const canSubmit =
    sessionStatus !== 'loading' &&
    hasGrantedPermission(permissions, concessionPermissions.submit) &&
    (!isAdminCreator || adminCanApprove) &&
    (isEditMode
      ? hasGrantedPermission(permissions, concessionPermissions.edit)
      : hasGrantedPermission(permissions, concessionPermissions.add));
  const canUploadDocuments = hasGrantedPermission(
    permissions,
    concessionPermissions.uploadDocument
  );
  const canViewDocuments = hasGrantedPermission(permissions, concessionPermissions.viewDocument);
  const canOpenFeeStructureAssignment = hasGrantedPermission(
    permissions,
    `${financePermissions.fees.structureAssign}.View`
  );

  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  // List filters may refresh while the request is being edited.
  const [openingScope] = useState(() => ({
    defaultBoardId,
    defaultMediumId,
    defaultStandardId,
    defaultDivisionId,
  }));

  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivisions, setAllDivisions] = useState<any[]>([]);

  // -- API queries / mutations -----------------------------------------------

  const {
    data: concessionData,
    refetch: refetchConcessionData,
    isLoading: isLoadingConcession,
    isFetching: isFetchingConcession,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionRequestByIdQuery,
    params: {
      concessionRequestId: editData?.id,
    },
    options: { skip: !editData?.id },
  });

  const [updateConcessionRequest, { isLoading: updateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateConcessionRequestMutation,
    popupConfig: { error: false },
  });

  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const [createConcessionRequest, { isLoading: createLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateConcessionRequestMutation,
    popupConfig: { error: false },
  });
  const [createConcessionDraft, { isLoading: createDraftLoading }] =
    useCreateConcessionDraftMutation();
  const [submitConcessionRequest, { isLoading: submitLoading }] =
    useSubmitConcessionRequestMutation();
  const [previewConcessionRequest] = usePreviewConcessionRequestMutation();
  const previewSequence = useRef(0);
  const [authoritativePreview, setAuthoritativePreview] = useState<ConcessionRequestPreview | null>(
    null
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<unknown>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const previewIsError = previewError !== null;

  // -- Derived lists ---------------------------------------------------------

  const commandKeys = useRef<Record<string, string>>({});
  const draftSaveInFlight = useRef(false);
  const getCommandKey = useCallback((action: string) => {
    commandKeys.current[action] ||= window.crypto.randomUUID();
    return commandKeys.current[action];
  }, []);
  const clearCommandKey = useCallback((action: string) => {
    delete commandKeys.current[action];
  }, []);

  // -- Formik ----------------------------------------------------------------

  const initialValues = useMemo(
    () =>
      buildInitialValues(concessionData?.data, {
        boardId: openingScope.defaultBoardId,
        mediumId: openingScope.defaultMediumId,
        standardId: openingScope.defaultStandardId,
        divisionId: openingScope.defaultDivisionId,
        studentId: student?.studentId,
        studentName: student?.studentName,
        concessionTypeId: student?.concessionTypeId,
      }),
    [
      concessionData,
      openingScope,
      student?.studentId,
      student?.studentName,
      student?.concessionTypeId,
    ]
  );

  const formik = useFormik<FormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    validateOnChange: true,
    validate: (currentValues) => {
      const dueFeeEntries = validateConcessionInstallments(
        currentValues.selectedFeeHeads[currentValues.concessionTypeId] || [],
        currentValues.dueFeeEntries,
        requestContext,
        selectedPolicy
      );
      return Object.keys(dueFeeEntries).length ? { dueFeeEntries } : {};
    },
    onSubmit: async (values) => {
      setSubmitError(null);
      try {
        const typeId = values.concessionTypeId;
        const feeHeadConcessions =
          selectedPolicy?.valueSource === 'PolicyFixed' ? buildFeeHeadConcessions(values) : [];
        const dueFeeConcessions =
          selectedPolicy?.valueSource === 'RequestEnteredWithinLimits'
            ? buildDueFeeConcessions(values, requestContext)
            : [];
        const latestPreview = await previewConcessionRequest({
          academicYearId: currentYear?.id || '',
          studentId: values.studentId,
          studentFeeStructureId: requestContext?.studentFeeStructureId,
          concessionPolicyId: values.concessionPolicyId,
          concessionPolicyVersionId: values.concessionPolicyVersionId,
          concessionTypeId: typeId,
          feeHeadConcessions,
          dueFeeConcessions,
        }).unwrap();

        const adminSnapshot = JSON.stringify({
          values,
          fingerprint: latestPreview.previewFingerprint,
        });
        if (isAdminCreator && confirmedAdminSnapshotRef.current !== adminSnapshot) {
          setAdminConfirmation({
            snapshot: adminSnapshot,
            studentName: values.studentName,
            amount: latestPreview.totalConcessionAmount,
            autoCreateRefund: selectedPolicy?.autoCreateRefund === true,
            concessionType:
              requestContext?.concessionTypes.find(
                (type) => type.concessionTypeId === values.concessionTypeId
              )?.name ?? 'Concession',
            policyName: latestPreview.concessionPolicyName,
          });
          return;
        }

        const isEditing = !!(editData?.id && values.concessionRequestId);
        const docBlock = values.concessionTypeDocuments?.find(
          (d: any) => d.concessionTypeId === typeId
        );
        const documents =
          docBlock?.documents
            ?.filter((d: any) => d.url)
            .map((d: any) => ({ documentId: d.documentId, url: d.url, status: 1 })) || [];

        const baseCommand: ConcessionDraftCommand = {
          academicYearId: currentYear?.id || '',
          studentId: values.studentId,
          studentFeeStructureId: requestContext?.studentFeeStructureId,
          concessionPolicyId: values.concessionPolicyId,
          concessionPolicyVersionId: values.concessionPolicyVersionId,
          concessionTypeId: typeId,
          sourceRequestId: student?.sourceRequestId,
          remarks: values.remarks,
          feeHeadConcessions,
          dueFeeConcessions,
          documents,
        };

        let savedStatus: number;
        if (isEditing) {
          // A draft may have been changed in another tab or by another user
          // while this form was open. Always use the server's latest stamp.
          const latestDraft = await refetchConcessionData().unwrap();
          const updateResult = await updateConcessionRequest({
            ...baseCommand,
            concessionRequestId: values.concessionRequestId,
            concurrencyStamp:
              latestDraft?.data?.concurrencyStamp || concessionData?.data?.concurrencyStamp || '',
            idempotencyKey: getCommandKey('update-draft'),
          }).unwrap();
          clearCommandKey('update-draft');
          const submitted = await submitConcessionRequest({
            concessionRequestId: values.concessionRequestId,
            concurrencyStamp: updateResult.data.concurrencyStamp,
            previewFingerprint: latestPreview.previewFingerprint,
            idempotencyKey: getCommandKey('submit-draft'),
          }).unwrap();
          savedStatus = submitted.data.status;
          clearCommandKey('submit-draft');
        } else {
          const created = await createConcessionRequest({
            ...baseCommand,
            previewFingerprint: latestPreview.previewFingerprint,
            idempotencyKey: getCommandKey('create-submit'),
          }).unwrap();
          savedStatus = created.data.status;
          clearCommandKey('create-submit');
        }

        if (isAdminCreator && savedStatus !== 1) {
          shikshaMitraToast.warning({
            message: 'Concession request is Pending. Automatic approval did not occur.',
          });
        } else {
          shikshaMitraToast.success({
            message:
              savedStatus === 1
                ? 'Concession request created and approved.'
                : 'Concession request submitted for approval.',
          });
        }
        confirmedAdminSnapshotRef.current = null;
        onClose(null, true);
      } catch (err: any) {
        confirmedAdminSnapshotRef.current = null;
        const message = concessionErrorMessage(
          err,
          'Could not submit the concession request. Review the values and try again.'
        );
        setSubmitError(message);
        shikshaMitraToast.error({ message });
        if ((err?.data?.errorCode ?? err?.data?.error?.code) === 'Finance:Concession:010020') {
          void refetchRequestContext();
        }
      }
    },
  });
  useEffect(() => {
    formik.resetForm();
    setSelectedAssignmentId('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear?.id]); // Log formik values on every change for debugging

  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;
  const isSaving =
    formik.isSubmitting || createLoading || createDraftLoading || updateLoading || submitLoading;
  useEffect(() => {
    onBusyChange?.(isSaving);
    return () => onBusyChange?.(false);
  }, [isSaving, onBusyChange]);
  const {
    currentData: studentsData,
    isLoading: studentLoading,
    isFetching: studentFetching,
    isError: studentsError,
  } = useGetStudentsByScopeQuery(
    {
      academicYearId: currentYear?.id || '',
      boardId: values.boardId,
      educationMediumId: values.mediumId,
      classIds: [values.standardId],
      divisionIds: [values.divisionId],
    },
    {
      skip:
        !currentYear?.id ||
        !values.boardId ||
        !values.mediumId ||
        !values.standardId ||
        !values.divisionId,
    }
  );
  const studentOptions = useMemo(
    () => studentsData?.map((item) => ({ ...item, name: item.studentName })) || [],
    [studentsData]
  );

  // -- Fee structure ---------------------------------------------------------

  const {
    data: requestContext,
    isLoading: feeStructureLoading,
    isFetching: feeStructureFetching,
    isError: feeStructureIsError,
    error: feeStructureError,
    refetch: refetchRequestContext,
  } = useGetConcessionRequestContextQuery(
    {
      studentId: values.studentId,
      academicYearId: currentYear?.id || '',
      studentFeeStructureId:
        concessionData?.data?.studentFeeStructureId || selectedAssignmentId || undefined,
      concessionTypeId: values.concessionTypeId || undefined,
      concessionPolicyId: values.concessionPolicyId || undefined,
      concessionPolicyVersionId: values.concessionPolicyVersionId || undefined,
    },
    { skip: !values.studentId || !currentYear?.id, refetchOnMountOrArgChange: true }
  );

  const hasResolvedAssignment = Boolean(requestContext?.studentFeeStructureId);

  const concessionTypesList = useMemo(
    () =>
      (requestContext?.concessionTypes || []).map((type) => ({
        ...type,
        id: type.concessionTypeId,
      })),
    [requestContext?.concessionTypes]
  );

  const concessionPoliciesList = useMemo(
    () => requestContext?.concessionPolicies || [],
    [requestContext?.concessionPolicies]
  );

  const selectedPolicy = useMemo(
    () =>
      concessionPoliciesList.find(
        (policy) =>
          policy.concessionPolicyId === values.concessionPolicyId &&
          policy.concessionPolicyVersionId === values.concessionPolicyVersionId
      ),
    [concessionPoliciesList, values.concessionPolicyId, values.concessionPolicyVersionId]
  );

  useEffect(() => {
    if (
      !values.concessionTypeId ||
      values.concessionPolicyId ||
      concessionPoliciesList.length !== 1
    )
      return;
    const initialPolicy = concessionPoliciesList[0];
    setFieldValue('concessionPolicyId', initialPolicy.concessionPolicyId, false);
    setFieldValue('concessionPolicyVersionId', initialPolicy.concessionPolicyVersionId, false);
  }, [concessionPoliciesList, setFieldValue, values.concessionPolicyId, values.concessionTypeId]);

  const feeHeads: any[] = useMemo(
    () =>
      (requestContext?.feeHeads || []).map((item) => ({
        ...item,
        amount: item.eligibleOutstanding,
      })),
    [requestContext]
  );

  const requestContextError = (feeStructureError as RequestContextError | undefined)?.data;
  const noFeeStructureError =
    feeStructureIsError && requestContextError?.errorCode === FEE_STRUCTURE_ASSIGNMENT_REQUIRED;

  const previewRequest = useMemo(
    () => ({
      academicYearId: currentYear?.id || '',
      studentId: values.studentId,
      studentFeeStructureId: requestContext?.studentFeeStructureId,
      concessionPolicyId: values.concessionPolicyId,
      concessionPolicyVersionId: values.concessionPolicyVersionId,
      concessionTypeId: values.concessionTypeId,
      feeHeadConcessions:
        selectedPolicy?.valueSource === 'PolicyFixed' ? buildFeeHeadConcessions(values) : [],
      dueFeeConcessions:
        selectedPolicy?.valueSource === 'RequestEnteredWithinLimits'
          ? buildDueFeeConcessions(values, requestContext)
          : [],
    }),
    [currentYear?.id, requestContext, selectedPolicy?.valueSource, values]
  );

  const hasInvalidInstallmentValues =
    Object.keys(
      validateConcessionInstallments(
        values.selectedFeeHeads[values.concessionTypeId] || [],
        values.dueFeeEntries,
        requestContext,
        selectedPolicy
      )
    ).length > 0;
  const previewReady =
    !hasInvalidInstallmentValues &&
    Boolean(
      previewRequest.academicYearId &&
      previewRequest.studentId &&
      previewRequest.concessionPolicyId &&
      previewRequest.concessionPolicyVersionId &&
      previewRequest.concessionTypeId
    ) &&
    (selectedPolicy?.valueSource === 'PolicyFixed'
      ? previewRequest.feeHeadConcessions.length > 0
      : previewRequest.dueFeeConcessions.length > 0);

  useEffect(() => {
    const requestSequence = previewSequence.current + 1;
    previewSequence.current = requestSequence;
    setAuthoritativePreview(null);
    setPreviewError(null);
    if (!previewReady) {
      setPreviewLoading(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPreviewLoading(true);
      previewConcessionRequest(previewRequest)
        .unwrap()
        .then((response) => {
          if (requestSequence === previewSequence.current) {
            setAuthoritativePreview(response);
          }
        })
        .catch((error: unknown) => {
          if (requestSequence === previewSequence.current) setPreviewError(error);
        })
        .finally(() => {
          if (requestSequence === previewSequence.current) setPreviewLoading(false);
        });
    }, 400);
    return () => {
      window.clearTimeout(timer);
      previewSequence.current += 1;
    };
  }, [previewConcessionRequest, previewReady, previewRequest]);

  // -- Derived state for selected type / preview ----------------------------

  const selectedConcessionType = useMemo(
    () => concessionTypesList.find((ct: any) => ct.id === values.concessionTypeId),
    [concessionTypesList, values.concessionTypeId]
  );
  const selectedTypeRequirements = useMemo(
    () =>
      requestContext?.concessionTypes.find(
        (type) => type.concessionTypeId === values.concessionTypeId
      )?.documents || [],
    [requestContext, values.concessionTypeId]
  );
  const submittedDocumentIds = useMemo(() => {
    const block = values.concessionTypeDocuments?.find(
      (item: any) => item.concessionTypeId === values.concessionTypeId
    );
    return new Set(
      (block?.documents || []).filter((item: any) => item.url).map((item: any) => item.documentId)
    );
  }, [values.concessionTypeDocuments, values.concessionTypeId]);
  const missingRequiredDocuments = selectedTypeRequirements.filter(
    (requirement) => requirement.isRequired && !submittedDocumentIds.has(requirement.documentId)
  );
  const hasMissingRequiredDocuments = missingRequiredDocuments.length > 0;

  const selectedFeeHeadCount = (values.selectedFeeHeads[values.concessionTypeId] || []).length;
  const hasSelectedFeeHeads = selectedFeeHeadCount > 0;
  // -- Handlers --------------------------------------------------------------

  const handleSubmit = useCallback(() => {
    if (!isSaving) formik.handleSubmit();
  }, [formik, isSaving]);

  const handleSaveDraft = useCallback(async () => {
    if (isSaving || draftSaveInFlight.current) return;
    setSubmitError(null);
    draftSaveInFlight.current = true;
    formik.setSubmitting(true);
    try {
      const validationErrors = await formik.validateForm();
      if (Object.keys(validationErrors).length > 0 || !hasResolvedAssignment || !requestContext) {
        formik.setTouched({
          boardId: true,
          mediumId: true,
          standardId: true,
          divisionId: true,
          studentId: true,
          concessionPolicyId: true,
          concessionPolicyVersionId: true,
          concessionTypeId: true,
        });
        shikshaMitraToast.error({
          message: validationErrors.dueFeeEntries
            ? 'Correct the invalid installment concession values before saving the draft.'
            : 'Select the student, concession policy, and concession type before saving.',
        });
        return;
      }

      const typeId = values.concessionTypeId;
      const docBlock = values.concessionTypeDocuments?.find(
        (item: any) => item.concessionTypeId === typeId
      );
      const documents = (docBlock?.documents || [])
        .filter((item: any) => item.url)
        .map((item: any) => ({ documentId: item.documentId, url: item.url, status: 1 as const }));
      const command: ConcessionDraftCommand = {
        academicYearId: currentYear?.id || '',
        studentId: values.studentId,
        studentFeeStructureId: requestContext.studentFeeStructureId,
        concessionPolicyId: values.concessionPolicyId,
        concessionPolicyVersionId: values.concessionPolicyVersionId,
        concessionTypeId: typeId,
        sourceRequestId: student?.sourceRequestId,
        remarks: values.remarks,
        feeHeadConcessions:
          selectedPolicy?.valueSource === 'PolicyFixed' ? buildFeeHeadConcessions(values) : [],
        dueFeeConcessions:
          selectedPolicy?.valueSource === 'RequestEnteredWithinLimits'
            ? buildDueFeeConcessions(values, requestContext)
            : [],
        documents,
      };

      try {
        if (values.concessionRequestId) {
          const latestDraft = await refetchConcessionData().unwrap();
          await updateConcessionRequest({
            ...command,
            concessionRequestId: values.concessionRequestId,
            concurrencyStamp:
              latestDraft?.data?.concurrencyStamp || concessionData?.data?.concurrencyStamp || '',
            idempotencyKey: getCommandKey('update-draft'),
          }).unwrap();
          clearCommandKey('update-draft');
        } else {
          await createConcessionDraft({
            ...command,
            idempotencyKey: getCommandKey('create-draft'),
          }).unwrap();
          clearCommandKey('create-draft');
        }
        shikshaMitraToast.success({ message: 'Concession request saved as a draft.' });
        onClose(null, true);
      } catch (error: any) {
        const message = concessionErrorMessage(error, 'Could not save the concession draft.');
        setSubmitError(message);
        shikshaMitraToast.error({ message });
      }
    } finally {
      draftSaveInFlight.current = false;
      formik.setSubmitting(false);
    }
  }, [
    clearCommandKey,
    concessionData?.data?.concurrencyStamp,
    createConcessionDraft,
    currentYear?.id,
    formik,
    getCommandKey,
    hasResolvedAssignment,
    isSaving,
    onClose,
    refetchConcessionData,
    requestContext,
    selectedPolicy?.valueSource,
    student?.sourceRequestId,
    updateConcessionRequest,
    values,
  ]);

  const handleFeeHeadToggle = useCallback(
    (concessionTypeId: string, feeHeadId: string) => {
      const current = values.selectedFeeHeads[concessionTypeId] || [];
      const updated = current.includes(feeHeadId)
        ? current.filter((id) => id !== feeHeadId)
        : [...current, feeHeadId];
      setFieldValue('selectedFeeHeads', {
        ...values.selectedFeeHeads,
        [concessionTypeId]: updated,
      });
    },
    [values.selectedFeeHeads, setFieldValue]
  );

  const handleSaveDocs = useCallback(
    (concessionId: string, newDocs: any[]) => {
      const payload = [...(values.concessionTypeDocuments || [])];
      const idx = payload.findIndex((d: any) => d.concessionTypeId === concessionId);
      const docs = newDocs.map((d) => ({
        documentId: d.documentId,
        url: d.url,
        status: d.status,
        fileName: d.fileName,
      }));
      if (idx === -1) payload.push({ concessionTypeId: concessionId, documents: docs });
      else payload[idx] = { ...payload[idx], documents: docs };
      setFieldValue('concessionTypeDocuments', payload);
    },
    [values.concessionTypeDocuments, setFieldValue]
  );

  const getSubmittedDocs = useCallback(
    (concessionId: string) => {
      const block = values.concessionTypeDocuments?.find(
        (d: any) => d.concessionTypeId === concessionId
      );
      return (block?.documents || []).map((d: any) => ({
        documentId: d.documentId,
        url: d.url,
        status: d.status,
        fileName: d.fileName,
      }));
    },
    [values.concessionTypeDocuments]
  );
  // -- Side effects ----------------------------------------------------------

  useEffect(() => {
    const yearBoards = currentYear?.boards || [];
    setBoards(yearBoards);
    if (yearBoards.length > 0) {
      if (!values.boardId) {
        const firstBoard = yearBoards[0];
        setFieldValue('boardId', firstBoard.id);
        const firstMedium = firstBoard?.educationMediums?.[0]?.id ?? '';
        setFieldValue('mediumId', firstMedium);
      } else if (!values.mediumId) {
        const board = yearBoards.find((b: any) => b.id === values.boardId);
        const firstMedium = board?.educationMediums?.[0]?.id ?? '';
        setFieldValue('mediumId', firstMedium);
      }
    }
  }, [currentYear, values.boardId, values.mediumId, setFieldValue]);

  useEffect(() => {
    const board = boards.find((b: any) => b.id === values.boardId);
    setMediums(board?.educationMediums || []);
  }, [values.boardId, boards]);

  useEffect(() => {
    if (values.mediumId) getClassByMedium(values.mediumId);
  }, [values.mediumId, getClassByMedium]);

  useEffect(() => {
    setAllDivisions(classes?.find((cls: any) => cls.id === values.standardId)?.divisions || []);
  }, [values.standardId, classes]);

  // -- Render ----------------------------------------------------------------

  if (isLoadingConcession || isFetchingConcession) {
    return (
      <Stack spacing={1.5} sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', overflow: 'auto' }}>
        {/* Student Information skeleton */}
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
            <Skeleton variant="rounded" width={36} height={36} />
            <Box>
              <Skeleton variant="text" width={140} height={20} />
            </Box>
          </Stack>
          <Grid container spacing={2}>
            {[...Array(4)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6 }} key={i}>
                <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
            <Grid size={{ xs: 12 }}>
              <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
            </Grid>
          </Grid>
        </Paper>

        {/* Concession Details skeleton */}
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
            <Skeleton variant="rounded" width={36} height={36} />
            <Box>
              <Skeleton variant="text" width={140} height={20} />
            </Box>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Skeleton variant="rounded" height={60} sx={{ borderRadius: 1 }} />
            </Grid>
          </Grid>
        </Paper>

        {/* Fee Head Mapping skeleton */}
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
            <Skeleton variant="rounded" width={36} height={36} />
            <Box>
              <Skeleton variant="text" width={130} height={20} />
            </Box>
          </Stack>
          <Grid container spacing={1}>
            {[...Array(8)].map((_, i) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
                <Skeleton variant="rounded" height={52} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Stack>
    );
  }

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!isSaving) formik.handleSubmit(event);
        }}
        style={{ height: '100%' }}
      >
        <Box display="flex" flexDirection="column" height="100%" minHeight={0}>
          <Box
            role="region"
            aria-label="Concession request form fields"
            tabIndex={0}
            sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}
          >
            <FormBusyRegion busy={isSaving} label="Saving concession request…">
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  containerType: 'inline-size',
                  '& .MuiCard-root': { boxShadow: 'none' },
                }}
              >
                <Grid container spacing={2}>
                  {/* 1. Student Information */}
                  <Grid size={{ xs: 12 }}>
                    <FormSectionCard
                      descriptionTooltip="Select the board, medium, class, division, and student for this request."
                      icon="solar:users-group-rounded-bold-duotone"
                      title="Student Information"
                      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <ShakingTextField error={!!(touched.boardId && errors.boardId)}>
                            <CustomSelect
                              size="small"
                              label="Board"
                              name="boardId"
                              required
                              onBlur={() => setFieldTouched('boardId', true)}
                              options={boards}
                              labelKey="name"
                              valueKey="id"
                              value={values.boardId}
                              disabled={isEditMode}
                              onChange={(val) => {
                                const board = boards.find((b) => b.id === val);
                                setFieldValue('boardId', val);
                                setFieldTouched('boardId', false);
                                setFieldValue('boardName', board?.name || '');
                                setFieldValue('mediumId', '');
                                setFieldValue('mediumName', '');
                                setFieldValue('standardId', '');
                                setFieldValue('standardName', '');
                                setFieldValue('divisionId', '');
                                setFieldValue('divisionName', '');
                                setFieldValue('studentId', '');
                                setFieldValue('studentName', '');
                                setFieldValue('selectedStudent', null);
                              }}
                              error={!!errors.boardId && touched.boardId}
                              helperText={
                                ((touched.boardId && errors.boardId) as string) || undefined
                              }
                            />
                          </ShakingTextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <ShakingTextField error={!!(touched.mediumId && errors.mediumId)}>
                            <CustomSelect
                              size="small"
                              label="Medium"
                              name="mediumId"
                              required
                              onBlur={() => setFieldTouched('mediumId', true)}
                              disabled={isEditMode || !values.boardId}
                              options={mediums}
                              labelKey="name"
                              valueKey="id"
                              value={values.mediumId}
                              onChange={(val) => {
                                const medium = mediums.find((m) => m.id === val);
                                setFieldValue('mediumId', val);
                                setFieldTouched('mediumId', false);
                                setFieldValue('mediumName', medium?.name || '');
                                setFieldValue('standardId', '');
                                setFieldValue('standardName', '');
                                setFieldValue('divisionId', '');
                                setFieldValue('divisionName', '');
                                setFieldValue('studentId', '');
                                setFieldValue('studentName', '');
                                setFieldValue('selectedStudent', null);
                              }}
                              error={!!errors.mediumId && touched.mediumId}
                              helperText={
                                ((touched.mediumId && errors.mediumId) as string) || undefined
                              }
                            />
                          </ShakingTextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <ShakingTextField error={!!(touched.standardId && errors.standardId)}>
                            <CustomSelect
                              size="small"
                              label="Class"
                              name="standardId"
                              required
                              onBlur={() => setFieldTouched('standardId', true)}
                              disabled={isEditMode || !values.mediumId}
                              options={classes || []}
                              isLoading={classLoading}
                              labelKey="name"
                              valueKey="id"
                              value={values.standardId}
                              onChange={(val) => {
                                const standard = classes?.find((c: any) => c.id === val);
                                setFieldValue('standardId', val);
                                setFieldTouched('standardId', false);
                                setFieldValue('standardName', standard?.name || '');
                                setFieldValue('divisionId', '');
                                setFieldValue('divisionName', '');
                                setFieldValue('studentId', '');
                                setFieldValue('studentName', '');
                                setFieldValue('selectedStudent', null);
                              }}
                              error={!!errors.standardId && touched.standardId}
                              helperText={
                                ((touched.standardId && errors.standardId) as string) || undefined
                              }
                            />
                          </ShakingTextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <ShakingTextField error={!!(touched.divisionId && errors.divisionId)}>
                            <CustomSelect
                              size="small"
                              label="Division"
                              name="divisionId"
                              required
                              onBlur={() => setFieldTouched('divisionId', true)}
                              disabled={isEditMode || !values.standardId}
                              options={allDivisions}
                              labelKey="name"
                              valueKey="id"
                              value={values.divisionId}
                              onChange={(val) => {
                                const division = allDivisions.find((d) => d.id === val);
                                setFieldValue('divisionId', val);
                                setFieldTouched('divisionId', false);
                                setFieldValue('divisionName', division?.name || '');
                                setFieldValue('studentId', '');
                                setFieldValue('studentName', '');
                                setFieldValue('selectedStudent', null);
                              }}
                              error={!!errors.divisionId && touched.divisionId}
                              helperText={
                                ((touched.divisionId && errors.divisionId) as string) || undefined
                              }
                            />
                          </ShakingTextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <ShakingTextField error={!!(touched.studentId && errors.studentId)}>
                            <Autocomplete
                              size="small"
                              loading={studentLoading || studentFetching}
                              noOptionsText={
                                studentsError ? 'Unable to load students' : 'No Student Found'
                              }
                              fullWidth
                              disabled={isEditMode || !values.divisionId}
                              options={studentOptions}
                              value={
                                studentOptions.find((s) => s.studentId === values.studentId) ||
                                (isEditMode && values.studentId
                                  ? { studentId: values.studentId, name: values.studentName }
                                  : null)
                              }
                              isOptionEqualToValue={(option, value) =>
                                option.studentId === value.studentId
                              }
                              onChange={(_e, value: any) => {
                                setSelectedAssignmentId('');
                                setFieldValue('studentId', value?.studentId || '');
                                setFieldTouched('studentId', false);
                                setFieldValue('studentName', value?.name || '');
                                setFieldValue('selectedStudent', value || null);
                                setFieldValue('concessionPolicyId', '');
                                setFieldValue('concessionPolicyVersionId', '');
                                setFieldValue('dueFeeEntries', {});
                              }}
                              getOptionLabel={(option: any) => option.name || ''}
                              renderOption={(props, option: any) => (
                                <li {...props} key={option.studentId}>
                                  {option.name}
                                </li>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  label="Student"
                                  name="studentId"
                                  required
                                  onBlur={formik.handleBlur}
                                  fullWidth
                                  error={!!errors.studentId && touched.studentId}
                                  helperText={
                                    ((touched.studentId && errors.studentId) as string) || undefined
                                  }
                                />
                              )}
                            />
                          </ShakingTextField>
                        </Grid>
                      </Grid>
                    </FormSectionCard>
                  </Grid>
                  {requestContext?.assignmentSelectionRequired && (
                    <Grid size={{ xs: 12 }}>
                      <FormSectionCard
                        descriptionTooltip="Choose the fee assignment whose dues this concession will apply to."
                        icon="solar:bill-list-bold-duotone"
                        title="Fee assignment"
                      >
                        <CustomSelect
                          size="small"
                          label="Fee assignment *"
                          options={requestContext.assignments.map((assignment) => ({
                            ...assignment,
                            displayName: `${assignment.feeStructureName} (${new Date(
                              assignment.chargeStartDate
                            ).toLocaleDateString('en-IN')} – ${new Date(
                              assignment.chargeEndDate
                            ).toLocaleDateString('en-IN')})`,
                          }))}
                          labelKey="displayName"
                          valueKey="studentFeeStructureId"
                          value={selectedAssignmentId}
                          onChange={(value) => {
                            setSelectedAssignmentId(String(value));
                            setFieldValue('concessionPolicyId', '');
                            setFieldValue('concessionPolicyVersionId', '');
                            setFieldValue('concessionTypeId', '');
                            setFieldValue('selectedFeeHeads', {});
                            setFieldValue('valueEntries', {});
                            setFieldValue('dueFeeEntries', {});
                            setFieldValue('concessionTypeDocuments', []);
                          }}
                        />
                      </FormSectionCard>
                    </Grid>
                  )}
                  {/* Fee structure loading skeleton */}
                  {values.studentId && feeStructureLoading && (
                    <Grid size={{ xs: 12 }}>
                      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                          <Skeleton variant="rounded" width={36} height={36} />
                          <Box>
                            <Skeleton variant="text" width={160} height={20} />
                          </Box>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Skeleton variant="rounded" height={60} sx={{ borderRadius: 1 }} />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  )}

                  {/* No Fee Structure assigned alert */}
                  {values.studentId && !feeStructureLoading && noFeeStructureError && (
                    <Grid size={{ xs: 12 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 1.5,
                          borderRadius: 2,
                          border: '1.5px solid',
                          borderColor: 'warning.main',
                          bgcolor: 'warning.lighter',
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: 'flex-start',
                          gap: 1.5,
                        }}
                      >
                        <Iconify
                          icon="solar:danger-triangle-bold-duotone"
                          width={24}
                          sx={{ color: 'warning.dark', flexShrink: 0, mt: 0.25 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" color="warning.dark">
                            Fee structure assignment required
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mt={0.25}>
                            {FEE_STRUCTURE_ASSIGNMENT_MESSAGE}
                          </Typography>
                        </Box>
                        {canOpenFeeStructureAssignment && (
                          <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            startIcon={<Iconify icon="mdi:file-document-edit-outline" />}
                            onClick={() => router.push(financePaths.fees.structureAssign)}
                            sx={{ flexShrink: 0 }}
                          >
                            Assign Fee Structure
                          </Button>
                        )}
                      </Paper>
                    </Grid>
                  )}

                  {previewIsError && previewReady && (
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="error">
                        {concessionErrorMessage(
                          previewError,
                          'The server could not calculate this concession. Review the selected heads and values.'
                        )}
                      </Alert>
                    </Grid>
                  )}

                  {values.studentId && !feeStructureLoading && !noFeeStructureError && (
                    <Grid size={{ xs: 12 }}>
                      <ConcessionRequestWorkspace
                        key={`${values.studentId}:${values.concessionPolicyVersionId}:${
                          values.concessionTypeId
                        }`}
                        policyFields={
                          <Stack spacing={1}>
                            <ConcessionPolicyFields
                              policies={concessionPoliciesList}
                              types={
                                isEditMode &&
                                values.concessionTypeId &&
                                !concessionTypesList.some(
                                  (type) => type.id === values.concessionTypeId
                                )
                                  ? [
                                      ...concessionTypesList,
                                      {
                                        id: values.concessionTypeId,
                                        name: concessionData?.data?.concessionTypeName || '',
                                      },
                                    ]
                                  : concessionTypesList
                              }
                              policyVersionId={values.concessionPolicyVersionId}
                              typeId={values.concessionTypeId}
                              onPolicyChange={(policy) => {
                                setFieldValue(
                                  'concessionPolicyId',
                                  policy?.concessionPolicyId || ''
                                );
                                setFieldValue(
                                  'concessionPolicyVersionId',
                                  policy?.concessionPolicyVersionId || ''
                                );
                                setFieldValue('selectedFeeHeads', {});
                                setFieldValue('valueEntries', {});
                                setFieldValue('dueFeeEntries', {});
                              }}
                              onTypeChange={(id) => {
                                setFieldValue('concessionTypeId', id);
                                setFieldValue('concessionTypeDocuments', []);
                                setFieldValue('selectedFeeHeads', {});
                                setFieldValue('valueEntries', {});
                                setFieldValue('dueFeeEntries', {});
                              }}
                              onPolicyBlur={() => setFieldTouched('concessionPolicyId', true)}
                              onTypeBlur={() => setFieldTouched('concessionTypeId', true)}
                              policyDisabled={isSaving || feeStructureLoading || !requestContext}
                              typeDisabled={isSaving || isEditMode}
                              policyError={Boolean(
                                (touched.concessionPolicyId || formik.submitCount > 0) &&
                                errors.concessionPolicyId
                              )}
                              typeError={Boolean(
                                (touched.concessionTypeId || formik.submitCount > 0) &&
                                errors.concessionTypeId
                              )}
                              policyHelperText={
                                feeStructureIsError
                                  ? 'Could not load concession policies. Retry or check the student fee assignment.'
                                  : !requestContext
                                    ? 'Select the student fee assignment to continue.'
                                    : concessionPoliciesList.length === 0
                                      ? 'No active concession policy for this academic year.'
                                      : touched.concessionPolicyId || formik.submitCount > 0
                                        ? errors.concessionPolicyId
                                        : undefined
                              }
                              typeHelperText={
                                touched.concessionTypeId || formik.submitCount > 0
                                  ? errors.concessionTypeId
                                  : undefined
                              }
                            />
                            {feeStructureIsError && values.studentId && (
                              <Button
                                size="small"
                                disabled={isSaving}
                                startIcon={<Iconify icon={GlobalIcons.refresh} />}
                                onClick={() => refetchRequestContext()}
                              >
                                Retry loading policies
                              </Button>
                            )}
                          </Stack>
                        }
                        feeHeads={
                          feeHeads.length > 0
                            ? feeHeads
                            : isEditMode
                              ? (concessionData?.data?.feeHeadConcessions || []).map(
                                  (head: any) => ({
                                    feeHeadId: head.feeHeadId,
                                    feeHeadName: head.feeHeadName,
                                    amount: head.annualBaseAmount ?? head.amount ?? 0,
                                  })
                                )
                              : []
                        }
                        installments={requestContext?.eligibleDueFees || []}
                        selectedIds={values.selectedFeeHeads[values.concessionTypeId] || []}
                        onToggle={(id) => handleFeeHeadToggle(values.concessionTypeId, id)}
                        policy={selectedPolicy}
                        preview={authoritativePreview}
                        loading={previewLoading}
                        missingDocumentNames={missingRequiredDocuments.map(
                          (document) => document.documentName
                        )}
                        feeSelectionMessage={
                          !values.concessionPolicyId ? (
                            <Typography color="text.secondary" variant="body2">
                              Select a concession policy to load eligible fees.
                            </Typography>
                          ) : !values.concessionTypeId ? (
                            <Typography color="text.secondary" variant="body2">
                              Select a concession type to map fee heads.
                            </Typography>
                          ) : feeStructureFetching ? (
                            <Typography color="text.secondary" variant="body2">
                              Loading eligible installments…
                            </Typography>
                          ) : feeHeads.length === 0 &&
                            !(isEditMode && concessionData?.data?.feeHeadConcessions?.length) ? (
                            <Alert severity="error">
                              {requestContext?.blockers?.[0] ||
                                'No outstanding fee heads are eligible for this policy and fee assignment.'}
                            </Alert>
                          ) : undefined
                        }
                        valueFields={
                          values.concessionTypeId && hasSelectedFeeHeads ? (
                            <Box>
                              {selectedPolicy?.valueSource !== 'PolicyFixed' && (
                                <FormSectionHeader
                                  title="Concession Values"
                                  titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                                  icon={GlobalIcons.usage}
                                  descriptionTooltip="Enter concession values for the selected eligible installments."
                                />
                              )}
                              <ValueEntryStep
                                showPolicyFixedDetails={false}
                                formik={{
                                  ...formik,
                                  values: {
                                    ...formik.values,
                                    concessionTypeIds: [formik.values.concessionTypeId],
                                  },
                                }}
                                concessionTypes={concessionTypesList}
                                requestContext={requestContext}
                                policy={selectedPolicy}
                                preview={authoritativePreview ?? undefined}
                              />
                            </Box>
                          ) : undefined
                        }
                        documents={
                          values.concessionTypeId ? (
                            <ConcessionDocumentList
                              concessionId={values.concessionTypeId}
                              concessionName={selectedConcessionType?.name || ''}
                              submittedDocuments={getSubmittedDocs(values.concessionTypeId)}
                              onSave={(newDocs) => handleSaveDocs(values.concessionTypeId, newDocs)}
                              requirements={selectedTypeRequirements}
                              canUpload={canUploadDocuments}
                              canView={canViewDocuments}
                            />
                          ) : undefined
                        }
                        remarks={
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                            label="Remarks (optional)"
                            name="remarks"
                            onBlur={formik.handleBlur}
                            value={values.remarks}
                            onChange={(event) => setFieldValue('remarks', event.target.value)}
                          />
                        }
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            </FormBusyRegion>
          </Box>

          {/* ── Sticky Action Bar ── */}
          <Box
            sx={{
              flexShrink: 0,
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              backdropFilter: 'blur(12px)',
              px: { xs: 2, md: 3 },
              py: 1.5,
            }}
          >
            {isAdminCreator && !adminCanApprove && (
              <Alert severity="error" sx={{ mb: 1 }}>
                Approve permission is required to submit an automatically approved concession.
              </Alert>
            )}
            {submitError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {submitError}
              </Alert>
            )}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
              gap={1}
            >
              <Stack
                direction="row"
                spacing={1.5}
                useFlexGap
                flexWrap="wrap"
                justifyContent="flex-end"
              >
                <Button
                  startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  onClick={() => {
                    if (!isSaving) onClose(null, false);
                  }}
                  disabled={isSaving}
                  variant="outlined"
                  size="small"
                >
                  Cancel
                </Button>
                {canSaveDraft && (
                  <LoadingButton
                    type="button"
                    variant="outlined"
                    size="small"
                    loading={createDraftLoading || updateLoading}
                    disabled={
                      !hasResolvedAssignment ||
                      formik.isSubmitting ||
                      createLoading ||
                      submitLoading ||
                      createDraftLoading ||
                      updateLoading
                    }
                    startIcon={<Iconify icon="solar:diskette-bold" />}
                    onClick={handleSaveDraft}
                  >
                    Save draft
                  </LoadingButton>
                )}
                {canSubmit && (
                  <LoadingButton
                    type="button"
                    variant="contained"
                    size="small"
                    disabled={
                      createLoading ||
                      createDraftLoading ||
                      formik.isSubmitting ||
                      submitLoading ||
                      updateLoading ||
                      previewLoading ||
                      !previewReady ||
                      !authoritativePreview ||
                      previewIsError ||
                      hasInvalidInstallmentValues ||
                      hasMissingRequiredDocuments ||
                      !hasResolvedAssignment
                    }
                    startIcon={<Iconify icon={GlobalIcons.submit} />}
                    loading={
                      formik.isSubmitting ||
                      createLoading ||
                      submitLoading ||
                      updateLoading ||
                      previewLoading
                    }
                    onClick={handleSubmit}
                  >
                    {isAdminCreator ? 'Submit and approve' : 'Submit for approval'}
                  </LoadingButton>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>
        <ConfirmDialog
          open={adminConfirmation !== null}
          icon="warning"
          title="Submit and approve concession?"
          disableBackdropClick
          cancelText="Keep editing"
          onClose={() => setAdminConfirmation(null)}
          content={
            <Stack spacing={1}>
              <Typography>
                {adminConfirmation?.studentName || 'Selected student'} · {currentYear?.name}
              </Typography>
              <Typography>
                {adminConfirmation?.concessionType} · {adminConfirmation?.policyName}
              </Typography>
              <Typography>
                Concession: {formatNumber(adminConfirmation?.amount ?? 0, 'INR')}
              </Typography>
              <Typography>
                This request will be approved automatically when you confirm and will affect dues
                immediately.
              </Typography>
              {adminConfirmation?.autoCreateRefund && (
                <Typography>
                  Any linked refund request follows its own approval workflow.
                </Typography>
              )}
            </Stack>
          }
          action={
            <LoadingButton
              startIcon={<Iconify icon="mdi:check-circle-outline" />}
              type="button"
              variant="contained"
              loading={formik.isSubmitting || createLoading || submitLoading}
              onClick={() => {
                confirmedAdminSnapshotRef.current = adminConfirmation?.snapshot ?? null;
                setAdminConfirmation(null);
                formik.submitForm();
              }}
            >
              Submit and approve
            </LoadingButton>
          }
        />
      </form>
    </BackPopUpChecked>
  );
};

export default ConcessionRequestForm;
