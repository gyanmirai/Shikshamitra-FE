import type { ReactNode } from 'react';

import { GlobalIcons } from 'src/utils/icons';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

export function CertificateDecisionSection({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  if (!active) return children;
  return (
    <FormSectionCard
      title="Certificate Action"
      icon={GlobalIcons.admissionDetails}
      descriptionTooltip="Review the certificate action and record why it is needed. The certificate number remains visible in the dialog title."
    >
      {children}
    </FormSectionCard>
  );
}

export function CertificateDecisionReason({
  active,
  error,
  children,
}: {
  active: boolean;
  error: boolean;
  children: ReactNode;
}) {
  return active ? <ShakingTextField error={error}>{children}</ShakingTextField> : children;
}
