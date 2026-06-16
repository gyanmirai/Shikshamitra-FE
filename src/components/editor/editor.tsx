import Stack from '@mui/material/Stack';
import Portal from '@mui/material/Portal';
import StarterKit from '@tiptap/starter-kit';
import Backdrop from '@mui/material/Backdrop';
import { common, createLowlight } from 'lowlight';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import FormHelperText from '@mui/material/FormHelperText';
import TextAlignExtension from '@tiptap/extension-text-align';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import { useRef, useState, useEffect, forwardRef, useCallback } from 'react';
import CodeBlockLowlightExtension from '@tiptap/extension-code-block-lowlight';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import { List, Paper, Popover, ListItemText, ListItemButton } from '@mui/material';

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
      isToolbarShow = true,
      value: content = '',
      placeholder = 'Write something awesome...',
      mentionItems = [],
      mentionable = false,
      ...other
    },
    ref
  ) => {
    const [fullScreen, setFullScreen] = useState(false);
    const [showToolbar, setShowToolbar] = useState(isToolbarShow);
    const [isHovering, setIsHovering] = useState(false);

    // Mention state
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const anchorSpanRef = useRef<HTMLSpanElement | null>(null);
    const [mentionOpen, setMentionOpen] = useState(false);
    const [filteredItems, setFilteredItems] = useState<{ id: string; label: string }[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleToggleFullScreen = useCallback(() => setFullScreen((prev) => !prev), []);
    const handleToggleToolbar = useCallback(() => setShowToolbar((prev) => !prev), []);
    const handleMouseEnter = useCallback(() => setIsHovering(true), []);
    const handleMouseLeave = useCallback(() => setIsHovering(false), []);

    const lowlight = createLowlight(common);

    const editor = useEditor({
      content,
      editable,
      extensions: [
        StarterKit.configure({
          codeBlock: false,
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
        }),
        CodeBlockLowlightExtension.extend({
          addNodeView() {
            return ReactNodeViewRenderer(CodeHighlightBlock);
          },
        }).configure({ lowlight }),
      ],
      onUpdate({ editor: _editor }) {
        const html = _editor.getHTML();
        onChange?.(html);
        if (!mentionable) return;
        const { from } = _editor.state.selection;
        const textBeforeCursor = _editor.state.doc.textBetween(0, from, '\n', '\ufffc');
        const match = textBeforeCursor.match(/@([a-zA-Z\s]*)$/);

        if (match) {
          const q = match[1];

          const filtered = mentionItems.filter((item) =>
            item.label.toLowerCase().includes(q.toLowerCase())
          );
          setFilteredItems(filtered);
          setSelectedIndex(0); // reset selection when query changes

          try {
            const coords = _editor.view.coordsAtPos(from);
            if (!anchorSpanRef.current) {
              const span = document.createElement('span');
              span.style.position = 'absolute';
              span.style.pointerEvents = 'none';
              span.style.width = '0px';
              span.style.height = '0px';
              document.body.appendChild(span);
              anchorSpanRef.current = span;
            }
            const span = anchorSpanRef.current;
            if (span) {
              span.style.left = `${coords.left + window.scrollX}px`;
              span.style.top = `${coords.bottom + window.scrollY}px`;
              setAnchorEl(span);
            }
            setMentionOpen(true);
          } catch (err) {
            cleanupAnchorSpan();
            setMentionOpen(false);
          }
        } else {
          cleanupAnchorSpan();
          setMentionOpen(false);
          setFilteredItems([]);
        }
      },
      immediatelyRender: false,
      ...other,
    });

    useEffect(() => {
      if (!editor) return;

      const currentHTML = editor.getHTML();

      // Normalize empty states to prevent infinite loop
      const isContentEmpty = !content || content === '<p></p>' || content.trim() === '';
      const isEditorEmpty = currentHTML === '<p></p>' || currentHTML === '' || editor.isEmpty;

      if (isContentEmpty && isEditorEmpty) {
        return;
      }

      if (content !== currentHTML) {
        editor.commands.setContent(content || '', {
          emitUpdate: false,
        });
      }
    }, [content, editor]);

    const cleanupAnchorSpan = () => {
      if (anchorSpanRef.current) {
        try {
          anchorSpanRef.current.remove();
        } catch (err) {
          console.error('remove anchor span failed', err);
        }
        anchorSpanRef.current = null;
        setAnchorEl(null);
      }
    };

    const handleSelectMention = useCallback(
      (item: { id: string; label: string }) => {
        if (!editor) return;
        const { state } = editor;
        const { from } = state.selection;
        const textBefore = state.doc.textBetween(0, from, '\n', '\ufffc');
        const lastAt = textBefore.lastIndexOf('@');
        if (lastAt !== -1) {
          editor
            .chain()
            .focus()
            .deleteRange({ from: lastAt, to: from })
            .insertContent(`[${item.label}] `)
            .run();
        } else {
          editor.chain().focus().insertContent(`[${item.label}] `).run();
        }
        cleanupAnchorSpan();
        setMentionOpen(false);
      },
      [editor]
    );

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!mentionOpen || filteredItems.length === 0) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
        } else if (e.key === 'Enter') {
          e.preventDefault();

          handleSelectMention(filteredItems[selectedIndex]);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cleanupAnchorSpan();
          setMentionOpen(false);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [mentionOpen, filteredItems, selectedIndex, editor, handleSelectMention]);

    useEffect(() => () => cleanupAnchorSpan(), []);

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

            <EditorContent
              ref={ref}
              spellCheck="false"
              autoComplete="off"
              autoCapitalize="off"
              editor={editor}
              style={{ textAlign: 'justify', fontSize: '0.98rem' }}
              className={editorClasses.content.root}
            />

            {/* Mention Popper */}
            {mentionable && (
              <Popover
                open={mentionOpen}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                style={{ zIndex: 1600 }}
              >
                <Paper elevation={3}>
                  <List dense sx={{ minWidth: 200, maxHeight: 220, overflow: 'auto' }}>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item, index) => (
                        <ListItemButton
                          key={item.id}
                          selected={index === selectedIndex} // 👈 highlight active
                          onClick={() => handleSelectMention(item)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSelectMention(item);
                            }
                          }}
                        >
                          <ListItemText primary={item.label} />
                        </ListItemButton>
                      ))
                    ) : (
                      <ListItemButton disabled>
                        <ListItemText primary="No matches" />
                      </ListItemButton>
                    )}
                  </List>
                </Paper>
              </Popover>
            )}
          </StyledRoot>

          {helperText && <FormHelperText error={!!error}>{helperText}</FormHelperText>}
        </Stack>
      </Portal>
    );
  }
);
