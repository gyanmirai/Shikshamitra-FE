'use client';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { useAIRoomAssistant } from '../roomAvailability.hooks';

import type { ReservationRequirements } from '../types';

const EXAMPLE_COMMANDS = [
  'Book a room for 9-A Physics Practical on Friday Period 3 with 30 students.',
  'Find a free lab for Grade 8 tomorrow morning.',
  'Suggest the best room for parent meeting with 80 people.',
  'Why is Physics Lab not available?',
  'Show underused rooms this week.',
];

interface AIRoomAssistantPanelProps {
  onApplyToForm?: (parsed: Partial<ReservationRequirements>) => void;
  onReserveRoom?: (roomId: string) => void;
}

export const AIRoomAssistantPanel = ({
  onApplyToForm,
  onReserveRoom,
}: AIRoomAssistantPanelProps) => {
  const [command, setCommand] = useState('');
  const { data, isLoading, error, parse, reset } = useAIRoomAssistant();

  const handleParse = async () => {
    if (!command.trim()) return;
    await parse(command.trim());
  };

  const handleApplyToForm = () => {
    if (!data) return;
    const parsed: Partial<ReservationRequirements> = {
      reservationType: data.reservationType,
      purpose: data.purpose,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      requiredCapacity: data.requiredCapacity,
      roomType: data.roomType,
      requiredFacilities: data.requiredFacilities || [],
      reservedFor: data.reservedFor,
      subject: data.subject,
      aiCommand: command,
    };
    onApplyToForm?.(parsed);
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'primary.light',
        bgcolor: 'primary.lighter',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Iconify icon="mdi:robot-outline" width={22} color="primary.main" />
        <Typography variant="subtitle1" fontWeight={700} color="primary.main">
          AI Room Assistant
        </Typography>
        <Chip
          size="small"
          label="Beta"
          color="primary"
          variant="soft"
          sx={{ fontSize: 10, height: 18 }}
        />
      </Stack>

      <TextField
        size="small"
        fullWidth
        multiline
        rows={2}
        placeholder="Describe what you need in plain language…"
        value={command}
        onChange={(e) => {
          setCommand(e.target.value);
          if (data) reset();
        }}
        sx={{ bgcolor: 'background.paper', mb: 1 }}
        InputProps={{
          endAdornment: command ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => {
                  setCommand('');
                  reset();
                }}
              >
                <Iconify icon="mdi:close" width={16} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Example prompts */}
      {!data && !isLoading && (
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
            Try:
          </Typography>
          {EXAMPLE_COMMANDS.map((ex) => (
            <Chip
              key={ex}
              size="small"
              label={ex.length > 50 ? `${ex.slice(0, 50)}…` : ex}
              onClick={() => setCommand(ex)}
              variant="outlined"
              sx={{ cursor: 'pointer', fontSize: 11, maxWidth: 300 }}
            />
          ))}
        </Stack>
      )}

      <Button
        fullWidth
        variant="contained"
        startIcon={
          isLoading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="mdi:robot" />
        }
        onClick={handleParse}
        disabled={isLoading || !command.trim()}
      >
        {isLoading ? 'Analyzing…' : 'Ask AI'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      )}

      {data && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 1.5 }} />

          {/* Confidence */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Iconify icon="mdi:check-circle" width={18} color="success.main" />
            <Typography variant="body2" color="success.dark">
              Parsed with {Math.round(data.confidence * 100)}% confidence
            </Typography>
          </Stack>

          {/* Explanation */}
          {data.explanation && (
            <Alert
              severity="info"
              icon={<Iconify icon="mdi:information" />}
              sx={{ mb: 1.5, fontSize: 12 }}
            >
              {data.explanation}
            </Alert>
          )}

          {/* Parsed Fields */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              mb: 1.5,
            }}
          >
            <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 1 }}>
              Parsed Requirements
            </Typography>
            {[
              { label: 'Type', value: data.reservationType },
              { label: 'Purpose', value: data.purpose },
              { label: 'Date', value: data.date },
              {
                label: 'Time',
                value:
                  data.startTime && data.endTime
                    ? `${data.startTime} – ${data.endTime}`
                    : undefined,
              },
              {
                label: 'Capacity',
                value: data.requiredCapacity ? `${data.requiredCapacity} seats` : undefined,
              },
              { label: 'Room Type', value: data.roomType },
              { label: 'Class', value: data.reservedFor },
              { label: 'Subject', value: data.subject },
            ]
              .filter((f) => f.value)
              .map(({ label, value }) => (
                <Stack key={label} direction="row" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
                    {label}
                  </Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {value}
                  </Typography>
                </Stack>
              ))}
          </Box>

          {/* Suggested Rooms */}
          {data.suggestedRooms && data.suggestedRooms.length > 0 && (
            <Box>
              <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 1 }}>
                Suggested Rooms
              </Typography>
              <Stack spacing={1}>
                {data.suggestedRooms.slice(0, 2).map((room) => (
                  <Stack
                    key={room.roomId}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography variant="caption" fontWeight={600}>
                        {room.roomName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {room.buildingName} · {room.capacity} seats
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={`${room.matchScore}%`}
                        color="success"
                        variant="soft"
                        sx={{ fontSize: 10, height: 18 }}
                      />
                      {onReserveRoom && (
                        <Tooltip title="Reserve this room">
                          <IconButton size="small" onClick={() => onReserveRoom(room.roomId)}>
                            <Iconify icon="mdi:calendar-plus" width={15} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            {onApplyToForm && (
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:form-select" />}
                onClick={handleApplyToForm}
              >
                Apply to Form
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="mdi:refresh" />}
              onClick={() => {
                reset();
                setCommand('');
              }}
            >
              New Query
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};
