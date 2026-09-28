import { Box, Card, Skeleton, Typography } from '@mui/material';

export default function SalaryTemplateSkeleton() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        p: { xs: 1, md: 2 },
        minWidth: 0,
        display: 'grid',
        gap: 3,
        '@media (prefers-reduced-motion: reduce)': {
          '& .MuiSkeleton-root, & .MuiSkeleton-root::after': { animation: 'none' },
        },
      }}
    >
      <Card variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}>
          Basic Information
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          <Skeleton height={48} sx={{ gridColumn: '1 / -1', borderRadius: 1 }} />
          {['name', 'description', 'salary-basis', 'protection-policy'].map((field) => (
            <Skeleton key={field} height={40} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Card>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {['Earnings', 'Deductions'].map((section) => (
          <Box key={section} sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="h6">{section}</Typography>
                <Skeleton variant="text" width={88} />
              </Box>
              <Skeleton width={112} height={30} sx={{ borderRadius: 1 }} />
            </Box>
            {[0, 1].map((row) => (
              <Card key={row} variant="outlined" sx={{ p: 2, display: 'grid', gap: 1 }}>
                <Skeleton variant="text" width="45%" />
                <Skeleton variant="text" width="70%" />
                <Skeleton height={40} sx={{ borderRadius: 1 }} />
              </Card>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
