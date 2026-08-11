import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Alert,
  Button,
  Drawer,
  Switch,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';

import type { AllocationStrategy, SeatingAllocationRules } from '../../types';

interface PreviewSummary {
  totalStudents: number;
  allocated: number;
  roomsUsed: number;
  remaining: number;
  emptySeats: number;
  utilization: number;
}

interface Props {
  open: boolean;
  rules: SeatingAllocationRules;
  onClose: () => void;
  onPreview: (rules: SeatingAllocationRules) => PreviewSummary;
  onApply: () => void;
  onCancelPreview: () => void;
}

const STRATEGIES: { value: AllocationStrategy; label: string; description: string; disabled?: boolean }[] = [
  { value: 'roll-number', label: 'Roll Number Order', description: 'Seat students sequentially by roll number' },
  { value: 'alphabetical', label: 'Alphabetical Order', description: 'Seat students A–Z by name' },
  { value: 'random', label: 'Random', description: 'Shuffle students across available seats' },
  { value: 'rank', label: 'Rank Order', description: 'Seat students by academic rank' },
  { value: 'alternate-division', label: 'Alternate Divisions', description: 'Interleave students from different divisions' },
  { value: 'alternate-class', label: 'Alternate Classes', description: 'Interleave students from different classes' },
  { value: 'ai-suggested', label: 'AI Suggested (coming soon)', description: 'Let AI optimize the seating layout', disabled: true },
];

const FILL_DIRECTIONS: { value: string; label: string; icon: string }[] = [
  { value: 'front-to-back', label: 'Front to Back', icon: 'mdi:arrow-down' },
  { value: 'back-to-front', label: 'Back to Front', icon: 'mdi:arrow-up' },
  { value: 'row-wise', label: 'Row Wise', icon: 'mdi:arrow-right' },
  { value: 'column-wise', label: 'Column Wise', icon: 'mdi:arrow-down-bold' },
  { value: 'aisle-wise', label: 'Aisle Wise', icon: 'mdi:swap-horizontal' },
];

const RULE_TOGGLES: {
  key: keyof Pick<SeatingAllocationRules, 'leaveGap' | 'mixDivisions' | 'specialRequirementPriority'>;
  icon: string;
  label: string;
  description: string;
}[] = [
    {
      key: 'leaveGap',
      icon: 'mdi:seat-outline',
      label: 'Leave one empty seat between students',
      description: 'Helps reduce copying by spacing students apart',
    },
    {
      key: 'mixDivisions',
      icon: 'mdi:account-group-outline',
      label: 'Keep same-division students separated',
      description: 'Avoids seating classmates from the same division together',
    },
    {
      key: 'specialRequirementPriority',
      icon: 'mdi:wheelchair-accessibility',
      label: 'Reserve front / accessible seats for special requirements',
      description: 'Prioritizes accessible seating for students who need it',
    },
  ];

export default function AllocationRuleDrawer({ open, rules, onClose, onPreview, onApply, onCancelPreview }: Props) {
  const theme = useTheme();
  const [localRules, setLocalRules] = useState<SeatingAllocationRules>(rules);
  const [preview, setPreview] = useState<PreviewSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    const result = onPreview(localRules);
    setPreview(result);
    setIsGenerating(false);
  };

  const handleClose = () => {
    setPreview(null);
    onCancelPreview();
    onClose();
  };

  const selectedStrategy = STRATEGIES.find((s) => s.value === localRules.strategy);
  const fullyAllocated = preview ? preview.remaining === 0 : false;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: 440, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <Iconify icon={preview ? 'mdi:check-decagram' : 'mdi:auto-fix'} width={22} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Auto Allocate
          </Typography>
          <Typography
            variant="body2"
            color={preview ? 'success.main' : 'text.secondary'}
            fontWeight={preview ? 600 : 400}
          >
            {preview ? 'Allocation Ready' : 'Configure rules to automatically seat students'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}>
          <Iconify icon="mdi:close" width={18} />
        </IconButton>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2.5 }}>
        {!preview ? (
          /* CONFIGURATION STATE */
          <>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5, fontWeight: 700 }}>
              Strategy
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={localRules.strategy}
              onChange={(e) => setLocalRules((r) => ({ ...r, strategy: e.target.value as AllocationStrategy }))}
              sx={{ mt: 1, mb: 0.75 }}
            >
              {STRATEGIES.map((s) => (
                <MenuItem key={s.value} value={s.value} disabled={s.disabled}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
            {selectedStrategy && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
                {selectedStrategy.description}
              </Typography>
            )}

            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5, fontWeight: 700 }}>
              Fill Direction
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={localRules.fillDirection}
              onChange={(e) => setLocalRules((r) => ({ ...r, fillDirection: e.target.value as any }))}
              sx={{ mt: 1, mb: 3 }}
            >
              {FILL_DIRECTIONS.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon={d.icon} width={16} />
                    {d.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5, fontWeight: 700 }}>
              Rules
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {RULE_TOGGLES.map((toggle) => {
                const checked = localRules[toggle.key];
                return (
                  <Box
                    key={toggle.key}
                    onClick={() => setLocalRules((r) => ({ ...r, [toggle.key]: !r[toggle.key] }))}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: checked ? alpha(theme.palette.primary.main, 0.4) : 'divider',
                      bgcolor: checked ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.4) },
                    }}
                  >
                    <Iconify
                      icon={toggle.icon}
                      width={20}
                      color={checked ? theme.palette.primary.main : theme.palette.text.secondary}
                      style={{ flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {toggle.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                        {toggle.description}
                      </Typography>
                    </Box>
                    <Switch
                      size="small"
                      checked={checked}
                      onChange={(e) => setLocalRules((r) => ({ ...r, [toggle.key]: e.target.checked }))}
                      onClick={(e) => e.stopPropagation()}
                      inputProps={{ 'aria-label': toggle.label }}
                    />
                  </Box>
                );
              })}
            </Box>
          </>
        ) : (
          /* RESULT STATE */
          <>
            {/* Status Alert Banner */}
            <Alert
              severity={fullyAllocated ? 'success' : 'warning'}
              icon={<Iconify icon={fullyAllocated ? 'mdi:check-circle-outline' : 'mdi:alert-outline'} width={22} />}
              sx={{
                mb: 3,
                borderRadius: 1.5,
                py: 0.75,
                '& .MuiAlert-message': { fontWeight: 600, fontSize: '0.9rem' },
              }}
            >
              {fullyAllocated
                ? 'All eligible students can be allocated.'
                : `${preview.remaining} student${preview.remaining > 1 ? 's' : ''} could not be allocated with current rules.`}
            </Alert>

            {/* Main Result & Progress Bar */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (t) =>
                  fullyAllocated ? alpha(t.palette.success.main, 0.06) : alpha(t.palette.warning.main, 0.06),
                border: '1px solid',
                borderColor: (t) =>
                  fullyAllocated ? alpha(t.palette.success.main, 0.25) : alpha(t.palette.warning.main, 0.25),
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  {preview.allocated} / {preview.totalStudents} students allocated
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color={fullyAllocated ? 'success.main' : 'warning.main'}
                >
                  {preview.totalStudents ? Math.round((preview.allocated / preview.totalStudents) * 100) : 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={preview.totalStudents ? Math.min(100, (preview.allocated / preview.totalStudents) * 100) : 0}
                color={fullyAllocated ? 'success' : 'warning'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Allocation Summary Section */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              Allocation Summary
            </Typography>

            <Box
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Students */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Students
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {preview.totalStudents}
                  </Typography>
                </Box>

                {/* Allocated (Visually Prioritized) */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (t) => alpha(t.palette.success.main, 0.05),
                  }}
                >
                  <Typography variant="body2" color="success.dark" fontWeight={600}>
                    Allocated
                  </Typography>
                  <Chip
                    size="small"
                    label={preview.allocated}
                    color="success"
                    variant="soft"
                    sx={{ fontWeight: 700, minWidth: 36 }}
                  />
                </Box>

                {/* Remaining (Visually Prioritized) */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (t) => (preview.remaining > 0 ? alpha(t.palette.warning.main, 0.05) : 'transparent'),
                  }}
                >
                  <Typography
                    variant="body2"
                    color={preview.remaining > 0 ? 'warning.dark' : 'text.secondary'}
                    fontWeight={600}
                  >
                    Remaining
                  </Typography>
                  <Chip
                    size="small"
                    label={preview.remaining}
                    color={preview.remaining > 0 ? 'warning' : 'default'}
                    variant="soft"
                    sx={{ fontWeight: 700, minWidth: 36 }}
                  />
                </Box>

                {/* Rooms Used */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Rooms Used
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {preview.roomsUsed}
                  </Typography>
                </Box>

                {/* Empty Seats */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Empty Seats
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {preview.emptySeats}
                  </Typography>
                </Box>

                {/* Utilization */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.75 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Utilization
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {preview.utilization}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* Sticky footer */}
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        {!preview ? (
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleGenerate}
            disabled={isGenerating}
            startIcon={<Iconify icon="mdi:play-circle-outline" width={20} />}
            sx={{ height: 44, fontWeight: 700 }}
          >
            {isGenerating ? 'Generating…' : 'Generate Allocation'}
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="medium"
              sx={{ flex: 1, height: 42, fontWeight: 600 }}
              onClick={() => setPreview(null)}
              startIcon={<Iconify icon="mdi:tune" width={18} />}
            >
              Adjust Rules
            </Button>
            <Button
              variant="contained"
              size="medium"
              color="primary"
              sx={{ flex: 1.2, height: 42, fontWeight: 700 }}
              onClick={() => {
                onApply();
                handleClose();
              }}
              startIcon={<Iconify icon="mdi:check-circle-outline" width={18} />}
            >
              Apply Allocation
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
