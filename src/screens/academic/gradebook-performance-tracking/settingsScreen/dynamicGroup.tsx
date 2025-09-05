import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Grid,
  Chip,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogContent,
  DialogActions,
} from '@mui/material';

// Available field options
const AVAILABLE_FIELDS = [
  'Position',
  'Skills',
  'Subject',
  'Min Marks',
  'Max Marks',
  'Attendance Percentage',
  'Activity',
  'Performace Level',
  'Tag',
  'Participation',
];

// Interface for Dynamic Group
interface DynamicGroup {
  id: number;
  name: string;
  fields: string[];
}

const INITIAL_GROUPS: DynamicGroup[] = [
  {
    id: 1,
    name: 'Academic Group',
    fields: ['Subject', 'Min Marks', 'Max Marks'],
  },
  {
    id: 2,
    name: 'Attendance Based Group',
    fields: ['Attendance Percentage'],
  },
  {
    id: 1,
    name: 'Extracurriculum Group',
    fields: ['Activity', 'Performace Level'],
  },
];

const DynamicGroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<DynamicGroup[]>(INITIAL_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<DynamicGroup | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();

  const handleOpenAddDialog = () => {
    setSelectedGroup(null);
    setIsEdit(false);
    dialog.onTrue();
  };

  const handleOpenEditDialog = (group: DynamicGroup) => {
    setSelectedGroup(group);
    setIsEdit(true);
    dialog.onTrue();
  };

  const handleDelete = () => {
    if (selectedGroup) {
      setGroups(groups.filter((group) => group.id !== selectedGroup.id));
      deleteConfirmDialog.onFalse();
      setSelectedGroup(null);
    }
  };

  const handleSubmit = (values: { name: string; fields: string[] }) => {
    if (isEdit && selectedGroup) {
      // Update existing group
      setGroups(
        groups.map((group) =>
          group.id === selectedGroup.id
            ? { ...group, name: values.name, fields: values.fields }
            : group
        )
      );
    } else {
      // Create new group
      const newGroup: DynamicGroup = {
        id: groups.length > 0 ? Math.max(...groups.map((g) => g.id)) + 1 : 1,
        name: values.name,
        fields: values.fields,
      };
      setGroups([...groups, newGroup]);
    }
    dialog.onFalse();
  };

  const handleCloseDialog = () => {
    dialog.onFalse();
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" my={1}>
          Dynamic Group Management
        </Typography>
        <Button startIcon={<Add />} variant="contained" onClick={handleOpenAddDialog}>
          Add Dynamic Group
        </Button>
      </Box>

      <CustomizableTable
        tableId="dynamic-group-table"
        columns={[
          {
            id: 'name',
            label: 'Group Name',
          },
          {
            id: 'fields',
            label: 'Fields',
            render: (value: string[]) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((field: string) => (
                  <Chip key={field} label={field} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          {
            id: 'actions',
            label: 'Actions',
            render: (value, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={({ popover: pop }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        handleOpenEditDialog(row as DynamicGroup);
                        pop.onClose();
                      }}
                    >
                      <Iconify
                        icon="solar:pen-bold"
                        sx={{ height: '16px', width: '16px', mr: 1 }}
                      />
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setSelectedGroup(row as DynamicGroup);
                        deleteConfirmDialog.onTrue();
                        pop.onClose();
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <Iconify
                        icon="solar:trash-bin-trash-bold"
                        sx={{ height: '16px', width: '16px', mr: 1 }}
                      />
                      Delete
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={groups}
      />

      <CustomDialog
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Weightage' : 'Add Weightage'}
      >
        <DynamicGroupForm
          open={dialog.value}
          onClose={() => dialog.onFalse()}
          onSubmit={handleSubmit}
          initialData={selectedGroup}
          isEdit={isEdit}
        />
      </CustomDialog>

      <CustomDialog
        maxWidth="sm"
        open={deleteConfirmDialog.value}
        handleClose={() => deleteConfirmDialog.onFalse()}
        title="Delete Dynamic Group"
      >
        <DialogContent>
          <Typography>
            Are you sure you want to delete the group &quot;{selectedGroup?.name}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => deleteConfirmDialog.onFalse()}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

interface DynamicGroupFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; fields: string[] }) => void;
  initialData?: DynamicGroup | null;
  isEdit?: boolean;
}

const DynamicGroupForm: React.FC<DynamicGroupFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  isEdit = false,
}) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Group Name is Required'),
    fields: Yup.array().min(1, 'At least one field is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      fields: initialData?.fields || [],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
      formik.resetForm();
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
          <Grid container spacing={1}>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                label="Group Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid size={12}>
              <CustomSelect
                multiple
                label="Select Fields"
                options={AVAILABLE_FIELDS.map((field) => ({
                  value: field,
                  label: field,
                }))}
                value={formik.values.fields}
                onChange={(selectedFields) => {
                  formik.setFieldValue('fields', selectedFields);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
          </Grid>
        </Scrollbar>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" onClick={() => formik.handleSubmit()}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default DynamicGroupManagement;
