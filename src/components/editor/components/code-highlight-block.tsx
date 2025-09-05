import type { NodeViewProps } from '@tiptap/core';

import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from '@tiptap/react';

import { editorClasses } from '../classes';

type EditorCodeHighlightBlockProps = ReactNodeViewProps & NodeViewProps;

export function CodeHighlightBlock({
  node: {
    attrs: { language: defaultLanguage },
  },
  extension,
  updateAttributes,
}: EditorCodeHighlightBlockProps) {
  return (
    <NodeViewWrapper className={editorClasses.content.codeBlock}>
      <select
        name="language"
        contentEditable={false}
        defaultValue={defaultLanguage}
        onChange={(event) => updateAttributes({ language: event.target.value })}
        className={editorClasses.content.langSelect}
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {extension.options.lowlight.listLanguages().map((lang: string) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <pre>
        <NodeViewContent />
      </pre>
    </NodeViewWrapper>
  );
}
