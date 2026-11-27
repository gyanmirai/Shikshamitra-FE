import type { IdentitySelection } from 'src/screens/setting/school-identity/types';
import type { SavedTemplateSignature } from 'src/screens/setting/school-identity/components/template-identity-asset';

import { Alert, Stack, Button } from '@mui/material';
import { useGetSchoolIdentityQuery } from 'src/redux/InstituteSetup/schoolIdentityApi';
import { useGetRecordIdTemplatesQuery } from 'src/redux/student/records/student-record-documents-api';
import { TemplateIdentityAsset } from 'src/screens/setting/school-identity/components/template-identity-asset';

export function StudentICardSignatureSettings({
  value,
  disabled,
  onChange,
  onBusy,
}: {
  value?: IdentitySelection | null;
  disabled?: boolean;
  onChange: (signature: IdentitySelection) => void;
  onBusy?: (busy: boolean) => void;
}) {
  const identity = useGetSchoolIdentityQuery({});
  const templates = useGetRecordIdTemplatesQuery();
  const choices: SavedTemplateSignature[] = [];
  const add = (selection: IdentitySelection | null | undefined, source: string) => {
    const assetId = selection?.assetId;
    if (
      selection?.mode !== 1 ||
      !assetId ||
      !selection.principalName?.trim() ||
      !selection.designation?.trim() ||
      choices.some((choice) => choice.selection.assetId === assetId)
    )
      return;
    choices.push({ selection: { ...selection, assetId }, source });
  };
  const defaultSignature = identity.currentData?.effective.signature;
  if (defaultSignature?.asset) add(defaultSignature.selection, 'School Identity');
  templates.currentData?.forEach((template) =>
    add(template.signature, template.name?.trim() || 'Saved I-Card template')
  );

  return (
    <Stack spacing={1}>
      <TemplateIdentityAsset
        kind="signature"
        value={value}
        disabled={disabled}
        onChange={onChange}
        onBusy={onBusy}
        savedSignatures={choices}
        loadingSavedSignatures={identity.isLoading || templates.isLoading}
        showInheritanceHelp={false}
      />
      {(identity.isError || templates.isError) && (
        <Alert
          severity="warning"
          action={
            <Button
              size="small"
              disabled={disabled || identity.isFetching || templates.isFetching}
              onClick={() => {
                if (identity.isError) identity.refetch();
                if (templates.isError) templates.refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          Some saved signatures could not be loaded.
        </Alert>
      )}
    </Stack>
  );
}
