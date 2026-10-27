import type { RootState } from 'src/redux/store';
import type { UseTabsReturn } from 'src/hooks/use-tabs';
import type { ReactElement, ComponentType } from 'react';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { recordsQueryUrl } from 'src/screens/student/records/records-url-state';
import { useGetStudentRecordDetailsQuery } from 'src/redux/student/records/student-record-details-api';
import { useGetStudentRecordChangesQuery } from 'src/redux/student/records/student-record-changes-api';
import {
  Box,
  Tab,
  Menu,
  Stack,
  Paper,
  Button,
  Skeleton,
  MenuItem,
  LinearProgress,
} from '@mui/material';

import { StudentProfileHeader } from './student-profile-header';
import { StudentProfileOverview } from './student-profile-overview';
import { LEGACY_PROFILE_SECTIONS } from './student-record-profile-model';
import { StudentRecordHistoryPanel } from './student-record-history-panel';
import { StudentRegistrationFormPanel } from './student-registration-form-panel';

import type { ProfileAcademicYearContext } from './student-profile-data-boundary';

export type StudentProfileContentProps = {
  student: StudentRecordProfile;
  tabs: UseTabsReturn;
  refetch: () => unknown;
};
type Section = {
  value: string;
  label: string;
  icon: ReactElement;
  component: ComponentType<StudentProfileContentProps>;
};
type Props = {
  student: StudentRecordProfile;
  refetch: () => unknown;
  sections?: Section[];
  documents?: ComponentType<StudentProfileContentProps>;
  academicYearContext?: ProfileAcademicYearContext;
  onFormEditingChange?: (editing: boolean) => void;
  onNavigationGuardChange?: (requestNavigation: ((proceed: () => void) => void) | null) => void;
};
const PRIMARY = [
  { value: 'overview', label: 'Overview' },
  { value: 'details', label: 'Details' },
  { value: 'documents', label: 'Documents' },
  { value: 'history', label: 'History' },
];
const PRIMARY_ICONS: Record<string, string> = {
  overview: 'mdi:view-dashboard-outline',
  details: 'mdi:account-outline',
  documents: 'mdi:file-document-outline',
  history: 'mdi:history',
};
export function StudentProfileView({
  student,
  refetch,
  sections = [],
  documents,
  academicYearContext,
  onFormEditingChange,
  onNavigationGuardChange,
}: Props) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const legacyTab = params.get('tab');
  const legacyView =
    legacyTab === 'information' || LEGACY_PROFILE_SECTIONS[legacyTab ?? '']
      ? 'details'
      : legacyTab === 'dashboard'
        ? 'activity'
        : legacyTab === 'calender'
          ? 'calendar'
          : legacyTab;
  const requestedView = params.get('view') ?? legacyView ?? 'overview';
  const requested = requestedView === 'admission' ? 'details' : requestedView;
  const view = [...PRIMARY, ...sections].some((item) => item.value === requested)
    ? requested
    : 'overview';
  const related = sections.filter(
    (item) => !PRIMARY.some((primary) => primary.value === item.value) && item.value !== 'dashboard'
  );
  const [relatedAnchor, setRelatedAnchor] = useState<HTMLElement | null>(null);
  const [historyPage, setHistoryPage] = useState(0);
  const canViewChanges = hasGrantedPermission(permissions, 'Students.Records.Changes.View');
  const detailsQuery = useGetStudentRecordDetailsQuery(
    {
      studentId: student.studentId,
      academicYearId:
        view === 'history'
          ? undefined
          : academicYearContext
            ? academicYearContext.id
            : currentYear?.id,
    },
    {
      skip: !['overview', 'details', 'history'].includes(view),
      refetchOnMountOrArgChange: true,
    }
  );
  const detailsErrorStatus =
    detailsQuery.error && typeof detailsQuery.error === 'object' && 'status' in detailsQuery.error
      ? detailsQuery.error.status
      : undefined;
  const detailsAccessDenied = detailsErrorStatus === 401 || detailsErrorStatus === 403;
  const details =
    detailsQuery.currentData?.studentId === student.studentId && !detailsAccessDenied
      ? detailsQuery.currentData
      : undefined;
  const changes = useGetStudentRecordChangesQuery(
    {
      studentId: student.studentId,
      maxResultCount: 25,
      skipCount: view === 'history' ? historyPage * 25 : 0,
    },
    { skip: !canViewChanges || !['overview', 'history'].includes(view) }
  );
  const changeItems = !changes.isError ? (changes.currentData?.items ?? []) : [];
  const viewHref = (nextView: string) =>
    recordsQueryUrl(pathname, params.toString(), {
      view: nextView,
      section: undefined,
      tab: undefined,
      edit: undefined,
    });
  const tabs = useMemo<UseTabsReturn>(
    () => ({
      value: view,
      setValue: (next) => {
        const value = typeof next === 'function' ? next(view) : next;
        router.push(
          recordsQueryUrl(pathname, params.toString(), {
            view:
              value === 'information'
                ? 'details'
                : value === 'dashboard'
                  ? 'activity'
                  : String(value),
            tab: undefined,
            edit: undefined,
          }),
          { scroll: false }
        );
      },
      onChange: (_event, next) =>
        router.push(
          recordsQueryUrl(pathname, params.toString(), {
            view: String(next),
            tab: undefined,
            edit: undefined,
          }),
          { scroll: false }
        ),
    }),
    [view, router, pathname, params]
  );
  const Documents = documents ?? sections.find((item) => item.value === 'documents')?.component;
  const Related = related.find((item) => item.value === view)?.component;
  const loadingDetails = detailsQuery.isLoading || (detailsQuery.isFetching && !details);
  const ProfilePanel = view === 'documents' ? Box : Scrollbar;
  const detailsSkeleton = (
    <Stack spacing={1.5} aria-label="Loading student details">
      <Skeleton variant="rounded" height={180} />
      <Skeleton variant="rounded" height={180} />
    </Stack>
  );
  return (
    <>
      <StudentProfileHeader student={student} />
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          flexShrink: 0,
          minWidth: 0,
          px: 1,
        }}
      >
        <CustomTabs
          value={PRIMARY.some((item) => item.value === view) ? view : false}
          guardUnsavedChanges={false}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Student profile tabs"
          sx={{ minWidth: 0, flex: 1 }}
          slotProps={{
            tab: { minHeight: 44, px: 1.5 },
            scroller: { p: 0 },
            selected: { color: 'primary.main' },
          }}
        >
          {PRIMARY.map((item) => (
            <Tab
              key={item.value}
              id={`student-profile-tab-${item.value}`}
              component={RouterLink}
              href={viewHref(item.value)}
              value={item.value}
              icon={<Iconify icon={PRIMARY_ICONS[item.value]} width={18} />}
              iconPosition="start"
              label={item.label}
              aria-controls={`student-profile-panel-${item.value}`}
            />
          ))}
        </CustomTabs>
        {related.length > 0 && (
          <>
            <Button
              onClick={(event) => setRelatedAnchor(event.currentTarget)}
              aria-haspopup="menu"
              aria-expanded={Boolean(relatedAnchor)}
              endIcon={<Iconify icon="mdi:chevron-down" />}
              sx={{ flexShrink: 0, ml: { sm: 0.5 }, alignSelf: { xs: 'flex-end', sm: 'center' } }}
            >
              {related.find((item) => item.value === view)?.label ?? 'Related modules'}
            </Button>
            <Menu
              anchorEl={relatedAnchor}
              open={Boolean(relatedAnchor)}
              onClose={() => setRelatedAnchor(null)}
            >
              {related.map((item) => (
                <MenuItem
                  key={item.value}
                  component={RouterLink}
                  href={viewHref(item.value)}
                  selected={view === item.value}
                  onClick={() => setRelatedAnchor(null)}
                >
                  {item.icon}
                  <Box component="span" sx={{ ml: 1 }}>
                    {item.label}
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Paper>
      {detailsQuery.isFetching && details && (
        <LinearProgress aria-label="Refreshing student details" />
      )}
      {academicYearContext && academicYearContext.id !== currentYear?.id && (
        <StudentFeedback notificationKey="STU-0763" presentation="persistent" severity="info">
          This form is being edited for {academicYearContext.name || 'the original academic year'}.
          Finish editing to switch the profile to the selected year.
        </StudentFeedback>
      )}
      <ProfilePanel
        sx={{
          flex: 1,
          minHeight: 0,
          ...(view === 'documents' && {
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }),
        }}
      >
        <Box
          role="tabpanel"
          id={`student-profile-panel-${view}`}
          aria-labelledby={
            PRIMARY.some((item) => item.value === view) ? `student-profile-tab-${view}` : undefined
          }
          sx={{
            p: { xs: 0.5, sm: 1 },
            minWidth: 0,
            ...(view === 'documents' && {
              height: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }),
          }}
        >
          <Stack spacing={1.5} sx={view === 'documents' ? { flex: 1, minHeight: 0 } : undefined}>
            {detailsQuery.isError && ['overview', 'details', 'history'].includes(view) && (
              <StudentFeedback
                notificationKey="STU-0764"
                presentation="toast"
                severity="error"
                action={<Button onClick={() => detailsQuery.refetch()}>Retry details</Button>}
              >
                Student details could not be loaded. Your profile context has been kept.
              </StudentFeedback>
            )}
            {changes.isError && view === 'overview' && canViewChanges && (
              <StudentFeedback
                notificationKey="STU-0765"
                presentation="toast"
                severity="error"
                action={<Button onClick={() => changes.refetch()}>Retry history</Button>}
              >
                Record change history could not be loaded.
              </StudentFeedback>
            )}
            {view === 'overview' && (
              <StudentProfileOverview
                student={student}
                details={details}
                changes={changeItems}
                viewHref={viewHref}
                changesLoading={changes.isLoading || (changes.isFetching && !changes.currentData)}
                changesError={changes.isError}
                canReadChanges={canViewChanges}
                detailsLoading={loadingDetails}
                detailsError={detailsQuery.isError}
              />
            )}
            {view === 'details' &&
              (loadingDetails
                ? detailsSkeleton
                : details && (
                    <StudentRegistrationFormPanel
                      key={details.studentId}
                      details={details}
                      requestEdit={params.get('edit') === 'details'}
                      onEditingChange={onFormEditingChange}
                      onNavigationGuardChange={onNavigationGuardChange}
                      onSaved={() => {
                        refetch();
                        detailsQuery.refetch();
                      }}
                    />
                  ))}
            {view === 'documents' && Documents && (
              <Documents student={student} tabs={tabs} refetch={refetch} />
            )}
            {view === 'history' && (
              <StudentRecordHistoryPanel
                student={student}
                changes={changeItems}
                sources={[
                  ...(details?.formSources ?? []),
                  ...(details?.registrationSources ?? []),
                ].filter(
                  (source, index, sources) =>
                    sources.findIndex((item) => item.submissionId === source.submissionId) === index
                )}
                canReadChanges={canViewChanges}
                isLoading={changes.isLoading || (changes.isFetching && !changes.currentData)}
                isError={changes.isError}
                isFetching={changes.isFetching}
                onRetry={() => changes.refetch()}
                page={historyPage}
                pageSize={25}
                totalCount={changes.currentData?.totalCount ?? 0}
                onPageChange={setHistoryPage}
              />
            )}
            {Related && <Related student={student} tabs={tabs} refetch={refetch} />}
          </Stack>
        </Box>
      </ProfilePanel>
    </>
  );
}
