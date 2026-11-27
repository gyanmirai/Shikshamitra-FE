
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CustomSelect from 'src/components/custom-select';
import { useGetSchoolIdentityQuery, useUploadSchoolIdentityAssetMutation } from 'src/redux/InstituteSetup/schoolIdentityApi';

import { IDENTITY_LABELS } from '../types';
import { changedSelection } from '../identity-form';
import { IdentityAssetField } from './identity-asset-field';
import { useIdentityPermissions } from '../hooks/use-identity-permissions';

import type { IdentityKind, IdentitySelection } from '../types';

export type SavedTemplateSignature = {
  selection: IdentitySelection & { assetId: string };
  source: string;
};

export function TemplateIdentityAsset({
  kind,
  value,
  legacy,
  disabled = false,
  onChange,
  onBusy,
  showInheritanceHelp = true,
  savedSignatures,
  loadingSavedSignatures,
}: {
  kind: IdentityKind;
  value?: IdentitySelection | null;
  legacy?: string | null;
  disabled?: boolean;
  onChange: (next: IdentitySelection) => void;
  onBusy?: (busy: boolean) => void;
  showInheritanceHelp?: boolean;
  savedSignatures?: SavedTemplateSignature[];
  loadingSavedSignatures?: boolean;
}) {
  const permissions = useIdentityPermissions();
  const defaults = useGetSchoolIdentityQuery({}, { skip: !permissions.canView });
  const [upload, uploading] = useUploadSchoolIdentityAssetMutation();
  const [error, setError] = useState('');
  const canUpload = permissions.canView && permissions.canManageDefaults && defaults.currentData?.canManage === true
    && (kind !== 'signature' || permissions.canAccessSignature);
  if (kind === 'signature' && !permissions.canAccessSignature) return null;
  const currentSaved = savedSignatures?.find(({ selection }) =>
    selection.assetId === value?.assetId && selection.principalName === value?.principalName &&
    selection.designation === value?.designation
  );
  const setting = savedSignatures && (
    <CustomSelect
      name="principalSignatureSetting"
      label={`${IDENTITY_LABELS.signature} setting`}
      size="small"
      fullWidth
      isLoading={loadingSavedSignatures}
      disabled={disabled || uploading.isLoading}
      value={currentSaved?.selection.assetId ?? value?.mode ?? 0}
      labelKey="label"
      valueKey="value"
      optionEndLabelKey="source"
      MenuProps={{
        slotProps: {
          paper: {
            sx: {
              '& .MuiMenuItem-root > .MuiTypography-caption': {
                maxWidth: '40%', whiteSpace: 'normal', overflowWrap: 'anywhere',
              },
            },
          },
        },
      }}
      disabledValues={canUpload ? [] : [1]}
      disabledLabel="Requires permission to manage School Identity"
      options={[
        { value: 0, label: 'Use School Identity', source: '' },
        ...savedSignatures.map(({ selection, source }) => ({
          value: selection.assetId,
          label: `${selection.principalName} · ${selection.designation}`,
          source,
        })),
        { value: 1, label: 'Upload custom signature', source: '' },
        { value: 2, label: 'Do not display', source: '' },
      ]}
      onChange={(next) => {
        setError('');
        if (next === 0 || next === 2 || (next === 1 && canUpload)) {
          onChange(changedSelection(next, 'signature'));
          return;
        }
        const saved = savedSignatures.find(({ selection }) => selection.assetId === next);
        if (saved) onChange(saved.selection);
      }}
    />
  );
  if (!value && legacy) return <TextField select label={`${IDENTITY_LABELS[kind]} setting`} value={3} disabled={disabled}
    helperText="The existing custom asset is preserved until you choose a replacement."
    onChange={(event) => onChange(changedSelection(Number(event.target.value) as 0 | 1 | 2, kind))}>
    <MenuItem value={3}>Keep existing custom asset</MenuItem><MenuItem value={0}>Use School Identity</MenuItem>
    <MenuItem value={1} disabled={!canUpload}>Use custom asset</MenuItem><MenuItem value={2}>Do not display</MenuItem>
  </TextField>;
  return <Stack spacing={1}>
    {showInheritanceHelp && (
      <Typography variant="body2" color="text.secondary">
        Inherited assets use School Identity for each document’s board and medium.
      </Typography>
    )}
    <IdentityAssetField kind={kind} value={value ?? { mode: 0 }} context={{}} inheritLabel="Use School Identity" allowCustom={canUpload} disabled={disabled || uploading.isLoading}
      settingControl={setting}
      description={savedSignatures && 'Choose the signature for both sides of this template. School Identity follows each student’s board and medium.'}
      showCustomEditor={!currentSaved || canUpload}
      onChange={(next) => {
        if (next.mode === 1 && !canUpload) { setError('Your account cannot upload custom school assets.'); return; }
        onChange(next);
      }} onUpload={async (file) => {
        if (!canUpload) return;
        setError(''); onBusy?.(true);
        try {
          const asset = await upload({ kind, file }).unwrap();
          onChange({ ...(value ?? changedSelection(1, kind)), mode: 1, assetId: asset.id });
        } catch { setError('The image could not be uploaded. Check its format and size, then retry.'); }
        finally { onBusy?.(false); }
      }} />
    {error && <Alert severity="error">{error}</Alert>}
  </Stack>;
}
