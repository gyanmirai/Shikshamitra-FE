import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizable-table/types';

import * as Yup from 'yup';
import { debounce } from 'lodash';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
/* eslint-disable import/order */
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import CloseIcon from '@mui/icons-material/Close';
import { useBoolean } from 'src/hooks/useBoolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { LoadingScreen } from 'src/components/loading-screen';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  useGetGroupByIdQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useGetUsersForSelectionMutation,
} from 'src/redux/calendar/group-management/groupManagementApi';
import {
  Box,
  Grid,
  Step,
  Paper,
  Button,
  Divider,
  Stepper,
  Checkbox,
  StepLabel,
  TextField,
  IconButton,
  Typography,
  StepContent,
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
  initialValues?: any; // TODO: replace with accurate type
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
  p: 3,
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
  const [filterTab, setFilterTab] = useState(0); // 0 = Condition Based, 1 = Selection Based
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
    onSubmit: (values) => {
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
            userId: m.userId,
          })),
        },
      };

      if (isEdit) {
        updateGroup({ groupId: initialValues?.id, body: payload });
      } else {
        createGroup({ academicYearId: currentYear?.id, body: payload });
      }
      onClose?.(values, true);
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

  const [getUsersForSelection] = useQueryAndMutation({
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
    studentFilters: formik.values.nameBased.studentFilters || [],
    employeeFilters: formik.values.nameBased.employeeFilters || [],
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
  const allSelectedInView =
    usersForSelection.length > 0 &&
    usersForSelection.every((row) =>
      formik.values.nameBased.selectedMembers.some((m: any) => m.memberId === row.memberId)
    );
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
                current.push({
                  memberType: row.memberType ?? 0,
                  memberId: row.memberId,
                  userId: row.userId || row.memberId,
                });
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
        const selectedCount = formik.values.nameBased.selectedMembers.length;
        const indeterminate = selectedCount > 0 && !allSelectedInView;
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
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
                      current.push({
                        memberType: row.memberType ?? 0,
                        memberId: row.memberId,
                        userId: row.userId || row.memberId,
                      });
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
      id: 'status',
      label: 'Status',
      minWidth: 100,
      align: 'left' as const,
      sticky: true,
      render(value, row) {
        return (
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 0.75,
              typography: 'caption',
              fontWeight: 700,
              bgcolor: (theme) =>
                alpha(theme.palette[value === 'Active' ? 'success' : 'error'].main, 0.1),
              color: (theme) => theme.palette[value === 'Active' ? 'success' : 'error'].dark,
              display: 'inline-flex',
            }}
          >
            {value}
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
            value={formik.values.name}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z\s]/g, '')
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              formik.setFieldValue('name', value);
            }}
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

  const renderFilters = () => (
    <SectionCard
      title=""
      paperProps={{
        sx: {
          ...cardStyle,
          p: 0, // Reset padding for cleaner tab integration
          overflow: 'hidden',
          mb: 3,
          bgcolor: 'background.paper',
        },
      }}
    >
      <Grid size={{ xs: 12 }}>
        {/* Tabs Row - Modernized */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            borderBottom: (theme) => `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 0.5,
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            }}
          >
            {[
              { label: 'Rule Based', value: 0 },
              { label: 'Name Based', value: 1 },
            ].map((tab) => {
              const isSelected = filterTab === tab.value;
              return (
                <Box
                  key={tab.value}
                  onClick={() => setFilterTab(tab.value)}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 0.75,
                    cursor: 'pointer',
                    typography: 'subtitle2',
                    fontWeight: isSelected ? 700 : 500,
                    transition: (theme) =>
                      theme.transitions.create(['background-color', 'color', 'box-shadow']),
                    bgcolor: isSelected ? 'background.paper' : 'transparent',
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    boxShadow: isSelected ? (theme) => theme.customShadows.z4 : 'none',
                    '&:hover': {
                      color: isSelected ? 'primary.main' : 'text.primary',
                      bgcolor: isSelected
                        ? 'background.paper'
                        : (theme) => alpha(theme.palette.grey[500], 0.04),
                    },
                  }}
                >
                  {tab.label}
                </Box>
              );
            })}
          </Box>
        </Box>
        {formik.errors.selection && (
          <Box
            sx={{
              px: 3,
              py: 1,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
              borderBottom: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
            }}
          >
            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
              {formik.errors.selection as string}
            </Typography>
          </Box>
        )}
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Box sx={{ p: 3 }}>
          {filterTab === 0 && (
            <Box>
              <Grid container spacing={4}>
                <Grid
                  size={{ xs: 12, sm: 8 }}
                  sx={{
                    borderRight: (theme) => ({ sm: `1px dashed ${theme.palette.divider}` }),
                    pr: { sm: 4 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                      <Iconify
                        icon="solar:globus-outline"
                        width={20}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Academic Selections
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={() => {
                        setCurrentFilterName('ruleBased');
                        academicDrawer.onTrue();
                      }}
                      sx={{ borderRadius: 1 }}
                    >
                      Add Selection
                    </Button>
                  </Box>

                  {formik.values.ruleBased.academicTree.length === 0 ? (
                    <Box
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: (theme) => `1px dashed ${theme.palette.divider}`,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                      }}
                    >
                      <Iconify
                        icon="solar:layers-minimalistic-bold-duotone"
                        width={48}
                        sx={{ color: 'text.disabled', mb: 1, opacity: 0.5 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        No academic rules applied. Click &quot;Add Selection&quot; to start.
                      </Typography>
                    </Box>
                  ) : (
                    <Scrollbar sx={{ maxHeight: 300 }}>
                      <HierarchyTextView
                        data={formik.values.ruleBased.academicTree}
                        onRemove={(ids) => handleRemoveAcademicRule(ids, 'ruleBased')}
                      />
                    </Scrollbar>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Iconify
                      icon="solar:users-group-rounded-bold-duotone"
                      width={20}
                      sx={{ color: 'primary.main' }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Roles
                    </Typography>
                  </Box>
                  <Scrollbar sx={{ maxHeight: 300 }}>
                    <Grid container spacing={0.5}>
                      {roleData?.items?.length > 0 ? (
                        roleData?.items?.map((role: any) => (
                          <Grid size={{ xs: 12 }} key={role?.id}>
                            <Box
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                },
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={formik.values.ruleBased.roles?.includes(role.id)}
                                    onChange={(e) => {
                                      const current = new Set(formik.values.ruleBased.roles || []);
                                      if (e.target.checked) current.add(role.id);
                                      else current.delete(role.id);
                                      formik.setFieldValue('ruleBased.roles', Array.from(current));
                                    }}
                                  />
                                }
                                label={
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {role?.name}
                                  </Typography>
                                }
                                sx={{ mr: 0, width: '100%' }}
                              />
                            </Box>
                          </Grid>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No roles found
                        </Typography>
                      )}
                    </Grid>
                  </Scrollbar>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

              <Box>
                {/* <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Additional Filters
                </Typography> */}
                <AdditionalFilters formik={formik} basePath="ruleBased" />
              </Box>
            </Box>
          )}

          {filterTab === 1 && (
            <Box>
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid
                  size={{ xs: 12, sm: 8 }}
                  sx={{
                    borderRight: (theme) => ({ sm: `1px dashed ${theme.palette.divider}` }),
                    pr: { sm: 4 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                      <Iconify
                        icon="solar:globus-outline"
                        width={20}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Academic Selections
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={() => {
                        setCurrentFilterName('nameBased');
                        academicDrawer.onTrue();
                      }}
                      sx={{ borderRadius: 1 }}
                    >
                      Add Selection
                    </Button>
                  </Box>

                  {formik.values.nameBased.academicTree.length === 0 ? (
                    <Box
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: (theme) => `1px dashed ${theme.palette.divider}`,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                      }}
                    >
                      <Iconify
                        icon="solar:layers-minimalistic-bold-duotone"
                        width={48}
                        sx={{ color: 'text.disabled', mb: 1, opacity: 0.5 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        No academic filters applied.
                      </Typography>
                    </Box>
                  ) : (
                    <Scrollbar sx={{ maxHeight: 300 }}>
                      <HierarchyTextView
                        data={formik.values.nameBased.academicTree}
                        onRemove={(ids) => handleRemoveAcademicRule(ids, 'nameBased')}
                      />
                    </Scrollbar>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Iconify
                      icon="solar:users-group-rounded-bold-duotone"
                      width={20}
                      sx={{ color: 'primary.main' }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Roles
                    </Typography>
                  </Box>
                  <Scrollbar sx={{ maxHeight: 300 }}>
                    <Grid container spacing={0.5}>
                      {roleData?.items?.length > 0 ? (
                        roleData?.items?.map((role: any) => (
                          <Grid size={{ xs: 12 }} key={role.id}>
                            <Box
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                },
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={formik.values.nameBased.roles?.includes(role.id)}
                                    onChange={(e) => {
                                      const current = new Set(formik.values.nameBased.roles || []);
                                      if (e.target.checked) current.add(role.id);
                                      else current.delete(role.id);
                                      formik.setFieldValue('nameBased.roles', Array.from(current));
                                    }}
                                  />
                                }
                                label={
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {role?.name}
                                  </Typography>
                                }
                                sx={{ mr: 0, width: '100%' }}
                              />
                            </Box>
                          </Grid>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No roles found
                        </Typography>
                      )}
                    </Grid>
                  </Scrollbar>
                </Grid>
              </Grid>

              <AdditionalFilters formik={formik} basePath="nameBased" />

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Left side: Search & Table */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                    Search & Select Users
                  </Typography>

                  <TextField
                    fullWidth
                    placeholder="Search by name, roll no, or ID..."
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
                    sx={{ mb: 2 }}
                    variant="outlined"
                  />

                  <Box
                    sx={{
                      minHeight: 400,
                      border: (t) => `1px solid ${t.palette.divider}`,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.02),
                    }}
                  >
                    {(() => {
                      const query = formik.values.searchQuery.trim().toLowerCase();
                      const showTable = query.length > 0 || formik.values.searchTriggered;
                      if (!showTable) {
                        return (
                          <Box sx={{ p: 5, textAlign: 'center' }}>
                            <Iconify
                              icon="eva:search-fill"
                              sx={{ width: 64, height: 64, mb: 2, opacity: 0.5 }}
                            />
                            <Typography variant="subtitle1" color="text.secondary">
                              Start typing to find users
                            </Typography>
                          </Box>
                        );
                      }
                      return (
                        <Box sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                          <CustomizableTable
                            tableId="group-selection-table"
                            noDataText="No users found matching your search."
                            data={usersForSelection}
                            columns={selectionColumns}
                          />
                        </Box>
                      );
                    })()}
                  </Box>
                </Box>

                {/* Right side: Selected Users */}
                <Box
                  sx={{
                    width: { md: 350, xs: '100%' },
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: (theme) => ({ md: `1px dashed ${theme.palette.divider}` }),
                    pl: { md: 3 },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Selected ({formik.values.nameBased.selectedMembers.length})
                    </Typography>
                    {formik.values.nameBased.selectedMembers.length > 0 && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => formik.setFieldValue('nameBased.selectedMembers', [])}
                        sx={{ fontSize: 12, minWidth: 'auto', px: 1 }}
                      >
                        Clear All
                      </Button>
                    )}
                  </Box>

                  <Paper
                    variant="outlined"
                    sx={{
                      flexGrow: 1,
                      maxHeight: 500,
                      overflow: 'auto',
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                      p: 1.5,
                      borderRadius: 1.5,
                      border: (theme) => `1px dashed ${theme.palette.divider}`,
                    }}
                  >
                    {formik.values.nameBased.selectedMembers.length === 0 ? (
                      <Box
                        sx={{
                          py: 8,
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Iconify
                          icon="solar:users-group-two-rounded-bold-duotone"
                          width={48}
                          sx={{ color: 'text.disabled', opacity: 0.3 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          No users selected.
                        </Typography>
                      </Box>
                    ) : (
                      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                        {formik.values.nameBased.selectedMembers.map((member: any) => {
                          const { memberId } = member;
                          // If search result or dummy rows has this member, we can show details
                          // But since we store full objects, we might want to store name/etc in the object if needed for UI
                          // For now, let's try to find it in usersForSelection or fallback to memberId
                          const user =
                            usersForSelection.find((u: any) => u.memberId === memberId) || member;
                          const isStudent =
                            (user.type || user.memberType) === 0 || user.type === 'Student';
                          return (
                            <Box
                              key={memberId}
                              component="li"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1.25,
                                bgcolor: 'background.paper',
                                border: (theme) =>
                                  `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                                boxShadow: (theme) => theme.customShadows.z1,
                                '&:last-child': { mb: 0 },
                                transition: 'all 0.2s',
                                '&:hover': {
                                  boxShadow: (theme) => theme.customShadows.z8,
                                  borderColor: 'primary.main',
                                  transform: 'translateX(4px)',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1.5,
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                {user.displayName?.charAt(0) || user.fullName?.charAt(0) || '?'}
                              </Box>
                              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 600, display: 'block', fontSize: 13 }}
                                >
                                  {user.displayName || user.fullName || memberId}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                  sx={{ display: 'block' }}
                                >
                                  {isStudent
                                    ? `Class ${user.class}-${user.division}`
                                    : user.designation}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  formik.setFieldValue(
                                    'nameBased.selectedMembers',
                                    formik.values.nameBased.selectedMembers.filter(
                                      (s: any) => s.memberId !== memberId
                                    )
                                  );
                                }}
                                sx={{
                                  color: 'text.disabled',
                                  '&:hover': {
                                    color: 'error.main',
                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                                  },
                                }}
                              >
                                <Iconify icon="mingcute:close-line" width={16} />
                              </IconButton>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
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
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateY(-2px)',
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
                    boxShadow: (theme) => theme.customShadows.primary,
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
                  <Typography variant="subtitle1">{formik.values.name || '—'}</Typography>
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
                      dangerouslySetInnerHTML={{ __html: formik.values.description }}
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
    { label: 'General Information', content: renderGeneralInformation() },
    { label: 'Select Audience', content: renderFilters() },
    { label: 'Final Preview', content: renderPreview() },
  ];

  if (isGroupDataLoading && isEdit) {
    return <LoadingScreen />;
  }

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.neutral',
        }}
      >
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Scrollbar sx={{ height: '100%', p: 3 }}>
            <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
              <Stepper
                activeStep={activeStep}
                orientation="vertical"
                sx={{
                  '& .MuiStep-root': {
                    mb: 1,
                  },
                  '& .MuiStepLabel-label': {
                    typography: 'subtitle2',
                    fontWeight: 700,
                    color: 'text.disabled',
                    '&.Mui-active': { color: 'text.primary' },
                    '&.Mui-completed': { color: 'primary.main' },
                  },
                  '& .MuiStepIcon-root': {
                    width: 32,
                    height: 32,
                    color: (theme) => alpha(theme.palette.grey[500], 0.16),
                    '&.Mui-active': {
                      color: 'primary.main',
                      '& .MuiStepIcon-text': {
                        fill: 'common.white',
                      },
                    },
                    '&.Mui-completed': {
                      color: 'primary.main',
                    },
                  },
                  '& .MuiStepConnector-root': {
                    ml: '15px',
                  },
                  '& .MuiStepConnector-line': {
                    borderLeftWidth: 2,
                    borderColor: 'divider',
                  },
                }}
              >
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                    <StepContent
                      sx={{
                        ml: '15px',
                        pl: 4,
                        borderLeft: (theme) => `2px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box sx={{ py: 3 }}>{step.content}</Box>

                      <Box sx={{ mb: 2, display: 'flex', gap: 1.5 }}>
                        {activeStep > 0 && (
                          <Button
                            color="inherit"
                            variant="outlined"
                            onClick={gotoBack}
                            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                            sx={{ px: 2, borderRadius: 1 }}
                          >
                            Back
                          </Button>
                        )}

                        {activeStep < 2 ? (
                          <Button
                            variant="contained"
                            onClick={gotoNext}
                            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                            sx={{
                              px: 3,
                              fontWeight: 700,
                              borderRadius: 1,
                              boxShadow: (theme) => theme.customShadows.primary,
                            }}
                          >
                            Next
                          </Button>
                        ) : (
                          <LoadingButton
                            variant="contained"
                            loading={isCreatingGroup || isUpdatingGroup}
                            onClick={() => formik.handleSubmit()}
                            startIcon={<Iconify icon={GlobalIcons.submit} />}
                          >
                            {isEdit ? 'Update' : 'Create'}
                          </LoadingButton>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Scrollbar>
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
