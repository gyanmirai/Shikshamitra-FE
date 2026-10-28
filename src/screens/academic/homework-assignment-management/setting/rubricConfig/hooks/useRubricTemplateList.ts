import type { RootState } from 'src/redux/store';
import type { IParams, ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetRubricTemplatesQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricTemplateReadApi';

import { rubricTemplateListRow } from './rubricTemplateListRows';
import { useRubricTemplateExport } from './useRubricTemplateExport';

const initialCriteria = { page: 1, pageSize: 10, search: '', filters: [] as IParams['filters'], sorts: [] as IParams['sorts'] };

export function useRubricTemplateList() {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const mediumId = currentMedium?.id;
  const [state, setState] = useState({ mediumId, ...initialCriteria });
  const criteria = state.mediumId === mediumId ? state : { mediumId, ...initialCriteria };
  const change = (patch: Partial<typeof initialCriteria>) => setState({ ...criteria, page: 1, ...patch });
  const query = useGetRubricTemplatesQuery({ academicMediumId: mediumId, page: criteria.page,
    pageSize: criteria.pageSize, search: criteria.search, filters: JSON.stringify(criteria.filters),
    sorts: JSON.stringify(criteria.sorts), timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone }, { skip: !mediumId });
  const tableData = (query.currentData?.items ?? []).map(rubricTemplateListRow);
  const onExport = useRubricTemplateExport(mediumId);
  const tableProps: Partial<ICustomizableTableProps> = {
    serverSidePagination: true, serverSideSearch: true, serverSideSort: true, serverSideFilter: true,
    maxServerRowsPerPage: 100,
    page: criteria.page - 1, rowsPerPage: criteria.pageSize, searchTerm: criteria.search,
    filters: criteria.filters, sorts: criteria.sorts, totalCount: query.currentData?.totalCount ?? 0,
    onServerPagination: (page, pageSize) => change({ page, pageSize }),
    onServerSearch: search => change({ search }),
    onServerSort: (_column, sorts) => change({ sorts }),
    onServerFilter: filters => change({ filters }),
    onClearCriteria: () => change({ search: '', filters: [] }), onExport,
  };
  return {
    tableData, tableProps,
    counts: query.currentData?.summary ?? { total: 0, published: 0, draft: 0, archived: 0, linked: 0 },
    usageCountByTemplate: Object.fromEntries(tableData.map(row => [row.id, row.usageCount ?? 0])),
    hasMedium: Boolean(mediumId),
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    retry: query.refetch,
  };
}
