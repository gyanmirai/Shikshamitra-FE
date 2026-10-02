import type { ClipboardEvent } from 'react';

import { useRef, useState, useEffect } from 'react';

import CancelIcon from '@mui/icons-material/Cancel';
import { Chip, TextField, IconButton, Autocomplete } from '@mui/material';

export const parseRubricTags = (value: string): string[] => {
  const seen = new Set<string>();
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = tag.toLocaleLowerCase();
      if (!tag || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function RubricTagsField({ value, onChange }: Props) {
  const [draft, setDraft] = useState('');
  const [highlightedTag, setHighlightedTag] = useState<string | null>(null);
  const highlightTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tags = parseRubricTags(value);

  useEffect(
    () => () => {
      if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    },
    []
  );

  const highlightDuplicate = (tag: string) => {
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    setHighlightedTag(tag.toLocaleLowerCase());
    highlightTimeout.current = setTimeout(() => setHighlightedTag(null), 1200);
  };

  const addTags = (candidates: string[]) => {
    const next = [...tags];
    let duplicate: string | null = null;
    candidates.forEach((candidate) => {
      const tag = candidate.trim();
      if (!tag) return;
      const existing = next.find((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase());
      if (existing) duplicate = existing;
      else next.push(tag);
    });
    if (next.length !== tags.length) onChange(next.join(', '));
    if (duplicate) highlightDuplicate(duplicate);
  };

  return (
    <Autocomplete<string, true, true, true>
      multiple
      freeSolo
      disableClearable
      options={[]}
      value={tags}
      inputValue={draft}
      onChange={(_event, next, reason) => {
        if (reason === 'removeOption') onChange(next.join(', '));
      }}
      onInputChange={(_event, next, reason) => {
        if (reason !== 'input') return;
        if (next.includes(',')) {
          const parts = next.split(',');
          addTags(parts.slice(0, -1));
          setDraft(parts[parts.length - 1] ?? '');
        } else {
          setDraft(next);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === ',') {
          event.preventDefault();
          (event as typeof event & { defaultMuiPrevented?: boolean }).defaultMuiPrevented = true;
          addTags([draft]);
          setDraft('');
        } else if (event.key === 'Enter') {
          event.preventDefault();
          (event as typeof event & { defaultMuiPrevented?: boolean }).defaultMuiPrevented = true;
        }
      }}
      renderTags={(selected, getTagProps) =>
        selected.map((tag, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              {...tagProps}
              label={tag}
              deleteIcon={
                <IconButton size="small" aria-label={`Remove tag ${tag}`} sx={{ p: 0 }}>
                  <CancelIcon fontSize="small" />
                </IconButton>
              }
              size="small"
              variant="outlined"
              sx={{
                borderRadius: 1,
                borderColor:
                  highlightedTag === tag.toLocaleLowerCase() ? 'primary.main' : undefined,
                bgcolor: highlightedTag === tag.toLocaleLowerCase() ? 'action.selected' : undefined,
              }}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          name="tags"
          label="Tags"
          helperText="Separate tags with commas."
          inputProps={{
            ...params.inputProps,
            onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
              const pasted = event.clipboardData.getData('text');
              if (!pasted.includes(',')) return;
              event.preventDefault();
              addTags((draft + pasted).split(','));
              setDraft('');
            },
          }}
        />
      )}
      sx={{
        '& .MuiAutocomplete-inputRoot': { alignItems: 'center' },
        '& .MuiAutocomplete-tag': { m: 0.25 },
      }}
    />
  );
}
