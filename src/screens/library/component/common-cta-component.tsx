import React from 'react';
import { Box, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles/utils';

interface CommonCtaComponentProps {
  bookHandler: () => void;
  issueBookHandler: () => void;
  returnBookHandler: () => void;
  createReservationHandler: () => void;
}

const CommonCtaComponent: React.FC<CommonCtaComponentProps> = ({
  bookHandler,
  issueBookHandler,
  returnBookHandler,
  createReservationHandler,
}) => {
  const data = [];
  return (
    <Box display="flex" flexDirection="row" gap={2} justifyContent="flex-end">
      {/* <Button

                startIcon={<Iconify icon="fluent-mdl2:reservation-orders" />}
                variant="contained"
                color="primary"
                sx={{
                    backgroundColor: (theme) =>
                        varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                    color: 'primary.main',
                    '&:hover': {
                        backgroundColor: (theme) =>
                            varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                    },
                }}
                onClick={createReservationHandler}


            >

                Make Reservation
            </Button> */}

      <Button
        startIcon={<Iconify icon="iconoir:book" />}
        variant="contained"
        color="warning"
        sx={{
          backgroundColor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.1),
          color: 'warning.main',
          '&:hover': {
            backgroundColor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.1),
          },
        }}
        onClick={bookHandler}
      >
        Add New Book
      </Button>
      <Button
        startIcon={<Iconify icon="mingcute:book-5-line" />}
        variant="contained"
        color="success"
        sx={{
          backgroundColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
          color: 'primary.main',
          '&:hover': {
            backgroundColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
          },
        }}
        onClick={issueBookHandler}
      >
        Issue Book
      </Button>
      <Button
        startIcon={<Iconify icon="carbon:return" />}
        variant="contained"
        sx={{
          backgroundColor: alpha('#ff5630', 0.1), // Lightened background using 10% opacity
          color: '#ff5630', // Text color
          '&:hover': {
            backgroundColor: alpha('#ff5630', 0.2), // Slightly darker background on hover
          },
        }}
        onClick={returnBookHandler}
      >
        Return Book
      </Button>
    </Box>
  );
};

export default CommonCtaComponent;
