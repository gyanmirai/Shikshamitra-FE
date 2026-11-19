import { useRef, useState, useEffect } from 'react';
import { Box, Stack, Typography } from '@mui/material';

import { STUDENT_ICARD_FIELDS } from '../student-icard-design';
import { StudentConfiguredCardPreview } from './student-configured-card-preview';

import type { StudentCardPreviewProps } from './student-configured-card-preview';

export function StudentCardPreview({
  previewLegacyBack = false,
  ...props
}: StudentCardPreviewProps & { previewLegacyBack?: boolean }) {
  if (props.template.schemaVersion === 2) return <StudentConfiguredCardPreview {...props} />;

  const legacyFront = <LegacyStudentCardPreview {...props} />;
  return previewLegacyBack ? (
    <StudentConfiguredCardPreview {...props} legacyFront={legacyFront} />
  ) : (
    legacyFront
  );
}

function LegacyStudentCardPreview({ template, card, photoUrl }: StudentCardPreviewProps) {
  const vertical = template.orientation === 'Vertical';
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const cardWidth = vertical ? 260 : 420;
  const cardHeight = vertical ? 420 : 260;
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const measure = () => setAvailableWidth(element.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <Box
      ref={containerRef}
      role="img"
      aria-label={
        card?.studentSnapshot.StudentName
          ? `I-Card preview for ${card.studentSnapshot.StudentName}`
          : 'I-Card composition preview'
      }
      sx={{
        width: 1,
        minWidth: 0,
        position: 'relative',
        aspectRatio: `${cardWidth} / ${cardHeight}`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: cardWidth,
          height: cardHeight,
          transform: `scale(${availableWidth ? availableWidth / cardWidth : 0})`,
          transformOrigin: 'top left',
          bgcolor: template.backgroundColor,
          color: (theme) => theme.palette.getContrastText(template.backgroundColor),
          border: '1px solid',
          borderColor: template.primaryColor,
          borderRadius: 1.5,
          p: 2,
          boxSizing: 'border-box',
          boxShadow: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          noWrap
          sx={{ color: template.primaryColor, fontWeight: 700 }}
        >
          {template.schoolName || 'School Name'}
        </Typography>
        {template.schoolAddress && (
          <Typography variant="caption" noWrap display="block">
            {template.schoolAddress}
          </Typography>
        )}
        {template.presetKey !== 'minimal' && (
          <Box
            sx={{ borderTop: '2px solid', borderColor: template.primaryColor, mt: 0.5, mb: 1 }}
          />
        )}
        <Typography variant="caption" fontWeight={700}>
          {template.headerText}
        </Typography>
        <Stack direction={vertical ? 'column' : 'row'} spacing={1.5} sx={{ mt: 1 }}>
          {template.showPhoto && (
            <Box
              sx={{
                width: template.presetKey === 'photo-first' ? 108 : vertical ? 72 : 80,
                height: template.presetKey === 'photo-first' ? 112 : vertical ? 84 : 96,
                border: '1px solid',
                borderColor: template.primaryColor,
                borderRadius: template.presetKey === 'modern-student' ? '50%' : 1,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Typography variant="caption">{card?.hasPhoto ? 'PHOTO' : 'NO PHOTO'}</Typography>
              {photoUrl && (
                <Box
                  component="img"
                  src={photoUrl}
                  alt="Edited cardholder photo"
                  sx={{ width: 1, height: 1, objectFit: 'cover', gridArea: '1 / 1' }}
                />
              )}
            </Box>
          )}
          <Stack spacing={0.25} minWidth={0}>
            {template.fields.map((field) => (
              <Typography key={field} variant="caption" noWrap>
                <strong>
                  {STUDENT_ICARD_FIELDS.find((item) => item.key === field)?.label ?? field}:
                </strong>{' '}
                {card?.studentSnapshot[field] || '—'}
              </Typography>
            ))}
            {card?.cardNumber && card.cardNumber !== 'Preview' && (
              <Typography variant="caption">Card: {card.cardNumber}</Typography>
            )}
          </Stack>
          {template.showQrCode && (
            <Box
              sx={{
                width: 44,
                height: 44,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Typography variant="caption" color="text.primary">
                QR
              </Typography>
            </Box>
          )}
        </Stack>
        <Typography variant="caption" sx={{ display: 'block', mt: 1.5, fontSize: 10 }}>
          {template.footerText}
        </Typography>
      </Box>
    </Box>
  );
}
