import type { HrReportSource, HrReportTemplate } from 'src/redux/hr/hrReportsApi';

import { useMemo } from 'react';
import CommonReport from 'src/components/common-report';

import { HrReportBuilder } from './HrReportBuilder';
import { mapHrSourcesToCategories, mapHrSourcesToSubCategories } from '../hr-report-utils';
import SalaryDocumentsWorkspace from '../../payroll/salarySlip-generate/salary-documents-workspace';

import type { HrReportPermissions } from '../hr-report-permissions';
import type { HrReportQueuedExport, HrReportCatalogSelection } from '../hr-report-types';

type HrReportCatalogProps = {
  sources: HrReportSource[];
  templates: HrReportTemplate[];
  isLoadingSources: boolean;
  isFetchingExports: boolean;
  refetchExports: () => unknown;
  permissions: HrReportPermissions;
  directSelection?: HrReportCatalogSelection | null;
  onExportQueued?: (exportJob: HrReportQueuedExport) => void;
};

export function HrReportCatalog({
  sources,
  templates,
  isLoadingSources,
  isFetchingExports,
  refetchExports,
  permissions,
  directSelection,
  onExportQueued,
}: HrReportCatalogProps) {
  const categories = useMemo(() => mapHrSourcesToCategories(sources), [sources]);

  const subCategories = useMemo(
    () =>
      mapHrSourcesToSubCategories(sources, templates, ({ source, template }) =>
        source.id === 'payroll_statement' || source.id === 'payroll_register' ? (
          <SalaryDocumentsWorkspace
            kind={source.id === 'payroll_statement' ? 'statement' : 'register'}
          />
        ) : (
          <HrReportBuilder
            source={source}
            template={template}
            isFetchingExports={isFetchingExports}
            refetchExports={refetchExports}
            permissions={permissions}
            onExportQueued={onExportQueued}
          />
        )
      ),
    [isFetchingExports, onExportQueued, permissions, refetchExports, sources, templates]
  );

  if (directSelection) {
    if (
      directSelection.source.id === 'payroll_statement' ||
      directSelection.source.id === 'payroll_register'
    )
      return (
        <SalaryDocumentsWorkspace
          kind={directSelection.source.id === 'payroll_statement' ? 'statement' : 'register'}
        />
      );
    return (
      <HrReportBuilder
        source={directSelection.source}
        template={directSelection.template}
        isFetchingExports={isFetchingExports}
        refetchExports={refetchExports}
        permissions={permissions}
        onExportQueued={onExportQueued}
      />
    );
  }

  return (
    <CommonReport
      categories={categories}
      subCategories={subCategories}
      isLoading={isLoadingSources}
      emptyText="No HR report sources are available."
    />
  );
}
