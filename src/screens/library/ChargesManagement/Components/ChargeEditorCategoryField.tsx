import type { ChargeEditorCategory } from 'src/redux/library/charges-management/charge-editor-types';

import { useState } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazyGetLibraryChargeEditorCategoriesQuery } from 'src/redux/library/charges-management/charges-get-api';

import { chargeEditorFieldError, type ChargeEditorFieldProps } from './charge-editor-field-types';

export function ChargeEditorCategoryField({
  formik,
  disabled,
  onFixedChange,
}: ChargeEditorFieldProps & { onFixedChange: (fixed: boolean) => void }) {
  const [category, setCategory] = useState<ChargeEditorCategory | null>(null);
  const [findCategories] = useLazyGetLibraryChargeEditorCategoriesQuery();
  const year = formik.values.academicYearId;
  const error = () => chargeEditorFieldError(formik, 'chargeCategory');
  return (
    <ShakingTextField error={Boolean(error())}>
      <PaginatedSearchSelect<ChargeEditorCategory>
        key={year}
        label="Charge category"
        name="chargeCategory"
        required
        size="small"
        fullWidth
        value={category}
        disabled={disabled || !year}
        filterOptions={(options) => options}
        fetchOptions={async (search, page) => {
          if (!year || disabled) return { data: [], hasMore: false };
          const response = await findCategories({
            academicYearId: year,
            search,
            page,
            pageSize: 20,
          }).unwrap();
          return { data: response.items, hasMore: page * 20 < response.totalCount };
        }}
        getOptionLabel={(option) => option.name}
        getOptionKey={(option) => option.id}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onInput={(event) => {
          if (category && event.target instanceof HTMLInputElement) {
            setCategory(null);
            onFixedChange(false);
            formik.setFieldValue('chargeCategory', '');
          }
        }}
        onChange={(_, selected) => {
          setCategory(selected);
          onFixedChange(Boolean(selected?.isFixed));
          formik.setValues({
            ...formik.values,
            chargeCategory: selected?.id || '',
            amount: selected?.isFixed ? String(selected.amount) : formik.values.amount,
          });
        }}
        onBlur={() => formik.setFieldTouched('chargeCategory', true)}
        error={Boolean(error())}
        helperText={error()}
      />
    </ShakingTextField>
  );
}
