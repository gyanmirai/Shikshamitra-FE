import type { NodeViewProps } from '@tiptap/react';

import { common, createLowlight } from 'lowlight';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import StarterKitExtension from '@tiptap/starter-kit';
import TextAlignExtension from '@tiptap/extension-text-align';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import { useState, useEffect, forwardRef, useCallback } from 'react';
import CodeBlockLowlightExtension from '@tiptap/extension-code-block-lowlight';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';

import Stack from '@mui/material/Stack';
import Portal from '@mui/material/Portal';
import Backdrop from '@mui/material/Backdrop';
import FormHelperText from '@mui/material/FormHelperText';

import { Toolbar } from './toolbar';
import { Iconify } from '../iconify';
import { StyledRoot } from './styles';
import { editorClasses } from './classes';
import { CodeHighlightBlock } from './components/code-highlight-block';

import type { EditorProps } from './types';

// ----------------------------------------------------------------------

export const Editor = forwardRef<HTMLDivElement, EditorProps>(
  (
    {
      sx,
      error,
      onChange,
      slotProps,
      helperText,
      resetValue,
      editable = true,
      fullItem = false,
      value: content = '',
      placeholder = 'Write something awesome...',
      ...other
    },
    ref
  ) => {
    const [fullScreen, setFullScreen] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const handleToggleFullScreen = useCallback(() => {
      setFullScreen((prev) => !prev);
    }, []);

    const handleToggleToolbar = useCallback(() => {
      setShowToolbar((prev) => !prev);
    }, []);

    const handleMouseEnter = useCallback(() => {
      setIsHovering(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setIsHovering(false);
    }, []);

    const lowlight = createLowlight(common);

    const editor = useEditor({
      content,
      editable,
      extensions: [
        StarterKitExtension.configure({
          codeBlock: false,
          code: { HTMLAttributes: { class: editorClasses.content.codeInline } },
          heading: { HTMLAttributes: { class: editorClasses.content.heading } },
          horizontalRule: { HTMLAttributes: { class: editorClasses.content.hr } },
          listItem: { HTMLAttributes: { class: editorClasses.content.listItem } },
          blockquote: { HTMLAttributes: { class: editorClasses.content.blockquote } },
          bulletList: { HTMLAttributes: { class: editorClasses.content.bulletList } },
          orderedList: { HTMLAttributes: { class: editorClasses.content.orderedList } },
        }),
        PlaceholderExtension.configure({
          placeholder,
          emptyEditorClass: editorClasses.content.placeholder,
        }),
        ImageExtension.configure({ HTMLAttributes: { class: editorClasses.content.image } }),
        TextAlignExtension.configure({ types: ['heading', 'paragraph'] }),
        LinkExtension.configure({
          autolink: true,
          openOnClick: false,
          HTMLAttributes: { class: editorClasses.content.link },
        }),
        CodeBlockLowlightExtension.extend({
          addNodeView() {
            return ReactNodeViewRenderer(
              CodeHighlightBlock as unknown as React.ComponentType<NodeViewProps>
            );
          },
        }).configure({ lowlight, HTMLAttributes: { class: editorClasses.content.codeBlock } }),
      ],
      onUpdate({ editor: _editor }) {
        const html = _editor.getHTML();
        onChange?.(html);
      },
      ...other,
    });

    useEffect(() => {
      const timer = setTimeout(() => {
        if (editor?.isEmpty && content !== '<p></p>') {
          editor.commands.setContent(content);
        }
      }, 100);
      return () => clearTimeout(timer);
    }, [content, editor]);

    useEffect(() => {
      if (resetValue && !content) {
        editor?.commands.clearContent();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);

    useEffect(() => {
      if (fullScreen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }, [fullScreen]);

    return (
      <Portal disablePortal={!fullScreen}>
        {fullScreen && <Backdrop open sx={{ zIndex: (theme) => theme.zIndex.modal - 1 }} />}

        <Stack
          sx={{
            ...(!editable && { cursor: 'not-allowed' }),
            ...slotProps?.wrap,
            position: 'relative',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <StyledRoot
            error={!!error}
            disabled={!editable}
            fullScreen={fullScreen}
            className={editorClasses.root}
            sx={sx}
          >
            {isHovering && (
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleToggleToolbar();
                  }
                }}
                onClick={handleToggleToolbar}
                style={{
                  position: 'absolute',
                  bottom: 7,
                  right: 15,
                  cursor: 'pointer',
                  zIndex: 1,
                }}
              >
                <Iconify icon="fluent:text-edit-style-24-regular" />
              </div>
            )}

            {showToolbar && (
              <Toolbar
                editor={editor}
                fullItem={fullItem}
                fullScreen={fullScreen}
                onToggleFullScreen={handleToggleFullScreen}
              />
            )}

            {/* <Scrollbar sx={{ height: '200px' }}> */}
            <EditorContent
              ref={ref}
              spellCheck="false"
              autoComplete="off"
              autoCapitalize="off"
              editor={editor}
              style={{ textAlign: 'justify', fontSize: '0.98rem' }}
              className={editorClasses.content.root}
            />

            {/* </Scrollbar> */}
          </StyledRoot>

          {helperText && <FormHelperText error={!!error}>{helperText}</FormHelperText>}
        </Stack>
      </Portal>
    );
  }
);
