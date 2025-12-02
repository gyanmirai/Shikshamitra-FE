import Box from '@mui/material/Box';
import Confetti from 'react-confetti';
import Stack from '@mui/material/Stack';
import { useWindowSize } from 'react-use';
import { useState, useEffect } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

interface SecurityScoreProps {
  score: number;
}

export default function SecurityScore({ score }: SecurityScoreProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (score === 100) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [score]);

  const getColor = (value: number) => {
    if (value < 30) return 'error';
    if (value < 70) return 'warning';
    return 'success';
  };

  const color = getColor(score);

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {showConfetti && (
        <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: '50%',
              bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.1),
              color: `${color}.main`,
            }}
          >
            <Iconify icon="solar:shield-check-bold" width={24} />
          </Box>
          <Box>
            <Typography variant="subtitle2">Permission Score</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {score === 100 ? 'Permission Master!' : 'Keep improving'}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h4" sx={{ color: `${color}.main` }}>
          {score}%
        </Typography>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          value={score}
          color={color}
          sx={{
            height: 10,
            borderRadius: 1,
            bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.1),
          }}
        />
      </Box>
    </Stack>
  );
}
