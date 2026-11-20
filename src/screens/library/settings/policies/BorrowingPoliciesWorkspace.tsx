'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Tab, Alert, Stack } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { libraryPaths } from 'src/constants/library-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PolicyList } from './PolicyList';
import { useWorkspaceQuery } from './useWorkspaceQuery';
import { RolloverPanel } from './rollover/RolloverPanel';
import { useLibrarySettings } from './useLibrarySettings';
import BorrowingReturnRules from '../BorrowingAndReturnRules';

export default function BorrowingPoliciesWorkspace() {
  const { academicYearId, canEdit, canView } = useLibrarySettings();
  const { query, update } = useWorkspaceQuery();
  const requestedTab = query.get('tab');
  const tab =
    requestedTab === 'legacy' || (requestedTab === 'rollover' && canView)
      ? requestedTab
      : 'policies';
  return (
    <Stack spacing={2} sx={{ minHeight: 0, height: 1 }}>
      <CustomBreadcrumbs
        heading="Borrowing Rules"
        description="Draft and publish borrowing policies for the selected academic year."
        links={[{ name: 'Library', href: libraryPaths.dashboard }, { name: 'Borrowing Rules' }]}
      />
      <CustomTabs
        value={tab}
        onChange={(_, value) => update({ tab: value, page: 1 })}
        guardUnsavedChanges={false}
        aria-label="Borrowing rule views"
      >
        <Tab
          value="policies"
          label="Policies"
          id="borrowing-policies-tab"
          aria-controls="borrowing-policies-panel"
          icon={<Iconify icon={GlobalIcons.documentIcon} />}
        />
        <Tab
          value="legacy"
          label="Legacy limits"
          id="borrowing-legacy-tab"
          aria-controls="borrowing-legacy-panel"
          icon={<Iconify icon={GlobalIcons.history} />}
        />
        {canView && (
          <Tab
            value="rollover"
            label="Year rollover"
            id="borrowing-rollover-tab"
            aria-controls="borrowing-rollover-panel"
            icon={<Iconify icon={GlobalIcons.calendar} />}
          />
        )}
      </CustomTabs>
      <Stack
        role="tabpanel"
        id={`borrowing-${tab}-panel`}
        aria-labelledby={`borrowing-${tab}-tab`}
        sx={{ minHeight: 0, flex: 1 }}
      >
        {tab === 'policies' ? (
          <PolicyList key={academicYearId} academicYearId={academicYearId} canEdit={canEdit} />
        ) : tab === 'rollover' ? (
          <RolloverPanel academicYearId={academicYearId} />
        ) : (
          <>
            <Alert severity="info">
              Legacy limits apply when no published policy matches. Due dates remain manual for
              those loans.
            </Alert>
            <BorrowingReturnRules showHeader={false} />
          </>
        )}
      </Stack>
    </Stack>
  );
}
