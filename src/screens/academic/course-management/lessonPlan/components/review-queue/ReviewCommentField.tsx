import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ShakingTextField from 'src/components/shaking-text-field';

// Match ReviewRemarksDto.Comment and the persisted lesson-plan review remarks.
export const REVIEW_COMMENT_MAX_LENGTH = 1024;

type Props = {
  value: string;
  errorMessage?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function ReviewCommentField({ value, errorMessage, onChange, onBlur }: Props) {
  return (
    <ShakingTextField error={Boolean(errorMessage)}>
      <TextField
        label="Review Remarks / Comments"
        multiline
        rows={3}
        fullWidth
        size="small"
        value={value}
        onChange={(event) => {
          const comment = event.target.value.slice(0, REVIEW_COMMENT_MAX_LENGTH);
          // Avoid retaining half an emoji when a paste crosses the UTF-16 limit.
          onChange(comment.replace(/[\uD800-\uDBFF]$/, ''));
        }}
        onBlur={onBlur}
        error={Boolean(errorMessage)}
        slotProps={{ htmlInput: { maxLength: REVIEW_COMMENT_MAX_LENGTH } }}
        helperText={
          <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Box component="span">{errorMessage}</Box>
            <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
              {value.length} / {REVIEW_COMMENT_MAX_LENGTH}
            </Box>
          </Box>
        }
      />
    </ShakingTextField>
  );
}
