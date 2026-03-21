import { useFormik } from 'formik';
import { useBoolean } from 'src/hooks/useBoolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import Modules from '../role/modules';

function ModuleNode({ title, sx, icon }: any) {
  const dialog = useBoolean();
  const assignDialog = useBoolean();
  return (
    <Card
      sx={{
        p: 2,
        minWidth: 150,
        borderRadius: 1.5,
        textAlign: 'left',
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        '& *': {
          userSelect: 'none',
        },
        ...sx,
      }}
    >
      {/* <ThreeDotsActions
        sx={{ position: 'absolute', top: 8, right: 8 }}
        actions={({ popover }) => (
          <MenuList>
            <MenuItem
              onClick={() => {
                popover.onClose();
                dialog.onTrue();
              }}
            >
              <Iconify icon="si:assignment-duotone" />
              Assign / Remove Employee
            </MenuItem>
            <MenuItem>
              <Iconify icon="tdesign:user-setting-filled" />
              Create Role
            </MenuItem>
            <MenuItem onClick={assignDialog.onTrue}>
              <Iconify icon="carbon:data-structured" />
              Assign Module
            </MenuItem>
          </MenuList>
        )}
      /> */}

      {icon}

      <Typography variant="subtitle2" noWrap sx={{ mb: 0.5 }}>
        {title}
      </Typography>

      <CustomDialog title="Assign user" open={dialog.value} handleClose={dialog.onFalse}>
        <AssignUserForm />
      </CustomDialog>
      <CustomDialog
        title="Assign Module"
        open={assignDialog.value}
        handleClose={assignDialog.onFalse}
        fullScreen
      >
        <Modules />
      </CustomDialog>
    </Card>
  );
}

export default ModuleNode;

const AssignUserForm = () => {
  const formik = useFormik({
    initialValues: {
      users: [],
    },
    onSubmit: (values) => {},
  });
  const { data: employees, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neautral', p: 2 }}>
        <Stack spacing={2}>
          <Autocomplete
            loading={isLoading}
            multiple
            limitTags={3}
            value={formik.values.users}
            onChange={(e, value) => {
              formik.setFieldValue('users', value);
            }}
            options={employees?.items || []}
            getOptionLabel={(option: any) => `${option?.firstName || ''} ${option?.lastName || ''}`}
            // defaultValue={top100Films.slice(0, 8)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Employee" placeholder="Search  Employee" />
            )}
            renderOption={(props, option: any) => (
              <li {...props} key={option.id}>
                {`${option?.firstName || ''} ${option?.lastName || ''}`}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option: any, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={`${option?.firstName || ''} ${option?.lastName || ''}`}
                  size="small"
                  variant="soft"
                />
              ))
            }
            fullWidth
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" color="inherit">
          cancel
        </Button>
        <Button type="submit" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Box>
  );
};
