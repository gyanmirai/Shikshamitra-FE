import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';

import { InquiryPreferenceForm } from '../setting/inquiryPreference';

const RenderInquiryPrefrance = ({ formik, ...props }: { formik: any } & any) => {
  const { values, setFieldValue, touched, errors } = formik;
  const { currentYear } = useSelector((state: any) => state.globalState);
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
    params: {
      academicYearId: currentYear?.id,
    },
    options: {
      skip: !currentYear?.id,
    },
  });
  const dialog = useBoolean();

  return (
    <>
      <PaginatedSearchSelect
        label="Inquiry Preference"
        fetchOptions={async (query) => {
          const items = inquiryPreference?.items || [];
          const filtered = items.filter((item: any) =>
            item?.preferenceName?.toLowerCase().includes(query.toLowerCase())
          );
          return {
            data: filtered.map((item: any) => ({
              label: item.preferenceName,
              id: item.id,
            })),
            hasMore: false,
          };
        }}
        value={
          values.inquiryPreference
            ? {
                label:
                  inquiryPreference?.items?.find((b: any) => b.id === values.inquiryPreference)
                    ?.preferenceName || '',
                id: values.inquiryPreference,
              }
            : null
        }
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        getOptionLabel={(option: any) => option?.label || ''}
        renderOption={(prop, option: any) => (
          <li {...prop} key={option.id}>
            {option.label}
          </li>
        )}
        minChars={0}
        onChange={(_, value: any) => {
          setFieldValue('inquiryPreference', value?.id || '');
        }}
        error={!!(touched.inquiryPreference && errors.inquiryPreference)}
        helperText={(touched.inquiryPreference && errors.inquiryPreference) || ''}
        fullWidth
        sx={{ maxWidth: 'unset' }}
        size="small"
      />

      {/* <Typography
        variant="body2"
        fontWeight={500}
        textAlign="right"
        color="primary.main"
        fontSize={12}
        sx={{ cursor: 'pointer' }}
        onClick={() => {
          dialog.onTrue();
        }}
      >
        Add Inquiry Preference
      </Typography> */}
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Inquiry Preference">
        <InquiryPreferenceForm handleClose={dialog.onFalse} editData={null} />
      </CustomDialog>
    </>
  );
};
export default RenderInquiryPrefrance;
