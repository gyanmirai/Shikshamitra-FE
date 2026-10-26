import type { ReactNode } from 'react';

import { FormSectionHeader } from 'src/components/form-section-card';

type Academic360SectionHeaderProps = {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function Academic360SectionHeader({
  icon,
  title,
  description,
  action,
}: Academic360SectionHeaderProps) {
  return (
    <FormSectionHeader
      icon={icon}
      title={title}
      descriptionTooltip={description}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      action={action}
    />
  );
}
