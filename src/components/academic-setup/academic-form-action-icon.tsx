import { Iconify } from '../iconify';

const actionIcons = {
  cancel: 'mdi:close',
  submit: 'mdi:content-save-outline',
  confirm: 'mdi:check',
} as const;

export function AcademicFormActionIcon({ action }: { action: keyof typeof actionIcons }) {
  return <Iconify icon={actionIcons[action]} width={18} aria-hidden />;
}
