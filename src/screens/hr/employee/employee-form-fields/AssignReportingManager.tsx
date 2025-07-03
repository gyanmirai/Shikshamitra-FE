import { useMemo } from 'react';

import { Box, Skeleton, TextField, Autocomplete } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';

import CustomTooltip from 'src/components/custom-tooltip';

import { CardActions } from './InformationFields';

import type { FieldsType } from './types';

const RenderAssignReportingManager = ({ formik, isMainForm, editData = null }: any) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

  const { data: employees, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });
  const employeeValue = useMemo(
    () => employees?.items?.find((i: any) => i.id === values.reportingManager) || null,
    [employees?.items, values.reportingManager]
  );

  const isEditable = useBoolean(isMainForm);
  const handleSave = () => {
    formik.submitForm();
  };
  return (
    <>
      {!isMainForm && (
        <Box display="flex" justifyContent="flex-end" p={1}>
          <CardActions
            isEdit={isEditable}
            onSave={handleSave}
            isLoading={formik.isSubmitting}
            onCancel={() => {
              setFieldValue('reportingManager', editData?.reportingManager || '');
            }}
          />
        </Box>
      )}
      {isLoading ? (
        <Box sx={{ width: '100%', maxWidth: 268 }}>
          <Skeleton height={40} width="100%" />
        </Box>
      ) : (
        <Autocomplete
          options={employees?.items || []}
          getOptionLabel={(option: any) =>
            `${option.firstName || ''} ${option.middleName || ''} ${option.lastName || ''} (${option.employeeCode || ''})`
          }
          disabled={!isEditable.value}
          renderInput={(params) => (
            <CustomTooltip
              placement="top"
              title={
                employeeValue &&
                `${employeeValue?.firstName || ''} ${employeeValue?.middleName || ''} ${employeeValue?.lastName || ''} (${employeeValue?.employeeCode || ''})`
              }
            >
              <TextField
                {...params}
                label="Reporting Manager *"
                size="small"
                error={!!touched.reportingManager && !!errors.reportingManager}
                helperText={touched.reportingManager && errors.reportingManager}
                disabled={!isEditable.value}
                sx={{ maxWidth: 268 }}
              />
            </CustomTooltip>
          )}
          sx={{ minWidth: 300 }}
          value={employeeValue}
          onChange={(e, value) => {
            setFieldValue('reportingManager', value?.id);
            // formik.setFieldValue('examType', value?.id);
          }}
        />
      )}
    </>
  );
};
export const AssignReportingManager: FieldsType[] = [
  {
    type: 'text',
    label: ' ',
    name: ' ',
    gridProps: { xs: 12, md: 12 },
    renderComp: (props) => <RenderAssignReportingManager {...props} />,
  },
];
