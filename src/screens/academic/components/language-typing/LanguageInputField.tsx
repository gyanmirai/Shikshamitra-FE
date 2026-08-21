'use client';

import type { TextFieldProps } from '@mui/material/TextField';

import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Menu, MenuItem, TextField, IconButton } from '@mui/material';
import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useCallback,
  useLayoutEffect,
} from 'react';

import { useAcademicLanguageTyping } from './AcademicLanguageTypingContext';
import { ACADEMIC_TYPING_LANGUAGES, type AcademicTypingLanguage } from './types';

type LanguageInputFieldProps = Omit<TextFieldProps, 'onSelect'> & {
  typingLanguage?: string;
  onTypingLanguageChange?: (language: AcademicTypingLanguage) => void;
};

type FieldActionPosition = {
  left: number;
  top: number;
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function getFieldActionPosition(
  input: HTMLInputElement | HTMLTextAreaElement,
  container: HTMLElement
): FieldActionPosition {
  const inputRect = input.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const iconSize = 28;
  const fieldRightGap = 8;

  return {
    left: Math.max(8, inputRect.right - containerRect.left - iconSize - fieldRightGap),
    top: Math.max(
      4,
      inputRect.top - containerRect.top + Math.max(0, (inputRect.height - iconSize) / 2)
    ),
  };
}

export const LanguageInputField = forwardRef<HTMLInputElement, LanguageInputFieldProps>(
  ({ typingLanguage = 'en', onTypingLanguageChange, inputRef, onFocus, onBlur, ...props }, ref) => {
    const { isSetupComplete, openSetupGuide, syncSetupState } = useAcademicLanguageTyping();
    const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [focused, setFocused] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState(typingLanguage);
    const [fieldActionPosition, setFieldActionPosition] = useState<FieldActionPosition>({
      left: 8,
      top: 4,
    });
    const isMenuOpen = Boolean(menuAnchor);

    useEffect(() => {
      setSelectedLanguage(typingLanguage);
    }, [typingLanguage]);

    useEffect(() => {
      syncSetupState();
    }, [syncSetupState]);

    useEffect(() => {
      if (isSetupComplete) {
        setMenuAnchor(null);
      }
    }, [isSetupComplete]);

    const updateCaretPosition = useCallback(() => {
      const field = fieldRef.current;
      const container = containerRef.current;
      if (!field || !container || document.activeElement !== field) return;

      setFieldActionPosition(getFieldActionPosition(field, container));
    }, []);

    useLayoutEffect(() => {
      updateCaretPosition();
    }, [props.value, focused, updateCaretPosition]);

    useEffect(() => {
      if (!focused) return undefined;

      const handleSelectionChange = () => updateCaretPosition();
      const handleViewportChange = () => updateCaretPosition();

      document.addEventListener('selectionchange', handleSelectionChange);
      window.addEventListener('resize', handleViewportChange);
      window.addEventListener('scroll', handleViewportChange, true);

      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        window.removeEventListener('resize', handleViewportChange);
        window.removeEventListener('scroll', handleViewportChange, true);
      };
    }, [focused, updateCaretPosition]);

    const handleInputRef = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      fieldRef.current = node;
      assignRef(ref, node as HTMLInputElement | null);
      assignRef(inputRef, node as HTMLInputElement | null);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(true);
      onFocus?.(event);
      requestAnimationFrame(updateCaretPosition);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onBlur?.(event);
      window.setTimeout(() => setFocused(false), 120);
    };

    const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isSetupComplete) {
        openSetupGuide();
        return;
      }

      setMenuAnchor(event.currentTarget);
    };

    return (
      <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
        <TextField
          {...props}
          inputRef={handleInputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {focused && !isSetupComplete && (
          <CustomTooltip title={isSetupComplete ? 'Choose typing language' : 'Set up language typing'}>
            <IconButton
              size="small"
              aria-label={isSetupComplete ? 'Choose typing language' : 'Set up language typing'}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleLanguageClick}
              sx={{
                position: 'absolute',
                left: fieldActionPosition.left,
                top: fieldActionPosition.top,
                zIndex: 1,
                width: 28,
                height: 28,
                color: 'primary.contrastText',
                bgcolor: 'primary.main',
                boxShadow: (theme) => `0 4px 10px ${alpha(theme.palette.primary.main, 0.32)}`,
                animation: 'academic-language-typing-pulse 1.8s ease-in-out infinite',
                '@keyframes academic-language-typing-pulse': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                  },
                  '50%': {
                    transform: 'scale(1.14)',
                  },
                },
                '&:hover': {
                  color: 'primary.contrastText',
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <Iconify icon="mdi:translate" width={17} />
            </IconButton>
          </CustomTooltip>
        )}
        <Menu
          anchorEl={menuAnchor}
          open={isMenuOpen && !isSetupComplete}
          onClose={() => setMenuAnchor(null)}
          MenuListProps={{ 'aria-label': 'Typing language options' }}
        >
          {ACADEMIC_TYPING_LANGUAGES.map((language) => (
            <MenuItem
              key={language.code}
              selected={selectedLanguage === language.code}
              onClick={() => {
                setSelectedLanguage(language.code);
                onTypingLanguageChange?.(language);
                setMenuAnchor(null);
              }}
            >
              {language.label} ({language.nativeLabel})
            </MenuItem>
          ))}
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              openSetupGuide();
            }}
          >
            Open typing setup guide
          </MenuItem>
        </Menu>
      </Box>
    );
  }
);
