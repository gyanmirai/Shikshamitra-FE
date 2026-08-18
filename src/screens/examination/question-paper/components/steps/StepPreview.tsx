'use client';

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Stack, Button, Typography, DialogActions } from '@mui/material';

import { QUESTION_TYPE_LABELS } from '../../constants';
import type { QuestionPaperMetadata, SectionPattern } from '../../types';

interface StepPreviewProps {
  paper: QuestionPaperMetadata | null;
  sections: SectionPattern[];
  /** Server-rendered print HTML when available (existing preview API). */
  printHtml?: string;
  /** True while the preview document is being fetched. */
  isLoading?: boolean;
  previewActions?: React.ReactNode;
}

export default function StepPreview({
  paper,
  sections,
  printHtml,
  isLoading = false,
  previewActions,
}: StepPreviewProps) {
  const printRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: paper?.paperTitle || 'Question_Paper',
  });

  const allQuestions = sections.flatMap((sec) => sec.questions || []);

  return (
    <Stack spacing={2} sx={{ width: '100%', flex: 1, minHeight: 0 }}>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          Preview Question Paper
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is how the final paper will look for students.
        </Typography>
      </Box>

      <Scrollbar sx={{ height: 'calc(100vh - 340px)', minHeight: 360, pr: 1 }}>
        <Box
          ref={printRef}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: '#ffffff',
            color: '#1a1a1a',
            minHeight: 600,
            boxShadow: (t) => `0 12px 36px -12px ${alpha(t.palette.common.black, 0.1)}`,
          }}
        >
          {allQuestions.length > 0 ? (
            <RenderedPaper paper={paper} sections={sections} />
          ) : printHtml ? (
            <Box dangerouslySetInnerHTML={{ __html: printHtml }} />
          ) : isLoading ? (
            <PreviewSkeleton label="Generating official print preview document…" />
          ) : (
            <RenderedPaper paper={paper} sections={sections} />
          )}
        </Box>
      </Scrollbar>

      {previewActions ?? (
        <DialogActions sx={{ px: 0 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:printer-outline" width={16} />}
            onClick={() => handlePrint()}
          >
            Print / Download PDF
          </Button>
        </DialogActions>
      )}
    </Stack>
  );
}

/** Local fallback render of the paper when the server preview is not available. */
function RenderedPaper({
  paper,
  sections,
}: {
  paper: QuestionPaperMetadata | null;
  sections: SectionPattern[];
}) {
  const allQuestions = sections.flatMap((sec) => sec.questions || []);

  return (
    <Stack spacing={2.5}>
      <Box sx={{ textAlign: 'center', pb: 2, borderBottom: '2px solid #1a1a1a' }}>
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
        >
          {paper?.paperTitle || 'Untitled Question Paper'}
        </Typography>
        <Typography variant="subtitle2" fontWeight={600} mt={0.5}>
          {paper?.standardName || 'Class'} &nbsp;•&nbsp; {paper?.subjectName || 'Subject'}
          {paper?.examTitle ? ` • ${paper.examTitle}` : ''}
        </Typography>
        <Stack
          direction="row"
          justifyContent="space-between"
          mt={2}
          sx={{ px: 2, py: 1, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 1.5 }}
        >
          <Typography variant="caption" fontWeight={700}>
            TIME: {paper?.durationMinutes ?? '—'} MINUTES
          </Typography>
          <Typography variant="caption" fontWeight={700}>
            MAX. MARKS: {paper?.totalMarks ?? '—'}
          </Typography>
        </Stack>
      </Box>

      {paper?.generalInstructions && (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: 'rgba(0,0,0,0.03)',
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            display="block"
            mb={0.5}
          >
            General Instructions:
          </Typography>
          <Typography
            variant="caption"
            component="div"
            sx={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '0.78rem' }}
          >
            {paper.generalInstructions}
          </Typography>
        </Box>
      )}

      {sections.map((section) => {
        const startIndex = sections
          .slice(0, sections.indexOf(section))
          .reduce((s, sec) => s + (sec.questions?.length || 0), 0);
        return (
          <Box key={section.id}>
            <Box
              sx={{
                textAlign: 'center',
                pb: 1,
                mb: 1.5,
                borderBottom: '1px solid rgba(0,0,0,0.12)',
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={800}
                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {section.sectionName}
              </Typography>
              <Typography variant="caption" display="block">
                {section.questionType ? QUESTION_TYPE_LABELS[section.questionType] : ''}
                {section.instructions ? ` — ${section.instructions}` : ''}
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {(section.questions || []).length} × {section.marksPerQuestion ?? 1} ={' '}
                {section.marks} Marks
              </Typography>
            </Box>
            <Stack spacing={1.5}>
              {(section.questions || []).map((q, idx) => (
                <Stack
                  key={q.id || idx}
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'flex-start' }}
                >
                  <Typography variant="body2" fontWeight={700} sx={{ minWidth: 30 }}>
                    Q{startIndex + idx + 1}.
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.7 }}>
                    {q.questionText}
                  </Typography>
                  <Typography variant="caption" fontWeight={700}>
                    [{q.marks}]
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        );
      })}

      {allQuestions.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 8 }}>
          No questions added yet — the preview will populate as you add questions.
        </Typography>
      )}
    </Stack>
  );
}

function PreviewSkeleton({ label }: { label: string }) {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Iconify icon="mdi:loading" width={32} color="text.disabled" className="spin" />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}
