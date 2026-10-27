import { useState } from 'react';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { Box, Dialog, IconButton, DialogContent } from '@mui/material';

import type { IImageSliderProps } from '../type';

export const ImageSlider = ({ images, open, onClose }: IImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <IconButton
          onClick={handlePrev}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: (theme) => theme.vars.palette.grey[500],
            color: 'white',
            '&:hover': { background: (theme) => theme.vars.palette.grey[600] },
          }}
        >
          <ArrowBack />
        </IconButton>
        <Box
          component="img"
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          sx={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain' }}
        />
        <IconButton
          onClick={handleNext}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: (theme) => theme.vars.palette.grey[500],
            color: 'white',
            '&:hover': { background: (theme) => theme.vars.palette.grey[600] },
          }}
        >
          <ArrowForward />
        </IconButton>
      </DialogContent>
    </Dialog>
  );
};
