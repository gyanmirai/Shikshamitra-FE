import { useState } from 'react';
import { useFormik } from 'formik';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useAddTenantMutation, useUpdateTenantMutation } from 'src/redux/tenant/tenantApi';

import { basicInformationvalidationSchema } from '../validationSchema';

import type { IFormValues } from '../type';
import type { BasicInformationFormProps } from './types';

export function useBasicInformationForm({ editData, handleClose }: BasicInformationFormProps) {
  const [openedRecord] = useState(editData);
  const [addTenant, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddTenantMutation,
    popupConfig: { success: true, successMessage: 'Tenant Added Successfully' },
  });
  const [updateTenant, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateTenantMutation,
    popupConfig: { success: true, successMessage: 'Tenant Updated Successfully' },
  });
  const properties = openedRecord?.extraProperties;
  const formik = useFormik<IFormValues>({
    initialValues: {
      instituteName: properties?.InstituteName ?? openedRecord?.name ?? '',
      instituteLogo: properties?.Logo ?? [],
      instituteBanner: properties?.Banner ?? [],
      addressLine1: properties?.Address1 ?? '',
      addressLine2: properties?.Address2 ?? '',
      addressLine3: properties?.Address3 ?? '',
      city: { name: properties?.City ?? '' },
      stateProvince: properties?.State ?? { name: '', isoCode: '' },
      country: properties?.Country ?? { name: 'India', isoCode: 'IN' },
      zipPostalCode: properties?.PostalCode ?? '',
      contactNumber: properties?.ContactNumber ?? '',
      emailAddress: openedRecord?.adminEmailAddress ?? '',
      password: '',
      principleSign: properties?.PrincipleSign ?? [],
    },
    validationSchema: basicInformationvalidationSchema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      const payload = {
        name: values.instituteName,
        email: values.emailAddress,
        adminPassword: values.password,
        extraProperties: {
          Country: values.country,
          State: values.stateProvince,
          City: values.city?.name,
          Address1: values.addressLine1,
          Address2: values.addressLine2,
          Address3: values.addressLine3,
          ContactNumber: values.contactNumber,
          PostalCode: values.zipPostalCode,
          InstituteName: values.instituteName,
        },
      };
      try {
        if (openedRecord) await updateTenant({ id: openedRecord.id, body: payload }).unwrap();
        else await addTenant({ ...payload, adminEmailAddress: values.emailAddress }).unwrap();
        handleClose?.();
      } catch (error) {
        helpers.setStatus(
          parseApiProblemDetail(error).detail || 'School profile could not be saved. Try again.'
        );
      }
    },
  });
  return {
    formik,
    editing: Boolean(openedRecord),
    saving: isLoading || isUpdateLoading || formik.isSubmitting,
  };
}
