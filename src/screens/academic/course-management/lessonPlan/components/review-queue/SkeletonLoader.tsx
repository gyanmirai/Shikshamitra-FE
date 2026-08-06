'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';

export const SkeletonCard = () => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: '12px',
      borderColor: 'divider',
      boxShadow: 'none',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
    }}
  >
    {/* Card Header Skeleton */}
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={16} />
      </Box>
      <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: '12px' }} />
    </Stack>

    {/* Metadata Grid Skeleton */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 1,
        p: 1.5,
        bgcolor: 'action.hover',
        borderRadius: 1,
      }}
    >
      <Box>
        <Skeleton variant="text" width="50%" height={14} />
        <Skeleton variant="text" width="80%" height={20} />
      </Box>
      <Box>
        <Skeleton variant="text" width="50%" height={14} />
        <Skeleton variant="text" width="80%" height={20} />
      </Box>
      <Box>
        <Skeleton variant="text" width="50%" height={14} />
        <Skeleton variant="text" width="70%" height={20} />
      </Box>
      <Box>
        <Skeleton variant="text" width="50%" height={14} />
        <Skeleton variant="text" width="70%" height={20} />
      </Box>
    </Box>

    {/* Lesson Details Skeleton */}
    <Stack spacing={1}>
      <Skeleton variant="text" width="90%" height={24} />
      <Skeleton variant="text" width="70%" height={18} />
      <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
    </Stack>

    {/* Footer Actions Skeleton */}
    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
      <Skeleton variant="rounded" width={80} height={32} />
      <Skeleton variant="rounded" width={100} height={32} />
    </Stack>
  </Card>
);

export const SkeletonCardGrid = ({ count = 6 }: { count?: number }) => (
  <Box
    sx={{
      display: 'grid',
      gap: 2,
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
    }}
  >
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </Box>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell><Skeleton variant="text" width={120} /></TableCell>
          <TableCell><Skeleton variant="text" width={100} /></TableCell>
          <TableCell><Skeleton variant="text" width={80} /></TableCell>
          <TableCell><Skeleton variant="text" width={90} /></TableCell>
          <TableCell><Skeleton variant="text" width={110} /></TableCell>
          <TableCell><Skeleton variant="text" width={150} /></TableCell>
          <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="text" width={100} />
              </Stack>
            </TableCell>
            <TableCell><Skeleton variant="rounded" width={80} height={22} /></TableCell>
            <TableCell><Skeleton variant="text" width={75} /></TableCell>
            <TableCell><Skeleton variant="text" width={85} /></TableCell>
            <TableCell><Skeleton variant="text" width={100} /></TableCell>
            <TableCell><Skeleton variant="text" width={140} /></TableCell>
            <TableCell align="right">
              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="circular" width={28} height={28} />
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default SkeletonCardGrid;
