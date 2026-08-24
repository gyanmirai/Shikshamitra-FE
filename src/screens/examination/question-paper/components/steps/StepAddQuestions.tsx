'use client';

import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useResponsive } from 'src/hooks/use-responsive';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { TabContext, TabList, TabPanel as MuiTabPanel } from '@mui/lab';
import {
  Box,
  Tab,
  Card,
  Grid,
  Menu,
  Stack,
  Paper,
  Drawer,
  Button,
  MenuItem,
  Typography,
  IconButton,
} from '@mui/material';

import QuestionReplaceDrawer from '../QuestionReplaceDrawer';
import QuestionLibraryRightPanel from '../QuestionLibraryRightPanel';
import { BLOOM_LABELS, DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from '../../constants';

import type { QuestionItem, SectionPattern, QuestionLibraryFilters } from '../../types';

interface StepAddQuestionsProps {
  sections: SectionPattern[];
  totalMarks: number;
  bankQuestions: QuestionItem[];
  bankAvailableCount: number;
  bankLoading: boolean;
  bankError: boolean;
  chapters: Array<{ id: string; chapterNumber: number; chapterName: string }>;
  libraryFilters: QuestionLibraryFilters;
  onLibraryFiltersChange: (filters: QuestionLibraryFilters) => void;
  onAddQuestion: (question: QuestionItem, sectionId: string) => void;
  onAddQuestions: (questions: QuestionItem[], sectionId: string) => Promise<void>;
  onRemoveQuestion: (questionId: string) => void;
  onMoveQuestion: (questionId: string, direction: 'up' | 'down') => void;
  onMoveQuestionToSection: (questionId: string, targetSectionId: string) => void;
  onDuplicateQuestion: (question: QuestionItem) => void;
  onReplaceQuestion: (oldQuestionId: string, newQuestion: QuestionItem) => void;
  onSaveDraft: () => void;
  isSavingDraft?: boolean;
  isAddingQuestions?: boolean;
  readOnly?: boolean;
}

export default function StepAddQuestions({
  sections,
  totalMarks,
  bankQuestions,
  bankAvailableCount,
  bankLoading,
  bankError,
  chapters,
  libraryFilters,
  onLibraryFiltersChange,
  onAddQuestion,
  onAddQuestions,
  onRemoveQuestion,
  onMoveQuestion,
  onMoveQuestionToSection,
  onDuplicateQuestion,
  onReplaceQuestion,
  onSaveDraft,
  isSavingDraft = false,
  isAddingQuestions = false,
  readOnly = false,
}: StepAddQuestionsProps) {
  const theme = useTheme();
  const isDesktop = useResponsive('up', 'lg');
  const isTablet = useResponsive('between', 'md', 'lg');

  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id || '');
  const [panelTab, setPanelTab] = useState('builder');
  const [bankDrawerOpen, setBankDrawerOpen] = useState(false);
  const [replaceQuestion, setReplaceQuestion] = useState<QuestionItem | null>(null);
  const [removeConfirmQuestion, setRemoveConfirmQuestion] = useState<QuestionItem | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const activeSection = sections.find((section) => section.id === activeSectionId) || sections[0];

  const allQuestions = useMemo(() => sections.flatMap((sec) => sec.questions || []), [sections]);
  const targetQuestionCount = useMemo(
    () => sections.reduce((sum, sec) => sum + (sec.questionCount ?? sec.questions?.length ?? 0), 0),
    [sections]
  );
  const currentMarks = allQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const remainingMarks = totalMarks - currentMarks;

  // Keep a valid active section as sections load or change.
  useEffect(() => {
    if (sections.length > 0 && !sections.some((s) => s.id === activeSectionId)) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  const focusSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleReplace = (newQuestion: QuestionItem) => {
    if (replaceQuestion) {
      onReplaceQuestion(replaceQuestion.id, newQuestion);
    }
    setReplaceQuestion(null);
  };

  /* ── Paper Outline (left) ─────────────────────────────────────────── */
  const renderOutline = () => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Paper Outline
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Click a section to jump to it
        </Typography>
      </Box>
      <Scrollbar sx={{ flex: 1, p: 1.25 }}>
        <Stack spacing={1}>
          {sections.map((sec) => {
            const qCount = sec.questions?.length || 0;
            const qTarget = sec.questionCount ?? qCount;
            const marks = (sec.questions || []).reduce((s, q) => s + (q.marks || 0), 0);
            const isActive = sec.id === activeSectionId;
            const complete = qTarget > 0 && qCount >= qTarget;
            return (
              <Paper
                key={sec.id}
                onClick={() => focusSection(sec.id)}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isActive ? 'primary.main' : 'divider',
                  bgcolor: isActive
                    ? (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.05)
                    : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" fontWeight={700}>
                    {sec.sectionName}
                  </Typography>
                  {complete ? (
                    <Iconify icon="mdi:check-circle" width={15} color="success.main" />
                  ) : (
                    <Iconify icon="mdi:clock-outline" width={14} color="warning.main" />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {sec.questionType ? QUESTION_TYPE_LABELS[sec.questionType] : 'Mixed types'}
                </Typography>
                <Stack direction="row" spacing={1.5} mt={0.5}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color={complete ? 'success.main' : 'text.secondary'}
                  >
                    {qCount} / {qTarget} Questions
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    {marks} / {sec.marks} Marks
                  </Typography>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Scrollbar>
    </Card>
  );

  /* ── Paper Builder (center) ───────────────────────────────────────── */
  const renderBuilder = () => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Paper Builder
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {allQuestions.length} questions • {currentMarks} / {totalMarks} marks
        </Typography>
      </Box>

      <Scrollbar sx={{ flex: 1, p: { xs: 1.25, md: 2 } }}>
        {sections.length === 0 ? (
          <EmptyPatternHint />
        ) : allQuestions.length === 0 ? (
          <Box
            sx={{
              py: 6,
              px: 3,
              textAlign: 'center',
              border: '2px dashed',
              borderRadius: 2,
              borderColor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.25),
              bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.02),
            }}
          >
            <Iconify
              icon="mdi:file-document-plus-outline"
              width={36}
              color="primary.main"
              opacity={0.7}
            />
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1, mb: 0.5 }}>
              Your Question Paper is Empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start by adding questions from the Question Bank.
            </Typography>
            {!readOnly && (
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="mdi:library" width={16} />}
                  onClick={() => (isDesktop ? undefined : setBankDrawerOpen(true))}
                >
                  Browse Question Bank
                </Button>
              </Stack>
            )}
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {sections.map((section) => {
              const questions = section.questions || [];
              const qTarget = section.questionCount ?? questions.length;
              const sectionStartIndex = sections
                .slice(0, sections.indexOf(section))
                .reduce((s, sec) => s + (sec.questions?.length || 0), 0);

              return (
                <Box
                  key={section.id}
                  ref={(el: HTMLDivElement | null) => {
                    sectionRefs.current[section.id] = el;
                  }}
                >
                  {/* Section header styled like a real paper */}
                  <Box
                    sx={{
                      textAlign: 'center',
                      pb: 1,
                      mb: 1.25,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                    >
                      {section.sectionName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {section.questionType ? QUESTION_TYPE_LABELS[section.questionType] : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {section.instructions}{' '}
                      {qTarget > 0 &&
                        `• ${qTarget} × ${section.marksPerQuestion ?? 1} = ${section.marks} Marks`}
                    </Typography>
                  </Box>

                  {questions.length === 0 ? (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        textAlign: 'center',
                        border: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        No questions in this section yet — add {qTarget > 0 ? qTarget : ''} from the
                        Question Bank.
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={1.25}>
                      {questions.map((question, idx) => (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          number={sectionStartIndex + idx + 1}
                          sections={sections}
                          currentSectionId={section.id}
                          readOnly={readOnly}
                          onReplace={() => setReplaceQuestion(question)}
                          onMove={onMoveQuestion}
                          onMoveToSection={onMoveQuestionToSection}
                          onDuplicate={() => onDuplicateQuestion(question)}
                          onRemoveRequest={() => setRemoveConfirmQuestion(question)}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Scrollbar>
    </Card>
  );

  /* ── Question Bank (right) ────────────────────────────────────────── */
  const renderBank = () => (
    <QuestionLibraryRightPanel
      bankQuestions={bankQuestions}
      availableCount={bankAvailableCount}
      addedQuestionIds={allQuestions.map((q) => q.questionBankItemId || q.id)}
      chapters={chapters}
      sectionName={activeSection?.sectionName || 'Question Bank'}
      questionTypeLabel={
        activeSection?.questionType ? QUESTION_TYPE_LABELS[activeSection.questionType] : 'Mixed types'
      }
      requiredCount={activeSection?.questionCount ?? activeSection?.questions?.length ?? 0}
      requiredMarks={activeSection?.marks ?? 0}
      onAddQuestion={(q) => onAddQuestion(q, activeSectionId || sections[0]?.id || '')}
      onAddQuestions={(questions) =>
        onAddQuestions(questions, activeSectionId || sections[0]?.id || '')
      }
      onFiltersChange={onLibraryFiltersChange}
      isLoading={bankLoading}
      isError={bankError}
      isAdding={isAddingQuestions}
    />
  );

  return (
    <Stack spacing={1.5} height="100%" minHeight={0}>
      {/* Step intro and compact progress summary */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1.25, md: 3 }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ flexShrink: 0 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Add Questions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeSection ? `Add questions to ${activeSection.sectionName}.` : 'Add questions from the Question Bank or create new ones.'}
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 2.5 }}
          alignItems="center"
          justifyContent={{ xs: 'space-between', md: 'flex-end' }}
          flexWrap="wrap"
          useFlexGap
        >
          <ProgressMetric label="Questions" value={`${allQuestions.length} / ${targetQuestionCount}`} />
          <ProgressMetric label="Marks" value={`${currentMarks} / ${totalMarks}`} />
          <ProgressMetric label="Sections" value={String(sections.length)} />
          <Stack spacing={0.25} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Status
            </Typography>
            <Label
              variant="soft"
              color={remainingMarks === 0 ? 'success' : remainingMarks < 0 ? 'error' : 'warning'}
              sx={{ fontWeight: 700, height: 22, fontSize: '0.72rem' }}
            >
              {remainingMarks === 0
                ? 'All marks filled'
                : remainingMarks > 0
                  ? `${remainingMarks} Marks remaining`
                  : `${Math.abs(remainingMarks)} Marks over`}
            </Label>
          </Stack>
        </Stack>
      </Stack>

      {/* Panels */}
      <Box flex={1} minHeight={0}>
        {isDesktop ? (
          <Grid container spacing={1.5} sx={{ height: '100%' }}>
            <Grid size={{ xs: 12, lg: 2.75 }} sx={{ height: '100%', overflow: 'hidden' }}>
              {renderOutline()}
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ height: '100%', overflow: 'hidden' }}>
              {renderBuilder()}
            </Grid>
            <Grid size={{ xs: 12, lg: 3.25 }} sx={{ height: '100%', overflow: 'hidden' }}>
              {renderBank()}
            </Grid>
          </Grid>
        ) : isTablet ? (
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <TabContext value={panelTab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={(_, v) => setPanelTab(v)} variant="fullWidth">
                  <Tab label="Paper Outline" value="outline" />
                  <Tab label="Builder" value="builder" />
                  <Tab label="Question Bank" value="bank" />
                </TabList>
              </Box>
              <Box flex={1} minHeight={0}>
                <MuiTabPanel value="outline" sx={{ height: '100%', p: 0, overflow: 'hidden' }}>
                  {renderOutline()}
                </MuiTabPanel>
                <MuiTabPanel value="builder" sx={{ height: '100%', p: 0, overflow: 'hidden' }}>
                  {renderBuilder()}
                </MuiTabPanel>
                <MuiTabPanel value="bank" sx={{ height: '100%', p: 0, overflow: 'hidden' }}>
                  {renderBank()}
                </MuiTabPanel>
              </Box>
            </TabContext>
          </Card>
        ) : (
          <Stack spacing={1.25} height="100%" minHeight={0}>
            {renderBuilder()}
            {!readOnly && (
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mdi:library" width={16} />}
                onClick={() => setBankDrawerOpen(true)}
                sx={{ alignSelf: 'flex-start' }}
              >
                Open Question Bank
              </Button>
            )}
          </Stack>
        )}
      </Box>

      {/* Question Bank drawer for small screens */}
      <DrawerShell
        open={bankDrawerOpen}
        onClose={() => setBankDrawerOpen(false)}
        title="Question Bank"
      >
        {renderBank()}
      </DrawerShell>

      {/* Replace question drawer */}
      <QuestionReplaceDrawer
        open={Boolean(replaceQuestion)}
        onClose={() => setReplaceQuestion(null)}
        question={replaceQuestion}
        bankQuestions={bankQuestions}
        onReplace={handleReplace}
      />

      {/* Remove confirmation */}
      <ConfirmDialog
        open={Boolean(removeConfirmQuestion)}
        onClose={() => setRemoveConfirmQuestion(null)}
        title="Remove question?"
        content={`Remove “${removeConfirmQuestion?.questionText?.slice(0, 80) || 'this question'}” from the paper?`}
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              if (removeConfirmQuestion) onRemoveQuestion(removeConfirmQuestion.id);
              setRemoveConfirmQuestion(null);
            }}
          >
            Remove
          </Button>
        }
      />
    </Stack>
  );
}

/* ── Question card ─────────────────────────────────────────────────── */
function QuestionCard({
  question,
  number,
  sections,
  currentSectionId,
  readOnly,
  onReplace,
  onMove,
  onMoveToSection,
  onDuplicate,
  onRemoveRequest,
}: {
  question: QuestionItem;
  number: number;
  sections: SectionPattern[];
  currentSectionId: string;
  readOnly: boolean;
  onReplace: () => void;
  onMove: (questionId: string, direction: 'up' | 'down') => void;
  onMoveToSection: (questionId: string, targetSectionId: string) => void;
  onDuplicate: () => void;
  onRemoveRequest: () => void;
}) {
  const [moveMenuAnchor, setMoveMenuAnchor] = useState<null | HTMLElement>(null);
  const otherSections = sections.filter((s) => s.id !== currentSectionId);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Typography variant="subtitle2" fontWeight={800} sx={{ minWidth: 28 }}>
            Q{number}.
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.6, color: 'text.primary' }}>
            {question.questionText}
          </Typography>
          <Label
            variant="soft"
            color="primary"
            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
          >
            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
          </Label>
        </Stack>

        {/* Compact metadata row */}
        <Typography variant="caption" color="text.secondary" sx={{ pl: 4.5 }}>
          {[
            question.chapterName,
            DIFFICULTY_LABELS[question.difficultyLevel],
            BLOOM_LABELS[question.bloomLevel],
          ]
            .filter(Boolean)
            .join(' · ')}
        </Typography>

        {!readOnly && (
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
            <CustomTooltip title="Replace with a similar question">
              <IconButton size="small" color="primary" onClick={onReplace}>
                <Iconify icon="mdi:repeat" width={15} />
              </IconButton>
            </CustomTooltip>
            <CustomTooltip title="Move up">
              <span>
                <IconButton size="small" onClick={() => onMove(question.id, 'up')}>
                  <Iconify icon="mdi:chevron-up" width={15} />
                </IconButton>
              </span>
            </CustomTooltip>
            <CustomTooltip title="Move down">
              <span>
                <IconButton size="small" onClick={() => onMove(question.id, 'down')}>
                  <Iconify icon="mdi:chevron-down" width={15} />
                </IconButton>
              </span>
            </CustomTooltip>
            {otherSections.length > 0 && (
              <>
                <CustomTooltip title="Move to another section">
                  <IconButton size="small" onClick={(e) => setMoveMenuAnchor(e.currentTarget)}>
                    <Iconify icon="mdi:transfer" width={15} />
                  </IconButton>
                </CustomTooltip>
                <MoveMenu
                  anchorEl={moveMenuAnchor}
                  onClose={() => setMoveMenuAnchor(null)}
                  sections={otherSections}
                  onSelect={(sectionId) => {
                    onMoveToSection(question.id, sectionId);
                    setMoveMenuAnchor(null);
                  }}
                />
              </>
            )}
            <CustomTooltip title="Duplicate">
              <IconButton size="small" onClick={onDuplicate}>
                <Iconify icon="mdi:content-copy" width={15} />
              </IconButton>
            </CustomTooltip>
            <CustomTooltip title="Remove from paper">
              <IconButton size="small" color="error" onClick={onRemoveRequest}>
                <Iconify icon="mdi:delete-outline" width={15} />
              </IconButton>
            </CustomTooltip>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

function MoveMenu({
  anchorEl,
  onClose,
  sections,
  onSelect,
}: {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  sections: SectionPattern[];
  onSelect: (sectionId: string) => void;
}) {
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      {sections.map((s) => (
        <MenuItem key={s.id} onClick={() => onSelect(s.id)}>
          {s.sectionName}
        </MenuItem>
      ))}
    </Menu>
  );
}

/** Small reusable drawer shell used for the Question Bank on narrow screens. */
export function DrawerShell({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 1.5 } }}
    >
      <Stack spacing={1.25} height="100%">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <Iconify icon="mdi:close" width={18} />
          </IconButton>
        </Stack>
        <Box flex={1} minHeight={0}>
          {children}
        </Box>
      </Stack>
    </Drawer>
  );
}

function EmptyPatternHint() {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Iconify icon="mdi:widgets" width={32} color="text.disabled" />
      <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
        No sections configured
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Go back to Paper Pattern and add at least one section first.
      </Typography>
    </Box>
  );
}

function ProgressMetric({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={800}>
        {value}
      </Typography>
    </Stack>
  );
}
