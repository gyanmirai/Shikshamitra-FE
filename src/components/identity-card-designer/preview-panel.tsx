import { GlobalIcons } from 'src/utils/icons';
import { Box, Tab, Typography } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { FormSectionHeader } from 'src/components/form-section-card';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';

import { PreviewStage } from './preview-stage';

import type { IdentityCardElement, IdentityCardDesignerProps } from './types';

const previewHelp =
  'Select a field on the card to configure it. Arrow keys move an unlocked field; Shift moves it by ten canvas units. Missing values and sample codes are placeholders. This preview stays in place while settings scroll.';

export function DesignerPreviewPanel({
  side,
  onSideChange,
  selectedId,
  onSelect,
  onMove,
  guides,
  ...props
}: IdentityCardDesignerProps & {
  side: 'front' | 'back';
  onSideChange: (side: 'front' | 'back') => void;
  selectedId: string;
  onSelect: (id: string) => void;
  onMove: (element: IdentityCardElement) => void;
  guides: boolean;
}) {
  return (
    <Box
      component="section"
      role="region"
      aria-label="Card preview"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
        gap: 1,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <FormSectionHeader
          title="Card Preview"
          icon={GlobalIcons.documentIcon}
          descriptionTooltip={previewHelp}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, minWidth: 0 }}>
        <CustomTabs
          value={side}
          onChange={(_, value) => onSideChange(value)}
          guardUnsavedChanges={false}
          aria-label="Card side"
          sx={{ flex: 1, minWidth: 0, '& .MuiTabs-scroller': { p: 0 } }}
        >
          <Tab value="front" label="Front" />
          <Tab value="back" label="Back" disabled={!props.backSideEnabled} />
        </CustomTabs>
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
          <Typography variant="body2" fontWeight={600}>
            Preview
          </Typography>
          <InfoTooltipIcon title={previewHelp} label="Card Preview information" />
        </Box>
      </Box>
      <PreviewStage
        {...props}
        side={side}
        selectedId={selectedId}
        onSelect={onSelect}
        onMove={onMove}
        guides={guides}
        safeInsetMm={props.printSettings.safeInsetMm}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ flexShrink: 0, textAlign: 'center' }}
      >
        {props.layout.widthMm} × {props.layout.heightMm} mm · Enlarged preview
      </Typography>
    </Box>
  );
}
