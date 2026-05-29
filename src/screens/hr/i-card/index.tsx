'use client';

import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';
import type { EmployeeICardTemplate } from 'src/redux/hr/employee-icard-template-api';

import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { useConfirmDialog } from 'src/hooks/use-confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import {
  EmployeeICardStatusType,
  EmployeeICardStatusTypeColor,
  EmployeeICardStatusTypeLabel,
  EmployeeICardStatusTypeOptions,
} from 'src/enums/employee-icard-status';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Button,
  MenuList,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  ToggleButton,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';
import {
  useGetEmployeeICardTemplatesQuery,
  useLazyGetEmployeeICardAssetQuery,
  useUploadEmployeeICardAssetMutation,
  useDownloadEmployeeICardsPdfMutation,
  useCreateEmployeeICardTemplateMutation,
  useDeleteEmployeeICardTemplateMutation,
  useUpdateEmployeeICardTemplateMutation,
} from 'src/redux/hr/employee-icard-template-api';

import { isPdfBlob, clampCardsPerPage } from './i-card-builder-utils';

type ICardFieldKey =
  | 'name'
  | 'employeeCode'
  | 'designation'
  | 'department'
  | 'organization'
  | 'contactNo'
  | 'bloodGroup'
  | 'photo'
  | 'validityYear'
  | 'address';

type ICardField = {
  name: ICardFieldKey;
  label: string;
  enabled: boolean;
  important?: boolean;
};

type BuilderState = {
  name: string;
  organization: string;
  orientation: 'Horizontal' | 'Vertical';
  width: number;
  height: number;
  schoolName: string;
  schoolAddress: string;
  logoBlobName: string | null;
  logoPreview: string;
  themeColor: string;
  backgroundColor: string;
  presetKey: string;
  qrCodeEnabled: boolean;
  barcodeEnabled: boolean;
  fields: ICardField[];
  selectedEmployeeIds: string[];
  employeeSearch: string;
  designationFilter: string;
  excludeIncompleteEmployees: boolean;
  cardsPerPage: number;
};

type EmployeeICardRow = {
  id: string;
  fullName?: string | null;
  employeeIdentifier?: string | null;
  designation?: string | null;
  department?: string | null;
  organizationNames?: string[] | null;
  mobileNo?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  thumbnailPicture?: string | null;
};

const iCardActionPermissions = {
  add: 'HR.Employee.ICard.Add',
  delete: 'HR.Employee.ICard.Delete',
};

const steps = ['Setup', 'Branding', 'Layout', 'Review', 'Employees', 'Export'];

const presets = [
  { key: 'executive-clean', label: 'Executive Clean', color: '#1D4ED8' },
  { key: 'academic-formal', label: 'Academic Formal', color: '#047857' },
  { key: 'minimal-light', label: 'Minimal Light', color: '#334155' },
];

const CARD_DIMENSIONS = {
  Horizontal: { width: 420, height: 260 },
  Vertical: { width: 280, height: 420 },
} as const;

const defaultFields: ICardField[] = [
  { name: 'photo', label: 'Photo', enabled: true, important: true },
  { name: 'name', label: 'Employee Name', enabled: true, important: true },
  { name: 'employeeCode', label: 'Employee Code', enabled: true, important: true },
  { name: 'designation', label: 'Designation', enabled: true },
  { name: 'department', label: 'Department', enabled: true },
  { name: 'organization', label: 'Organization', enabled: true },
  { name: 'contactNo', label: 'Contact Number', enabled: true },
  { name: 'bloodGroup', label: 'Blood Group', enabled: false },
  { name: 'validityYear', label: 'Validity Year', enabled: true },
  { name: 'address', label: 'Address', enabled: false },
];

const initialBuilder = (academicYearName?: string, organization = 'all'): BuilderState => ({
  name: 'Employee I-Card',
  organization,
  orientation: 'Horizontal',
  width: CARD_DIMENSIONS.Horizontal.width,
  height: CARD_DIMENSIONS.Horizontal.height,
  schoolName: 'School Name',
  schoolAddress: '',
  logoBlobName: null,
  logoPreview: '',
  themeColor: '#1D4ED8',
  backgroundColor: '#F8FAFC',
  presetKey: 'executive-clean',
  qrCodeEnabled: true,
  barcodeEnabled: false,
  fields: defaultFields,
  selectedEmployeeIds: [],
  employeeSearch: '',
  designationFilter: 'all',
  excludeIncompleteEmployees: false,
  cardsPerPage: 8,
});

const parseFields = (template?: EmployeeICardTemplate | null) => {
  const mandatoryFields = new Set(['photo', 'name', 'employeeCode']);
  const disabledFields = defaultFields.map((field) => ({
    ...field,
    enabled: mandatoryFields.has(field.name),
  }));

  if (!template?.fieldsJson) return defaultFields;
  try {
    const parsed = JSON.parse(template.fieldsJson);
    if (!Array.isArray(parsed)) return disabledFields;
    return disabledFields.map((field) => ({
      ...field,
      enabled:
        field.important ||
        (parsed.find((item: ICardField) => item.name === field.name)?.enabled ?? field.enabled),
    }));
  } catch {
    return disabledFields;
  }
};

const extractDominantColor = (file: File) =>
  new Promise<string | null>((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      resolve(null);
      return;
    }

    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const size = 48;
      canvas.width = size;
      canvas.height = size;
      context?.drawImage(image, 0, 0, size, size);
      const data = context?.getImageData(0, 0, size, size).data;
      URL.revokeObjectURL(url);

      if (!data) {
        resolve(null);
        return;
      }

      let red = 0;
      let green = 0;
      let blue = 0;
      let count = 0;
      for (let index = 0; index < data.length; index += 16) {
        const alpha = data[index + 3];
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const isVisible = alpha >= 128;
        const isNotWhite = r <= 235 || g <= 235 || b <= 235;
        if (isVisible && isNotWhite) {
          red += r;
          green += g;
          blue += b;
          count += 1;
        }
      }

      if (!count) {
        resolve(null);
        return;
      }

      const toHex = (value: number) =>
        Math.round(value / count)
          .toString(16)
          .padStart(2, '0');
      resolve(`#${toHex(red)}${toHex(green)}${toHex(blue)}`);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });

const buildTemplateState = (
  template: EmployeeICardTemplate | null,
  academicYearName?: string,
  organization = 'all'
): BuilderState => {
  if (!template) return initialBuilder(academicYearName, organization);

  const orientation = template.orientation === 'Vertical' ? 'Vertical' : 'Horizontal';
  const defaultSize = CARD_DIMENSIONS[orientation];

  return {
    ...initialBuilder(academicYearName, template.mediumStageId || 'all'),
    name: template.name,
    orientation,
    width: template.width || defaultSize.width,
    height: template.height || defaultSize.height,
    schoolName: template.schoolName || template.name,
    schoolAddress: template.schoolAddress || '',
    logoBlobName: template.logoBlobName || null,
    logoPreview: '',
    themeColor: template.themeColor || '#1D4ED8',
    backgroundColor: template.backgroundColor || '#F8FAFC',
    presetKey: template.presetKey || 'executive-clean',
    qrCodeEnabled: Boolean(template.qrCodeEnabled),
    barcodeEnabled: Boolean(template.barcodeEnabled),
    fields: parseFields(template),
  };
};

const EmployeeIcardScreen = () => {
  const form = useBoolean();
  const previewDialog = useBoolean();
  const [selectedTemplate, setSelectedTemplate] = useState<EmployeeICardTemplate | null>(null);
  const [showConfirm, ConfirmDialog] = useConfirmDialog();

  const { currentMedium: medium, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAdd = hasGrantedPermission(permissions, iCardActionPermissions.add);
  const canDelete = hasGrantedPermission(permissions, iCardActionPermissions.delete);
  const canEdit = canAdd;
  const academicYearId = currentYear?.id;
  const currentMediumStageId = medium?.educationMediumStages?.[0]?.id;

  const { data, isLoading } = useGetEmployeeICardTemplatesQuery(
    { academicYearId, page: 1, pageSize: 50 },
    { skip: !academicYearId }
  );
  const [deleteTemplate] = useDeleteEmployeeICardTemplateMutation();
  const { data: employeeData } = useGetEmployeeQuery({
    page: 1,
    pageSize: 100,
    mediumStageId: currentMediumStageId,
  });

  const templates = useMemo(
    () =>
      (data?.items || []).filter(
        (template: EmployeeICardTemplate) =>
          !template.mediumStageId || template.mediumStageId === currentMediumStageId
      ),
    [currentMediumStageId, data?.items]
  );

  const rows = useMemo(
    () =>
      templates.map((template: EmployeeICardTemplate) => ({
        ...template,
        organization:
          medium?.educationMediumStages?.find(
            (item: Organization) => item.id === template.mediumStageId
          )?.name || 'All organizations',
        status: template.isActive
          ? EmployeeICardStatusType.Active
          : EmployeeICardStatusType.Inactive,
      })),
    [medium?.educationMediumStages, templates]
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
      title: 'Delete Employee I-Card Template',
      message: `Delete "${row.name}"? This cannot be undone.`,
      icon: 'warning',
    });
    if (!confirmed) return;

    try {
      await deleteTemplate(row.id).unwrap();
      shikshaMitraToast.success({ message: 'Employee I-card template deleted' });
    } catch {
      shikshaMitraToast.error({ message: 'Could not delete Employee I-card template' });
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {form.value ? (
        <Box display="flex" flexDirection="column" height="100%">
          <CustomBreadcrumbs
            heading={selectedTemplate ? 'Update Employee I-Card' : 'Create Employee I-Card'}
            description="Create branded, print-ready employee ID cards."
            links={[{ name: 'HR/Staff' }, { name: 'Employee' }, { name: 'Employee I-Card' }]}
            isBack
            onBack={form.onFalse}
          />
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <EmployeeICardBuilder
              template={selectedTemplate}
              organizations={medium?.educationMediumStages || []}
              academicYearId={academicYearId}
              academicYearName={currentYear?.name}
              handleClose={form.onFalse}
            />
          </Box>
        </Box>
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Employee I-Card"
            description="Manage templates, check readiness, and export employee cards."
            links={[{ name: 'HR/Staff' }, { name: 'Employee' }, { name: 'Employee I-Card' }]}
            action={
              <Button
                onClick={handleCreate}
                startIcon={<Add />}
                variant="contained"
                size="small"
                disabled={!academicYearId || !canAdd}
              >
                Create Employee I-Card
              </Button>
            }
          />
          <CustomizableTable
            tableId="employee-icard-table"
            isLoading={isLoading}
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
                align: 'left',
                width: 132,
                minWidth: 120,
              },
              {
                label: 'Status',
                id: 'status',
                filterType: 'enum',
                enumOptions: EmployeeICardStatusTypeOptions,
                align: 'left',
                sticky: true,
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
                      handleEditClick={() => handleEdit(row as unknown as EmployeeICardTemplate)}
                      handleViewClick={() => handlePreview(row as unknown as EmployeeICardTemplate)}
                      handleDeleteClick={() =>
                        handleDelete(row as unknown as EmployeeICardTemplate)
                      }
                      actions={() => (
                        <MenuList>
                          {canEdit && (
                            <MenuItem
                              onClick={() => handleEdit(row as unknown as EmployeeICardTemplate)}
                            >
                              <Iconify icon="solar:pen-bold" />
                              Edit Template
                            </MenuItem>
                          )}
                        </MenuList>
                      )}
                    />
                  );
                },
              },
            ]}
            data={rows}
            noDataText="No Employee I-card templates found."
          />
        </>
      )}
      <CustomDialog
        maxWidth="md"
        title="Employee I-Card Preview"
        open={previewDialog.value}
        handleClose={previewDialog.onFalse}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <CardPreview
            state={buildTemplateState(selectedTemplate, currentYear?.name)}
            employee={employeeData?.items?.[0]}
            scale={1}
          />
        </Box>
      </CustomDialog>
      {ConfirmDialog}
    </Box>
  );
};

export default EmployeeIcardScreen;

const EmployeeICardBuilder = ({
  template,
  organizations,
  academicYearId,
  academicYearName,
  handleClose,
}: {
  template: EmployeeICardTemplate | null;
  organizations: Organization[];
  academicYearId?: string;
  academicYearName?: string;
  handleClose: () => void;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [state, setState] = useState<BuilderState>(() =>
    buildTemplateState(template, academicYearName)
  );
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(template?.id ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [employeePage, setEmployeePage] = useState(1);
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState('all');
  const [selectedEmployeesById, setSelectedEmployeesById] = useState<
    Record<string, EmployeeICardRow>
  >({});
  const [createTemplate] = useCreateEmployeeICardTemplateMutation();
  const [updateTemplate] = useUpdateEmployeeICardTemplateMutation();
  const [uploadAsset] = useUploadEmployeeICardAssetMutation();
  const [loadAsset] = useLazyGetEmployeeICardAssetQuery();
  const [downloadPdf, { isLoading: isExporting }] = useDownloadEmployeeICardsPdfMutation();

  useEffect(() => {
    setState(buildTemplateState(template, academicYearName));
    setSavedTemplateId(template?.id ?? null);
    setEmployeePage(1);
    setSelectedEmployeesById({});
  }, [academicYearName, template]);

  useEffect(() => {
    if (!state.logoBlobName) return undefined;

    let currentUrl = '';
    let isActive = true;
    loadAsset(state.logoBlobName)
      .unwrap()
      .then((blob: Blob) => {
        if (!isActive) return;
        currentUrl = URL.createObjectURL(blob);
        patchState({ logoPreview: currentUrl });
      })
      .catch(() => {
        shikshaMitraToast.error({ message: 'Could not load school logo' });
      });

    return () => {
      isActive = false;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [loadAsset, state.logoBlobName]);

  useEffect(
    () => () => {
      if (state.logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(state.logoPreview);
      }
    },
    [state.logoPreview]
  );

  const selectedMediumStageId = state.organization === 'all' ? undefined : state.organization;
  const { data: employeeData, isFetching: isFetchingEmployees } = useGetEmployeeQuery({
    page: employeePage,
    pageSize: 25,
    mediumStageId: selectedMediumStageId,
    status: employeeStatusFilter === 'all' ? undefined : employeeStatusFilter,
    designation: state.designationFilter === 'all' ? undefined : state.designationFilter,
    search: state.employeeSearch.trim() || undefined,
  });
  const employees = useMemo(
    () => (employeeData?.items || []) as EmployeeICardRow[],
    [employeeData?.items]
  );
  const designRecommendations = useRecommendations(state, employees);
  const filteredEmployees = employees;

  const readiness = useMemo(() => {
    const selected = Object.values(selectedEmployeesById);
    return {
      selected: state.selectedEmployeeIds.length,
      missingPhoto: selected.filter((employee) => !employee.thumbnailPicture).length,
      missingPhone: selected.filter((employee) => !employee.mobileNo).length,
      missingDesignation: selected.filter((employee) => !employee.designation).length,
    };
  }, [selectedEmployeesById, state.selectedEmployeeIds.length]);

  const designationOptions = useMemo(
    () =>
      Array.from(
        new Set(employees.map((employee) => employee.designation).filter(Boolean) as string[])
      ).map((designation) => ({
        id: designation,
        name: designation,
      })),
    [employees]
  );

  const sampleEmployee = employees[0];

  const patchState = (patch: Partial<BuilderState>) => setState((prev) => ({ ...prev, ...patch }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleEmployeeSelection = (employee: EmployeeICardRow) => {
    const checked = state.selectedEmployeeIds.includes(employee.id);
    patchState({
      selectedEmployeeIds: checked
        ? state.selectedEmployeeIds.filter((id) => id !== employee.id)
        : [...state.selectedEmployeeIds, employee.id],
    });
    setSelectedEmployeesById((prev) => {
      if (!checked) return { ...prev, [employee.id]: employee };
      const next = { ...prev };
      delete next[employee.id];
      return next;
    });
  };

  const allVisibleSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((employee) => state.selectedEmployeeIds.includes(employee.id));

  const someVisibleSelected = filteredEmployees.some((employee) =>
    state.selectedEmployeeIds.includes(employee.id)
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleVisibleSelection = (checked: boolean) => {
    const visibleIds = filteredEmployees.map((employee) => employee.id);
    const visibleById = Object.fromEntries(
      filteredEmployees.map((employee) => [employee.id, employee])
    );
    patchState({
      selectedEmployeeIds: checked
        ? Array.from(new Set([...state.selectedEmployeeIds, ...visibleIds]))
        : state.selectedEmployeeIds.filter((id) => !visibleIds.includes(id)),
    });
    setSelectedEmployeesById((prev) =>
      checked
        ? { ...prev, ...visibleById }
        : Object.fromEntries(Object.entries(prev).filter(([id]) => !visibleIds.includes(id)))
    );
  };

  const employeeColumns = useMemo<any[]>(
    () => [
      {
        label: (
          <Checkbox
            size="small"
            checked={allVisibleSelected}
            indeterminate={!allVisibleSelected && someVisibleSelected}
            onChange={(event) => toggleVisibleSelection(event.target.checked)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
        id: 'select',
        width: 72,
        minWidth: 64,
        maxWidth: 72,
        isSort: false,
        sticky: true,
        isFilter: false,
        align: 'center' as const,
        render: (_: unknown, row: any) => (
          <Checkbox
            size="small"
            checked={state.selectedEmployeeIds.includes((row as EmployeeICardRow).id)}
            onChange={() => toggleEmployeeSelection(row as EmployeeICardRow)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },
      {
        label: 'Employee',
        id: 'fullName',
        minWidth: 100,
        sticky: true,
        align: 'left' as const,
        isFilter: false,
        render: (_: unknown, row: any) => (
          <Box>
            <Typography variant="body2">
              {(row as EmployeeICardRow).fullName || 'Unnamed employee'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(row as EmployeeICardRow).employeeIdentifier || '-'}
            </Typography>
          </Box>
        ),
      },
      {
        label: 'Designation',
        id: 'designation',
        minWidth: 100,
        align: 'left' as const,
        isFilter: false,
        render: (value: string) => value || '-',
      },
      {
        label: 'Readiness',
        id: 'readiness',
        minWidth: 100,
        sticky: true,
        align: 'left' as const,
        isSort: false,
        isFilter: false,
        render: (_: unknown, row: any) => (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {!(row as EmployeeICardRow).thumbnailPicture && (
              <Label color="warning" variant="soft">
                Photo
              </Label>
            )}
            {!(row as EmployeeICardRow).mobileNo && (
              <Label color="warning" variant="soft">
                Phone
              </Label>
            )}
            {!(row as EmployeeICardRow).designation && (
              <Label color="warning" variant="soft">
                Role
              </Label>
            )}
            {(row as EmployeeICardRow).thumbnailPicture &&
              (row as EmployeeICardRow).mobileNo &&
              (row as EmployeeICardRow).designation && (
                <Label color="success" variant="soft">
                  Ready
                </Label>
              )}
          </Stack>
        ),
      },
    ],
    [
      allVisibleSelected,
      someVisibleSelected,
      state.selectedEmployeeIds,
      toggleEmployeeSelection,
      toggleVisibleSelection,
    ]
  );

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    try {
      const [result, dominantColor]: any[] = await Promise.all([
        uploadAsset(file).unwrap(),
        extractDominantColor(file),
      ]);
      patchState({
        logoBlobName: result.blobName,
        logoPreview: preview,
        ...(dominantColor ? { themeColor: dominantColor } : {}),
      });
      shikshaMitraToast.success({ message: 'School logo uploaded' });
    } catch {
      URL.revokeObjectURL(preview);
      shikshaMitraToast.error({ message: 'Could not upload logo' });
    } finally {
      event.target.value = '';
    }
  };

  const handleFieldToggle = (name: ICardFieldKey) => {
    patchState({
      fields: state.fields.map((field) =>
        field.name === name && !field.important ? { ...field, enabled: !field.enabled } : field
      ),
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (!academicYearId) {
        shikshaMitraToast.error({ message: 'Academic year is required' });
        return null;
      }
      if (!state.name.trim()) {
        shikshaMitraToast.error({ message: 'Template name is required' });
        return null;
      }

      const body = {
        academicYearId,
        mediumStageId: state.organization === 'all' ? null : state.organization,
        name: state.name.trim(),
        width: state.width,
        height: state.height,
        backgroundColor: state.backgroundColor,
        backgroundImageBlobName: null,
        logoBlobName: state.logoBlobName,
        schoolName: state.schoolName.trim(),
        schoolAddress: state.schoolAddress.trim(),
        themeColor: state.themeColor,
        orientation: state.orientation,
        presetKey: state.presetKey,
        qrCodeEnabled: state.qrCodeEnabled,
        barcodeEnabled: state.barcodeEnabled,
        backSideEnabled: false,
        fieldsJson: JSON.stringify(state.fields),
        isActive: true,
      };

      if (savedTemplateId) {
        await updateTemplate({ id: savedTemplateId, body }).unwrap();
        shikshaMitraToast.success({ message: 'Employee I-card template updated' });
        return savedTemplateId;
      }

      const created: any = await createTemplate(body).unwrap();
      setSavedTemplateId(created.id);
      shikshaMitraToast.success({ message: 'Employee I-card template created' });
      return created.id;
    } catch {
      shikshaMitraToast.error({ message: 'Could not save Employee I-card template' });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (state.selectedEmployeeIds.length === 0) {
      shikshaMitraToast.error({ message: 'Select at least one employee' });
      return;
    }

    try {
      const templateId = await handleSave();
      if (!templateId) return;

      const blob: Blob = await downloadPdf({
        templateId,
        body: {
          employeeIds: state.selectedEmployeeIds,
          cardsPerPage: clampCardsPerPage(state.cardsPerPage),
          excludeIncompleteEmployees: state.excludeIncompleteEmployees,
        },
      }).unwrap();
      if (!(await isPdfBlob(blob))) {
        shikshaMitraToast.error({ message: 'Could not export Employee I-card PDF' });
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Employee-I-Cards-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      shikshaMitraToast.success({ message: 'Employee I-card PDF downloaded' });
      handleClose();
    } catch {
      shikshaMitraToast.error({ message: 'Could not export Employee I-card PDF' });
    }
  };

  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <CustomStepperWithFormik
        initialValues={{}}
        steps={steps}
        activeStep={activeStep}
        validateOnChange={false}
        validationSchema={undefined}
        handleBack={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
        handleNext={async (isLastStep, _value, _formik, setLoading) => {
          if (isLastStep) {
            setLoading(true);
            try {
              const savedId = await handleSave();
              if (savedId) handleClose();
            } finally {
              setLoading(false);
            }
          } else {
            setLoading(false);
            setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
          }
        }}
        showSaveButton={false}
        disableSubmit={isSaving || isExporting}
        saveAndNextButtonProps={{ disabled: isSaving || isExporting }}
        renderItem={({ activeStep: currentStep }) => (
          <Box sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                {currentStep === 0 && (
                  <Stack spacing={2}>
                    <TextField
                      label="Template Name"
                      value={state.name}
                      onChange={(event) => patchState({ name: event.target.value })}
                      size="small"
                    />
                    <CustomSelect
                      options={[{ name: 'All organizations', id: 'all' }, ...organizations]}
                      label="Organization"
                      value={state.organization}
                      onChange={(val) => {
                        patchState({
                          organization: String(Array.isArray(val) ? val[0] : val),
                          selectedEmployeeIds: [],
                        });
                        setSelectedEmployeesById({});
                        setEmployeePage(1);
                      }}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    />
                    <ToggleButtonGroup
                      exclusive
                      value={state.orientation}
                      onChange={(_, value) => {
                        if (!value) return;
                        patchState({
                          orientation: value,
                          width: CARD_DIMENSIONS[value as 'Horizontal' | 'Vertical'].width,
                          height: CARD_DIMENSIONS[value as 'Horizontal' | 'Vertical'].height,
                        });
                      }}
                    >
                      <ToggleButton value="Horizontal" size="small">
                        Horizontal
                      </ToggleButton>
                      <ToggleButton value="Vertical" size="small">
                        Vertical
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                )}

                {currentStep === 1 && (
                  <Stack spacing={2}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<Iconify icon="solar:upload-linear" />}
                    >
                      Upload School Logo
                      <input
                        hidden
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleLogoUpload}
                      />
                    </Button>
                    <TextField
                      label="School Name"
                      value={state.schoolName}
                      onChange={(event) => patchState({ schoolName: event.target.value })}
                      size="small"
                    />
                    <TextField
                      label="School Address"
                      value={state.schoolAddress}
                      onChange={(event) => patchState({ schoolAddress: event.target.value })}
                      size="small"
                      multiline
                      minRows={2}
                    />
                    <Stack direction="row" spacing={2}>
                      <TextField
                        label="Theme Color"
                        type="color"
                        value={state.themeColor}
                        onChange={(event) => patchState({ themeColor: event.target.value })}
                        size="small"
                        sx={{ width: 160 }}
                      />
                      <TextField
                        label="Background"
                        type="color"
                        value={state.backgroundColor}
                        onChange={(event) => patchState({ backgroundColor: event.target.value })}
                        size="small"
                        sx={{ width: 160 }}
                      />
                    </Stack>
                  </Stack>
                )}

                {currentStep === 2 && (
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {presets.map((preset) => (
                        <Chip
                          key={preset.key}
                          label={preset.label}
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            patchState({ presetKey: preset.key, themeColor: preset.color })
                          }
                          sx={{
                            mb: 0.5,
                            height: 30,
                            fontWeight: 700,
                            borderColor:
                              state.presetKey === preset.key ? `${preset.color}66` : 'divider',
                            color: state.presetKey === preset.key ? preset.color : 'text.secondary',
                            bgcolor:
                              state.presetKey === preset.key
                                ? `${preset.color}14`
                                : 'background.paper',
                          }}
                        />
                      ))}
                    </Stack>
                    <Grid container spacing={1}>
                      {state.fields.map((field) => (
                        <Grid key={field.name} size={{ xs: 12, sm: 6 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 1.5,
                              bgcolor: field.important ? 'action.hover' : 'background.paper',
                            }}
                          >
                            <FormControlLabel
                              sx={{ m: 0, width: '100%' }}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={field.enabled}
                                  disabled={field.important}
                                  onChange={() => handleFieldToggle(field.name)}
                                />
                              }
                              label={field.label}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                    <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                      <Paper
                        variant="outlined"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1.5,
                          bgcolor: state.qrCodeEnabled ? 'success.lighter' : 'background.paper',
                          borderColor: state.qrCodeEnabled ? 'success.light' : 'divider',
                        }}
                      >
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Checkbox
                              size="small"
                              checked={state.qrCodeEnabled}
                              onChange={(event) =>
                                patchState({ qrCodeEnabled: event.target.checked })
                              }
                            />
                          }
                          label="QR code text"
                        />
                      </Paper>
                      <Paper
                        variant="outlined"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1.5,
                          bgcolor: state.barcodeEnabled ? 'info.lighter' : 'background.paper',
                          borderColor: state.barcodeEnabled ? 'info.light' : 'divider',
                        }}
                      >
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Checkbox
                              size="small"
                              checked={state.barcodeEnabled}
                              onChange={(event) =>
                                patchState({ barcodeEnabled: event.target.checked })
                              }
                            />
                          }
                          label="Barcode text"
                        />
                      </Paper>
                    </Stack>
                  </Stack>
                )}

                {currentStep === 3 && (
                  <Stack spacing={1}>
                    {designRecommendations.map((item) => (
                      <Paper key={item.id} variant="outlined" sx={{ p: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" gap={2}>
                          <Box>
                            <Typography variant="subtitle2">{item.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.body}
                            </Typography>
                          </Box>
                          {item.action && (
                            <Button size="small" onClick={() => patchState(item.action!.patch)}>
                              {item.action.label}
                            </Button>
                          )}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}

                {currentStep === 4 && (
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Search employees"
                        value={state.employeeSearch}
                        onChange={(event) => {
                          patchState({ employeeSearch: event.target.value });
                          setEmployeePage(1);
                        }}
                        size="small"
                        fullWidth
                      />
                      <CustomSelect
                        options={[{ name: 'All designations', id: 'all' }, ...designationOptions]}
                        label="Designation"
                        value={state.designationFilter}
                        onChange={(val) => {
                          patchState({
                            designationFilter: String(Array.isArray(val) ? val[0] : val),
                          });
                          setEmployeePage(1);
                        }}
                        labelKey="name"
                        valueKey="id"
                        formControlProps={{ sx: { minWidth: 220 } }}
                      />
                      <CustomSelect
                        options={[
                          { name: 'All statuses', id: 'all' },
                          { name: 'Active', id: 'Active' },
                          { name: 'Inactive', id: 'Inactive' },
                        ]}
                        label="Status"
                        value={employeeStatusFilter}
                        onChange={(val) => {
                          setEmployeeStatusFilter(String(Array.isArray(val) ? val[0] : val));
                          setEmployeePage(1);
                        }}
                        labelKey="name"
                        valueKey="id"
                        formControlProps={{ sx: { minWidth: 180 } }}
                      />
                    </Stack>
                    <ReadinessBar readiness={readiness} />
                    {isFetchingEmployees && (
                      <Typography variant="caption" color="text.secondary">
                        Loading employees...
                      </Typography>
                    )}
                    <CustomizableTable
                      tableId="employee-icard-selection-table"
                      columns={employeeColumns}
                      data={filteredEmployees}
                      isLoading={isFetchingEmployees}
                      isSearch={false}
                      isFilter={false}
                      isPagination={false}
                      isShowedDense={false}
                      rowProps={(row) => ({
                        selected: state.selectedEmployeeIds.includes((row as EmployeeICardRow).id),
                      })}
                      tableContainerProps={{ sx: { maxHeight: 360 } }}
                      wrapperProps={{ sx: { maxHeight: 430 } }}
                      noDataText="No employees found for this filter."
                    />
                  </Stack>
                )}

                {currentStep === 5 && (
                  <Stack spacing={2}>
                    <ReadinessBar readiness={readiness} />
                    <TextField
                      label="Cards per A4 page"
                      type="number"
                      size="small"
                      value={state.cardsPerPage}
                      onChange={(event) =>
                        patchState({ cardsPerPage: clampCardsPerPage(Number(event.target.value)) })
                      }
                      inputProps={{ min: 1, max: 10 }}
                      sx={{ maxWidth: 220 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={state.excludeIncompleteEmployees}
                          onChange={(event) =>
                            patchState({ excludeIncompleteEmployees: event.target.checked })
                          }
                        />
                      }
                      label="Exclude employees missing photo, phone, or designation"
                    />
                    <Button
                      variant="contained"
                      disabled={isSaving || isExporting || state.selectedEmployeeIds.length === 0}
                      onClick={handleExport}
                      startIcon={<Iconify icon="solar:file-download-bold" />}
                    >
                      Export Bulk PDF
                    </Button>
                  </Stack>
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ position: 'sticky', top: 16 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'linear-gradient(180deg, rgba(148,163,184,0.08), rgba(148,163,184,0.02))'
                          : 'linear-gradient(180deg, rgba(15,23,42,0.03), rgba(15,23,42,0.01))',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Box>
                        <Typography variant="subtitle2">Live Preview</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Real-time card composition
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${state.orientation} ${state.width}x${state.height}`}
                      />
                    </Stack>
                    <CardPreview
                      state={state}
                      employee={sampleEmployee}
                      academicYearName={academicYearName}
                    />
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      />
    </Paper>
  );
};

const PreviewLogo = ({
  blobName,
  preview,
  themeColor,
}: {
  blobName: string | null;
  preview: string;
  themeColor: string;
}) => {
  const [loadAsset] = useLazyGetEmployeeICardAssetQuery();
  const [assetPreview, setAssetPreview] = useState('');

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    if (!blobName || preview) {
      setAssetPreview('');
      return undefined;
    }

    loadAsset(blobName)
      .unwrap()
      .then((blob) => {
        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setAssetPreview(objectUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setAssetPreview('');
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [blobName, loadAsset, preview]);

  const src = preview || assetPreview;

  if (src) {
    return (
      <Box
        component="img"
        src={src}
        alt="School logo"
        sx={{ width: 44, height: 44, objectFit: 'contain' }}
      />
    );
  }

  return <Box sx={{ width: 44, height: 44, borderRadius: 1, bgcolor: themeColor }} />;
};

const CardPreview = ({
  state,
  employee,
  academicYearName,
  scale = 0.9,
}: {
  state: BuilderState;
  employee?: any;
  academicYearName?: string;
  scale?: number;
}) => {
  const enabled = new Set(state.fields.filter((field) => field.enabled).map((field) => field.name));
  const employeeName = employee?.fullName || 'Ananya Sharma';
  const code = employee?.employeeIdentifier || 'EMP-1024';
  const isVertical = state.orientation === 'Vertical';

  return (
    <Box
      sx={{
        overflow: 'auto',
        p: 1.5,
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.35)' : 'rgba(148,163,184,0.08)',
      }}
    >
      <Box
        sx={{
          width: state.width,
          minHeight: state.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          bgcolor: state.backgroundColor,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 1.5,
          color: 'text.primary',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 10px 30px rgba(2,6,23,0.45)'
              : '0 10px 28px rgba(15,23,42,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(165deg, ${state.themeColor}14 0%, transparent 45%)`,
            pointerEvents: 'none',
          }}
        />

        <Stack spacing={1.25} sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.2} alignItems="center" minWidth={0}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 1.25,
                  display: 'grid',
                  placeItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(2,6,23,0.45)' : 'rgba(255,255,255,0.8)',
                }}
              >
                <PreviewLogo
                  blobName={state.logoBlobName}
                  preview={state.logoPreview}
                  themeColor={state.themeColor}
                />
              </Box>
              <Box minWidth={0}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{ color: state.themeColor, fontWeight: 700 }}
                >
                  {state.schoolName || state.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {state.schoolAddress || 'School address'}
                </Typography>
              </Box>
            </Stack>
            <Chip size="small" label="Employee ID" sx={{ fontWeight: 600, height: 22 }} />
          </Stack>

          <Box sx={{ height: 3, bgcolor: state.themeColor, borderRadius: 2 }} />

          <Stack
            direction={isVertical ? 'column' : 'row'}
            spacing={isVertical ? 1 : 1.5}
            alignItems={isVertical ? 'stretch' : 'flex-start'}
          >
            {enabled.has('photo') && (
              <Box
                sx={{
                  width: isVertical ? '100%' : 82,
                  maxWidth: isVertical ? 130 : 'unset',
                  height: isVertical ? 110 : 96,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.88)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.4 }}>
                  PHOTO
                </Typography>
              </Box>
            )}

            <Stack spacing={0.45} minWidth={0} flex={1}>
              {enabled.has('name') && (
                <Typography
                  variant="h6"
                  fontWeight={800}
                  noWrap
                  sx={{ fontSize: '1.2rem', lineHeight: 1.2 }}
                >
                  {employeeName}
                </Typography>
              )}
              {enabled.has('employeeCode') && <PreviewLine label="Code" value={code} />}
              {enabled.has('designation') && (
                <PreviewLine label="Designation" value={employee?.designation || 'Teacher'} />
              )}
              {enabled.has('department') && (
                <PreviewLine label="Department" value={employee?.department || 'Academic'} />
              )}
              {enabled.has('organization') && (
                <PreviewLine
                  label="Organization"
                  value={employee?.organizationNames?.[0] || 'Primary Wing'}
                />
              )}
              {enabled.has('contactNo') && (
                <PreviewLine label="Phone" value={employee?.mobileNo || '9876543210'} />
              )}
              {enabled.has('bloodGroup') && (
                <PreviewLine label="Blood Group" value={employee?.bloodGroup || 'B+'} />
              )}
              {enabled.has('validityYear') && (
                <PreviewLine label="Valid" value={academicYearName || '2026-2027'} />
              )}
            </Stack>
          </Stack>

          {enabled.has('address') && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.5,
                p: 0.75,
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.45)' : 'rgba(248,250,252,0.9)',
              }}
            >
              {employee?.address || 'Employee address'}
            </Typography>
          )}
          {(state.qrCodeEnabled || state.barcodeEnabled) && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 0.75 }}
            >
              <Typography variant="caption" color="text.secondary">
                Secure identity marker
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                label={state.qrCodeEnabled ? `QR: ${code}` : `BAR: ${code}`}
                sx={{ height: 22, maxWidth: 164, '& .MuiChip-label': { px: 1.1 } }}
              />
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

const PreviewLine = ({ label, value }: { label: string; value: string }) => (
  <Typography variant="caption" noWrap sx={{ fontSize: '0.76rem' }}>
    <Box component="span" sx={{ color: 'text.secondary', minWidth: 72, display: 'inline-block' }}>
      {label}:{' '}
    </Box>
    {value || '-'}
  </Typography>
);

const ReadinessBar = ({
  readiness,
}: {
  readiness: {
    selected: number;
    missingPhoto: number;
    missingPhone: number;
    missingDesignation: number;
  };
}) => (
  <Stack spacing={1}>
    <Typography variant="subtitle2">Readiness</Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Label color="primary" variant="soft">
        {`${readiness.selected} selected`}
      </Label>
      <Label color={readiness.missingPhoto ? 'warning' : 'success'} variant="soft">
        {`${readiness.missingPhoto} missing photo`}
      </Label>
      <Label color={readiness.missingPhone ? 'warning' : 'success'} variant="soft">
        {`${readiness.missingPhone} missing phone`}
      </Label>
      <Label color={readiness.missingDesignation ? 'warning' : 'success'} variant="soft">
        {`${readiness.missingDesignation} missing role`}
      </Label>
    </Stack>
  </Stack>
);

const useRecommendations = (state: BuilderState, employees: any[]) =>
  useMemo(() => {
    const recommendations: Array<{
      id: string;
      title: string;
      body: string;
      action?: { label: string; patch: Partial<BuilderState> };
    }> = [];

    const enabledFields = state.fields.filter((field) => field.enabled).length;
    if (!state.logoBlobName) {
      recommendations.push({
        id: 'logo',
        title: 'Add the school logo',
        body: 'A logo makes the card instantly recognizable and improves trust at entry gates.',
      });
    }
    if (enabledFields > 8) {
      recommendations.push({
        id: 'fields',
        title: 'Too many front-side fields',
        body: 'Use the front for identity and move long details away from the primary face.',
        action: {
          label: 'Hide address',
          patch: {
            fields: state.fields.map((field) =>
              field.name === 'address' ? { ...field, enabled: false } : field
            ),
          },
        },
      });
    }
    if (state.schoolName.length > 32 && state.orientation === 'Vertical') {
      recommendations.push({
        id: 'orientation',
        title: 'School name is long',
        body: 'Horizontal cards preserve school identity better when the name is long.',
        action: {
          label: 'Use horizontal',
          patch: {
            orientation: 'Horizontal',
            width: CARD_DIMENSIONS.Horizontal.width,
            height: CARD_DIMENSIONS.Horizontal.height,
          },
        },
      });
    }
    if (state.backgroundColor.toLowerCase() === state.themeColor.toLowerCase()) {
      recommendations.push({
        id: 'contrast',
        title: 'Improve color contrast',
        body: 'The theme and background colors are too close for print readability.',
        action: { label: 'Use light background', patch: { backgroundColor: '#F8FAFC' } },
      });
    }
    if (employees.some((employee) => !employee.thumbnailPicture)) {
      recommendations.push({
        id: 'photos',
        title: 'Some employees are missing photos',
        body: 'Cards can still export, but HR should upload photos before final printing.',
      });
    }
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'ready',
        title: 'Template is print ready',
        body: 'Branding, fields, and employee data look ready for PDF generation.',
      });
    }

    return recommendations;
  }, [employees, state]);
