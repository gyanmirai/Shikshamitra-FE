import { varAlpha } from 'src/theme/styles';
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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" mb={2}>
            Basic Information
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
              columnGap: 2,
              rowGap: 3,
            }}
          >
            {['name', 'description', 'salary-basis', 'protection-policy'].map((field) => (
              <Skeleton key={field} height={40} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        </Card>
        <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" mb={2}>
            Statutory Defaults
          </Typography>
          <Skeleton width="70%" height={32} />
          <Skeleton height={40} sx={{ my: 2, borderRadius: 1 }} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </Card>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {['Earnings', 'Deductions'].map((section) => (
          <Card
            key={section}
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              minWidth: 0,
              height: { xs: 'auto', lg: 480 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                pb: 1,
                borderBottom: 2,
                borderColor: (theme) =>
                  varAlpha(
                    theme.vars.palette[section === 'Earnings' ? 'success' : 'warning'].mainChannel,
                    0.4
                  ),
              }}
            >
              <Typography variant="h6">{section}</Typography>
              <Skeleton width={112} height={30} sx={{ borderRadius: 1 }} />
            </Box>
            {[0, 1, 2, 3].map((row) => (
              <Box
                key={row}
                sx={{
                  py: 1.5,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 112px 44px',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box>
                  <Skeleton variant="text" width="65%" />
                  <Skeleton variant="text" width="85%" />
                </Box>
                <Skeleton height={40} sx={{ borderRadius: 1 }} />
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  sx={{ justifySelf: 'center' }}
                />
              </Box>
            ))}
          </Card>
        ))}
      </Box>
      {['Sample calculation'].map((section) => (
        <Card key={section} variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            {section}
          </Typography>
          <Skeleton variant="text" width="70%" />
          <Skeleton height={40} sx={{ borderRadius: 1 }} />
        </Card>
      ))}
    </Box>
  );
}
