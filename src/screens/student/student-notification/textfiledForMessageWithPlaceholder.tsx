import React, { useRef, useState } from 'react';
import { Box, Menu, MenuItem } from '@mui/material';

interface CustomPlaceholderInputProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholderOptions: { value: string; label: string }[];
  isFromView?: boolean;
}

const CustomPlaceholderInput: React.FC<CustomPlaceholderInputProps> = ({
  value,
  onChange,
  placeholderOptions,
  isFromView = false,
}) => {
  const [cursorPos, setCursorPos] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<{ top: number; left: number } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    const cursorIndex = event.target.selectionStart || 0;

    // Find the last "@" before the cursor
    const lastAtIndex = text.lastIndexOf('@', cursorIndex - 1);

    if (lastAtIndex !== -1) {
      setCursorPos(lastAtIndex); // Save position of "@"
      positionMenu(event, lastAtIndex);
    } else {
      setAnchorEl(null);
    }

    onChange(text);
  };

  const positionMenu = (event: React.ChangeEvent<HTMLTextAreaElement>, atIndex: number) => {
    const textarea = event.target;
    if (!textarea || !inputRef.current) return;

    const textBeforeCursor = textarea.value.substring(0, atIndex);
    const lines = textBeforeCursor.split('\n');

    const lineHeight = 20; // Approximate line height
    const topOffset = lines.length * lineHeight;

    // Get bounding box of textarea for absolute positioning
    const rect = textarea.getBoundingClientRect();
    const leftOffset = lines[lines.length - 1].length * 8; // Approximate character width

    setAnchorEl({
      top: rect.top + topOffset + window.scrollY + 20, // Adjust Y-position
      left: rect.left + leftOffset + window.scrollX, // Adjust X-position
    });
  };

  const insertPlaceholder = (placeholder: string) => {
    if (cursorPos === null) return;

    // Replace "@" with {placeholder}
    const newText = `${value.slice(0, cursorPos)}[${placeholder}] ${value.slice(cursorPos + 1)}`;
    onChange(newText);
    setAnchorEl(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const cursorIndex = inputRef.current?.selectionStart || 0;
    const text = value;

    // Prevent users from modifying text inside {placeholder}
    const regex = /\{(.*?)\}/g;
    let match;

    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(text)) !== null) {
      const placeholderStart = match.index;
      const placeholderEnd = placeholderStart + match[0].length;

      //  If cursor is inside {placeholder}, prevent typing
      if (cursorIndex > placeholderStart && cursorIndex < placeholderEnd) {
        event.preventDefault();
        return;
      }

      // ✅ Allow removing the whole placeholder
      if (event.key === 'Backspace' && cursorIndex === placeholderEnd) {
        const newText = text.substring(0, placeholderStart) + text.substring(placeholderEnd);
        onChange(newText);
        event.preventDefault();
        return;
      }

      if (event.key === 'Delete' && cursorIndex === placeholderStart) {
        const newText = text.substring(0, placeholderStart) + text.substring(placeholderEnd);
        onChange(newText);
        event.preventDefault();
        return;
      }
    }
  };

  return (
    <Box position="relative">
      <textarea
        disabled={isFromView}
        ref={inputRef}
        value={value}
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
        style={{
          width: '100%',
          height: '100px',
          padding: '10px',
          fontSize: '16px',
          lineHeight: '20px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          resize: 'none',
        }}
        placeholder="Type your SMS here. Use @ to insert placeholders."
      />

      {/* Dropdown appears exactly below @ */}
      <Menu
        anchorReference="anchorPosition"
        anchorPosition={anchorEl ? { top: anchorEl.top, left: anchorEl.left } : undefined}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {placeholderOptions.map((option) => (
          <MenuItem key={option.value} onClick={() => insertPlaceholder(option.label)}>
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default CustomPlaceholderInput;
