import Box from '@mui/material/Box';
import { useId, useRef } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { FormSectionCard } from 'src/components/form-section-card';

import { IdentityImage } from './identity-image';
import { changedSelection } from '../identity-form';
import { IDENTITY_MINIMUMS } from '../identity-image-frame';
import { IDENTITY_LABELS, IDENTITY_LIMITS } from '../types';
import { IdentityImageUpload } from './identity-image-upload';
import { IdentitySignatureFields } from './identity-signature-fields';

import type {
  IdentityKind,
  IdentityMode,
  IdentityAsset,
  IdentityContext,
  IdentitySelection,
} from '../types';

export function IdentityAssetField({
  kind,
  value,
  context,
  asset,
  disabled,
  inheritLabel = 'Use inherited asset',
  allowCustom = true,
  enableFormatting = false,
  errors,
  onChange,
  onUpload,
  onPreparing,
}: {
  kind: IdentityKind;
  value: IdentitySelection;
  context: IdentityContext;
  asset?: IdentityAsset | null;
  disabled: boolean;
  inheritLabel?: string;
  allowCustom?: boolean;
  enableFormatting?: boolean;
  errors?: { assetId?: string; principalName?: string; designation?: string };
  onChange: (selection: IdentitySelection) => void;
  onUpload: (file: File) => void;
  onPreparing?: (busy: boolean) => void;
}) {
  const label = IDENTITY_LABELS[kind];
  const fieldId = useId();
  const initialValue = useRef(value);
  const sections = {
    logo: {
      title: 'School Logo',
      icon: 'mdi:school-outline',
      description: 'Set the logo used on school documents.',
    },
    banner: {
      title: 'School Banner / Letterhead',
      icon: 'mdi:file-document-outline',
      description: 'Set the banner or letterhead used on school documents.',
    },
    signature: {
      title: 'Principal’s Signature',
      icon: 'mdi:draw-pen',
      description: 'Set the principal’s signature and signing details.',
    },
  };
  return (
    <Box data-identity-kind={kind}>
      <FormSectionCard
        title={sections[kind].title}
        icon={sections[kind].icon}
        descriptionTooltip={sections[kind].description}
      >
        <Stack spacing={1.5}>
          <TextField
            id={`${fieldId}-setting`}
            size="small"
            fullWidth
            select
            label={`${label} setting`}
            SelectProps={{ SelectDisplayProps: { 'aria-labelledby': `${fieldId}-setting-label` } }}
            value={value.mode}
            disabled={disabled}
            onChange={(event) =>
              onChange(changedSelection(Number(event.target.value) as IdentityMode, kind))
            }
          >
            <MenuItem value={0}>{inheritLabel}</MenuItem>
            <MenuItem value={1} disabled={!allowCustom}>
              Use custom asset
            </MenuItem>
            <MenuItem value={2}>Do not display</MenuItem>
          </TextField>
          {value.mode === 1 && (
            <>
              <IdentityImageUpload
                kind={kind}
                context={context}
                assetId={value.assetId}
                onPreparing={onPreparing}
                label={label}
                actionLabel={`${value.assetId ? 'Replace' : 'Upload'} ${kind === 'banner' ? 'letterhead' : kind}`}
                previewWidth={kind === 'logo' ? 88 : 160}
                fileName={asset?.id === value.assetId ? asset?.fileName : undefined}
                preview={
                  value.assetId ? (
                    <IdentityImage
                      key={value.assetId}
                      id={value.assetId}
                      context={context}
                      label={label}
                      height={80}
                      disabled={disabled}
                    />
                  ) : undefined
                }
                disabled={disabled || !allowCustom}
                maxSize={IDENTITY_LIMITS[kind]}
                onUpload={onUpload}
                helperText={`PNG or JPG. Minimum ${IDENTITY_MINIMUMS[kind].width} × ${IDENTITY_MINIMUMS[kind].height} px. Maximum ${IDENTITY_LIMITS[kind] / 1024 / 1024} MB. Adjust the image in its frame before uploading.${kind === 'signature' ? ' Transparent PNG is recommended.' : ''}`}
                error={errors?.assetId}
              />
              {kind === 'signature' && (
                <IdentitySignatureFields
                  value={value}
                  initialValue={initialValue.current}
                  enableFormatting={enableFormatting}
                  disabled={disabled}
                  errors={errors}
                  onChange={onChange}
                />
              )}
            </>
          )}
        </Stack>
      </FormSectionCard>
    </Box>
  );
}
