import type { ComponentProps } from 'react';

import { DetailField as SharedDetailField } from 'src/components/detail-view';

export { DetailGrid, DetailSection } from 'src/components/detail-view';

type DetailFieldProps = Omit<
  ComponentProps<typeof SharedDetailField>,
  'labelAppearance' | 'labelTypographyProps'
>;

export function DetailField(props: DetailFieldProps) {
  return <SharedDetailField {...props} labelAppearance="standard" />;
}
