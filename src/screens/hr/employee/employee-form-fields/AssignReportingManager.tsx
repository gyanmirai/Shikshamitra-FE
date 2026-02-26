import { useMemo } from 'react';
import { Box, Skeleton } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

import { CardActions } from './InformationFields';

import type { FieldsType } from './types';

const RenderAssignReportingManager = ({ formik, isMainForm, editData = null }: any) => {
  const { values, errors, touched, setFieldValue } = formik;

  const { data: employees, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });
  const employeeValue = useMemo(
    () => employees?.items?.find((i: any) => i.id === values.reportingManager) || null,
    [employees?.items, values.reportingManager]
  );

  const isEditable = useBoolean(isMainForm);
  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    await formik?.submitForm?.();
    if (Object.keys(validation).length > 0) return false;

    formik.resetForm({ values: formik.values });
    return undefined;
  };
  const handleCancel = () => {
    formik.resetForm();
  };
  return (
    <>
      {!isMainForm && (
        <Box display="flex" justifyContent="flex-end" p={1}>
          <CardActions
            isEdit={isEditable}
            onSave={handleSave}
            isLoading={formik.isSubmitting}
            onCancel={handleCancel}
          />
        </Box>
      )}
      {isLoading ? (
        <Box sx={{ width: '100%', maxWidth: 268 }}>
          <Skeleton height={40} width="100%" />
        </Box>
      ) : (
        <CustomTooltip placement="top" title={employeeValue && employeeValue?.fullName}>
          <Box sx={{ minWidth: 300, maxWidth: 300 }}>
            <PaginatedSearchSelect
              label="Reporting Manager *"
              disabled={!isEditable.value}
              noOptionsText="No results found"
              fetchOptions={async (searchQuery) => {
                const items = employees?.items || [];
                const filtered = items.filter((item: any) =>
                  item?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return {
                  data: filtered.map((option: any) => ({
                    label: option.fullName,
                    id: option.id,
                  })),
                  hasMore: false,
                };
              }}
              value={
                employeeValue
                  ? {
                      label: employeeValue.fullName,
                      id: employeeValue.id,
                    }
                  : null
              }
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              getOptionLabel={(option: any) => option?.label || ''}
              renderOption={(props, option: any) => (
                <li {...props} key={option.id}>
                  {option.label}
                </li>
              )}
              minChars={0}
              onChange={(_, value: any) => {
                setFieldValue('reportingManager', value?.id || null);
              }}
              error={!!touched.reportingManager && !!errors.reportingManager}
              helperText={touched.reportingManager && (errors.reportingManager as string)}
              size="small"
              sx={{ width: '100%', maxWidth: 268 }}
            />
          </Box>
        </CustomTooltip>
      )}
    </>
  );
};
export const AssignReportingManager: FieldsType[] = [
  {
    type: 'text',
    label: ' ',
    name: ' ',
    gridProps: { size: { xs: 12, md: 12 } },
    renderComp: (props) => <RenderAssignReportingManager {...props} />,
  },
];
