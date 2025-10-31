import { useGetRolesQuery } from 'src/redux/role/roleApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Checkbox, Typography, FormControlLabel } from '@mui/material';

interface ConditionBaseSettingsProps {
  addConditionBaseDialog: any;
  addSelectionBaseDialog: any;
  formik: any;
}

const ConditionBaseSettings: React.FC<ConditionBaseSettingsProps> = ({
  addConditionBaseDialog,
  addSelectionBaseDialog,
  formik,
}) => {
  // Query hook for fetching all roles
  const { data: roles, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  const handleRoleChange = (roleId: string) => {
    const selectedRoles = formik.values.roles || [];

    if (selectedRoles.includes(roleId)) {
      formik.setFieldValue(
        'roles',
        selectedRoles.filter((id: string) => id !== roleId)
      );
    } else {
      formik.setFieldValue('roles', [...selectedRoles, roleId]);
    }
  };

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {roles?.items?.length ? (
        roles.items.map((role: any) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={role.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.roles?.includes(role.id)}
                  onChange={() => handleRoleChange(role.id)}
                  color="primary"
                />
              }
              label={<Typography variant="body2">{role.name}</Typography>}
            />
          </Grid>
        ))
      ) : (
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">
            No roles available
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};
export default ConditionBaseSettings;
