import type {
  HrReportSource,
  HrReportTemplate,
  HrReportExportJob,
} from 'src/redux/hr/hrReportsApi';

import { useMemo } from 'react';
import CommonReport from 'src/components/common-report';

import { HrReportBuilder } from './HrReportBuilder';
import { mapHrSourcesToCategories, mapHrSourcesToSubCategories } from '../hr-report-utils';

import type { HrReportPermissions } from '../hr-report-permissions';

type HrReportCatalogProps = {
  sources: HrReportSource[];
  templates: HrReportTemplate[];
  exportJobs: HrReportExportJob[];
  isLoadingSources: boolean;
  isFetchingExports: boolean;
  refetchExports: () => any;
  permissions: HrReportPermissions;
};

export function HrReportCatalog({
  sources,
  templates,
  exportJobs,
  isLoadingSources,
  isFetchingExports,
  refetchExports,
  permissions,
}: HrReportCatalogProps) {
  const categories = useMemo(() => mapHrSourcesToCategories(sources), [sources]);

  const subCategories = useMemo(
    () =>
      mapHrSourcesToSubCategories(sources, templates, ({ source, template }) => (
        <HrReportBuilder
          source={source}
          template={template}
          exportJobs={exportJobs}
          isFetchingExports={isFetchingExports}
          refetchExports={refetchExports}
          permissions={permissions}
        />
      )),
    [exportJobs, isFetchingExports, permissions, refetchExports, sources, templates]
  );

  return (
    <CommonReport
      categories={categories}
      subCategories={subCategories}
      isLoading={isLoadingSources}
      emptyText="No HR report sources are available."
    />
  );
}
