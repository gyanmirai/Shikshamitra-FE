'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { useState, useEffect, useCallback } from 'react';
import { studentPaths } from 'src/constants/student-menu';
import { Box, Paper, Stack, Button } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetStudentRecordsDirectoryOptionsQuery } from 'src/redux/student/records/student-records-api';
import { useGetICardAssignmentClassesQuery } from 'src/redux/student/records/student-icard-assignment-api';

import { directoryScope } from './student-directory-scope';
import { recordsQueryUrl, positivePageValue } from './records-url-state';
import StudentICardAssignmentRule from './student-icard-assignment-rule';
import StudentICardAssignmentRoster, {
  rosterColumns,
  rosterPageSizes,
} from './student-icard-assignment-roster';

const all = 'all';
const permission = 'Students.Records.StudentICard';

export default function StudentICardAssignment() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const rawQuery = params.toString();
  const yearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, `${permission}.View`);
  const canAdd = canView && hasGrantedPermission(permissions, `${permission}.Add`);
  const canDelete = canView && hasGrantedPermission(permissions, `${permission}.Delete`);
  const [appliedYear, setAppliedYear] = useState(yearId);
  const [busy, setBusy] = useState(false);
  const [templateSelectionKey, setTemplateSelectionKey] = useState<string | null>(null);
  const [ruleEditor, setRuleEditor] = useState<{ scope: string; remove: boolean } | null>(null);
  const options = useGetStudentRecordsDirectoryOptionsQuery(
    { academicYearId: yearId },
    { skip: !canView || !yearId }
  );

  useEffect(() => {
    if (appliedYear === yearId) return;
    setAppliedYear(yearId);
    setRuleEditor(null);
    if (appliedYear) {
      router.replace(
        recordsQueryUrl(pathname, rawQuery, {
          board: undefined,
          medium: undefined,
          class: undefined,
          division: undefined,
          search: undefined,
          page: undefined,
        }),
        { scroll: false }
      );
    }
  }, [appliedYear, pathname, rawQuery, router, yearId]);

  const scope = directoryScope(new URLSearchParams(rawQuery), options.currentData);
  const [standardId] = scope.classes;
  const [divisionId] = scope.divisions;
  const academicOptions = options.currentData;
  const mediums = academicOptions?.mediums.filter((item) => item.parentId === scope.board) ?? [];
  const standards =
    academicOptions?.standards.filter((item) => item.parentId === scope.medium) ?? [];
  const divisions = academicOptions?.divisions.filter((item) => item.parentId === standardId) ?? [];
  const rosterScope = JSON.stringify([yearId, scope.board, scope.medium, standardId, divisionId]);
  const page = positivePageValue(params.get('page'), 0, 100000);
  const requestedPageSize = positivePageValue(params.get('pageSize'), 25, 100);
  const pageSize = rosterPageSizes.includes(requestedPageSize) ? requestedPageSize : 25;
  const search = (params.get('search') ?? '').slice(0, 150);
  const ready = Boolean(
    canView &&
    yearId &&
    appliedYear === yearId &&
    academicOptions &&
    !options.isError &&
    scope.ready
  );
  const rule = useGetICardAssignmentClassesQuery(
    {
      academicYearId: yearId ?? '',
      boardId: scope.board,
      mediumId: scope.medium,
      standardId,
      skipCount: 0,
      // Older API hosts return the medium page when they do not recognize standardId.
      maxResultCount: 100,
    },
    { skip: !ready || !standardId, refetchOnMountOrArgChange: true }
  );
  const assignment =
    ready && !rule.isError
      ? rule.currentData?.items.find((item) => item.standardId === standardId)
      : undefined;
  const reviewKey = JSON.stringify([
    rosterScope,
    assignment?.concurrencyStamp,
    assignment?.templateConcurrencyStamp,
  ]);
  const onTemplateSelectionChange = useCallback(
    (eligible: boolean) => setTemplateSelectionKey(eligible ? reviewKey : null),
    [reviewKey]
  );
  const loadError = options.isError || (ready && !!standardId && rule.isError);
  const loading = Boolean(
    canView &&
    yearId &&
    (appliedYear !== yearId ||
      (options.isFetching && !academicOptions) ||
      (ready && standardId && rule.isFetching && !rule.currentData))
  );
  const editor = ruleEditor?.scope === rosterScope ? ruleEditor : null;
  const canEdit = canAdd && assignment?.canManage;
  const canOpenTemplate =
    canEdit && templateSelectionKey === reviewKey && !busy && !rule.isFetching;
  const showTemplateAction = canAdd && (!assignment || assignment.canManage);
  const canRemove =
    canDelete && assignment?.canManage && assignment.templateId && assignment.concurrencyStamp;

  const update = (changes: Record<string, string | number | undefined>) => {
    if (busy) return;
    const next = recordsQueryUrl(pathname, rawQuery, changes);
    if (next !== `${pathname}${rawQuery ? `?${rawQuery}` : ''}`) {
      setRuleEditor(null);
      router.push(next, { scroll: false });
    }
  };
  const reset = () =>
    update({
      board: undefined,
      medium: undefined,
      class: undefined,
      division: undefined,
      search: undefined,
      page: undefined,
    });
  const academicDisabled = busy || !canView || !yearId || !academicOptions || options.isError;
  const editLabel = assignment?.templateId ? 'Change template' : 'Assign template';

  return (
    <Box
      sx={{
        height: { xs: 'auto', sm: 1 },
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
        gap: 1,
      }}
    >
      <CustomBreadcrumbs
        heading="I-Card Assignment"
        description="Select students to enable template assignment. Templates apply to the whole class, and cards are generated for the selected students."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: 'I-Card Assignment' },
        ]}
        action={
          (showTemplateAction || canRemove) && (
            <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="flex-end">
              {canRemove && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<Iconify icon={GlobalIcons.delete} />}
                  disabled={busy || rule.isFetching}
                  onClick={() => setRuleEditor({ scope: rosterScope, remove: true })}
                >
                  Remove assignment
                </Button>
              )}
              {showTemplateAction && (
                <Button
                  size="small"
                  variant="contained"
                  color="inherit"
                  aria-label={
                    assignment ? `${editLabel} for ${assignment.standardName}` : editLabel
                  }
                  startIcon={<Iconify icon={GlobalIcons.assigned} />}
                  disabled={!canOpenTemplate}
                  onClick={() => {
                    if (canOpenTemplate) setRuleEditor({ scope: rosterScope, remove: false });
                  }}
                >
                  {editLabel}
                </Button>
              )}
            </Stack>
          )
        }
        sx={{ flexShrink: 0 }}
      />
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <CustomSelect
            fullWidth
            label="Board"
            size="small"
            value={scope.board}
            options={academicOptions?.boards ?? []}
            labelKey="name"
            valueKey="id"
            disabled={academicDisabled}
            isLoading={options.isFetching && !academicOptions}
            onChange={(value) =>
              update({
                board: String(value),
                medium: undefined,
                class: undefined,
                division: undefined,
                search: undefined,
                page: undefined,
              })
            }
          />
          <CustomSelect
            fullWidth
            label="Medium"
            size="small"
            value={scope.medium}
            options={mediums}
            labelKey="name"
            valueKey="id"
            disabled={academicDisabled || !scope.board}
            onChange={(value) =>
              update({
                board: scope.board,
                medium: String(value),
                class: undefined,
                division: undefined,
                search: undefined,
                page: undefined,
              })
            }
          />
          <CustomSelect
            fullWidth
            label="Class"
            size="small"
            value={standardId ?? ''}
            options={standards}
            labelKey="name"
            valueKey="id"
            disabled={academicDisabled || !scope.medium || !standards.length}
            onChange={(value) =>
              update({
                class: String(value),
                division: undefined,
                search: undefined,
                page: undefined,
              })
            }
          />
          <CustomSelect
            fullWidth
            label="Division"
            size="small"
            value={divisionId ?? all}
            options={[{ id: all, name: 'All divisions' }, ...divisions]}
            labelKey="name"
            valueKey="id"
            disabled={academicDisabled || !standardId || !divisions.length}
            onChange={(value) =>
              update({
                division: value === all ? undefined : String(value),
                page: undefined,
              })
            }
          />
        </Stack>
      </Paper>
      {assignment && yearId ? (
        <StudentICardAssignmentRoster
          key={rosterScope}
          reviewKey={reviewKey}
          academicYearId={yearId}
          assignment={assignment}
          divisionId={divisionId}
          assignmentRefreshing={rule.isFetching}
          canIssue={canAdd}
          canManageTemplate={Boolean(canEdit)}
          search={search}
          page={page}
          pageSize={pageSize}
          onBusyChange={setBusy}
          onTemplateSelectionChange={onTemplateSelectionChange}
          onSearch={(value) => update({ search: value || undefined, page: undefined })}
          onPageChange={(nextPage, nextSize) =>
            update({
              page: nextSize === pageSize ? nextPage : undefined,
              pageSize: nextSize,
            })
          }
          onClearFilters={() => update({ division: undefined, search: undefined, page: undefined })}
          onReloadAssignment={rule.refetch}
        />
      ) : (
        <Box sx={{ flex: 1, minHeight: { xs: 360, sm: 0 }, minWidth: 0, overflow: 'hidden' }}>
          <CustomizableTable
            tableId="student-icard-assignment-roster"
            tableTitle="I-Card students"
            columns={rosterColumns}
            data={[]}
            isLoading={loading}
            showToolbar={false}
            isPagination={false}
            noDataText={
              !canView ? (
                'I-Card View access is required.'
              ) : !yearId ? (
                'Select an academic year to view students.'
              ) : !scope.ready ? (
                <Stack spacing={1} alignItems="center">
                  Select an available board, medium and class.
                  {academicOptions && (
                    <Button size="small" onClick={reset}>
                      Reset filters
                    </Button>
                  )}
                </Stack>
              ) : standardId ? (
                'The selected class is unavailable. Choose another class.'
              ) : (
                'Select a class to view its students.'
              )
            }
            errorContent={
              loadError ? (
                <StudentFeedback
                  notificationKey="i-card-assignment-scope"
                  severity="error"
                  toastAction={
                    <Button
                      size="small"
                      onClick={() => (options.isError ? options.refetch() : rule.refetch())}
                    >
                      Retry
                    </Button>
                  }
                >
                  {options.isError
                    ? 'Academic filters could not be loaded.'
                    : 'The class template could not be loaded.'}
                </StudentFeedback>
              ) : undefined
            }
            wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          />
        </Box>
      )}
      {assignment && yearId && editor && (editor.remove ? canRemove : canEdit) && (
        <StudentICardAssignmentRule
          academicYearId={yearId}
          assignment={assignment}
          remove={editor.remove}
          onReload={rule.refetch}
          onClose={() => setRuleEditor(null)}
        />
      )}
    </Box>
  );
}
