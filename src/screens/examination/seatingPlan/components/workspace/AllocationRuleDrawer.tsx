import { useState } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Alert,
  Button,
  Drawer,
  Switch,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

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
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handlePreview = () => {
    setIsPreviewing(true);
    // Simulated latency-free computation, but keep a tick so the button shows feedback.
    const result = onPreview(localRules);
    setPreview(result);
    setIsPreviewing(false);
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
          gap: 1,
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
          <Iconify icon="mdi:auto-fix" width={22} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Auto Allocate
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure rules to automatically seat students
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}>
          <Iconify icon="mdi:close" width={18} />
        </IconButton>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2.5 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5 }}>
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

        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5 }}>
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

        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5 }}>
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
                  gap: 1,
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: checked ? alpha(theme.palette.primary.main, 0.4) : 'divider',
                  bgcolor: checked ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
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
                  <Typography variant="caption" color="text.secondary">
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

        {preview && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2.5 }} />
            <Alert
              severity={fullyAllocated ? 'success' : 'warning'}
              icon={<Iconify icon={fullyAllocated ? 'mdi:check-circle-outline' : 'mdi:alert-outline'} width={20} />}
              sx={{ mb: 2 }}
            >
              {fullyAllocated
                ? 'All eligible students can be allocated.'
                : `${preview.remaining} students could not be allocated with current rooms/rules.`}
            </Alert>

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Allocation progress
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {preview.allocated} / {preview.totalStudents}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={preview.totalStudents ? Math.min(100, (preview.allocated / preview.totalStudents) * 100) : 0}
                color={fullyAllocated ? 'success' : 'warning'}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip size="small" variant="outlined" label={`Total: ${preview.totalStudents}`} />
              <Chip size="small" color="success" variant="soft" label={`Allocated: ${preview.allocated}`} />
              <Chip
                size="small"
                color={preview.remaining > 0 ? 'warning' : 'default'}
                variant="soft"
                label={`Remaining: ${preview.remaining}`}
              />
              <Chip size="small" variant="outlined" label={`Rooms used: ${preview.roomsUsed}`} />
              <Chip size="small" variant="outlined" label={`Empty seats: ${preview.emptySeats}`} />
              <Chip size="small" color="info" variant="soft" label={`Utilization: ${preview.utilization}%`} />
            </Box>
          </Box>
        )}
      </Box>

      {/* Sticky footer */}
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        {!preview ? (
          <Button
            variant="outlined"
            fullWidth
            size="medium"
            onClick={handlePreview}
            disabled={isPreviewing}
            startIcon={<Iconify icon="mdi:eye-outline" width={18} />}
          >
            {isPreviewing ? 'Calculating…' : 'Preview Allocation'}
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="text"
              size="small"
              onClick={() => setPreview(null)}
              startIcon={<Iconify icon="mdi:tune" width={16} />}
            >
              Adjust Rules
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ flex: 1 }}
              onClick={() => {
                onApply();
                handleClose();
              }}
              startIcon={<Iconify icon="mdi:check" width={16} />}
            >
              Apply Allocation
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
