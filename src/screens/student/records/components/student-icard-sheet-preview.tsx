import type {
  IdCard,
  IdCardTemplate,
} from 'src/redux/student/records/student-record-documents-api';

import { Stack, Typography } from '@mui/material';
import { IdentityCardSheetPreview } from 'src/components/identity-card-designer/sheet-preview';

import { StudentConfiguredCardPreview } from './student-configured-card-preview';
import { getStudentICardLayout, getStudentICardPrintSettings } from '../student-icard-design';

export function StudentICardSheetPreview({
  template,
  cards,
  photoUrls = [],
}: {
  template: IdCardTemplate;
  cards: Array<Pick<IdCard, 'studentSnapshot' | 'hasPhoto' | 'cardNumber' | 'templateSnapshot'> | undefined>;
  photoUrls?: Array<string | undefined>;
}) {
  const layout = getStudentICardLayout(template);
  const settings = getStudentICardPrintSettings(template);
  return (
    <Stack spacing={1}>
      <IdentityCardSheetPreview
        layout={layout}
        settings={settings}
        backSideEnabled={Boolean(template.backSideEnabled)}
        cardCount={cards.length}
        renderCard={(index, side) => (
          <StudentConfiguredCardPreview
            template={template}
            card={cards[index]}
            photoUrl={photoUrls[index]}
            side={side}
            interactive={false}
            flat
          />
        )}
      />
      <Typography variant="caption" color="text.secondary">
        {layout.widthMm.toFixed(2)} × {layout.heightMm.toFixed(2)} mm finished size. Print at actual
        size / 100%.
        {template.backSideEnabled && ' Test front/back pairing and alignment on your printer.'}
      </Typography>
    </Stack>
  );
}
