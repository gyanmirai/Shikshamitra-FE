'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Divider,
  Tooltip,
  TextField,
  Accordion,
  IconButton,
  Typography,
  InputAdornment,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import type { IChapterCardProps } from './type';

const ChapterCard: React.FC<IChapterCardProps> = ({
  entry,
  index,
  onRemove,
  onChange,
  onBlur,
  onFileUpload,
  errors,
  touched,
  isExpanded,
  onToggle,
}) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const getError = (field: string): string | undefined =>
    touched?.[field] && errors?.[field] ? errors[field] : undefined;

  const hasError = !!(
    (touched?.chapterNo && errors?.chapterNo) ||
    (touched?.chapterName && errors?.chapterName) ||
    (touched?.startDate && errors?.startDate) ||
    (touched?.endDate && errors?.endDate)
  );

  return (
    <Accordion
      expanded={isExpanded}
      onChange={() => onToggle(entry.uid)}
      sx={{
        borderRadius: 1.5,
        border: (t) => `1px solid ${hasError ? t.palette.error.main : t.palette.divider}`,
        transition: (t) => t.transitions.create(['box-shadow', 'border-color', 'background-color']),
        '&:before': { display: 'none' },
        mb: 2,
        overflow: 'hidden',
        '&.Mui-expanded': {
          m: 0,
          mb: 3,
          border: (t) => `1px solid ${hasError ? t.palette.error.main : t.palette.primary.main}`,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          py: 1,
          px: 2,
          pb: 0,
          pt: 0,
          bgcolor: (t) => (isExpanded ? t.palette.action.hover : 'transparent'),
          '& .MuiAccordionSummary-content': { alignItems: 'center', display: 'flex', gap: 1 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <Iconify
            icon="mdi:book-open-page-variant"
            width={20}
            sx={{ color: hasError ? 'error.main' : 'primary.main', flexShrink: 0 }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {entry.chapterName || `Chapter ${index + 1}`}
          </Typography>

          {!isExpanded && entry.chapterNo !== '' && (
            <Box sx={{ display: 'flex', gap: 1, ml: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`No: ${entry.chapterNo}`}
                size="small"
                variant="soft"
                color="primary"
                sx={{ height: 22, fontSize: '0.75rem' }}
              />
            </Box>
          )}

          {hasError && (
            <Chip
              label="Incomplete"
              size="small"
              color="error"
              variant="soft"
              sx={{ height: 22, fontSize: '0.75rem', ml: 'auto', mr: 1 }}
            />
          )}
        </Box>

        <Tooltip title="Remove chapter">
          <IconButton
            component="span"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(entry.uid);
            }}
            sx={{
              mr: 0.5,
              color: 'text.secondary',
              '&:hover': { color: 'error.main', bgcolor: 'error.lighter' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 3, bgcolor: 'background.paper' }}>
        {/* ── Section 1: Chapter Info ──────────────────────────────── */}
        <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
          <Iconify icon="mdi:information-outline" width={18} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Chapter Info
          </Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3} mb={3}>
          {/* Chapter Number */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(touched?.chapterNo && errors?.chapterNo)}>
              <TextField
                fullWidth
                size="small"
                label="Chapter Number *"
                type="number"
                placeholder="e.g. 1"
                inputProps={{ min: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:pound" width={15} sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                }}
                value={entry.chapterNo}
                onChange={(e) =>
                  onChange(
                    entry.uid,
                    'chapterNo',
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                onBlur={() => onBlur(entry.uid, 'chapterNo')}
                error={!!(touched?.chapterNo && errors?.chapterNo)}
                helperText={getError('chapterNo')}
              />
            </ShakingTextField>
          </Grid>

          {/* Chapter Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(touched?.chapterName && errors?.chapterName)}>
              <TextField
                fullWidth
                size="small"
                label="Chapter Name *"
                placeholder="e.g. Introduction to Algebra"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify
                        icon="mdi:book-open-variant"
                        width={15}
                        sx={{ color: 'text.disabled' }}
                      />
                    </InputAdornment>
                  ),
                }}
                value={entry.chapterName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  onChange(entry.uid, 'chapterName', value);
                }}
                onBlur={() => onBlur(entry.uid, 'chapterName')}
                error={!!(touched?.chapterName && errors?.chapterName)}
                helperText={getError('chapterName')}
              />
            </ShakingTextField>
          </Grid>

          {/* Start Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(touched?.startDate && errors?.startDate)}>
              <DatePicker
                label="Start Date *"
                format="DD/MM/YYYY"
                value={entry.startDate}
                onChange={(val) => {
                  onChange(entry.uid, 'startDate', val);
                }}
                minDate={currentYear?.startDate ? dayjs(currentYear.startDate) : undefined}
                maxDate={currentYear?.endDate ? dayjs(currentYear.endDate) : undefined}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    placeholder: 'DD/MM/YYYY',
                    error: !!(touched?.startDate && errors?.startDate),
                    helperText: getError('startDate'),
                    onBlur: () => onBlur(entry.uid, 'startDate'),
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          {/* End Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(touched?.endDate && errors?.endDate)}>
              <DatePicker
                label="End Date *"
                format="DD/MM/YYYY"
                value={entry.endDate}
                onChange={(val) => {
                  onChange(entry.uid, 'endDate', val);
                }}
                minDate={currentYear?.startDate ? dayjs(currentYear.startDate) : undefined}
                maxDate={currentYear?.endDate ? dayjs(currentYear.endDate) : undefined}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    placeholder: 'DD/MM/YYYY',
                    error: !!(touched?.endDate && errors?.endDate),
                    helperText: getError('endDate'),
                    onBlur: () => onBlur(entry.uid, 'endDate'),
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>

        {/* ── Section 2: Content ───────────────────────────────────── */}
        <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
          <Iconify icon="mdi:text-box-outline" width={18} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Content
          </Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        <Box mb={3}>
          <Editor
            value={entry.description}
            onChange={(value) => onChange(entry.uid, 'description', value)}
            placeholder="Describe what this chapter covers, key topics and learning outcomes…"
            sx={{
              border: `1px solid ${theme.vars.palette.grey[500]}`,
              borderRadius: 1,
              '&:hover': { borderColor: theme.vars.palette.text.primary },
              '&:focus-within': {
                borderColor: theme.vars.palette.text.primary,
                borderWidth: 2,
              },
            }}
          />
        </Box>

        {/* ── Section 3: Attachments ───────────────────────────────── */}
        <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
          <Iconify icon="mdi:paperclip" width={18} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Attachments
          </Typography>
          <Typography variant="caption" color="text.secondary">
            — PDFs, images, slides
          </Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        <CustomUpload
          multiple
          previewCount={6}
          onChange={(files) => onFileUpload(entry.uid, files)}
          value={entry.documents}
          label="Drag & drop files here, or click to browse"
          outputFormat="file"
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default ChapterCard;
