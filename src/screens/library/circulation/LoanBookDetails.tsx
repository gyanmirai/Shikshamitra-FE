import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { BookLanguage } from 'src/enums/book-language';
import { formatNumber } from 'src/utils/formate_number';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';

import type { LoanLookupBook } from './lookup-types';

const labelTypographyProps = {
  sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'text.secondary' },
};
export function LoanBookDetails({ book }: { book: LoanLookupBook }) {
  const fields = [
    ['Book title', book.title || book.bookTitle],
    ['Accession number', book.accessionNo],
    ['Author', book.author],
    ['ISBN', book.isbn],
    ['Publisher', book.publisher],
    ['Edition', book.edition],
    ['Added on', fDate(book.addedOn)],
    ['Language', typeof book.language === 'number' ? BookLanguage[book.language] : book.language],
    ['Book category', book.category],
    ['Pages', book.pages === undefined ? undefined : formatNumber(book.pages)],
  ];
  return (
    <FormSectionCard
      title="Book Information"
      icon={GlobalIcons.bookIcon}
      descriptionTooltip="Saved catalogue information for the copy returned by this lookup."
    >
      <DetailGrid>
        {fields.map(([label, value]) => (
          <DetailField
            key={String(label)}
            label={String(label)}
            value={value}
            labelTypographyProps={labelTypographyProps}
          />
        ))}
      </DetailGrid>
    </FormSectionCard>
  );
}
