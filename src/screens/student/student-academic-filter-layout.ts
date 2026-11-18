export const studentAcademicFilterRowSx = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  flexWrap: { sm: 'wrap' },
  gap: 1,
  minWidth: 0,
  '& > .MuiFormControl-root': {
    flex: { sm: '1 1 160px' },
    minWidth: 0,
    maxWidth: { sm: 248 },
  },
} as const;
