import type {
  HrReportSource,
  HrReportTemplate,
  HrReportExportJob,
} from 'src/redux/hr/hrReportsApi';

import { useMemo } from 'react';
import CommonReport from 'src/components/common-report';

import { HrReportBuilder } from './HrReportBuilder';
import { mapHrSourcesToCategories, mapHrSourcesToSubCategories } from '../hr-report-utils';

type HrReportCatalogProps = {
  sources: HrReportSource[];
  templates: HrReportTemplate[];
  exportJobs: HrReportExportJob[];
  isLoadingSources: boolean;
  isFetchingExports: boolean;
  refetchExports: () => any;
};

export function HrReportCatalog({
  sources,
  templates,
  exportJobs,
  isLoadingSources,
  isFetchingExports,
  refetchExports,
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
        />
      )),
    [exportJobs, isFetchingExports, refetchExports, sources, templates]
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
