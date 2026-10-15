import type { CertificateTemplate } from 'src/redux/student/records/student-record-documents-api';

import Stack from '@mui/material/Stack';
import { IDENTITY_KINDS } from 'src/screens/setting/school-identity/types';
import { TemplateIdentityAsset } from 'src/screens/setting/school-identity/components/template-identity-asset';

export function CertificateIdentityAssets({ value, disabled, onChange, onBusy }: {
  value: CertificateTemplate; disabled: boolean; onChange: (next: CertificateTemplate['identityChoices']) => void;
  onBusy: (busy: boolean) => void;
}) {
  return <Stack spacing={2}>{IDENTITY_KINDS.map((kind) => <TemplateIdentityAsset key={kind} kind={kind}
    value={value.identityChoices?.[kind]} legacy={kind === 'logo' ? value.logoUrl : kind === 'signature' ? value.principalSignatureUrl : null}
    disabled={disabled} onBusy={onBusy}
    onChange={(selection) => onChange({ ...value.identityChoices, [kind]: selection })} />)}</Stack>;
}
