'use client';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  List,
  Stack,
  Alert,
  Button,
  Drawer,
  Divider,
  ListItem,
  TextField,
  Typography,
  IconButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import type { LessonPlanRow } from '../lessonPlanData';

type AiAction =
  | 'generate_plan'
  | 'suggest_activity'
  | 'generate_homework'
  | 'generate_resources'
  | 'improve_objective'
  | 'diary_summary'
  | 'review_quality'
  | 'parent_update'
  | 'teaching_method'
  | 'planned_vs_actual';

const AI_ACTIONS: { key: AiAction; label: string; icon: string; description: string }[] = [
  {
    key: 'generate_plan',
    label: 'Generate Lesson Plan',
    icon: 'mdi:file-document-plus-outline',
    description: 'AI creates a complete lesson plan from subject, chapter, and topic',
  },
  {
    key: 'improve_objective',
    label: 'Improve Objective',
    icon: 'mdi:target',
    description: 'AI rewrites learning objective for clarity and measurability',
  },
  {
    key: 'suggest_activity',
    label: 'Suggest Activity',
    icon: 'mdi:school-outline',
    description: 'AI suggests classroom activities suitable for the topic',
  },
  {
    key: 'generate_homework',
    label: 'Generate Homework',
    icon: 'mdi:home-edit-outline',
    description: 'AI generates homework ideas aligned to the lesson',
  },
  {
    key: 'generate_resources',
    label: 'Suggest Resources',
    icon: 'mdi:bookshelf',
    description: 'AI recommends worksheets, videos, and materials',
  },
  {
    key: 'teaching_method',
    label: 'Best Teaching Method',
    icon: 'mdi:head-lightbulb-outline',
    description: 'AI recommends the most effective teaching method for this topic',
  },
  {
    key: 'diary_summary',
    label: 'Generate Diary Summary',
    icon: 'mdi:text-box-edit-outline',
    description: 'AI converts brief notes into a professional diary entry',
  },
  {
    key: 'review_quality',
    label: 'Review Plan Quality',
    icon: 'mdi:star-check-outline',
    description: 'AI scores lesson plan quality and suggests improvements',
  },
  {
    key: 'planned_vs_actual',
    label: 'Compare Planned vs Actual',
    icon: 'mdi:swap-horizontal',
    description: 'AI analyzes gaps between planned and actual teaching',
  },
  {
    key: 'parent_update',
    label: 'Generate Parent Update',
    icon: 'mdi:account-child-outline',
    description: 'AI creates a parent-friendly summary from approved diary',
  },
];

// Mock AI responses by action
const MOCK_RESPONSES: Record<AiAction, string> = {
  generate_plan: `**Learning Objective:** Students will understand how to add like and unlike fractions using LCM.

**Teaching Method:** Activity Based + Board Work

**Introduction (5 min):**
Show fraction strips and ask students to combine equal parts. Ask: "What happens when denominators are different?"

**Explanation Flow:**
1. Revise numerator and denominator concepts
2. Explain like fractions with board examples
3. Introduce LCM method for unlike fractions
4. Solve 3 worked examples on board
5. Student practice round

**Practice Questions:**
• 1/4 + 2/4 = ?
• 1/3 + 1/6 = ?
• 2/5 + 3/10 = ?

**Homework Idea:**
Solve Exercise 3.1, Q1–Q8 from textbook

**Assessment Check:**
Ask each student to solve one unlike fraction example independently before class ends.

**Closure Summary:**
Addition of fractions requires same denominators. Use LCM to convert before adding.`,

  improve_objective:
    'REVISED: By the end of this lesson, students will be able to add two unlike fractions by finding the LCM of denominators and converting them to like fractions, with at least 80% accuracy on the practice worksheet.',

  suggest_activity: `**Fraction War Activity (10 minutes):**
1. Give each pair of students a set of fraction cards
2. Each student draws 2 cards and must add the fractions shown
3. The student with the higher sum wins the round
4. Teacher circulates and helps with LCM calculation

**Fraction Strip Visual:**
Using paper strips divided into equal parts, students physically combine strips to see the addition result.`,

  generate_homework: `**Homework: Fraction Addition Practice**

Level 1 (Like fractions):
1. 2/7 + 3/7 = ___
2. 5/11 + 4/11 = ___

Level 2 (Unlike fractions):
1. 1/3 + 1/4 = ___
2. 2/5 + 1/3 = ___

Bonus: Write a word problem using unlike fractions and solve it.`,

  generate_resources: `**Recommended Resources:**
• **Textbook:** Chapter 3, Pages 42–48
• **Worksheet:** Fraction Addition Drill Sheet (attached)
• **Video:** Khan Academy - Adding Fractions with Different Denominators
• **Flashcards:** LCM reference cards for quick practice
• **Lab material:** Paper fraction strips (printable template available)
• **Digital:** Desmos Fraction Explorer tool`,

  teaching_method: `**Recommended: Activity Based + Visual Demonstration**

For Fractions (Addition), research shows:
✓ Visual fraction strips improve concept retention by 35%
✓ Peer practice in pairs increases engagement
✓ Board work with step-by-step LCM calculation prevents common errors

**Avoid:** Pure lecture-based for this topic — students need to "see" fractions to understand them.`,

  diary_summary: `**Professional Diary Summary:**

Today, students were introduced to addition of like and unlike fractions. The class began with a fraction strip visual activity where students combined paper strips to observe the concept physically. Most students understood like fraction addition quickly.

For unlike fractions, the LCM method was introduced using three board examples. Approximately 85% of students demonstrated understanding during the practice round. Four students (Aarav, Priya, Mohan, and Sunita) required additional explanation and will receive a follow-up worksheet.

Homework was assigned: Exercise 3.1, Q1–Q8. Next class will focus on fraction subtraction.`,

  review_quality: `**Lesson Plan Quality Score: 82/100**

✅ Clear learning objective
✅ Teaching method specified
✅ Activity included
✅ Homework assigned
✅ Syllabus chapter linked

⚠️ Needs improvement:
• Assessment check is vague — add a specific exit ticket
• Resources list is incomplete — attach worksheet
• Time allocation per section not specified

**Recommendation:** Add a 2-minute exit ticket activity and attach the fraction worksheet to reach 90+ quality score.`,

  planned_vs_actual: `**Planned vs Actual Analysis:**

| Parameter | Planned | Actual |
|-----------|---------|--------|
| Topic | Addition of Fractions | Like fractions only |
| Completion % | 40% | 30% |
| Method | Board Work | Board Work ✓ |

**AI Insight:**
Actual coverage is 10% lower than planned. Unlike fractions were not covered due to time constraints.

**Recommendation:**
Schedule one additional 20-minute period to complete unlike fractions before moving to subtraction. Consider combining the next two topics.`,

  parent_update: `**Parent Update — Mathematics | Class 7-A**
Date: Today

Dear Parent,

Today in Mathematics, your child practiced **addition of fractions**. We worked on adding fractions that have the same denominator (like fractions) and learned a step-by-step method for different denominators using LCM.

**Homework assigned:** Exercise 3.1, Questions 1 to 8 in the textbook.

**How you can help:** Ask your child to explain "What is LCM?" and solve one example together at home.

Next class: We will continue with unlike fractions.`,
};

type Props = {
  open: boolean;
  onClose: () => void;
  contextPlan?: LessonPlanRow | null;
  onInsertContent?: (action: AiAction, content: string) => void;
};

const AiLessonBuilderDrawer = ({ open, onClose, contextPlan, onInsertContent }: Props) => {
  const [selectedAction, setSelectedAction] = useState<AiAction | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<{ action: string; result: string }[]>([]);

  const runAi = async () => {
    if (!selectedAction) return;
    setLoading(true);
    setResult('');
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1500));
    const response = MOCK_RESPONSES[selectedAction];
    setResult(response);
    setHistory((prev) => [
      {
        action: AI_ACTIONS.find((a) => a.key === selectedAction)?.label || selectedAction,
        result: response,
      },
      ...prev,
    ]);
    setLoading(false);
  };

  const handleInsert = () => {
    if (selectedAction && result && onInsertContent) {
      onInsertContent(selectedAction, result);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 }, display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'secondary.darker', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="mdi:robot-outline" width={22} />
              <Typography variant="h6" fontWeight={700}>
                AI Lesson Builder
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              AI-powered lesson planning & diary assistant
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
      </Box>

      {/* Context banner */}
      {contextPlan && (
        <Box sx={{ px: 2, py: 1, bgcolor: 'secondary.lighter' }}>
          <Typography variant="caption" color="secondary.dark">
            Context: {contextPlan.subjectName} — {contextPlan.chapterName} — {contextPlan.topic}
          </Typography>
        </Box>
      )}

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Stack spacing={2}>
          {/* Action selector */}
          <Typography variant="subtitle2" color="text.secondary">
            Select AI Action
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
            }}
          >
            {AI_ACTIONS.map((action) => (
              <Box
                key={action.key}
                onClick={() => {
                  setSelectedAction(action.key);
                  setResult('');
                }}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  border: '1.5px solid',
                  borderColor: selectedAction === action.key ? 'secondary.main' : 'divider',
                  bgcolor: selectedAction === action.key ? 'secondary.lighter' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: 'secondary.main', bgcolor: 'secondary.lighter' },
                }}
              >
                <Iconify
                  icon={action.icon}
                  width={18}
                  color={selectedAction === action.key ? 'secondary.main' : 'text.secondary'}
                  sx={{ mb: 0.5 }}
                />
                <Typography
                  variant="caption"
                  display="block"
                  fontWeight={600}
                  sx={{ lineHeight: 1.3 }}
                >
                  {action.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {selectedAction && (
            <>
              <Alert severity="info" sx={{ py: 0.75 }}>
                <Typography variant="caption">
                  {AI_ACTIONS.find((a) => a.key === selectedAction)?.description}
                </Typography>
              </Alert>

              <TextField
                size="small"
                label="Additional context (optional)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                placeholder="Add specific instructions or context for the AI..."
              />

              <Button
                variant="contained"
                color="secondary"
                onClick={runAi}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Iconify icon="mdi:robot-outline" />
                  )
                }
              >
                {loading ? 'Generating...' : 'Generate with AI'}
              </Button>
            </>
          )}

          {/* Result */}
          {result && (
            <>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">AI Response</Typography>
                <Stack direction="row" spacing={0.75}>
                  <Chip label="AI Generated" size="small" color="secondary" variant="soft" />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigator.clipboard?.writeText(result)}
                    startIcon={<Iconify icon="mdi:content-copy" width={14} />}
                  >
                    Copy
                  </Button>
                  {onInsertContent && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleInsert}
                      startIcon={<Iconify icon="mdi:check" width={14} />}
                    >
                      Use This
                    </Button>
                  )}
                </Stack>
              </Stack>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  maxHeight: 360,
                  overflow: 'auto',
                }}
              >
                {result}
              </Box>
            </>
          )}

          {/* History */}
          {history.length > 0 && (
            <>
              <Divider />
              <Typography variant="subtitle2" color="text.secondary">
                Recent AI Generations
              </Typography>
              <List dense>
                {history.slice(0, 3).map((item, i) => (
                  <ListItem
                    key={i}
                    sx={{
                      px: 1,
                      py: 0.5,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      mb: 0.5,
                      cursor: 'pointer',
                    }}
                    onClick={() => setResult(item.result)}
                    secondaryAction={
                      <IconButton size="small" onClick={() => setResult(item.result)}>
                        <Iconify icon="mdi:eye-outline" width={16} />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={item.action}
                      primaryTypographyProps={{ variant: 'caption', fontWeight: 600 }}
                      secondary={`${item.result.substring(0, 60)}...`}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Stack>
      </Box>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.disabled" textAlign="center" display="block">
          AI content requires human review before submission. Always verify accuracy.
        </Typography>
      </Box>
    </Drawer>
  );
};

export default AiLessonBuilderDrawer;
