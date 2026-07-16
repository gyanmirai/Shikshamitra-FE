import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import * as Yup from 'yup';
import { debounce } from 'lodash';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import CloseIcon from '@mui/icons-material/Close';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { sanitizeHtml } from 'src/utils/sanitize-html';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { EmptyContent } from 'src/components/empty-content';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { LoadingScreen } from 'src/components/loading-screen';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  useGetGroupByIdQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useGetUsersForSelectionMutation,
} from 'src/redux/calendar/GroupManagement/groupManagementApi';
import {
  Box,
  Grid,
  Stack,
  Paper,
  Alert,
  Button,
  Divider,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import AdditionalFilters from './AdditionalFilters';
import HierarchyTextView from './HorizonatalTreeView';
import AcademicFilterDrawer from './AcademicFilterDrawer';
import { transformApiToTree } from './TransformApiToTree';
import { getGroupInitialValues } from './getGroupInitialValues';
import { extractAllRuleIds, pruneTreeBySelectedIds } from './academicTreeUtils';

import type { IGroup, TreeNodeData, ISelectedMember } from './type';
// import HorizontalTreeView from './HorizonatalTreeView'; // legacy tree view not used in new flow
import type { AcademicFilterDrawerProps } from './AcademicFilterDrawer';

// Validation schema (reused)
export const groupValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Group Name is required'),
  description: Yup.string().nullable(),
  ruleBased: Yup.object().shape({
    academicRules: Yup.mixed().nullable(),
    roles: Yup.array(),
    studentFilters: Yup.array(),
    employeeFilters: Yup.array(),
  }),
  nameBased: Yup.object().shape({
    selectedMembers: Yup.array(),
  }),
});

const isRuleBasedEmpty = (ruleBased: any) => {
  if (!ruleBased) return true;
  const r = ruleBased.academicRules;
  const hasAcademic =
    r &&
    !Array.isArray(r) &&
    ((r.boards?.length || 0) > 0 ||
      (r.mediums?.length || 0) > 0 ||
      (r.stages?.length || 0) > 0 ||
      (r.classes?.length || 0) > 0 ||
      (r.divisions?.length || 0) > 0);

  // Fallback for array if it somehow still is one
  const hasAcademicArray =
    Array.isArray(r) &&
    r.some(
      (ar: any) =>
        (ar.boards?.length || 0) > 0 ||
        (ar.mediums?.length || 0) > 0 ||
        (ar.stages?.length || 0) > 0 ||
        (ar.classes?.length || 0) > 0 ||
        (ar.divisions?.length || 0) > 0
    );

  const hasRoles = (ruleBased.roles?.length || 0) > 0;
  const hasStudentFilters = (ruleBased.studentFilters?.length || 0) > 0;
  const hasEmployeeFilters = (ruleBased.employeeFilters?.length || 0) > 0;
  return (
    !hasAcademic && !hasAcademicArray && !hasRoles && !hasStudentFilters && !hasEmployeeFilters
  );
};

interface GroupFormProps {
  initialValues?: Partial<IGroup> | null;
  isEdit?: boolean;
  onClose?: (value: any, success: boolean) => void;
}

// Fields per step for selective validation
const STEP_FIELDS: string[][] = [
  ['name', 'description'], // General Information
  [], // Filters (currently no required fields gating progress)
  [], // Final Preview
];

const cardStyle = {
  p: 2,
  borderRadius: 2,
  boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
  border: '1px solid rgba(145, 158, 171, 0.08)',
};

// Dummy table columns will be created inside component to access formik safely.

interface IRuleBasedForm {
  academicRules: any; // Using any as the structure is complex and derived
  academicTree: TreeNodeData[];
  roles: string[];
  studentFilters: any[];
  employeeFilters: any[];
}

interface INameBasedForm {
  academicRules: any;
  academicTree: TreeNodeData[];
  roles: string[];
  studentFilters: any[];
  employeeFilters: any[];
  selectedMembers: ISelectedMember[];
}

interface IGroupFormValues extends Omit<IGroup, 'ruleBased' | 'nameBased'> {
  ruleBased: IRuleBasedForm;
  nameBased: INameBasedForm;
  searchQuery: string;
  searchTriggered: boolean;
  selection: string; // Dummy field for global selection error
}

const GroupForm: React.FC<GroupFormProps> = ({ initialValues, isEdit, onClose }) => {
  const [usersForSelection, setUsersForSelection] = useState<any[]>([]);
  const academicDrawer = useBoolean(false);
  const [activeStep, setActiveStep] = useState(0);
  const formikRef = useRef<any>(null);
  const [currentFilterName, setCurrentFilterName] = useState('');
  const [createGroup, { isLoading: isCreatingGroup }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateGroupMutation,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: roleData, isLoading: isRoleDataLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: groupData, isLoading: isGroupDataLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGroupByIdQuery,
    params: {
      id: initialValues?.id,
    },
    options: {
      skip: !initialValues?.id,
    },
  });
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [updateGroup, { isLoading: isUpdatingGroup }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateGroupMutation,
  });

  const extractUniqueIds = (rules: any): string[] => {
    if (!rules) return [];
    if (Array.isArray(rules)) {
      return Array.from(new Set(rules.flatMap((rule) => rule.divisions || [])));
    }
    return rules.divisions || [];
  };

  const initialData = useMemo(() => getGroupInitialValues(groupData), [groupData]);

  const formik = useFormik<IGroupFormValues>({
    initialValues: {
      ...initialData,
      searchQuery: '',
      searchTriggered: false,
      selection: '',
    } as unknown as IGroupFormValues,
    enableReinitialize: true,
    validationSchema: groupValidationSchema,
    validate: (values) => {
      const errors: any = {};
      if (isRuleBasedEmpty(values.ruleBased) && values.nameBased.selectedMembers.length === 0) {
        errors.selection =
          'At least one selection is required (either via Rules or Name Based Selection)';
      }
      return errors;
    },
    onSubmit: async (values) => {
      const mapFilters = (filters: any[]) =>
        (filters || []).map((f) => ({
          field: f.field,
          operator: f.operator,
          value: f.value,
        }));
      const mapRules = (rules: any) => ({
        divisionIds: extractUniqueIds(rules.academicRules),
        roleIds: rules.roles || [],
        studentFilters: mapFilters(rules.studentFilters),
        employeeFilters: mapFilters(rules.employeeFilters),
      });

      const payload = {
        name: values.name,
        description: values.description,
        ruleBased: mapRules(values.ruleBased),
        nameBased: {
          ...mapRules(values.nameBased),
          selectedMembers: (values.nameBased.selectedMembers || []).map((m: any) => ({
            memberType: m.memberType,
            memberId: m.memberId,
            userId: m.userId ?? null,
          })),
        },
      };

      try {
        if (!currentYear?.id) {
          shikshaMitraToast.error({
            message: 'Please select an academic year before saving group',
          });
          return;
        }

        if (isEdit) {
          await updateGroup({
            groupId: initialValues?.id,
            academicYearId: currentYear?.id,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({ message: 'Group updated successfully' });
        } else {
          await createGroup({ academicYearId: currentYear?.id, body: payload }).unwrap();
          shikshaMitraToast.success({ message: 'Group created successfully' });
        }
        onClose?.(values, true);
      } catch (error) {
        shikshaMitraToast.error({
          message: isEdit ? 'Failed to update group' : 'Failed to create group',
        });
      }
    },
  });

  const { data: boardsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  const allBoards = useMemo(() => {
    if (!boardsData?.items) return [];
    return boardsData.items.filter((board: any) => board.academicYearId === currentYear?.id);
  }, [boardsData, currentYear?.id]);

  const fullAcademicTree = useMemo(() => transformApiToTree(allBoards), [allBoards]);

  useEffect(() => {
    if (fullAcademicTree.length === 0) return;

    // Helper to generate tree if rules exist but tree is empty
    const syncTree = (path: 'ruleBased' | 'nameBased') => {
      const rules = formik.values[path].academicRules;
      const tree = formik.values[path].academicTree;
      const selectedIds = extractAllRuleIds(rules);

      if (selectedIds.size > 0 && (!tree || tree.length === 0)) {
        const pruned = pruneTreeBySelectedIds(fullAcademicTree, selectedIds);
        formik.setFieldValue(`${path}.academicTree`, pruned);
      }
    };

    if (isEdit) {
      syncTree('ruleBased');
      syncTree('nameBased');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fullAcademicTree,
    isEdit,
    formik.values.ruleBased.academicRules,
    formik.values.nameBased.academicRules,
    formik.setFieldValue,
  ]);

  const [getUsersForSelection, { isLoading: loadingUsersData, isFetching: fetchingUsersData }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useGetUsersForSelectionMutation,
    });

  const buildUserSearchPayload = () => ({
    maxResultCount: 10,
    skipCount: 0,
    academicYearId: currentYear?.id,
    searchTerm: formik.values.searchQuery,
    divisionFilters: extractUniqueIds(formik.values.nameBased.academicRules),
    roleFilters: formik.values.nameBased.roles || [],
    studentFilters: (formik.values.nameBased.studentFilters || []).map((f: any) => ({
      field: f.field,
      operator: f.operator,
      value: f.value,
    })),
    employeeFilters: (formik.values.nameBased.employeeFilters || []).map((f: any) => ({
      field: f.field,
      operator: f.operator,
      value: f.value,
    })),
  });

  // attach formik to ref for table render access
  formikRef.current = formik;
  // Keep computed total in sync (number of selected users)
  // useEffect(() => {
  //   const total = (formik.values.nameBased.selectedMembers || []).length;
  //   if (formik.values.total !== total) {
  //     formik.setFieldValue('total', total, false);
  //   }
  // }, [formik, formik.values.nameBased.selectedMembers]);

  // Selection table columns
  const toSelectedMember = (row: any) => ({
    memberType: row.memberType ?? 0,
    memberId: row.memberId,
    userId: row.userId ?? null,
    displayName: row.displayName,
    employeeCode: row.employeeCode || row.identifier,
    identifier: row.identifier || row.employeeCode,
    roleName: row.roleName,
    department: row.department,
    designation: row.designation,
    standardName: row.standardName,
    divisionName: row.divisionName,
    mobileNo: row.mobileNo,
    email: row.email,
    status: row.status,
    employeeStatusType: row.employeeStatusType,
  });

  const allSelectedInView =
    usersForSelection.length > 0 &&
    usersForSelection.every((row) =>
      formik.values.nameBased.selectedMembers.some((m: any) => m.memberId === row.memberId)
    );
  const selectedInViewCount = usersForSelection.filter((row) =>
    formik.values.nameBased.selectedMembers.some((m: any) => m.memberId === row.memberId)
  ).length;
  const selectionColumns: IColumn[] = [
    {
      id: 'select',
      label: ' ',
      minWidth: 20,
      isSort: false,
      isFilter: false,
      align: 'left' as const,
      sticky: true,
      render: (_: any, row: any) => {
        const isSelected = formik.values.nameBased.selectedMembers.some(
          (m: any) => m.memberId === row.memberId
        );
        return (
          <Checkbox
            size="small"
            checked={isSelected}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const current = [...formik.values.nameBased.selectedMembers];
              if (e.target.checked) {
                current.push(toSelectedMember(row));
              } else {
                const filtered = current.filter((m: any) => m.memberId !== row.memberId);
                formik.setFieldValue('nameBased.selectedMembers', filtered);
                return;
              }
              formik.setFieldValue('nameBased.selectedMembers', current);
            }}
          />
        );
      },
      renderColumn: () => {
        const indeterminate = selectedInViewCount > 0 && !allSelectedInView;
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Checkbox
              size="small"
              checked={allSelectedInView}
              indeterminate={indeterminate}
              onChange={() => {
                if (allSelectedInView) {
                  const viewIds = usersForSelection.map((r: any) => r.memberId);
                  const filtered = formik.values.nameBased.selectedMembers.filter(
                    (m: any) => !viewIds.includes(m.memberId)
                  );
                  formik.setFieldValue('nameBased.selectedMembers', filtered);
                } else {
                  const current = [...formik.values.nameBased.selectedMembers];
                  usersForSelection.forEach((row: any) => {
                    if (!current.some((m: any) => m.memberId === row.memberId)) {
                      current.push(toSelectedMember(row));
                    }
                  });
                  formik.setFieldValue('nameBased.selectedMembers', current);
                }
              }}
            />
          </Box>
        );
      },
    },
    { id: 'displayName', label: 'Full Name', minWidth: 160, align: 'left' as const, sticky: true },
    { id: 'roleName', label: 'Role', minWidth: 100, align: 'left' as const },
    { id: 'standardName', label: 'Class', minWidth: 80, align: 'left' as const },
    { id: 'divisionName', label: 'Division', minWidth: 90, align: 'left' as const },
    { id: 'rollNo', label: 'Roll No', minWidth: 90, align: 'left' as const },
    { id: 'board', label: 'Board', minWidth: 110, align: 'left' as const },
    { id: 'medium', label: 'Medium', minWidth: 110, align: 'left' as const },
    { id: 'department', label: 'Department', minWidth: 140, align: 'left' as const },
    { id: 'designation', label: 'Designation', minWidth: 160, align: 'left' as const },
    { id: 'identifier', label: 'Emp Code', minWidth: 110, align: 'left' as const },
    {
      id: 'employeeStatusType',
      label: 'Status',
      minWidth: 100,
      align: 'left' as const,
      sticky: true,
      render(value, row) {
        const isEmployee = row.memberType === 1;
        const label = isEmployee
          ? value === 0 || value === undefined || value === null
            ? 'Active'
            : 'Inactive'
          : row.status === 1
            ? 'Active'
            : 'Student';
        const isActive = label === 'Active';
        return (
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 0.75,
              typography: 'caption',
              fontWeight: 700,
              bgcolor: (theme) =>
                isActive
                  ? alpha(theme.palette.success.main, 0.12)
                  : alpha(theme.palette.grey[500], 0.12),
              color: (theme) =>
                isActive ? theme.palette.success.dark : theme.palette.text.secondary,
              display: 'inline-flex',
            }}
          >
            {label}
          </Box>
        );
      },
    },
  ];

  const gotoNext = async () => {
    const fields = STEP_FIELDS[activeStep];
    if (activeStep === 0 && fields.length) {
      // Mark touched
      fields.forEach((f: string) => formik.setFieldTouched(f, true, false));
      const errors = await formik.validateForm();
      const stepErrors = Object.keys(errors).filter((e) => fields.includes(e));
      if (stepErrors.length) {
        return; // Abort progression if errors
      }
    }

    if (activeStep === 1) {
      const errors = await formik.validateForm();
      if (errors.selection) {
        formik.setFieldTouched('selection', true, false);
        return;
      }
    }
    setActiveStep((prev: number) => prev + 1);
  };

  const gotoBack = () => {
    setActiveStep((prev: number) => prev - 1);
  };

  const renderGeneralInformation = () => (
    <SectionCard
      title="General Information"
      paperProps={{
        sx: {
          ...cardStyle,
          mb: 3,
        },
      }}
      gridProps={{ sx: { alignItems: 'stretch', gap: 3 } }}
    >
      <Grid size={{ xs: 12 }}>
        <Typography variant="body2" color="text.secondary">
          Provide a unique name and a brief description for this group.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
          <TextField
            fullWidth
            label="Group Name *"
            name="name"
            data-testid="calendar-group-name-input"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={(formik.touched.name && (formik.errors.name as string)) || ''}
            size="small"
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Editor
          value={formik.values.description}
          onChange={(value) => formik.setFieldValue('description', value)}
          placeholder="Write a description..."
          data-testid="calendar-group-description-editor"
          sx={{
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 1,
            '&:hover': { borderColor: 'text.primary' },
            ...(!!formik.touched.description &&
              !!formik.errors.description && {
                borderColor: 'error.main',
              }),
            '&:focus-within': {
              borderColor: 'primary.main',
            },
            minHeight: 120,
            overflow: 'hidden',
          }}
        />
      </Grid>
    </SectionCard>
  );

  const debouncedSearch = useRef(
    debounce(async (payload) => {
      const res = await getUsersForSelection(payload).unwrap();
      setUsersForSelection(res?.items || []);
    }, 400)
  ).current;

  useEffect(() => {
    const search = formik.values.searchQuery?.trim();
    if (!search) {
      setUsersForSelection([]);
      return;
    }
    if (search.length < 2) return;
    debouncedSearch(buildUserSearchPayload());
    // eslint-disable-next-line consistent-return
    return () => debouncedSearch.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.searchQuery]);

  const handleAcademicApply: AcademicFilterDrawerProps['onApply'] = useCallback(
    (
      _ids: string[],
      _breakdown: any,
      _nodes: any,
      _breakdownNodes: any,
      hierarchicalSelectedTree: TreeNodeData[] | undefined,
      filterName?: string
    ) => {
      const extractOnlyIds = (nodes: TreeNodeData[], targetType: string): string[] => {
        let ids: string[] = [];
        nodes.forEach((node) => {
          if (node.type === targetType) {
            ids.push(node.id);
          }
          if (node.children && node.children.length > 0) {
            ids = [...ids, ...extractOnlyIds(node.children, targetType)];
          }
        });
        return Array.from(new Set(ids));
      };

      const newRule = {
        boards: extractOnlyIds(hierarchicalSelectedTree || [], 'boards'),
        mediums: extractOnlyIds(hierarchicalSelectedTree || [], 'mediums'),
        stages: extractOnlyIds(hierarchicalSelectedTree || [], 'organizations'),
        classes: extractOnlyIds(hierarchicalSelectedTree || [], 'standards'),
        divisions: extractOnlyIds(hierarchicalSelectedTree || [], 'divisions'),
      };

      if (filterName === 'ruleBased') {
        formik.setFieldValue('ruleBased.academicRules', newRule);
        formik.setFieldValue('ruleBased.academicTree', hierarchicalSelectedTree || []);
      } else if (filterName === 'nameBased') {
        formik.setFieldValue('nameBased.academicRules', newRule);
        formik.setFieldValue('nameBased.academicTree', hierarchicalSelectedTree || []);
      }
    },
    [formik]
  );

  const handleRemoveAcademicRule = useCallback(
    (nodes: TreeNodeData[], filterName: 'ruleBased' | 'nameBased') => {
      const currentRules = formik.values[filterName].academicRules;
      if (!currentRules || nodes.length === 0) return;

      // The last node in the path is the one being removed (e.g., the specific division or class)
      // We only want to remove THIS specific node from the rules, not its parents.
      // Parents are shared. If we remove a parent ID, all other paths using it are gone.
      const leafNode = nodes[nodes.length - 1];
      const leafType = leafNode.type; // 'boards', 'mediums', 'organizations', 'standards', 'divisions'
      const leafId = leafNode.id;

      const newRules = { ...currentRules };

      // Map the tree node type to the rule key
      const typeToKeyMap: Record<string, keyof typeof newRules> = {
        boards: 'boards',
        mediums: 'mediums',
        organizations: 'stages', // 'organizations' in tree -> 'stages' in rules
        standards: 'classes', // 'standards' in tree -> 'classes' in rules
        divisions: 'divisions',
      };

      const ruleKey = typeToKeyMap[leafType];

      if (ruleKey && Array.isArray(newRules[ruleKey])) {
        newRules[ruleKey] = newRules[ruleKey].filter((id: string) => id !== leafId);
      } else {
        // Fallback or error handling if type doesn't match
        return;
      }

      // Re-prune the full tree with the new IDs to maintain consistency
      const allSelectedIds = new Set([
        ...(newRules.boards || []),
        ...(newRules.mediums || []),
        ...(newRules.stages || []),
        ...(newRules.classes || []),
        ...(newRules.divisions || []),
      ]);

      const newTree = pruneTreeBySelectedIds(fullAcademicTree, allSelectedIds);

      formik.setFieldValue(`${filterName}.academicRules`, newRules);
      formik.setFieldValue(`${filterName}.academicTree`, newTree);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fullAcademicTree, formik.values.ruleBased.academicRules, formik.values.nameBased.academicRules]
  );

  const selectedMembers = formik.values.nameBased.selectedMembers || [];
  const selectedStudentCount = selectedMembers.filter(
    (member: any) => member.memberType === 0
  ).length;
  const selectedEmployeeCount = selectedMembers.filter(
    (member: any) => member.memberType === 1
  ).length;
  const ruleCount =
    extractUniqueIds(formik.values.ruleBased.academicRules).length +
    (formik.values.ruleBased.roles?.length || 0) +
    (formik.values.ruleBased.studentFilters?.length || 0) +
    (formik.values.ruleBased.employeeFilters?.length || 0);

  const renderAudienceHeader = (
    icon: string,
    title: string,
    description: string,
    countLabel: string
  ) => (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          color: 'primary.main',
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
          <Typography variant="subtitle1">{title}</Typography>
          <Label color="primary" variant="soft">
            {countLabel}
          </Label>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Stack>
  );

  const renderEmptyAudience = (title: string, description: string) => (
    <Box
      sx={{
        py: 3,
        borderRadius: 1,
        border: (theme) => `1px dashed ${theme.palette.divider}`,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
      }}
    >
      <EmptyContent title={title} description={description} sx={{ py: 0 }} />
    </Box>
  );

  const renderRoleSelector = (basePath: 'ruleBased' | 'nameBased') => {
    const selectedRoles = formik.values[basePath].roles || [];
    return (
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Iconify icon="solar:users-group-rounded-bold-duotone" width={18} />
          <Typography variant="subtitle2">Roles</Typography>
          <Label variant="soft">{selectedRoles.length}</Label>
        </Stack>
        <Scrollbar sx={{ maxHeight: 220 }}>
          <Grid container spacing={0.5}>
            {roleData?.items?.length > 0 ? (
              roleData.items.map((role: any) => (
                <Grid size={{ xs: 12 }} key={`${basePath}-${role.id}`}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedRoles.includes(role.id)}
                        onChange={(e) => {
                          const current = new Set(selectedRoles);
                          if (e.target.checked) current.add(role.id);
                          else current.delete(role.id);
                          formik.setFieldValue(`${basePath}.roles`, Array.from(current));
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {role.name}
                      </Typography>
                    }
                    sx={{
                      width: '100%',
                      mr: 0,
                      px: 1,
                      borderRadius: 1,
                      '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) },
                    }}
                  />
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <EmptyContent title="No roles found" sx={{ py: 2 }} />
              </Grid>
            )}
          </Grid>
        </Scrollbar>
      </Box>
    );
  };

  const renderAcademicSelector = (basePath: 'ruleBased' | 'nameBased') => {
    const isRuleBased = basePath === 'ruleBased';
    const tree = formik.values[basePath].academicTree || [];
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="solar:globus-outline" width={18} />
            <Typography variant="subtitle2">Academic hierarchy</Typography>
            <Label variant="soft">
              {extractUniqueIds(formik.values[basePath].academicRules).length}
            </Label>
          </Stack>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => {
              setCurrentFilterName(basePath);
              academicDrawer.onTrue();
            }}
          >
            {tree.length ? 'Edit' : 'Add'}
          </Button>
        </Stack>
        {tree.length === 0 ? (
          renderEmptyAudience(
            isRuleBased ? 'No academic rules' : 'No direct-selection filters',
            isRuleBased
              ? 'Add classes, divisions, boards, or mediums to resolve an audience automatically.'
              : 'Optionally narrow the direct search by academic hierarchy before selecting users.'
          )
        ) : (
          <Scrollbar sx={{ maxHeight: 260 }}>
            <HierarchyTextView
              data={tree}
              onRemove={(ids) => handleRemoveAcademicRule(ids, basePath)}
            />
          </Scrollbar>
        )}
      </Box>
    );
  };

  const renderSelectedMembers = () => {
    const selected = formik.values.nameBased.selectedMembers || [];
    if (selected.length === 0) {
      return renderEmptyAudience(
        'No direct members selected',
        'Search and select students or active HR employees.'
      );
    }

    return (
      <Scrollbar sx={{ maxHeight: 300 }}>
        <Stack spacing={1}>
          {selected.map((member: any) => {
            const user =
              usersForSelection.find((u: any) => u.memberId === member.memberId) || member;
            const isStudent = user.memberType === 0 || user.type === 'Student';
            const title =
              user.displayName ||
              user.fullName ||
              (isStudent ? 'Unknown student' : 'Unknown employee');
            const details = isStudent
              ? [user.standardName && `Class ${user.standardName}`, user.divisionName]
                  .filter(Boolean)
                  .join(' - ')
              : [
                  user.employeeCode || user.identifier,
                  user.roleName,
                  user.department || user.designation,
                ]
                  .filter(Boolean)
                  .join(' - ');

            return (
              <Paper
                key={member.memberId}
                variant="outlined"
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    typography: 'subtitle2',
                  }}
                >
                  {title?.charAt(0) || '?'}
                </Box>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                    <Typography variant="subtitle2" noWrap>
                      {title}
                    </Typography>
                    <Label color={isStudent ? 'info' : 'success'} variant="soft">
                      {isStudent ? 'Student' : 'Active employee'}
                    </Label>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {details || (isStudent ? 'Student' : 'Employee')}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => {
                    formik.setFieldValue(
                      'nameBased.selectedMembers',
                      selected.filter((s: any) => s.memberId !== member.memberId)
                    );
                  }}
                >
                  <Iconify icon="mingcute:close-line" width={16} />
                </IconButton>
              </Paper>
            );
          })}
        </Stack>
      </Scrollbar>
    );
  };

  const renderUserSearchTable = () => {
    const showTable = formik.values.searchQuery.trim().length > 0 || formik.values.searchTriggered;

    if (!showTable) {
      return renderEmptyAudience(
        'Search direct members',
        'Search by name, employee code, role, department, mobile, email, or roll number.'
      );
    }

    return (
      <Box
        sx={{
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          maxHeight: 360,
          overflow: 'auto',
          '& .MuiTableCell-root': { py: 1.25 },
        }}
      >
        <CustomizableTable
          tableId="group-selection-table"
          noDataText="No users found matching your search."
          isLoading={loadingUsersData || fetchingUsersData}
          data={usersForSelection}
          columns={selectionColumns}
        />
      </Box>
    );
  };

  const renderAudienceStats = () => (
    <Grid container spacing={1.5}>
      {[
        ['Total audience', selectedMembers.length, 'solar:users-group-rounded-bold-duotone'],
        ['Students', selectedStudentCount, 'solar:square-academic-cap-bold-duotone'],
        ['Employees', selectedEmployeeCount, 'solar:user-id-bold-duotone'],
        ['Rules', ruleCount, 'solar:filter-bold-duotone'],
      ].map(([label, value, icon]) => (
        <Grid key={label} size={{ xs: 6, md: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <Iconify icon={icon as string} width={18} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ lineHeight: 1 }}>
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {label}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const renderFilters = () => (
    <SectionCard
      title="Audience Builder"
      paperProps={{ sx: { ...cardStyle, mb: 3, p: { xs: 2, md: 3 } } }}
      gridProps={{ sx: { gap: 2.5 } }}
    >
      <Grid size={{ xs: 12 }}>
        {formik.errors.selection ? (
          <Alert severity="warning">{formik.errors.selection as string}</Alert>
        ) : (
          <Alert severity="success">
            This group can combine rule-based audience targeting with directly selected members.
          </Alert>
        )}
      </Grid>

      <Grid size={{ xs: 12 }}>{renderAudienceStats()}</Grid>

      <Grid size={{ xs: 12 }}>
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 1 }}>
          {renderAudienceHeader(
            'solar:filter-bold-duotone',
            'Rule Based Audience',
            'Resolve students and employees automatically from academic hierarchy, roles, and filters.',
            `${ruleCount} rules`
          )}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 7 }}>{renderAcademicSelector('ruleBased')}</Grid>
            <Grid size={{ xs: 12, md: 5 }}>{renderRoleSelector('ruleBased')}</Grid>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 0.5 }} />
              <AdditionalFilters formik={formik} basePath="ruleBased" />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 1 }}>
          {renderAudienceHeader(
            'solar:user-check-rounded-bold-duotone',
            'Direct Selection',
            'Search active HR employees or students, then keep explicit members in this group.',
            `${formik.values.nameBased.selectedMembers.length} selected`
          )}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 7 }}>{renderAcademicSelector('nameBased')}</Grid>
            <Grid size={{ xs: 12, md: 5 }}>{renderRoleSelector('nameBased')}</Grid>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 0.5 }} />
              <AdditionalFilters formik={formik} basePath="nameBased" />
            </Grid>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Search and select members
              </Typography>
              <TextField
                fullWidth
                size="small"
                data-testid="calendar-group-member-search"
                placeholder="Search name, employee code, role, department, mobile, email, or roll no..."
                value={formik.values.searchQuery || ''}
                onChange={({ target: { value } }) => {
                  formik.setFieldValue('searchQuery', value);
                  formik.setFieldValue('searchTriggered', value.trim().length > 0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                  endAdornment: formik.values.searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          formik.setFieldValue('searchQuery', '');
                          formik.setFieldValue('searchTriggered', false);
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={{ mb: 1.5 }}
              />
              {renderUserSearchTable()}
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2">
                  Selected direct members ({formik.values.nameBased.selectedMembers.length})
                </Typography>
                {formik.values.nameBased.selectedMembers.length > 0 && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => formik.setFieldValue('nameBased.selectedMembers', [])}
                  >
                    Clear all
                  </Button>
                )}
              </Stack>
              {renderSelectedMembers()}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </SectionCard>
  );

  const renderPreview = () => (
    <SectionCard
      title="Final Preview"
      paperProps={{
        sx: {
          ...cardStyle,
          mb: 3,
        },
      }}
    >
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2,
                mb: 3,
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  borderStyle: 'dashed',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: 'common.white',
                  }}
                >
                  <Iconify icon="solar:users-group-rounded-bold" width={32} />
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                    {formik.values.nameBased.selectedMembers.length || 0}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Total Users selected
                  </Typography>
                </Box>
              </Paper>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                }}
              >
                {/* Calculate students count from selection */}
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  {
                    formik.values.nameBased.selectedMembers.filter((m: any) => m.memberType === 0)
                      .length
                  }
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Students
                </Typography>
              </Paper>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                }}
              >
                {/* Calculate employee count from selection */}
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  {
                    formik.values.nameBased.selectedMembers.filter((m: any) => m.memberType === 1)
                      .length
                  }
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Employees
                </Typography>
              </Paper>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Group Details
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    Group Name
                  </Typography>
                  <Typography variant="subtitle1">{formik.values.name || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    Description
                  </Typography>
                  {formik.values.description ? (
                    <Typography
                      component="div"
                      variant="body2"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(formik.values.description) }}
                      sx={{
                        '& p': { m: 0 },
                        color: 'text.primary',
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No description provided.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </SectionCard>
  );

  const steps = [
    { label: 'Group Details', content: renderGeneralInformation() },
    { label: 'Audience Builder', content: renderFilters() },
    { label: 'Preview & Submit', content: renderPreview() },
  ];

  if (!currentYear?.id || (isGroupDataLoading && isEdit)) {
    return <LoadingScreen />;
  }

  const currentStep = steps[activeStep];
  const stepErrors = [
    Boolean(formik.touched.name && formik.errors.name),
    Boolean(formik.errors.selection),
    false,
  ];

  const handleStepperNext = async (
    isLastStep: boolean,
    _value: any,
    _stepperFormik: any,
    setIsLoading: (val: boolean) => void
  ) => {
    if (!isLastStep) {
      await gotoNext();
      return;
    }

    setIsLoading(true);
    try {
      await formik.submitForm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        sx={{
          height: { xs: 'calc(100vh - 88px)', md: 'calc(100vh - 112px)' },
          minHeight: 560,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <Box sx={{ height: '100%', px: { xs: 1, md: 2 }, py: 1 }}>
            <Box sx={{ height: '100%', maxWidth: 1280, mx: 'auto' }}>
              <CustomStepperWithFormik
                activeStep={activeStep}
                initialValues={formik.initialValues}
                formikInstance={formik}
                steps={steps.map((step) => step.label)}
                validationSchema={groupValidationSchema}
                handleNext={handleStepperNext}
                handleBack={gotoBack}
                showSaveButton={false}
                viewMode="horizontal"
                errors={stepErrors}
                nextButtonLabel="Save & Next"
                finalButtonLabel={isEdit ? 'Update' : 'Create'}
                isStepClickable={(index) => index <= activeStep}
                onStepClick={(index) => setActiveStep(index)}
                saveAndNextButtonProps={{
                  loading: isCreatingGroup || isUpdatingGroup,
                }}
                renderItem={() => (
                  <Box
                    sx={{
                      px: { xs: 0, md: 1 },
                      py: 2,
                      maxWidth: activeStep === 1 ? 1280 : 980,
                      mx: 'auto',
                      width: '100%',
                    }}
                  >
                    {currentStep.content}
                  </Box>
                )}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <AcademicFilterDrawer
        open={academicDrawer.value}
        onClose={academicDrawer.onFalse}
        currentFilterName={currentFilterName}
        onApply={handleAcademicApply}
        initialSelectedNodes={
          currentFilterName === 'ruleBased'
            ? formik.values.ruleBased.academicTree
            : formik.values.nameBased.academicTree
        }
        academicRules={
          currentFilterName === 'ruleBased'
            ? formik.values.ruleBased.academicRules
            : formik.values.nameBased.academicRules
        }
        fullAcademicTree={fullAcademicTree}
      />
    </BackPopUpChecked>
  );
};

export default GroupForm;
