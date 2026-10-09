import PermissionInlineEditor from './permission-inline-editor';

import type { MatrixAction } from './permission-matrix-model';
import type { PermissionOverrideState } from './permission-catalogue';

export default function PermissionMatrixCell({
  feature,
  action,
  user,
  visibility,
  disabled,
  onChange,
}: {
  feature: string;
  action: MatrixAction;
  user: boolean;
  visibility: boolean;
  disabled: boolean;
  onChange: (state: PermissionOverrideState) => void;
}) {
  return (
    <PermissionInlineEditor
      feature={feature}
      action={action}
      user={user}
      visibility={visibility}
      disabled={disabled}
      onChange={onChange}
    />
  );
}
