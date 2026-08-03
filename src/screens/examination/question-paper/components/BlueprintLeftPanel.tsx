'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Table,
  Slider,
  Switch,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import type { PaperRulesState, ValidationIssue } from '../types';

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const BLOOM_LEVELS = [
  { value: 1, label: 'Remembering', desc: 'Recall facts & basic concepts' },
  { value: 2, label: 'Understanding', desc: 'Explain ideas or concepts' },
  { value: 3, label: 'Applying', desc: 'Use information in new situations' },
  { value: 4, label: 'Analyzing', desc: 'Draw connections among ideas' },
  { value: 5, label: 'Evaluating', desc: 'Justify a stand or decision' },
  { value: 6, label: 'Creating', desc: 'Produce new or original work' },
];

interface BlueprintLeftPanelProps {
  totalPaperMarks: number;
  chapters: Array<{ id: string; chapterNumber: number; chapterName: string }>;
  blueprintRules: Record<string, { marks: number; count: number }>;
  onUpdateChapterRule: (chapterId: string, marks: number, count: number) => void;
  difficultyDist: Record<number, number>;
  onUpdateDifficulty: (level: number, pct: number) => void;
  bloomDist: Record<number, number>;
  onUpdateBloom: (level: number, pct: number) => void;
  paperRules: PaperRulesState;
  onUpdatePaperRule: (ruleKey: keyof PaperRulesState, value: boolean) => void;
  validationIssues: ValidationIssue[];
}

export default function BlueprintLeftPanel({
  totalPaperMarks,
  chapters,
  blueprintRules,
  onUpdateChapterRule,
  difficultyDist,
  onUpdateDifficulty,
  bloomDist,
  onUpdateBloom,
  paperRules,
  onUpdatePaperRule,
  validationIssues,
}: BlueprintLeftPanelProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const chapterMarksSum = Object.values(blueprintRules).reduce((sum, r) => sum + (r.marks || 0), 0);
  const remainingMarks = totalPaperMarks - chapterMarksSum;
  const difficultySum = Object.values(difficultyDist).reduce((s, v) => s + v, 0);
  const bloomSum = Object.values(bloomDist).reduce((s, v) => s + v, 0);

  return (
    <Scrollbar sx={{ height: '100%', pr: 0.5 }}>
      <Box display="flex" flexDirection="column" gap={1.25}>
        {/* 1. Chapter Weightage Accordion */}
        <Accordion
          expanded={expanded === 'chapters'}
          onChange={handleAccordionChange('chapters')}
          elevation={0}
          sx={{
            borderRadius: '10px !important',
            border: '1px solid',
            borderColor: 'divider',
            '&:before': { display: 'none' },
            bgcolor: 'background.paper',
          }}
        >
          <AccordionSummary expandIcon={<Iconify icon="mingcute:down-line" width={18} />}>
            <Stack direction="row" spacing={1.25} alignItems="center" width="100%">
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Iconify icon="solar:bookmark-bold-duotone" width={15} />
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Chapter Weightage
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {chapterMarksSum} / {totalPaperMarks} Marks allocated
                </Typography>
              </Box>
              <Label
                variant="soft"
                color={remainingMarks === 0 ? 'success' : 'warning'}
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
              >
                {remainingMarks === 0 ? 'Balanced' : `${remainingMarks} left`}
              </Label>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, px: 1.25, pb: 1.25 }}>
            <Box sx={{ overflow: 'hidden', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: alpha(theme.palette.grey[500], 0.04), fontWeight: 700, fontSize: '0.75rem' } }}>
                    <TableCell>Chapter</TableCell>
                    <TableCell align="center" sx={{ width: 64 }}>Marks</TableCell>
                    <TableCell align="center" sx={{ width: 64 }}>Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chapters.map((chap) => {
                    const rule = blueprintRules[chap.id] || { marks: 0, count: 0 };
                    return (
                      <TableRow key={chap.id} hover sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                        <TableCell sx={{ fontSize: '0.78rem', py: 0.75, fontWeight: 500 }}>
                          {chap.chapterNumber}. {chap.chapterName}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.75 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={rule.marks || ''}
                            onChange={(e) => onUpdateChapterRule(chap.id, Number(e.target.value), rule.count)}
                            inputProps={{ style: { textAlign: 'center', fontSize: '0.78rem', padding: '3px 4px' }, min: 0 }}
                            sx={{ width: 52 }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.75 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={rule.count || ''}
                            onChange={(e) => onUpdateChapterRule(chap.id, rule.marks, Number(e.target.value))}
                            inputProps={{ style: { textAlign: 'center', fontSize: '0.78rem', padding: '3px 4px' }, min: 0 }}
                            sx={{ width: 52 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {chapters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 2.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          No chapters found. Select subject first.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 2. Difficulty Distribution Accordion */}
        <Accordion
          expanded={expanded === 'difficulty'}
          onChange={handleAccordionChange('difficulty')}
          elevation={0}
          sx={{
            borderRadius: '10px !important',
            border: '1px solid',
            borderColor: 'divider',
            '&:before': { display: 'none' },
            bgcolor: 'background.paper',
          }}
        >
          <AccordionSummary expandIcon={<Iconify icon="mingcute:down-line" width={18} />}>
            <Stack direction="row" spacing={1.25} alignItems="center" width="100%">
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Iconify icon="solar:tuning-bold-duotone" width={15} />
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Difficulty Levels
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target sum: 100% ({difficultySum}%)
                </Typography>
              </Box>
              <Label variant="soft" color={difficultySum === 100 ? 'success' : 'warning'} sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}>
                {difficultySum}%
              </Label>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, px: 1.5, pb: 1.5 }}>
            <Stack spacing={1.75}>
              {DIFFICULTY_LEVELS.map((level) => {
                const val = difficultyDist[level.value] ?? 0;
                return (
                  <Box key={level.value}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.25}>
                      <Typography variant="caption" fontWeight={600} color="text.primary">
                        {level.label}
                      </Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={val}
                        onChange={(e) => onUpdateDifficulty(level.value, Number(e.target.value))}
                        inputProps={{ style: { textAlign: 'center', fontSize: '0.75rem', padding: '2px 4px' }, min: 0, max: 100 }}
                        sx={{ width: 52 }}
                      />
                    </Stack>
                    <Slider
                      size="small"
                      value={val}
                      min={0}
                      max={100}
                      onChange={(_, newVal) => onUpdateDifficulty(level.value, newVal as number)}
                      color="primary"
                    />
                  </Box>
                );
              })}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* 3. Bloom's Taxonomy Accordion */}
        <Accordion
          expanded={expanded === 'bloom'}
          onChange={handleAccordionChange('bloom')}
          elevation={0}
          sx={{
            borderRadius: '10px !important',
            border: '1px solid',
            borderColor: 'divider',
            '&:before': { display: 'none' },
            bgcolor: 'background.paper',
          }}
        >
          <AccordionSummary expandIcon={<Iconify icon="mingcute:down-line" width={18} />}>
            <Stack direction="row" spacing={1.25} alignItems="center" width="100%">
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Iconify icon="solar:graph-up-bold-duotone" width={15} />
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Bloom&apos;s Cognitive Depth
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target sum: 100% ({bloomSum}%)
                </Typography>
              </Box>
              <Label variant="soft" color={bloomSum === 100 ? 'success' : 'warning'} sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}>
                {bloomSum}%
              </Label>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, px: 1.5, pb: 1.5 }}>
            <Stack spacing={1}>
              {BLOOM_LEVELS.map((bloom) => {
                const val = bloomDist[bloom.value] ?? 0;
                return (
                  <Box
                    key={bloom.value}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      bgcolor: alpha(theme.palette.grey[500], 0.02),
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" fontWeight={600} display="block">
                        {bloom.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }} noWrap display="block">
                        {bloom.desc}
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      type="number"
                      value={val}
                      onChange={(e) => onUpdateBloom(bloom.value, Number(e.target.value))}
                      inputProps={{ style: { textAlign: 'center', fontSize: '0.75rem', padding: '2px 4px' }, min: 0, max: 100 }}
                      sx={{ width: 52 }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* 4. Paper Rules Accordion */}
        <Accordion
          expanded={expanded === 'rules'}
          onChange={handleAccordionChange('rules')}
          elevation={0}
          sx={{
            borderRadius: '10px !important',
            border: '1px solid',
            borderColor: 'divider',
            '&:before': { display: 'none' },
            bgcolor: 'background.paper',
          }}
        >
          <AccordionSummary expandIcon={<Iconify icon="mingcute:down-line" width={18} />}>
            <Stack direction="row" spacing={1.25} alignItems="center" width="100%">
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Iconify icon="solar:settings-bold-duotone" width={15} />
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Paper Rules
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Choice, numbering &amp; ordering
                </Typography>
              </Box>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, px: 1.5, pb: 1.5 }}>
            <Stack spacing={0.75}>
              {[
                { key: 'internalChoice', label: 'Allow Internal Choice', caption: 'OR choices between questions' },
                { key: 'negativeMarking', label: 'Negative Marking', caption: 'Deduct marks for wrong answers' },
                { key: 'randomizeQuestions', label: 'Randomize Order', caption: 'Shuffle questions on generation' },
                { key: 'autoNumbering', label: 'Auto-Numbering', caption: 'Sequential numbering' },
                { key: 'preventDuplicates', label: 'Block Duplicates', caption: 'Prevent repeat questions' },
                { key: 'enforceSectionOrder', label: 'Strict Section Flow', caption: 'Enforce Section A -> B -> C' },
              ].map((rule) => (
                <Stack
                  key={rule.key}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}
                >
                  <Box>
                    <Typography variant="caption" fontWeight={600} display="block">
                      {rule.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }} display="block">
                      {rule.caption}
                    </Typography>
                  </Box>
                  <Switch
                    size="small"
                    checked={Boolean((paperRules as any)[rule.key])}
                    onChange={(e) => onUpdatePaperRule(rule.key as keyof PaperRulesState, e.target.checked)}
                  />
                </Stack>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* 5. Validation Center Accordion */}
        <Accordion
          expanded={expanded === 'validation'}
          onChange={handleAccordionChange('validation')}
          elevation={0}
          sx={{
            borderRadius: '10px !important',
            border: '1px solid',
            borderColor: 'divider',
            '&:before': { display: 'none' },
            bgcolor: 'background.paper',
          }}
        >
          <AccordionSummary expandIcon={<Iconify icon="mingcute:down-line" width={18} />}>
            <Stack direction="row" spacing={1.25} alignItems="center" width="100%">
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Iconify icon="solar:verified-check-bold-duotone" width={15} />
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Validation Center
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {validationIssues.filter((i) => i.type === 'error').length} Errors • {validationIssues.filter((i) => i.type === 'warning').length} Warnings
                </Typography>
              </Box>
              <Label
                variant="soft"
                color={validationIssues.every((i) => i.type === 'success') ? 'success' : 'warning'}
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
              >
                {validationIssues.every((i) => i.type === 'success') ? 'Ready' : 'Check'}
              </Label>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, px: 1.25, pb: 1.25 }}>
            <Stack spacing={0.75}>
              {validationIssues.map((issue) => (
                <Box
                  key={issue.id}
                  onClick={() => {
                    if (issue.sectionTarget) setExpanded(issue.sectionTarget);
                  }}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.grey[500], 0.02),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                  }}
                >
                  <Iconify
                    icon={issue.type === 'success' ? 'mingcute:check-circle-line' : 'mingcute:alert-line'}
                    width={15}
                    color={issue.type === 'success' ? 'success.main' : 'warning.main'}
                    sx={{ mt: 0.2 }}
                  />
                  <Box>
                    <Typography variant="caption" fontWeight={700} display="block" color="text.primary">
                      {issue.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }} display="block">
                      {issue.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Scrollbar>
  );
}
