import type {
  IdCard,
  IdCardTemplate,
} from 'src/redux/student/records/student-record-documents-api';

import { useState } from 'react';
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { IdentityCardPreview } from 'src/components/identity-card-designer';

import { getStudentICardLayout } from '../student-icard-design';

export type StudentCardPreviewProps = {
  template: IdCardTemplate;
  card?: Pick<IdCard, 'studentSnapshot' | 'hasPhoto' | 'cardNumber'>;
  side?: 'front' | 'back';
  interactive?: boolean;
};

export function StudentConfiguredCardPreview({
  template,
  card,
  side,
  interactive = true,
}: StudentCardPreviewProps) {
  const [selected, setSelected] = useState<'front' | 'back'>('front');
  const activeSide = template.backSideEnabled ? (side ?? selected) : 'front';
  const values = {
    ...card?.studentSnapshot,
    schoolName: template.schoolName,
    schoolAddress: template.schoolAddress,
    headerText: template.headerText,
    footerText: template.footerText,
    CardNumber: card?.cardNumber ?? 'Preview',
  };
  return (
    <Stack spacing={1} sx={{ width: 1, minWidth: 0 }}>
      {interactive && template.backSideEnabled && (
        <ToggleButtonGroup
          size="small"
          exclusive
          value={activeSide}
          aria-label="Student card side"
          onChange={(_event, value: 'front' | 'back' | null) => {
            if (value) setSelected(value);
          }}
        >
          <ToggleButton value="front">Front</ToggleButton>
          <ToggleButton value="back">Back</ToggleButton>
        </ToggleButtonGroup>
      )}
      <Box sx={{ width: 1, minWidth: 0 }}>
        <IdentityCardPreview
          layout={getStudentICardLayout(template)}
          side={activeSide}
          values={values}
          qrCodeEnabled={template.showQrCode}
          logoHidden={template.logo?.mode === 2}
        />
      </Box>
    </Stack>
  );
}
