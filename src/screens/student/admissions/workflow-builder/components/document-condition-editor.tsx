import type { ComponentProps } from 'react';

import { AdmissionConditionEditor } from './admission-condition-editor';

export function DocumentConditionEditor(props: ComponentProps<typeof AdmissionConditionEditor>) {
  return <AdmissionConditionEditor {...props} groupLabel="Require this document when" />;
}
