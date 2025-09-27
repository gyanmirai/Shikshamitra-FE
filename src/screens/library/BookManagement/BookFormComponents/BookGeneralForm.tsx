import type { FormikProps } from 'formik';

import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { IBookPayload } from '../Components/type';

interface BookGeneralStepProps {
  formik: FormikProps<IBookPayload>;
}

const BookGeneralStep = ({ formik }: BookGeneralStepProps) => (
  <SectionCard title="General Information">
    <Grid container spacing={3}>
      {/* Title */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
          <TextField
            fullWidth
            name="title"
            label="Title *"
            value={formik.values.title}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z\s]/g, '')
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              formik.setFieldValue('title', value);
            }}
            error={!!(formik.touched.title && formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            size="small"
          />
        </ShakingTextField>
      </Grid>

      {/* ISBN */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik.touched.isbn && formik.errors.isbn)}>
          <TextField
            fullWidth
            name="isbn"
            label="ISBN *"
            value={formik.values.isbn}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9-]/g, '');
              if (value.length <= 13) {
                formik.setFieldValue('isbn', value);
              }
            }}
            error={!!(formik.touched.isbn && formik.errors.isbn)}
            helperText={formik.touched.isbn && formik.errors.isbn}
            size="small"
          />
        </ShakingTextField>
      </Grid>

      {/* Author */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik.touched.author && formik.errors.author)}>
          <TextField
            fullWidth
            name="author"
            label="Author *"
            value={formik.values.author}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z\s]/g, '')
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              formik.setFieldValue('author', value);
            }}
            error={!!(formik.touched.author && formik.errors.author)}
            helperText={formik.touched.author && formik.errors.author}
            size="small"
          />
        </ShakingTextField>
      </Grid>

      {/* Publisher */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik.touched.publisher && formik.errors.publisher)}>
          <TextField
            fullWidth
            name="publisher"
            label="Publisher *"
            value={formik.values.publisher}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z\s]/g, '')
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              formik.setFieldValue('publisher', value);
            }}
            error={!!(formik.touched.publisher && formik.errors.publisher)}
            helperText={formik.touched.publisher && formik.errors.publisher}
            size="small"
          />
        </ShakingTextField>
      </Grid>

      {/* Subject */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik.touched.subject && formik.errors.subject)}>
          <TextField
            fullWidth
            name="subject"
            label="Subject *"
            value={formik.values.subject}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z\s]/g, '')
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              formik.setFieldValue('subject', value);
            }}
            error={!!(formik.touched.subject && formik.errors.subject)}
            helperText={formik.touched.subject && formik.errors.subject}
            size="small"
          />
        </ShakingTextField>
      </Grid>

      {/* Category */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik.touched.category && formik.errors.category)}>
          <CustomSelect
            label="Category *"
            name="category"
            options={[
              { value: 'Fiction', label: 'Fiction' },
              { value: 'Non-Fiction', label: 'Non-Fiction' },
              { value: 'Reference', label: 'Reference' },
              { value: 'Textbook', label: 'Textbook' },
              { value: 'Children', label: 'Children' },
              { value: 'Biography', label: 'Biography' },
            ]}
            value={formik.values.category}
            onChange={(value) => formik.setFieldValue('category', value)}
            error={!!(formik.touched.category && formik.errors.category)}
            helperText={(formik.touched.category && formik.errors.category) as string}
            formControlProps={{ fullWidth: true }}
          />
        </ShakingTextField>
      </Grid>

      {/* Edition */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik.touched.edition && formik.errors.edition)}>
          <TextField
            fullWidth
            name="edition"
            label="Edition"
            value={formik.values.edition}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              formik.setFieldValue('edition', value);
            }}
            error={!!(formik.touched.edition && formik.errors.edition)}
            helperText={formik.touched.edition && formik.errors.edition}
            size="small"
          />
        </ShakingTextField>
      </Grid>

      {/* Language */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik.touched.language && formik.errors.language)}>
          <CustomSelect
            label="Language *"
            name="language"
            options={[
              { value: 'English', label: 'English' },
              { value: 'Hindi', label: 'Hindi' },
              { value: 'Gujarati', label: 'Gujarati' },
              { value: 'Bengali', label: 'Bengali' },
              { value: 'Marathi', label: 'Marathi' },
              { value: 'Tamil', label: 'Tamil' },
              { value: 'Telugu', label: 'Telugu' },
              { value: 'Kannada', label: 'Kannada' },
              { value: 'Malayalam', label: 'Malayalam' },
              { value: 'Urdu', label: 'Urdu' },
            ]}
            value={formik.values.language}
            onChange={(value) => formik.setFieldValue('language', value)}
            error={!!(formik.touched.language && formik.errors.language)}
            helperText={(formik.touched.language && formik.errors.language) as string}
            formControlProps={{ fullWidth: true }}
          />
        </ShakingTextField>
      </Grid>

      {/* Number of Copies */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik.touched.numberOfCopies && formik.errors.numberOfCopies)}>
          <TextField
            fullWidth
            name="numberOfCopies"
            type="number"
            label="Number of Copies "
            value={formik.values.numberOfCopies || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              formik.setFieldValue('numberOfCopies', value);
              formik.setFieldTouched('numberOfCopies', false);
              const count = Number(value || 0);
              if (count > 0) {
                const updated = Array.from({ length: count }, (_, i) => ({
                  copyNo: i + 1,
                  accessionNo: `ACC-${String(i + 1).padStart(4, '0')}`,
                  rfidEnabled: formik.values.copies?.[i]?.rfidEnabled || false,
                  rfidId: formik.values.copies?.[i]?.rfidId || null,
                  vendor: formik.values.copies?.[i]?.vendor || '',
                }));
                formik.setFieldValue('copies', updated);
              } else {
                formik.setFieldValue('copies', []);
              }
            }}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onWheel={(e) => (e.target as HTMLElement).blur()}
            error={!!(formik.touched.numberOfCopies && formik.errors.numberOfCopies)}
            helperText={formik.touched.numberOfCopies && formik.errors.numberOfCopies}
            size="small"
          />
        </ShakingTextField>
      </Grid>

      {/* Price */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik.touched.price && formik.errors.price)}>
          <NumericFormatCustom
            size="small"
            fullWidth
            label="Price *"
            name="price"
            value={formik.values.price}
            onChange={(e) => {
              const val = e.target.value.replace(/[₹ ,\s]/g, '');
              formik.setFieldValue('price', val ? Number(val) : '');
            }}
            error={!!(formik.touched.price && formik.errors.price)}
            helperText={(formik.touched.price && formik.errors.price) as string}
            prefix="₹ "
            thousandSeparator=","
            decimalScale={2}
            fixedDecimalScale
          />
        </ShakingTextField>
      </Grid>

      {/* Upload */}
      <Grid size={{ xs: 12 }}>
        <CustomUpload
          multiple
          previewCount={6}
          onChange={(files) => formik.setFieldValue(`documents`, files)}
          value={formik.values.documents}
          label="Upload Book Cover, Front, Back Images."
          outputFormat="file"
        />
      </Grid>
    </Grid>
  </SectionCard>
);

export default BookGeneralStep;
