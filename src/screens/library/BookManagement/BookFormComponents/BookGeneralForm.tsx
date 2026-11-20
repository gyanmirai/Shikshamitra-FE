import type { FormikProps } from 'formik';

import { Stack } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';

import { BookCoverUpload } from './BookCoverUpload';
import { BookStockFields } from './BookStockFields';
import { BookIdentityFields } from './BookIdentityFields';
import { BookClassificationFields } from './BookClassificationFields';

import type { BookFormValues } from '../Components/type';

const BookGeneralStep = ({
  formik,
  disabled,
  onBusyChange,
}: {
  formik: FormikProps<BookFormValues>;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) => (
  <Stack spacing={2}>
    <FormSectionCard
      title="General Information"
      icon={GlobalIcons.bookIcon}
      descriptionTooltip="Enter the book's title, author and publication details. Online lookup is optional; manual entry is always available."
    >
      <BookIdentityFields formik={formik} disabled={disabled} />
    </FormSectionCard>
    <FormSectionCard
      title="Classification And Stock"
      icon={GlobalIcons.documentIcon}
      descriptionTooltip="Choose the category and language, then specify physical copies. Catalogue price is optional; acquisition costs are recorded separately in Stock Receiving."
    >
      <BookClassificationFields formik={formik} disabled={disabled} />
      <BookStockFields formik={formik} disabled={disabled} />
    </FormSectionCard>
    <FormSectionCard
      title="Book Cover"
      icon={GlobalIcons.image}
      descriptionTooltip="Upload an optional cover image. Failed uploads leave the previous cover unchanged."
    >
      <BookCoverUpload formik={formik} disabled={disabled} onBusyChange={onBusyChange} />
    </FormSectionCard>
  </Stack>
);

export default BookGeneralStep;
