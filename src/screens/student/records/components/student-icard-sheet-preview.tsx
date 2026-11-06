import type {
  IdCard,
  IdCardTemplate,
} from 'src/redux/student/records/student-record-documents-api';

import { useState } from 'react';
import { getIdentityCardSheetLayout } from 'src/components/identity-card-designer';
import { Box, Stack, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { StudentConfiguredCardPreview } from './student-configured-card-preview';
import { getStudentICardLayout, getStudentICardPrintSettings } from '../student-icard-design';

export function StudentICardSheetPreview({
  template,
  cards,
}: {
  template: IdCardTemplate;
  cards: Array<Pick<IdCard, 'studentSnapshot' | 'hasPhoto' | 'cardNumber'> | undefined>;
}) {
  const [selectedSide, setSelectedSide] = useState<'front' | 'back'>('front');
  const layout = getStudentICardLayout(template);
  const settings = getStudentICardPrintSettings(template);
  const sheet = getIdentityCardSheetLayout(layout, settings);
  const side =
    settings.sideMode === 'back'
      ? 'back'
      : settings.sideMode === 'front' || !template.backSideEnabled
        ? 'front'
        : selectedSide;
  const cardOutput = settings.pageSize === 'Card';
  const slotWidth = layout.widthMm + settings.bleedMm * 2;
  const slotHeight = layout.heightMm + settings.bleedMm * 2;
  const gridWidth = sheet.columns * slotWidth + (sheet.columns - 1) * settings.gap;
  const gridHeight = sheet.rows * slotHeight + (sheet.rows - 1) * settings.gap;
  return (
    <Stack spacing={1}>
      {settings.sideMode === 'both' && template.backSideEnabled && (
        <ToggleButtonGroup
          exclusive
          size="small"
          value={side}
          aria-label="Print preview side"
          onChange={(_event, value: 'front' | 'back' | null) => {
            if (value) setSelectedSide(value);
          }}
        >
          <ToggleButton value="front">Front sheet</ToggleButton>
          <ToggleButton value="back">Back sheet</ToggleButton>
        </ToggleButtonGroup>
      )}
      {cardOutput ? (
        <StudentConfiguredCardPreview
          template={template}
          card={cards[0]}
          side={side}
          interactive={false}
        />
      ) : (
        <Box
          role="img"
          aria-label={`${side === 'front' ? 'Front' : 'Back'} A4 card arrangement`}
          sx={{
            position: 'relative',
            width: 1,
            maxWidth: 360,
            mx: 'auto',
            aspectRatio: '210 / 297',
            bgcolor: 'common.white',
            border: 1,
            borderColor: 'divider',
          }}
        >
          {cards.slice(0, sheet.effectiveCardsPerPage).map((card, index) => {
            let column = index % sheet.columns;
            let row = Math.floor(index / sheet.columns);
            if (side === 'back') {
              if (settings.duplexFlip === 'long-edge') column = sheet.columns - 1 - column;
              else row = sheet.rows - 1 - row;
            }
            const x =
              (210 - gridWidth) / 2 +
              column * (slotWidth + settings.gap) +
              settings.bleedMm +
              (side === 'back' ? settings.backOffsetXmm : 0);
            const y =
              (297 - gridHeight) / 2 +
              row * (slotHeight + settings.gap) +
              settings.bleedMm +
              (side === 'back' ? settings.backOffsetYmm : 0);
            return (
              <Box
                key={`${row}:${column}`}
                sx={{
                  position: 'absolute',
                  left: `${(x / 210) * 100}%`,
                  top: `${(y / 297) * 100}%`,
                  width: `${(layout.widthMm / 210) * 100}%`,
                  transform:
                    side === 'back' && settings.backRotation === 180 ? 'rotate(180deg)' : undefined,
                }}
              >
                <StudentConfiguredCardPreview
                  template={template}
                  card={card}
                  side={side}
                  interactive={false}
                />
              </Box>
            );
          })}
        </Box>
      )}
      <Typography variant="caption" color="text.secondary">
        {layout.widthMm.toFixed(2)} × {layout.heightMm.toFixed(2)} mm finished size. Print at actual
        size / 100%.
        {template.backSideEnabled && ' Test front/back pairing and alignment on your printer.'}
      </Typography>
    </Stack>
  );
}
