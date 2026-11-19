import CustomSelect from 'src/components/custom-select';
import { notificationLabel } from 'src/redux/academic-notifications/response-adapters';

import { templateVariableToken } from '../notification-template-model';

import type { TemplateVariable } from '../notification-template-model';

const variableTypeLabels = ['Text', 'Date', 'Date and time', 'Number', 'Link'];

export function NotificationVariablePicker({ variables, field, disabled, onInsert }: {
  variables: TemplateVariable[];
  field: 'subject' | 'message';
  disabled?: boolean;
  onInsert: (key: string) => void;
}) {
  if (!variables.length) return null;
  return (
    <CustomSelect
      label={`Insert ${field} variable`}
      size="small"
      value=""
      disabled={disabled}
      isSearch
      options={variables.map(({ key, type }) => ({
        value: key,
        label: `${notificationLabel(key.replaceAll('_', ' '))} · ${variableTypeLabels[type]} · ${templateVariableToken(key)}`,
      }))}
      onChange={(value) => onInsert(String(value))}
    />
  );
}
