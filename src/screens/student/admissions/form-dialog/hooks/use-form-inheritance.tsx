import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type {
  AdmissionForm,
  AdmissionFormField,
  CreateUpdateAdmissionForm,
  AdmissionFormConnectedSource,
  AdmissionFormInheritancePreview,
} from 'src/redux/student/admissions/admission-forms-api';

import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  memo,
  useRef,
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
  useLayoutEffect,
} from 'react';
import {
  useGetAdmissionFormQuery,
  useLazyGetAdmissionFormsQuery,
  useGetAdmissionFormInheritanceSourcesQuery,
  usePreviewAdmissionFormInheritanceMutation,
} from 'src/redux/student/admissions/admission-forms-api';

import { getAdmissionFormAccess } from '../../form-access';
import { getInheritedFields, approveInquirySource } from '../form-inheritance-model';

type ContextValue = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  editingId?: string;
  sourceId: string | null;
  selectSource: (id: string | null) => void;
  source?: AdmissionForm;
  preview?: AdmissionFormInheritancePreview;
  loading: boolean;
  failed: boolean;
  sourceLoading: boolean;
  sourceFailed: boolean;
  canViewSources: boolean;
  connectionsLoading: boolean;
  hasMoreConnections: boolean;
  loadMoreConnections: () => void;
  connected: {
    inquiryFormDefinitionId: string;
    name: string;
    version: number;
    connections: { offeringId: string; offeringName: string }[];
    isApproved: boolean;
  }[];
  fetchSources: (
    search: string,
    page: number
  ) => Promise<{ data: { id: string; name: string; version: number }[]; hasMore: boolean }>;
  approve: () => void;
  approved: boolean;
  refresh: () => void;
  selectedField: AdmissionFormField | null;
  selectField: (field: AdmissionFormField | null) => void;
};

const InheritanceContext = createContext<ContextValue | null>(null);
export const useFormInheritance = () => useContext(InheritanceContext);

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  editingId?: string;
  active: boolean;
  children: ReactNode;
  onReadinessChange?: (ready: boolean) => void;
};

export function FormInheritanceProvider({
  formik,
  editingId,
  active,
  children,
  onReadinessChange,
}: Props) {
  const enabled = formik.values.purpose === 1 && Boolean(formik.values.inheritance?.enabled);
  const [activeValue, setActiveValue] = useState<ContextValue | null>(null);
  useEffect(() => {
    if (!enabled || !active) setActiveValue(null);
    if (!enabled) onReadinessChange?.(true);
  }, [enabled, active, onReadinessChange]);
  const value = useMemo<ContextValue>(
    () => ({
      formik,
      editingId,
      enabled,
      setEnabled: (next) =>
        formik.setFieldValue('inheritance', {
          enabled: next,
          sources: formik.values.inheritance?.sources ?? [],
        }),
      sourceId: null,
      selectSource: () => undefined,
      loading: false,
      failed: false,
      sourceLoading: false,
      sourceFailed: false,
      canViewSources: false,
      connectionsLoading: false,
      hasMoreConnections: false,
      loadMoreConnections: () => undefined,
      connected: [],
      fetchSources: async () => ({ data: [], hasMore: false }),
      approve: () => undefined,
      approved: false,
      refresh: () => undefined,
      selectedField: null,
      selectField: () => undefined,
    }),
    [formik, editingId, enabled]
  );
  return (
    <InheritanceContext.Provider value={enabled && active ? (activeValue ?? value) : value}>
      {/* Keep the builder mounted while optional inheritance reads start or stop. */}
      {enabled && active && (
        <EnabledInheritanceController
          formik={formik}
          editingId={editingId}
          onReadinessChange={onReadinessChange}
          onChange={setActiveValue}
        />
      )}
      {children}
    </InheritanceContext.Provider>
  );
}

const EnabledInheritanceController = memo(
  ({
    formik,
    editingId,
    onReadinessChange,
    onChange,
  }: Omit<Props, 'active' | 'children'> & { onChange: (value: ContextValue) => void }) => {
    const [sourceId, selectSource] = useState<string | null>(
      formik.values.inheritance?.sources[0]?.inquiryFormDefinitionId ?? null
    );
    const [preview, setPreview] = useState<AdmissionFormInheritancePreview>();
    const [previewKey, setPreviewKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [revision, setRevision] = useState(0);
    const [selectedIdentity, setSelectedIdentity] = useState<string | null>(null);
    const [connectionsPage, setConnectionsPage] = useState(0);
    const [connectionResult, setConnectionResult] = useState<{
      totalCount: number;
      items: AdmissionFormConnectedSource[];
    }>({ totalCount: 0, items: [] });
    const loadingConnections = useRef(false);
    const [loadForms] = useLazyGetAdmissionFormsQuery();
    const [loadPreview] = usePreviewAdmissionFormInheritanceMutation();
    const { permissions } = useSelector((state: RootState) => state.auth);
    const canViewSources = getAdmissionFormAccess(permissions).canView;
    const connected = useGetAdmissionFormInheritanceSourcesQuery(
      { id: editingId ?? '', skipCount: connectionsPage * 25, maxResultCount: 25 },
      {
        skip: !editingId || !canViewSources,
      }
    );
    const source = useGetAdmissionFormQuery(sourceId ?? '', { skip: !sourceId || !canViewSources });
    const connectedBatchKey = JSON.stringify(connected.currentData ?? null);
    useEffect(() => {
      if (!canViewSources || !connectedBatchKey || connectedBatchKey === 'null') return;
      const batch = JSON.parse(connectedBatchKey) as {
        totalCount: number;
        items: AdmissionFormConnectedSource[];
      };
      setConnectionResult((previous) => ({
        totalCount: batch.totalCount,
        items:
          connectionsPage === 0
            ? batch.items
            : [
                ...new Map(
                  [...previous.items, ...batch.items].map((item) => [
                    item.inquiryFormDefinitionId,
                    item,
                  ])
                ).values(),
              ],
      }));
      loadingConnections.current = false;
    }, [connectedBatchKey, connectionsPage, canViewSources]);
    useEffect(() => {
      if (connected.isError) loadingConnections.current = false;
    }, [connected.isError]);
    const connectedItems = connectionResult.items;
    const hasMoreConnections =
      canViewSources && connectedItems.length < connectionResult.totalCount;
    const refetchConnected = connected.refetch;
    const sequence = useRef(0);
    const valuesKey = JSON.stringify(formik.values);
    const approved = Boolean(
      formik.values.inheritance?.sources.some((item) => item.inquiryFormDefinitionId === sourceId)
    );
    const ready = Boolean(
      sourceId &&
      approved &&
      !loading &&
      !failed &&
      previewKey === valuesKey &&
      preview?.isValid &&
      preview.inquiryFormDefinitionId === sourceId
    );
    useEffect(() => {
      onReadinessChange?.(ready);
    }, [onReadinessChange, ready]);
    useEffect(() => {
      const ticket = sequence.current + 1;
      sequence.current = ticket;
      setFailed(false);
      if (!sourceId) {
        setLoading(false);
        return undefined;
      }
      setLoading(true);
      const timer = setTimeout(() => {
        const draft = approveInquirySource(
          JSON.parse(valuesKey) as CreateUpdateAdmissionForm,
          sourceId
        );
        loadPreview({
          inquiryFormDefinitionId: sourceId,
          registrationFormDefinitionId: editingId,
          draft,
        })
          .unwrap()
          .then((result) => {
            if (ticket === sequence.current) {
              setPreview(result);
              setPreviewKey(valuesKey);
            }
          })
          .catch((error) => {
            if (ticket !== sequence.current) return;
            setFailed(true);
            shikshaMitraToast.error({
              message:
                parseApiProblemDetail(error).detail ||
                'Could not check Inquiry field compatibility.',
            });
          })
          .finally(() => {
            if (ticket === sequence.current) setLoading(false);
          });
      }, 400);
      return () => {
        clearTimeout(timer);
        if (sequence.current === ticket) sequence.current += 1;
      };
    }, [editingId, loadPreview, sourceId, valuesKey, revision]);
    const fetchSources = useCallback(
      async (search: string, page: number) => {
        if (!canViewSources) return { data: [], hasMore: false };
        const skipCount = (page - 1) * 25;
        const result = await loadForms({
          purpose: 0,
          status: 1,
          search: search || undefined,
          skipCount,
          maxResultCount: 25,
        }).unwrap();
        return { data: result.items, hasMore: skipCount + result.items.length < result.totalCount };
      },
      [loadForms, canViewSources]
    );
    const inherited = getInheritedFields(preview?.definition);
    const selectedField =
      inherited.find((field) => field.inheritedFrom?.fieldIdentity === selectedIdentity) ?? null;
    const value = useMemo<ContextValue>(
      () => ({
        formik,
        editingId,
        enabled: true,
        setEnabled: (enabled) =>
          formik.setFieldValue('inheritance', { ...formik.values.inheritance, enabled }),
        sourceId,
        selectSource: (id) => {
          selectSource(id);
          setSelectedIdentity(null);
        },
        source: canViewSources ? source.currentData : undefined,
        preview: preview?.inquiryFormDefinitionId === sourceId ? preview : undefined,
        loading: loading || Boolean(sourceId && !failed && previewKey !== valuesKey),
        failed,
        sourceLoading: canViewSources && source.isLoading,
        sourceFailed: canViewSources && source.isError,
        canViewSources,
        connectionsLoading: Boolean(canViewSources && connected.isFetching),
        hasMoreConnections,
        loadMoreConnections: () => {
          if (!hasMoreConnections || loadingConnections.current || connected.isFetching) return;
          loadingConnections.current = true;
          if (connected.isError) refetchConnected();
          else setConnectionsPage((page) => page + 1);
        },
        connected: canViewSources ? (connectedItems ?? []) : [],
        fetchSources,
        approved,
        approve: () => {
          if (
            sourceId &&
            preview?.isValid &&
            !failed &&
            !loading &&
            previewKey === valuesKey &&
            preview.inquiryFormDefinitionId === sourceId
          )
            formik.setFieldValue(
              'inheritance',
              approveInquirySource(formik.values, sourceId).inheritance
            );
        },
        refresh: () => {
          setRevision((counter) => counter + 1);
          if (editingId && canViewSources) {
            if (connectionsPage === 0) refetchConnected();
            else setConnectionsPage(0);
          }
        },
        selectedField,
        selectField: (field) => setSelectedIdentity(field?.inheritedFrom?.fieldIdentity ?? null),
      }),
      [
        formik,
        editingId,
        sourceId,
        source.currentData,
        source.isLoading,
        source.isError,
        preview,
        loading,
        failed,
        previewKey,
        valuesKey,
        canViewSources,
        connectedItems,
        connected.isFetching,
        connected.isError,
        hasMoreConnections,
        connectionsPage,
        refetchConnected,
        fetchSources,
        approved,
        selectedField,
      ]
    );
    useLayoutEffect(() => onChange(value), [onChange, value]);
    return null;
  }
);
EnabledInheritanceController.displayName = 'EnabledInheritanceController';
