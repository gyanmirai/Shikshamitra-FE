import type { RefObject } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/react';

import { useId } from 'react';
import { Editor } from 'src/components/editor';
import { Stack, Typography } from '@mui/material';

import { templateVariableToken } from '../notification-template-model';
import { NotificationVariablePicker } from './notification-variable-picker';
import { NotificationVariableSuggestions } from './notification-variable-suggestions';
import { variableQueryAt, useNotificationVariableSuggestions } from '../use-notification-variable-suggestions';

import type { TemplateVariable } from '../notification-template-model';

export function NotificationTemplateEmailField({
  editorRef, value, error, disabled, readOnly, variables, onValue, onBlur,
}: {
  editorRef: RefObject<TiptapEditor | null>;
  value: string;
  error?: string;
  disabled: boolean;
  readOnly: boolean;
  variables: TemplateVariable[];
  onValue: (value: string) => void;
  onBlur: () => void;
}) {
  const messageId = useId();
  const suggestions = useNotificationVariableSuggestions(variables, disabled || readOnly);

  function insert(key: string) {
    const editor = editorRef.current;
    if (!editor || !suggestions.query) return;

    const { start, end } = suggestions.query;
    suggestions.update(null);
    editor.chain().focus().insertContentAt({ from: start, to: end }, templateVariableToken(key)).run();
  }

  const editorElement = suggestions.open ? editorRef.current?.view.dom : undefined;
  return (
    <>
      <Stack gap={0.5}>
        <Typography component="label" id={messageId} variant="subtitle2">Message</Typography>
        <Editor value={value} editable={!disabled && !readOnly} isToolbarShow={!readOnly}
          sx={disabled ? { pointerEvents: 'none' } : undefined}
          onCreate={({ editor }) => { editorRef.current = editor; }}
          onChange={onValue}
          onBlur={() => {
            suggestions.update(null);
            onBlur();
          }}
          onTransaction={({ editor, transaction }) => {
            if (!transaction.docChanged && !transaction.selectionSet) return;

            const { $from, empty } = editor.state.selection;
            const beforeCaret = $from.parent.textBetween(0, $from.parentOffset, '\n', '\ufffc');
            suggestions.update(transaction.docChanged && editor.isFocused && empty
              ? variableQueryAt(beforeCaret, $from.pos)
              : null);
          }}
          placeholder="Write the email message"
          editorProps={{
            attributes: {
              role: 'textbox', name: 'body', 'aria-multiline': 'true', 'aria-labelledby': messageId,
              'aria-invalid': String(Boolean(error)),
              'aria-autocomplete': 'list',
              ...(suggestions.open ? { 'aria-controls': suggestions.listId } : {}),
              ...(suggestions.activeId ? { 'aria-activedescendant': suggestions.activeId } : {}),
            },
            handleKeyDown: (_view, event) => suggestions.handleKey(event, insert),
          }}
          error={Boolean(error)} helperText={error} />
      </Stack>
      {editorElement && (
        <NotificationVariableSuggestions anchor={editorElement} field="Message" listId={suggestions.listId}
          matches={suggestions.matches} activeId={suggestions.activeId} onInsert={(key) => insert(key)} />
      )}
      {!readOnly && (
        <NotificationVariablePicker variables={variables} field="message" disabled={disabled}
          onInsert={(key) => editorRef.current?.chain().focus().insertContent(templateVariableToken(key)).run()} />
      )}
    </>
  );
}
