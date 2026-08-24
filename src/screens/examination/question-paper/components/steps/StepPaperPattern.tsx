'use client';

import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { LanguageInputField } from 'src/screens/academic/components/language-typing';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Button,
  LinearProgress,
  Typography,
  IconButton,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import BlueprintLeftPanel from '../BlueprintLeftPanel';
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_OPTIONS } from '../../constants';

import type { SectionPattern, PaperRulesState, ValidationIssue } from '../../types';

interface StepPaperPatternProps {
  totalMarks: number;
  sections: SectionPattern[];
  onSectionsChange: (sections: SectionPattern[]) => void;
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
  readOnly?: boolean;
}

interface SectionDraftValues {
  sectionName: string;
  questionType: number;
  questionCount: number;
  marksPerQuestion: number;
  instructions: string;
}

const blankDraft = (sectionCount: number): SectionDraftValues => ({
  sectionName: `Section ${String.fromCharCode(65 + sectionCount)}`,
  questionType: 1,
  questionCount: 5,
  marksPerQuestion: 1,
  instructions: '',
});

export default function StepPaperPattern({
  totalMarks,
  sections,
  onSectionsChange,
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
  readOnly = false,
}: StepPaperPatternProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SectionDraftValues | null>(null);

  const marksAllocated = sections.reduce((sum, sec) => {
    const isConfigured =
      sec.questionType != null ||
      sec.questionCount != null ||
      sec.marksPerQuestion != null ||
      (sec.questions?.length || 0) > 0;
    return sum + (isConfigured ? sec.marks || 0 : 0);
  }, 0);
  const remaining = totalMarks - marksAllocated;
  const patternComplete = sections.length > 0 && Math.abs(remaining) < 0.01;
  const totalQuestions = sections.reduce(
    (sum, sec) => sum + (sec.questionCount ?? sec.questions?.length ?? 0),
    0
  );

  const startCreate = () => {
    setEditingId(null);
    setDraft(blankDraft(sections.length));
  };

  const startEdit = (section: SectionPattern) => {
    setEditingId(section.id);
    setDraft({
      sectionName: section.sectionName,
      questionType: section.questionType || 1,
      questionCount: section.questionCount ?? section.questions?.length ?? 5,
      marksPerQuestion: section.marksPerQuestion ?? 1,
      instructions: section.instructions || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveDraft = () => {
    if (!draft) return;
    const computedMarks =
      Math.max(0, Number(draft.questionCount) || 0) *
      Math.max(0, Number(draft.marksPerQuestion) || 0);

    if (editingId) {
      onSectionsChange(
        sections.map((sec) =>
          sec.id === editingId
            ? {
                ...sec,
                sectionName: draft.sectionName.trim() || sec.sectionName,
                questionType: draft.questionType,
                questionCount: Number(draft.questionCount) || 0,
                marksPerQuestion: Number(draft.marksPerQuestion) || 0,
                instructions: draft.instructions,
                marks: computedMarks,
              }
            : sec
        )
      );
    } else {
      onSectionsChange([
        ...sections,
        {
          id: `sec-${Date.now()}`,
          sectionName:
            draft.sectionName.trim() || `Section ${String.fromCharCode(65 + sections.length)}`,
          instructions: draft.instructions,
          marks: computedMarks,
          sortOrder: sections.length + 1,
          questionType: draft.questionType,
          questionCount: Number(draft.questionCount) || 0,
          marksPerQuestion: Number(draft.marksPerQuestion) || 0,
          questions: [],
        },
      ]);
    }
    cancelEdit();
  };

  const duplicateSection = (section: SectionPattern) => {
    onSectionsChange([
      ...sections,
      {
        ...section,
        id: `sec-${Date.now()}`,
        sectionName: `${section.sectionName} (Copy)`,
        sortOrder: sections.length + 1,
        questions: [],
      },
    ]);
  };

  const deleteSection = (sectionId: string) => {
    onSectionsChange(
      sections
        .filter((sec) => sec.id !== sectionId)
        .map((sec, idx) => ({ ...sec, sortOrder: idx + 1 }))
    );
    if (editingId === sectionId) cancelEdit();
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    const idx = sections.findIndex((sec) => sec.id === sectionId);
    const targetIdx = idx + direction;
    if (idx < 0 || targetIdx < 0 || targetIdx >= sections.length) return;
    const updated = [...sections];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    onSectionsChange(updated.map((sec, i) => ({ ...sec, sortOrder: i + 1 })));
  };

  const errorIssues = validationIssues.filter((issue) => issue.type === 'error');

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 1080, mx: 'auto', width: '100%' }}>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          Paper Pattern
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define how marks and questions should be distributed across the paper.
        </Typography>
      </Box>

      {/* ── Pattern Summary ─────────────────────────────────────────────── */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.04),
          borderColor: 'divider',
        }}
      >
        <Stack spacing={1.5}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total Marks
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {totalMarks}
              </Typography>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Marks Allocated
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {marksAllocated}
              </Typography>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Remaining
              </Typography>
              <Typography
                variant="h6"
                fontWeight={800}
                color={
                  patternComplete ? 'success.main' : remaining < 0 ? 'error.main' : 'warning.main'
                }
              >
                {remaining}
              </Typography>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Questions
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {totalQuestions}
              </Typography>
            </Grid>
          </Grid>

          <LinearProgress
            variant="determinate"
            value={Math.min(100, totalMarks > 0 ? (marksAllocated / totalMarks) * 100 : 0)}
            color={patternComplete ? 'success' : remaining < 0 ? 'error' : 'primary'}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {marksAllocated} / {totalMarks} Marks
            </Typography>
            {patternComplete ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Iconify icon="mdi:check-circle" width={15} color="success.main" />
                <Typography variant="caption" fontWeight={700} color="success.main">
                  Paper pattern is complete.
                </Typography>
              </Stack>
            ) : remaining > 0 ? (
              <Typography variant="caption" color="warning.main" fontWeight={600}>
                {remaining} marks are still unallocated. Add another section or increase an existing section.
              </Typography>
            ) : (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Iconify icon="mdi:alert" width={15} color="error.main" />
                <Typography variant="caption" color="error.main" fontWeight={600}>
                  You have allocated {Math.abs(remaining)} marks more than the paper total.
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* ── Section Builder ─────────────────────────────────────────────── */}
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>
            Sections
          </Typography>
          {!readOnly && !draft && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:add" width={16} />}
              onClick={startCreate}
            >
              Add Section
            </Button>
          )}
        </Stack>

        {sections.length === 0 && !draft && (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.25),
              bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.02),
            }}
          >
            <Iconify
              icon="mdi:view-list-outline"
              width={32}
              color="primary.main"
              opacity={0.7}
            />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
              No sections added yet
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
              Define the sections of your question paper.<br/>
              Example: Section A — MCQ — 10 × 1 = 10 marks
            </Typography>
            {!readOnly && (
              <Button
                size="small"
                variant="contained"
                onClick={startCreate}
                startIcon={<Iconify icon="mdi:add" width={16} />}
              >
                Add Section
              </Button>
            )}
          </Paper>
        )}

        {sections.map((section, index) => {
          const isEditing = editingId === section.id;
          const typeLabel = section.questionType ? QUESTION_TYPE_LABELS[section.questionType] : '—';

          if (isEditing && draft) {
            return (
              <Paper
                key={section.id}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2, borderColor: 'primary.main' }}
              >
                <SectionEditor
                  draft={draft}
                  setDraft={setDraft}
                  onCancel={cancelEdit}
                  onSave={saveDraft}
                />
              </Paper>
            );
          }

          return (
            <Paper
              key={section.id}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                '&:hover': { borderColor: 'primary.main' },
                transition: 'all 0.2s ease',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1.5}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ minWidth: 0, flex: 1 }}
                >
                  {!readOnly && (
                    <Stack spacing={0.25} alignItems="center">
                      <IconButton
                        size="small"
                        disabled={index === 0}
                        onClick={() => moveSection(section.id, -1)}
                      >
                        <Iconify icon="mdi:chevron-up" width={14} />
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={index === sections.length - 1}
                        onClick={() => moveSection(section.id, 1)}
                      >
                        <Iconify icon="mdi:chevron-down" width={14} />
                      </IconButton>
                    </Stack>
                  )}
                  <Box sx={{ minWidth: 0, width: '100%' }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {section.sectionName}
                      </Typography>
                      {section.instructions && (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic" noWrap>
                          {section.instructions}
                        </Typography>
                      )}
                    </Stack>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                        {section.questionCount ?? section.questions?.length ?? 0} Questions × {section.marksPerQuestion ?? 1} Mark = {section.marks} Marks
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Question Type: {typeLabel}
                    </Typography>
                  </Box>
                </Stack>

                {!readOnly && (
                  <Stack direction="row" spacing={0.5}>
                    <CustomTooltip title="Edit section">
                      <IconButton size="small" color="primary" onClick={() => startEdit(section)}>
                        <Iconify icon="mdi:pencil-outline" width={16} />
                      </IconButton>
                    </CustomTooltip>
                    <CustomTooltip title="Duplicate section">
                      <IconButton size="small" onClick={() => duplicateSection(section)}>
                        <Iconify icon="mdi:content-copy" width={16} />
                      </IconButton>
                    </CustomTooltip>
                    <CustomTooltip title="Delete section">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteSection(section.id)}
                      >
                        <Iconify icon="mdi:delete-outline" width={16} />
                      </IconButton>
                    </CustomTooltip>
                  </Stack>
                )}
              </Stack>
            </Paper>
          );
        })}

        {/* New section editor */}
        {draft && !editingId && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'primary.main' }}>
            <SectionEditor
              draft={draft}
              setDraft={setDraft}
              onCancel={cancelEdit}
              onSave={saveDraft}
              isNew
            />
          </Paper>
        )}
      </Stack>

      {/* ── Advanced Assessment Rules (collapsed by default) ─────────────── */}
      <Accordion
        elevation={0}
        sx={{
          borderRadius: '12px !important',
          border: '1px solid',
          borderColor: 'divider',
          '&:before': { display: 'none' },
          bgcolor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.04),
        }}
      >
        <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" width={18} />}>
          <Stack spacing={0.25}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Iconify icon="mdi:tune" width={17} color="primary.main" />
              <Typography variant="subtitle2" fontWeight={700}>
                Advanced Assessment Rules
              </Typography>
              <CustomTooltip title="Optional settings to control question distribution and academic coverage. You can skip these for a normal paper.">
                <Iconify
                  icon="lucide:info"
                  width={14}
                  color="info.main"
                  sx={{ cursor: 'pointer' }}
                />
              </CustomTooltip>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Optional settings to control question distribution and academic coverage.
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <BlueprintLeftPanel
            totalPaperMarks={totalMarks}
            chapters={chapters}
            blueprintRules={blueprintRules}
            onUpdateChapterRule={onUpdateChapterRule}
            difficultyDist={difficultyDist}
            onUpdateDifficulty={onUpdateDifficulty}
            bloomDist={bloomDist}
            onUpdateBloom={onUpdateBloom}
            paperRules={paperRules}
            onUpdatePaperRule={onUpdatePaperRule}
            validationIssues={validationIssues}
          />
        </AccordionDetails>
      </Accordion>

      {/* ── Pattern Validation Summary ──────────────────────────────────── */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          borderColor: (patternComplete && errorIssues.length === 0) ? 'success.light' : 'warning.main',
          bgcolor: (t) =>
            (patternComplete && errorIssues.length === 0)
              ? varAlpha(t.vars.palette.success.mainChannel, 0.04)
              : varAlpha(t.vars.palette.warning.mainChannel, 0.04),
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} mb={2}>
          Pattern Status
        </Typography>

        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
              Required
            </Typography>
            <Stack spacing={0.75}>
              <ValidationLine
                ok={sections.length > 0}
                label="Sections configured"
              />
              <ValidationLine
                ok={Math.abs(remaining) < 0.01}
                label="Total marks configured"
              />
              <ValidationLine
                ok={sections.length > 0 && sections.every((sec) => (sec.questionCount ?? 0) > 0)}
                label="Question count configured"
              />
              <ValidationLine
                ok={sections.length > 0 && sections.every((sec) => Boolean(sec.questionType))}
                label="Question types configured"
              />
            </Stack>
          </Box>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
              Optional
            </Typography>
            <Stack spacing={0.75}>
              <ValidationLine
                ok={Object.keys(blueprintRules).length > 0}
                label="Chapter coverage"
                optional
              />
              <ValidationLine
                ok={Object.values(difficultyDist).some((v) => v > 0)}
                label="Difficulty distribution"
                optional
              />
              <ValidationLine
                ok={Object.values(bloomDist).some((v) => v > 0)}
                label="Bloom's Taxonomy"
                optional
              />
            </Stack>
          </Box>
        </Stack>

        {errorIssues.length > 0 && (
          <Box mt={2}>
            {errorIssues.map((issue) => (
              <ValidationLine
                key={issue.id}
                ok={false}
                label={`${issue.title}: ${issue.description}`}
              />
            ))}
          </Box>
        )}

        <Box mt={2.5}>
          {patternComplete && errorIssues.length === 0 ? (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Iconify icon="mdi:check-circle" width={18} color="success.main" />
              <Typography variant="subtitle2" fontWeight={700} color="success.main">
                Pattern is ready. You can continue to Add Questions.
              </Typography>
            </Stack>
          ) : (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Iconify icon="mdi:alert" width={18} color="warning.main" />
              <Typography variant="subtitle2" fontWeight={700} color="warning.main">
                Complete all required items before continuing.
              </Typography>
            </Stack>
          )}
        </Box>
      </Paper>
    </Stack>
  );
}

function ValidationLine({ ok, label, optional }: { ok: boolean; label: string; optional?: boolean }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      {optional ? (
        <Iconify
          icon={ok ? 'mdi:check-circle-outline' : 'mdi:circle-outline'}
          width={15}
          color={ok ? 'success.main' : 'text.disabled'}
          sx={{ mt: '2px' }}
        />
      ) : (
        <Iconify
          icon={ok ? 'mdi:check' : 'mdi:alert-outline'}
          width={15}
          color={ok ? 'success.main' : 'warning.main'}
          sx={{ mt: '2px' }}
        />
      )}
      <Typography
        variant="body2"
        color={ok ? 'text.primary' : optional ? 'text.secondary' : 'warning.main'}
        sx={{ fontSize: '0.82rem' }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

function SectionEditor({
  draft,
  setDraft,
  onCancel,
  onSave,
  isNew = false,
}: {
  draft: SectionDraftValues;
  setDraft: (d: SectionDraftValues) => void;
  onCancel: () => void;
  onSave: () => void;
  isNew?: boolean;
}) {
  const computedMarks = (Number(draft.questionCount) || 0) * (Number(draft.marksPerQuestion) || 0);
  const isValid =
    draft.sectionName.trim().length > 0 && draft.questionCount > 0 && draft.marksPerQuestion > 0;

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={700}>
        {isNew ? 'New Section' : 'Edit Section'}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <LanguageInputField
            fullWidth
            size="small"
            label="Section Name *"
            placeholder="e.g. Section A"
            value={draft.sectionName}
            onChange={(e) => setDraft({ ...draft, sectionName: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomSelect
            label="Question Type *"
            options={QUESTION_TYPE_OPTIONS}
            value={draft.questionType}
            onChange={(val) => setDraft({ ...draft, questionType: Number(val) })}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Questions *"
            value={draft.questionCount}
            onChange={(e) => setDraft({ ...draft, questionCount: Number(e.target.value) })}
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Marks / Question *"
            value={draft.marksPerQuestion}
            onChange={(e) => setDraft({ ...draft, marksPerQuestion: Number(e.target.value) })}
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <LanguageInputField
            fullWidth
            size="small"
            label="Section Instructions (optional)"
            placeholder="e.g. Answer all questions."
            value={draft.instructions}
            onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
          />
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" fontWeight={700} color="primary.main">
          {`${draft.questionCount || 0} × ${draft.marksPerQuestion || 0} = ${computedMarks} Marks`}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" color="inherit" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="small" variant="contained" disabled={!isValid} onClick={onSave}>
            Save Section
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
