'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Iconify } from 'src/components/iconify';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShakingTextField from 'src/components/shaking-text-field';
import FileUploader from 'src/components/custom-upload';
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

const getFileNameFromUrl = (file: string | File, localFileNames?: Record<string, string>): string => {
  if (!file) return '';
  if (typeof file !== 'string') return file.name;
  if (localFileNames && localFileNames[file]) return localFileNames[file];

  const normalized = file.split('?')[0];
  const segments = normalized.split('/').filter(Boolean);
  let rawName = decodeURIComponent(segments[segments.length - 1] || '');

  if (rawName.length > 37 && rawName[36] === '_') {
    const maybeUuid = rawName.substring(0, 36);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(maybeUuid)) {
      rawName = rawName.substring(37);
    }
  }

  return rawName;
};

const ChapterCard: React.FC<IChapterCardProps> = ({
  entry,
  index,
  classId,
  onRemove,
  onChange,
  onBlur,
  onFileUpload,
  onPreviewDocument,
  localFileNames,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
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

        <Grid container spacing={1} mb={3}>
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
                  // const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  onChange(entry.uid, 'chapterName', e.target.value);
                }}
                onBlur={() => onBlur(entry.uid, 'chapterName')}
                error={!!(touched?.chapterName && errors?.chapterName)}
                helperText={getError('chapterName')}
              />
            </ShakingTextField>
          </Grid>

          {/* Start Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const startDateError =
                touched?.startDate || !!entry.startDate ? errors?.startDate : undefined;
              return (
                <ShakingTextField error={!!startDateError}>
                  <DatePicker
                    label="Expected Start Date for all Division"
                    format="DD/MM/YYYY"
                    value={entry.startDate}
                    standardId={classId}
                    disablePast
                    onChange={(val) => {
                      onChange(entry.uid, 'startDate', val);
                    }}
                    minDate={currentYear?.startDate ? dayjs(currentYear.startDate) : undefined}
                    maxDate={currentYear?.endDate ? dayjs(currentYear.endDate) : undefined}
                    sx={{ minWidth: 180, width: '100%' }}
                    helperText={
                      startDateError ||
                      (currentYear?.startDate && currentYear?.endDate
                        ? `Must be within ${dayjs(currentYear.startDate).format('DD/MM/YYYY')} – ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`
                        : undefined)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        placeholder: 'DD/MM/YYYY',
                        error: !!startDateError,
                        onBlur: () => onBlur(entry.uid, 'startDate'),
                        FormHelperTextProps: {
                          sx: {
                            position: 'relative',
                            bgcolor: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            px: 0,
                            py: 0,
                            mx: 1.75,
                            mt: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            color: startDateError ? 'error.main' : 'text.secondary',
                          },
                        },
                      },
                    }}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* End Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const endDateError =
                touched?.endDate || !!entry.endDate ? errors?.endDate : undefined;
              return (
                <ShakingTextField error={!!endDateError}>
                  <DatePicker
                    label="Expected End Date for all Division"
                    format="DD/MM/YYYY"
                    value={entry.endDate}
                    standardId={classId}
                    disablePast
                    onChange={(val) => {
                      onChange(entry.uid, 'endDate', val);
                    }}
                    minDate={currentYear?.startDate ? dayjs(currentYear.startDate) : undefined}
                    maxDate={currentYear?.endDate ? dayjs(currentYear.endDate) : undefined}
                    sx={{ minWidth: 180, width: '100%' }}
                    helperText={
                      endDateError ||
                      (currentYear?.startDate && currentYear?.endDate
                        ? `Must be within ${dayjs(currentYear.startDate).format('DD/MM/YYYY')} – ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`
                        : undefined)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        placeholder: 'DD/MM/YYYY',
                        error: !!endDateError,
                        onBlur: () => onBlur(entry.uid, 'endDate'),
                        FormHelperTextProps: {
                          sx: {
                            position: 'relative',
                            bgcolor: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            px: 0,
                            py: 0,
                            mx: 1.75,
                            mt: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            color: endDateError ? 'error.main' : 'text.secondary',
                          },
                        },
                      },
                    }}
                  />
                </ShakingTextField>
              );
            })()}
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

        <FileUploader
          multiple
          showVisibleDocumentCount={6}
          onChange={(droppedFiles) => onFileUpload(entry.uid, droppedFiles)}
          onPreview={(file: any) => {
            if (onPreviewDocument) {
              const url =
                file instanceof File
                  ? URL.createObjectURL(file)
                  : file?.url || file?.filePath || (typeof file === 'string' ? file : '');
              onPreviewDocument(url);
            }
          }}
          value={entry.documents?.map((doc: any) => {
            if (typeof doc === 'string') {
              return {
                url: doc,
                filePath: doc,
                name: getFileNameFromUrl(doc, localFileNames),
                size: undefined,
              };
            }
            return doc;
          })}
          primaryText="Drag & drop files here, or click to browse"
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default ChapterCard;
