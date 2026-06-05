'use client';

import type { RootState } from 'src/redux/store';
import type { EmployeeICardTemplate } from 'src/redux/hr/employee-icard-template-api';
import type { AcademicOrganizationSelectOption } from 'src/screens/hr/hooks/useAcademicOrganizationOptions';

import Draggable from 'react-draggable';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { useConfirmDialog } from 'src/hooks/use-confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { useAcademicOrganizationOptions } from 'src/screens/hr/hooks/useAcademicOrganizationOptions';
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

import {
  isPdfBlob,
  snapToGrid,
  parseLayoutJson,
  type ICardLayout,
  clampCardsPerPage,
  clampElementDimension,
  migrateFieldsToLayout,
  DEFAULT_PRINT_SETTINGS,
  parsePrintSettingsJson,
  type ICardLayoutElement,
  type ICardPrintSettings,
  createICardLayoutPreset,
} from './i-card-builder-utils';

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
  backSideEnabled: boolean;
  isActive: boolean;
  fields: ICardField[];
  layout: ICardLayout;
  selectedElementId: string | null;
  printSettings: ICardPrintSettings;
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

const steps = ['Template', 'Designer', 'Review', 'Employees', 'Export'];

const presets = [
  {
    key: 'formal-staff',
    label: 'Formal Staff',
    color: '#1D4ED8',
    description: 'Clean school header with balanced staff details.',
  },
  {
    key: 'modern-staff',
    label: 'Modern Staff',
    color: '#0F766E',
    description: 'Sharper badge look with circular photo styling.',
  },
  {
    key: 'vertical-badge',
    label: 'Vertical Badge',
    color: '#7C3AED',
    description: 'Portrait format for lanyards and holders.',
  },
  {
    key: 'visitor-style',
    label: 'Visitor Style',
    color: '#B45309',
    description: 'High-contrast identity card for temporary staff.',
  },
  {
    key: 'minimal',
    label: 'Minimal',
    color: '#334155',
    description: 'Low-ink print layout with quiet styling.',
  },
  {
    key: 'photo-first',
    label: 'Photo First',
    color: '#BE123C',
    description: 'Large visual identity area with compact details.',
  },
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
  presetKey: 'formal-staff',
  qrCodeEnabled: true,
  barcodeEnabled: false,
  backSideEnabled: false,
  isActive: true,
  fields: defaultFields,
  layout: createICardLayoutPreset('formal-staff', {
    orientation: 'Horizontal',
    width: CARD_DIMENSIONS.Horizontal.width,
    height: CARD_DIMENSIONS.Horizontal.height,
    themeColor: '#1D4ED8',
    backgroundColor: '#F8FAFC',
    qrCodeEnabled: true,
    barcodeEnabled: false,
  }),
  selectedElementId: null,
  printSettings: DEFAULT_PRINT_SETTINGS,
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
  const fields = parseFields(template);
  const layout =
    parseLayoutJson(template.layoutJson) ||
    migrateFieldsToLayout(fields, {
      orientation,
      width: template.width || defaultSize.width,
      height: template.height || defaultSize.height,
      themeColor: template.themeColor || '#1D4ED8',
      backgroundColor: template.backgroundColor || '#F8FAFC',
      qrCodeEnabled: Boolean(template.qrCodeEnabled),
      barcodeEnabled: Boolean(template.barcodeEnabled),
    });

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
    backSideEnabled: Boolean(template.backSideEnabled),
    isActive: template.isActive,
    fields,
    layout,
    selectedElementId: null,
    printSettings: parsePrintSettingsJson(template.printSettingsJson),
  };
};

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

  const { data, isLoading } = useGetEmployeeICardTemplatesQuery(
    { academicYearId, page: 1, pageSize: 50 },
    { skip: !academicYearId }
  );
  const [deleteTemplate] = useDeleteEmployeeICardTemplateMutation();
  const { data: employeeData } = useGetEmployeeQuery({
    page: 1,
    pageSize: 100,
  });

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
              organizations={organizationOptions}
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
  organizations: AcademicOrganizationSelectOption[];
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
      missingEmployeeCode: selected.filter((employee) => !employee.employeeIdentifier).length,
      missingLogo: state.logoBlobName ? 0 : 1,
    };
  }, [selectedEmployeesById, state.logoBlobName, state.selectedEmployeeIds.length]);

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

  const patchLayout = (patch: Partial<ICardLayout>) =>
    setState((prev) => ({
      ...prev,
      layout: { ...prev.layout, ...patch },
    }));

  const patchLayoutElement = (id: string, patch: Partial<ICardLayoutElement>) =>
    setState((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        front: {
          elements: prev.layout.front.elements.map((element) =>
            element.id === id ? { ...element, ...patch } : element
          ),
        },
      },
    }));

  const patchSelectedElementStyle = (patch: NonNullable<ICardLayoutElement['style']>) => {
    if (!state.selectedElementId) return;
    setState((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        front: {
          elements: prev.layout.front.elements.map((element) =>
            element.id === prev.selectedElementId
              ? { ...element, style: { ...element.style, ...patch } }
              : element
          ),
        },
      },
    }));
  };

  const applyPreset = (preset: (typeof presets)[number]) => {
    const nextOrientation = preset.key === 'vertical-badge' ? 'Vertical' : 'Horizontal';
    const nextSize = CARD_DIMENSIONS[nextOrientation];
    const layout = createICardLayoutPreset(preset.key, {
      orientation: nextOrientation,
      width: nextSize.width,
      height: nextSize.height,
      themeColor: preset.color,
      backgroundColor: state.backgroundColor,
      qrCodeEnabled: state.qrCodeEnabled,
      barcodeEnabled: state.barcodeEnabled,
    });
    patchState({
      presetKey: preset.key,
      themeColor: preset.color,
      orientation: layout.orientation,
      width: layout.width,
      height: layout.height,
      layout,
      backSideEnabled: false,
      selectedElementId: null,
    });
  };

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
            {!(row as EmployeeICardRow).employeeIdentifier && (
              <Label color="warning" variant="soft">
                Code
              </Label>
            )}
            {(row as EmployeeICardRow).thumbnailPicture &&
              (row as EmployeeICardRow).mobileNo &&
              (row as EmployeeICardRow).designation &&
              (row as EmployeeICardRow).employeeIdentifier && (
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
      layout: {
        ...state.layout,
        front: {
          elements: state.layout.front.elements.map((element) =>
            element.fieldKey === name &&
            !defaultFields.find((field) => field.name === name)?.important
              ? { ...element, visible: !element.visible }
              : element
          ),
        },
      },
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
        backSideEnabled: state.backSideEnabled,
        schemaVersion: 1,
        layoutJson: JSON.stringify({
          ...state.layout,
          orientation: state.orientation,
          width: state.width,
          height: state.height,
          backgroundColor: state.backgroundColor,
          themeColor: state.themeColor,
        }),
        printSettingsJson: JSON.stringify(state.printSettings),
        fieldsJson: JSON.stringify(state.fields),
        isActive: state.isActive,
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
          cardsPerPage: clampCardsPerPage(state.printSettings.cardsPerPage || state.cardsPerPage),
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
                    <Grid container spacing={1.25}>
                      {presets.map((preset) => (
                        <Grid key={preset.key} size={{ xs: 12, sm: 6 }}>
                          <Paper
                            variant="outlined"
                            onClick={() => applyPreset(preset)}
                            sx={{
                              p: 1.5,
                              cursor: 'pointer',
                              borderColor:
                                state.presetKey === preset.key ? `${preset.color}88` : 'divider',
                              bgcolor:
                                state.presetKey === preset.key
                                  ? `${preset.color}10`
                                  : 'background.paper',
                            }}
                          >
                            <Stack direction="row" spacing={1.25} alignItems="center">
                              <Box
                                sx={{
                                  width: 34,
                                  height: 24,
                                  borderRadius: 0.75,
                                  bgcolor: preset.color,
                                  flexShrink: 0,
                                }}
                              />
                              <Box minWidth={0}>
                                <Typography variant="subtitle2">{preset.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {preset.description}
                                </Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
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
                        const nextSize = CARD_DIMENSIONS[value as 'Horizontal' | 'Vertical'];
                        patchState({
                          orientation: value,
                          width: nextSize.width,
                          height: nextSize.height,
                          layout: {
                            ...state.layout,
                            orientation: value,
                            width: nextSize.width,
                            height: nextSize.height,
                            front: {
                              elements: state.layout.front.elements.map((element) => ({
                                ...element,
                                visible:
                                  element.type === 'qr'
                                    ? state.qrCodeEnabled
                                    : element.type === 'barcode'
                                      ? state.barcodeEnabled
                                      : element.visible,
                              })),
                            },
                          },
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
                        onChange={(event) => {
                          patchState({ themeColor: event.target.value });
                          patchLayout({ themeColor: event.target.value });
                        }}
                        size="small"
                        sx={{ width: 160 }}
                      />
                      <TextField
                        label="Background"
                        type="color"
                        value={state.backgroundColor}
                        onChange={(event) => {
                          patchState({ backgroundColor: event.target.value });
                          patchLayout({ backgroundColor: event.target.value });
                        }}
                        size="small"
                        sx={{ width: 160 }}
                      />
                    </Stack>
                    <DesignerCanvas
                      state={state}
                      sampleEmployee={sampleEmployee}
                      academicYearName={academicYearName}
                      onSelect={(id) => patchState({ selectedElementId: id })}
                      onMove={(id, x, y) => patchLayoutElement(id, { x, y })}
                      onElementChange={patchLayoutElement}
                      onElementStyleChange={patchSelectedElementStyle}
                    />
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
                                patchState({
                                  qrCodeEnabled: event.target.checked,
                                  layout: {
                                    ...state.layout,
                                    front: {
                                      elements: state.layout.front.elements.map((element) =>
                                        element.type === 'qr'
                                          ? { ...element, visible: event.target.checked }
                                          : element
                                      ),
                                    },
                                  },
                                })
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
                                patchState({
                                  barcodeEnabled: event.target.checked,
                                  layout: {
                                    ...state.layout,
                                    front: {
                                      elements: state.layout.front.elements.map((element) =>
                                        element.type === 'barcode'
                                          ? { ...element, visible: event.target.checked }
                                          : element
                                      ),
                                    },
                                  },
                                })
                              }
                            />
                          }
                          label="Barcode text"
                        />
                      </Paper>
                    </Stack>
                  </Stack>
                )}

                {currentStep === 2 && (
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

                {currentStep === 3 && (
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

                {currentStep === 4 && (
                  <Stack spacing={2}>
                    <ReadinessBar readiness={readiness} />
                    <TextField
                      label="Cards per A4 page"
                      type="number"
                      size="small"
                      value={state.printSettings.cardsPerPage}
                      onChange={(event) =>
                        patchState({
                          cardsPerPage: clampCardsPerPage(Number(event.target.value)),
                          printSettings: {
                            ...state.printSettings,
                            cardsPerPage: clampCardsPerPage(Number(event.target.value)),
                          },
                        })
                      }
                      inputProps={{ min: 1, max: 10 }}
                      sx={{ maxWidth: 220 }}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Page margin"
                        type="number"
                        size="small"
                        value={state.printSettings.margin}
                        onChange={(event) =>
                          patchState({
                            printSettings: {
                              ...state.printSettings,
                              margin: Math.max(0, Math.min(60, Number(event.target.value))),
                            },
                          })
                        }
                      />
                      <TextField
                        label="Card gap"
                        type="number"
                        size="small"
                        value={state.printSettings.gap}
                        onChange={(event) =>
                          patchState({
                            printSettings: {
                              ...state.printSettings,
                              gap: Math.max(0, Math.min(40, Number(event.target.value))),
                            },
                          })
                        }
                      />
                    </Stack>
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

const DesignerCanvas = ({
  state,
  sampleEmployee,
  academicYearName,
  onSelect,
  onMove,
  onElementChange,
  onElementStyleChange,
}: {
  state: BuilderState;
  sampleEmployee?: EmployeeICardRow;
  academicYearName?: string;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onElementChange: (id: string, patch: Partial<ICardLayoutElement>) => void;
  onElementStyleChange: (patch: NonNullable<ICardLayoutElement['style']>) => void;
}) => {
  const selected = state.layout.front.elements.find(
    (element) => element.id === state.selectedElementId
  );

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Field Palette
          </Typography>
          <Stack spacing={0.75}>
            {state.layout.front.elements
              .filter((element) => element.type !== 'shape' && element.type !== 'line')
              .map((element) => (
                <Stack
                  key={element.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Button
                    size="small"
                    variant={state.selectedElementId === element.id ? 'contained' : 'outlined'}
                    onClick={() => onSelect(element.id)}
                    sx={{ justifyContent: 'flex-start', flex: 1 }}
                  >
                    {element.label || element.fieldKey || element.type}
                  </Button>
                  <Checkbox
                    size="small"
                    checked={element.visible}
                    onChange={(event) =>
                      onElementChange(element.id, { visible: event.target.checked })
                    }
                  />
                </Stack>
              ))}
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            overflow: 'auto',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.35)' : 'rgba(148,163,184,0.08)',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: state.layout.width,
              height: state.layout.height,
              bgcolor: state.backgroundColor,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {state.layout.front.elements
              .filter((element) => element.visible)
              .sort((a, b) => a.z - b.z)
              .map((element) => (
                <DesignerElement
                  key={element.id}
                  element={element}
                  state={state}
                  selected={state.selectedElementId === element.id}
                  employee={sampleEmployee}
                  academicYearName={academicYearName}
                  onSelect={onSelect}
                  onMove={onMove}
                />
              ))}
          </Box>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Inspector
          </Typography>
          {selected ? (
            <Stack spacing={1.25}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={selected.visible}
                    onChange={(event) =>
                      onElementChange(selected.id, { visible: event.target.checked })
                    }
                  />
                }
                label="Visible"
              />
              <Stack direction="row" spacing={1}>
                <TextField
                  label="W"
                  type="number"
                  size="small"
                  value={selected.w}
                  onChange={(event) =>
                    onElementChange(selected.id, {
                      w: clampElementDimension(Number(event.target.value), selected.w),
                    })
                  }
                />
                <TextField
                  label="H"
                  type="number"
                  size="small"
                  value={selected.h}
                  onChange={(event) =>
                    onElementChange(selected.id, {
                      h: clampElementDimension(Number(event.target.value), selected.h),
                    })
                  }
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => onElementChange(selected.id, { x: 16 })}>
                  Left
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    onElementChange(selected.id, {
                      x: Math.round((state.layout.width - selected.w) / 2),
                    })
                  }
                >
                  Center
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    onElementChange(selected.id, { x: state.layout.width - selected.w - 16 })
                  }
                >
                  Right
                </Button>
              </Stack>
              {selected.type === 'text' && (
                <>
                  <TextField
                    label="Font size"
                    type="number"
                    size="small"
                    value={selected.style?.fontSize || 10}
                    onChange={(event) =>
                      onElementStyleChange({ fontSize: Number(event.target.value) })
                    }
                  />
                  <TextField
                    label="Text color"
                    type="color"
                    size="small"
                    value={selected.style?.color || '#111827'}
                    onChange={(event) => onElementStyleChange({ color: event.target.value })}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={Boolean(selected.style?.showLabel)}
                        onChange={(event) =>
                          onElementStyleChange({ showLabel: event.target.checked })
                        }
                      />
                    }
                    label="Show label"
                  />
                </>
              )}
              {selected.type === 'photo' && (
                <CustomSelect
                  options={[
                    { id: 'square', name: 'Square' },
                    { id: 'rounded', name: 'Rounded' },
                    { id: 'circle', name: 'Circle' },
                  ]}
                  label="Photo shape"
                  value={selected.style?.photoShape || 'rounded'}
                  onChange={(val) =>
                    onElementStyleChange({
                      photoShape: String(Array.isArray(val) ? val[0] : val) as any,
                    })
                  }
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                />
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select an element on the card.
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

const DesignerElement = ({
  element,
  state,
  selected,
  employee,
  academicYearName,
  onSelect,
  onMove,
}: {
  element: ICardLayoutElement;
  state: BuilderState;
  selected: boolean;
  employee?: EmployeeICardRow;
  academicYearName?: string;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      disabled={element.locked}
      position={{ x: element.x, y: element.y }}
      onStop={(_, data) => onMove(element.id, snapToGrid(data.x), snapToGrid(data.y))}
    >
      <Box
        ref={nodeRef}
        onMouseDown={(event) => {
          event.stopPropagation();
          onSelect(element.id);
        }}
        sx={{
          position: 'absolute',
          width: element.w,
          height: element.h,
          zIndex: element.z,
          cursor: element.locked ? 'default' : 'move',
          outline: selected ? '2px solid #2563EB' : '1px dashed transparent',
          outlineOffset: 1,
        }}
      >
        <LayoutElementPreview
          element={element}
          state={state}
          employee={employee}
          academicYearName={academicYearName}
        />
      </Box>
    </Draggable>
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
        sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    );
  }

  return <Box sx={{ width: '100%', height: '100%', borderRadius: 1, bgcolor: themeColor }} />;
};

const resolvePreviewValue = (
  fieldKey: ICardLayoutElement['fieldKey'],
  state: BuilderState,
  employee?: any,
  academicYearName?: string,
  fallback?: string
) => {
  switch (fieldKey) {
    case 'name':
      return employee?.fullName || 'Ananya Sharma';
    case 'employeeCode':
      return employee?.employeeIdentifier || 'EMP-1024';
    case 'designation':
      return employee?.designation || 'Teacher';
    case 'department':
      return employee?.department || 'Academic';
    case 'organization':
      return employee?.organizationNames?.[0] || 'Primary Wing';
    case 'contactNo':
      return employee?.mobileNo || '9876543210';
    case 'bloodGroup':
      return employee?.bloodGroup || 'B+';
    case 'validityYear':
      return academicYearName || '2026-2027';
    case 'address':
      return employee?.address || 'Employee address';
    case 'schoolName':
      return state.schoolName || state.name;
    case 'schoolAddress':
      return state.schoolAddress || 'School address';
    default:
      return fallback || '';
  }
};

const LayoutElementPreview = ({
  element,
  state,
  employee,
  academicYearName,
}: {
  element: ICardLayoutElement;
  state: BuilderState;
  employee?: any;
  academicYearName?: string;
}) => {
  const style = element.style || {};
  if (element.type === 'shape') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: style.backgroundColor || state.backgroundColor,
          borderRadius: `${style.borderRadius || 0}px`,
          border: `${style.borderWidth || 0}px solid ${style.borderColor || 'transparent'}`,
        }}
      />
    );
  }
  if (element.type === 'line') {
    return (
      <Box
        sx={{
          width: '100%',
          height: Math.max(1, element.h),
          bgcolor: style.backgroundColor || state.themeColor,
        }}
      />
    );
  }
  if (element.type === 'logo') {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
        <PreviewLogo
          blobName={state.logoBlobName}
          preview={state.logoPreview}
          themeColor={state.themeColor}
        />
      </Box>
    );
  }
  if (element.type === 'photo') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          border: `${style.borderWidth ?? 1}px solid ${style.borderColor || state.themeColor}`,
          borderRadius:
            style.photoShape === 'circle' ? '50%' : style.photoShape === 'rounded' ? 1.25 : 0,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          PHOTO
        </Typography>
      </Box>
    );
  }
  if (element.type === 'qr' || element.type === 'barcode') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {element.type.toUpperCase()}
      </Box>
    );
  }

  const value = resolvePreviewValue(
    element.fieldKey,
    state,
    employee,
    academicYearName,
    element.value
  );
  const text =
    style.showLabel && element.label ? `${element.label}${style.separator || ': '}${value}` : value;
  return (
    <Typography
      noWrap
      sx={{
        color: style.color || 'text.primary',
        fontSize: style.fontSize || 10,
        fontWeight: style.fontWeight || 400,
        textAlign: style.textAlign || 'left',
        lineHeight: `${element.h}px`,
      }}
    >
      {text}
    </Typography>
  );
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
}) => (
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
        width: state.layout.width,
        height: state.layout.height,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        bgcolor: state.backgroundColor,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxSizing: 'border-box',
        color: 'text.primary',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 10px 30px rgba(2,6,23,0.45)'
            : '0 10px 28px rgba(15,23,42,0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {state.layout.front.elements
        .filter((element) => element.visible)
        .sort((a, b) => a.z - b.z)
        .map((element) => (
          <Box
            key={element.id}
            sx={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.w,
              height: element.h,
              zIndex: element.z,
            }}
          >
            <LayoutElementPreview
              element={element}
              state={state}
              employee={employee}
              academicYearName={academicYearName}
            />
          </Box>
        ))}
    </Box>
  </Box>
);

const ReadinessBar = ({
  readiness,
}: {
  readiness: {
    selected: number;
    missingPhoto: number;
    missingPhone: number;
    missingDesignation: number;
    missingEmployeeCode: number;
    missingLogo: number;
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
      <Label color={readiness.missingEmployeeCode ? 'warning' : 'success'} variant="soft">
        {`${readiness.missingEmployeeCode} missing code`}
      </Label>
      <Label color={readiness.missingLogo ? 'warning' : 'success'} variant="soft">
        {readiness.missingLogo ? 'Logo missing' : 'Logo ready'}
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
