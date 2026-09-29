import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { GlobalIcons } from 'src/utils/icons';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

export type AdmissionOfferingActionProps = {
  canEdit: boolean;
  canClone: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  canDelete: boolean;
  onView: (row: AdmissionOfferingListItem) => void;
  onEdit: (row: AdmissionOfferingListItem) => void;
  onClone: (row: AdmissionOfferingListItem) => void;
  onToggleActive: (row: AdmissionOfferingListItem) => void;
  onDelete: (row: AdmissionOfferingListItem) => void;
};

type Props = AdmissionOfferingActionProps & { row: AdmissionOfferingListItem };

export function AdmissionOfferingRowActions({ row, ...actions }: Props) {
  const activationAllowed = row.canActivate || row.configurationStatus === 1;
  const rowActions: AdaptiveThreeDotsAction[] = [];
  if (actions.canEdit) rowActions.push({ id: 'edit', label: `Edit ${row.code}`, icon: 'solar:pen-bold', onClick: () => actions.onEdit(row) });
  if (actions.canDelete) rowActions.push({ id: 'delete', label: `Delete ${row.code}`, icon: 'solar:trash-bin-trash-bold', color: row.canDelete ? 'error.main' : 'text.disabled', disabled: !row.canDelete, onClick: () => actions.onDelete(row) });
  if (actions.canClone) rowActions.push({ id: 'clone', label: `Clone ${row.code}`, icon: GlobalIcons.copy, onClick: () => actions.onClone(row) });
  if (row.isActive && actions.canDeactivate) rowActions.push({ id: 'deactivate', label: `Deactivate ${row.code}`, icon: GlobalIcons.lockIcon, onClick: () => actions.onToggleActive(row) });
  if (!row.isActive && actions.canActivate && activationAllowed) rowActions.push({ id: 'activate', label: `Activate ${row.code}`, icon: GlobalIcons.publish, onClick: () => actions.onToggleActive(row) });
  if (!row.isActive && actions.canActivate && !activationAllowed && actions.canEdit) rowActions.push({ id: 'complete-setup', label: `Complete setup for ${row.code} to activate`, icon: 'mdi:clipboard-edit-outline', onClick: () => actions.onEdit(row) });
  if (!row.isActive && actions.canActivate && !activationAllowed && !actions.canEdit) rowActions.push({ id: 'activation-blocked', label: 'Activation blocked by incomplete setup', icon: 'mdi:alert-circle-outline', disabled: true, onClick: () => {} });

  return <AdaptiveThreeDotsActions placement="right-top" moreLabel={`More actions for ${row.code}`} mobileDirectActionLimit={0} sx={{ gap: 0, '& .MuiIconButton-root': { width: { xs: 44, sm: 30 }, height: { xs: 44, sm: 30 } } }} actions={rowActions} />;
}
