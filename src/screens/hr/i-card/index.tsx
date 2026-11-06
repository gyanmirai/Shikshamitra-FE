'use client';

import type { RootState } from 'src/redux/store';
import type { EmployeeICardTemplate } from 'src/redux/hr/employee-icard-template-api';

import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useConfirmDialog } from 'src/hooks/use-confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { useAcademicOrganizationOptions } from 'src/screens/hr/hooks/useAcademicOrganizationOptions';
import {
  useGetEmployeeICardTemplatesQuery,
  useDeleteEmployeeICardTemplateMutation,
} from 'src/redux/hr/employee-icard-template-api';
import {
  EmployeeICardStatusType,
  EmployeeICardStatusTypeColor,
  EmployeeICardStatusTypeLabel,
} from 'src/enums/employee-icard-status';

import { buildTemplateState } from './employee-builder-state';
import { EmployeeICardBuilder } from './employee-card-builder';
import { EmployeeCardPreview } from './components/employee-card-preview';

const iCardActionPermissions = { add: 'HR.Employee.ICard.Add', delete: 'HR.Employee.ICard.Delete' };

const EmployeeIcardScreen = () => {
  const form = useBoolean();
  const previewDialog = useBoolean();
  const [selectedTemplate, setSelectedTemplate] = useState<EmployeeICardTemplate | null>(null);
  const [showConfirm, ConfirmDialog] = useConfirmDialog();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAdd = hasGrantedPermission(permissions, iCardActionPermissions.add);
  const canDelete = hasGrantedPermission(permissions, iCardActionPermissions.delete);
  const canEdit = canAdd;
  const academicYearId = currentYear?.id;
  const { options: organizationOptions, byId: organizationById } =
    useAcademicOrganizationOptions(academicYearId);

  const [templatePage, setTemplatePage] = useState({
    page: 1,
    pageSize: 20,
    search: '',
    mediumStageId: '',
  });
  const exportTemplates = useHrTableExport('hr-icard-templates', {
    academicYearId,
    ...templatePage,
  });
  useEffect(() => {
    setTemplatePage((current) => ({ ...current, page: 1, mediumStageId: '' }));
  }, [academicYearId]);
  const {
    currentData: data,
    isFetching: isLoading,
    error: tableError,
    refetch: retryTable,
    tableProps: operationalTableProps,
  } = useHrTableQuery(
    {
      table: 'hr-icard-templates',
      query: { academicYearId, ...templatePage },
      page: templatePage.page - 1,
      size: templatePage.pageSize,
      resetPage: () => setTemplatePage((current) => ({ ...current, page: 1 })),
      skip: !academicYearId,
    },
    useGetEmployeeICardTemplatesQuery(
      { academicYearId, ...templatePage },
      { skip: !academicYearId }
    )
  );
  const [deleteTemplate] = useDeleteEmployeeICardTemplateMutation();

  const templates = useMemo(() => data?.items || [], [data?.items]);

  const rows = useMemo(
    () =>
      templates.map((template: EmployeeICardTemplate) => ({
        ...template,
        organization:
          (template.mediumStageId ? organizationById.get(template.mediumStageId)?.name : null) ||
          'All organizations',
        status: template.isActive
          ? EmployeeICardStatusType.Active
          : EmployeeICardStatusType.Inactive,
      })),
    [organizationById, templates]
  );

  const handleCreate = () => {
    setSelectedTemplate(null);
    form.onTrue();
  };

  const handleEdit = (row: EmployeeICardTemplate) => {
    setSelectedTemplate(row);
    form.onTrue();
  };

  const handlePreview = (row: EmployeeICardTemplate) => {
    setSelectedTemplate(row);
    previewDialog.onTrue();
  };

  const handleDelete = async (row: EmployeeICardTemplate) => {
    const confirmed = await showConfirm({
      title: 'Delete Staff I-Card Template',
      message: `Delete "${row.name}"? This cannot be undone.`,
      icon: 'warning',
    });
    if (!confirmed) return;

    try {
      await deleteTemplate(row.id).unwrap();
      shikshaMitraToast.success({ message: 'Staff I-card template deleted' });
    } catch {
      shikshaMitraToast.error({ message: 'Could not delete Staff I-card template' });
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {form.value ? (
        <EmployeeICardBuilder
          template={selectedTemplate}
          organizations={organizationOptions}
          academicYearId={academicYearId}
          academicYearName={currentYear?.name}
          handleClose={form.onFalse}
        />
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Staff I-Card"
            description="Manage templates, check readiness, and export staff cards."
            links={[{ name: 'Staff I-Card' }]}
            action={
              <Button
                onClick={handleCreate}
                startIcon={<Add />}
                variant="contained"
                size="small"
                disabled={!academicYearId || !canAdd}
              >
                Create Staff I-Card
              </Button>
            }
          />
          <CustomizableTable
            showColumns
            showExport
            showFullScreen
            exportScope="all"
            tableId="employee-icard-table"
            tableTitle="Staff I-card templates"
            onExport={exportTemplates}
            error={tableError}
            onRetry={retryTable}
            serverSidePagination
            serverSideSearch
            page={templatePage.page - 1}
            rowsPerPage={templatePage.pageSize}
            totalCount={data?.totalCount || 0}
            onServerPagination={(page, pageSize) =>
              setTemplatePage((current) => ({ ...current, page, pageSize }))
            }
            onServerSearch={(search) =>
              setTemplatePage((current) => ({ ...current, page: 1, search }))
            }
            isLoading={isLoading}
            searchTerm={templatePage.search}
            columns={[
              {
                label: 'Template',
                id: 'name',
                align: 'left',
                sticky: true,
                width: 260,
                minWidth: 220,
              },
              {
                label: 'Organization',
                id: 'organization',
                align: 'left',
                width: 220,
                minWidth: 180,
                maxWidth: 260,
                cellSx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
              },
              {
                label: 'Orientation',
                id: 'orientation',
                filterType: 'enum',
                enumOptions: ['Horizontal', 'Vertical'].map((value) => ({ label: value, value })),
                align: 'left',
                width: 132,
                minWidth: 120,
              },
              {
                label: 'Status',
                id: 'status',
                filterType: 'enum',
                enumOptions: [
                  { label: 'Active', value: 'Active' },
                  { label: 'Inactive', value: 'Inactive' },
                ],
                align: 'left',
                sticky: true,
                stickyPosition: 'right' as const,
                width: 108,
                minWidth: 100,
                render(value) {
                  const status = value as EmployeeICardStatusType;
                  return (
                    <Label color={EmployeeICardStatusTypeColor[status]}>
                      {EmployeeICardStatusTypeLabel[status]}
                    </Label>
                  );
                },
              },
              {
                label: 'Action',
                id: 'action',
                sticky: true,
                stickyPosition: 'right' as const,
                isSort: false,
                isFilter: false,
                width: 108,
                minWidth: 96,
                align: 'left',
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      showViewIcon
                      showEditIcon={canEdit}
                      showDeleteIcon={canDelete}
                      showThreeDots={false}
                      handleEditClick={() => handleEdit(row as unknown as EmployeeICardTemplate)}
                      handleViewClick={() => handlePreview(row as unknown as EmployeeICardTemplate)}
                      handleDeleteClick={() =>
                        handleDelete(row as unknown as EmployeeICardTemplate)
                      }
                    />
                  );
                },
              },
            ]}
            data={rows}
            noDataText="No Staff I-card templates found."
            {...operationalTableProps}
          />
        </>
      )}
      <CustomDialog
        maxWidth="sm"
        title="Staff I-Card Preview"
        titleInfo="Preview how the staff ID card will look when printed using its configured layout. Select staff in the builder to review their data."
        open={previewDialog.value}
        handleClose={previewDialog.onFalse}
        paperProps={{
          sx: {
            width: '100%',
            maxWidth: 560,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <EmployeeCardPreview
            state={buildTemplateState(selectedTemplate, currentYear?.name)}
            academicYearName={currentYear?.name}
          />
        </Box>
      </CustomDialog>
      {ConfirmDialog}
    </Box>
  );
};

export default EmployeeIcardScreen;
