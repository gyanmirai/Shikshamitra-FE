import { Editor } from 'src/components/editor';
import { Box, Menu, MenuItem } from '@mui/material';
import React, { useRef, useState, useEffect } from 'react';

interface EditorWithPlaceholderProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  editable?: boolean;
  helperText?: string;
  placeholderOptions: { value: string; label: string }[];
}

/**
 * Wrapper for Editor that adds @ → dropdown → [placeholder] functionality
 */
const EditorWithPlaceholder: React.FC<EditorWithPlaceholderProps> = ({
  value,
  onChange,
  placeholder = 'Type your message here...',
  error,
  editable = true,
  helperText,
  placeholderOptions,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<{ top: number; left: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<number | null>(null);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === '@') {
      event.preventDefault();
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Convert selection to absolute cursor position within the text value
      const position = getCaretCharacterOffsetWithin(editorRef.current);
      setCursorPos(position);

      setAnchorEl({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  };

  // Helper to find caret position relative to the editor's text
  const getCaretCharacterOffsetWithin = (element: HTMLElement | null): number => {
    let caretOffset = 0;
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !element) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
    return caretOffset;
  };

  const insertPlaceholder = (label: string) => {
    const placeholderText = `[${label}]`;
    let newValue = value;

    if (cursorPos !== null && cursorPos <= value.length) {
      newValue = value.slice(0, cursorPos) + placeholderText + value.slice(cursorPos);
    } else {
      newValue = `${value}${placeholderText}`;
    }

    onChange(newValue);
    setAnchorEl(null);
  };

  // 🔹 Attach keydown listener directly to editor's DOM element
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.addEventListener('keydown', handleKeyDown);

    // eslint-disable-next-line consistent-return
    return () => {
      el.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box position="relative">
      <div ref={editorRef}>
        <Editor
          value={value}
          sx={{ height: '200px' }}
          onChange={onChange}
          placeholder={placeholder}
          error={error}
          editable={editable}
          helperText={helperText}
        />
      </div>

      {/* Dropdown when @ is typed */}
      <Menu
        anchorReference="anchorPosition"
        anchorPosition={anchorEl ? { top: anchorEl.top, left: anchorEl.left } : undefined}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {placeholderOptions.map((opt) => (
          <MenuItem key={opt.value} onClick={() => insertPlaceholder(opt.label)}>
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default EditorWithPlaceholder;
