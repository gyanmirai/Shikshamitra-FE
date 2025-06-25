import React, { useRef, useState, useEffect } from 'react';

import { Box, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

const DetailRow = ({ icon, label, value, color }: any) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }
  }, [value]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
      {icon && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon={icon} sx={{ color, mt: 0.4 }} />
            <Typography variant="subtitle2">{label}</Typography>
          </Box>

          <Box ml={3.5}>
            <Typography
              ref={contentRef}
              variant="body2"
              color="text.primary"
              sx={{
                textAlign: 'justify',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: showFullDescription ? 'unset' : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {value}
            </Typography>

            {isOverflowing && (
              <Button
                onClick={() => setShowFullDescription((prev) => !prev)}
                sx={{
                  color: 'primary.main',
                  p: 0,
                  '&:hover': {
                    background: 'none',
                  },
                }}
              >
                {showFullDescription ? 'Show Less' : 'Show More'}
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DetailRow;
