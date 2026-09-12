import { Box, Typography } from '@mui/material';

export function OnboardingSettingsBreadcrumbInfo({
  title,
  description,
  items = [],
}: {
  title: string;
  description: string;
  items?: string[];
}) {
  return (
    <Box sx={{ p: 1.5, maxWidth: 340 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: items.length ? 1 : 0 }}
      >
        {description}
      </Typography>
      {items.length ? (
        <>
          <Typography variant="caption" fontWeight={700} color="text.primary">
            What you can manage
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mt: 0.25 } }}>
            {items.map((item) => (
              <Typography key={item} component="li" variant="caption" color="text.secondary">
                {item}
              </Typography>
            ))}
          </Box>
        </>
      ) : null}
    </Box>
  );
}
