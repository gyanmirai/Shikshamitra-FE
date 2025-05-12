import * as Yup from 'yup';

export const resourceRequestMaintenanceValidationSchema = Yup.object().shape({
  assignedEngineer: Yup.string().required('Assigned engineer is required'),

  costing: Yup.string()
    .required('Costing is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Costing must be a valid amount'),
});

export const resourceRequestMaintenanceRepairValidationSchema = Yup.object().shape({
  repairBill: Yup.string().required('Repair bill is required'),
});

export const resourceRequestMaintenanceNotRepariableValidationSchema = Yup.object().shape({
  notRepairbleReason: Yup.string().required('Not repairble reason is required'),
});
