import type { FieldInputProps } from 'formik';
import type { FormEvent, KeyboardEvent } from 'react';

import { useRef } from 'react';
import { TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { insertTemplateVariable } from '../notification-template-model';
import { NotificationVariablePicker } from './notification-variable-picker';
import { NotificationVariableSuggestions } from './notification-variable-suggestions';
import { variableQueryAt, useNotificationVariableSuggestions } from '../use-notification-variable-suggestions';

import type { TemplateVariable } from '../notification-template-model';

type TemplateInput = HTMLInputElement | HTMLTextAreaElement;

export function NotificationTemplateTextField({ input, error, readOnly, disabled, variables, onValue }: {
  input: FieldInputProps<string>;
  error?: string;
  readOnly: boolean;
  disabled: boolean;
  variables: TemplateVariable[];
  onValue: (value: string) => void;
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const inputRef = useRef<TemplateInput>(null);
  const message = input.name === 'body';
  const field = message ? 'Message' : 'Subject';
  const suggestions = useNotificationVariableSuggestions(variables, disabled || readOnly);

  function insert(key: string, replaceQuery = false) {
    const element = inputRef.current;
    if (!element) return;

    const range = replaceQuery ? suggestions.query : null;
    const start = range?.start ?? element.selectionStart ?? element.value.length;
    const end = range?.end ?? element.selectionEnd ?? start;
    const next = insertTemplateVariable(element.value, start, end, key);
    suggestions.update(null);
    onValue(next.value);
    requestAnimationFrame(() => {
      if (!element.isConnected || element.disabled) return;
      element.focus();
      element.setSelectionRange(next.caret, next.caret);
    });
  }

  return (
    <>
      <ShakingTextField error={Boolean(error)}>
        <TextField {...input} ref={anchor} inputRef={inputRef} label={field} size="small" fullWidth
          required={message} multiline={message} minRows={message ? 4 : undefined}
          disabled={disabled || readOnly} error={Boolean(error)} helperText={error}
          onChange={(event) => {
            const element = event.target;
            const caret = element.selectionStart;
            suggestions.update(caret !== null && caret === element.selectionEnd
              ? variableQueryAt(element.value.slice(0, caret), caret)
              : null);
            input.onChange(event);
          }}
          onBlur={(event) => {
            suggestions.update(null);
            input.onBlur(event);
          }}
          slotProps={{ htmlInput: {
            ...suggestions.inputAttributes,
            onSelect: ({ currentTarget: element }: FormEvent<TemplateInput>) => {
              if (suggestions.query && (
                element.selectionStart !== suggestions.query.end || element.selectionEnd !== suggestions.query.end
              )) {
                suggestions.update(null);
              }
            },
            onKeyDown: (event: KeyboardEvent<TemplateInput>) => {
              suggestions.handleKey(event, (key) => insert(key, true));
            },
          } }} />
      </ShakingTextField>
      {suggestions.open && anchor.current && (
        <NotificationVariableSuggestions anchor={anchor.current} field={field} listId={suggestions.listId}
          matches={suggestions.matches} activeId={suggestions.activeId} onInsert={(key) => insert(key, true)} />
      )}
      {!readOnly && (
        <NotificationVariablePicker variables={variables} field={message ? 'message' : 'subject'}
          disabled={disabled} onInsert={(key) => insert(key)} />
      )}
    </>
  );
}
