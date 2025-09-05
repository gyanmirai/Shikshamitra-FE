import type { BoxProps } from '@mui/material/Box';
import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { varAlpha } from 'src/theme/styles';
import { Image } from 'src/components/image';
import Autoplay from 'embla-carousel-autoplay';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { fShortenNumber } from 'src/utils/format-number';
import { Label, labelClasses } from 'src/components/label';
import { Carousel, useCarousel, CarouselArrowBasicButtons } from 'src/components/carousel';

import type { IPopularBook } from './dashboard_interface';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  title: string;
  list: IPopularBook[];
};

export function PopularBooks({ title, list, ...other }: Props) {
  const carousel = useCarousel(
    {
      align: 'start',
      slideSpacing: '24px',
      slidesToShow: { xs: 1, sm: 2, md: 3, lg: '40%', xl: '30%' },
      loop: true,
    },
    [Autoplay({ playOnInit: true, delay: 3000 })]
  );

  return (
    <Box {...other}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <CarouselArrowBasicButtons {...carousel.arrows} />
      </Box>

      <Carousel
        carousel={carousel}
        slotProps={{
          slide: { py: 3 },
        }}
        sx={{ px: 0.5 }}
      >
        {list.map((item) => (
          <CarouselItem key={item.bookId} item={item} />
        ))}
      </Carousel>
    </Box>
  );
}

// ----------------------------------------------------------------------

type CarouselItemProps = CardProps & {
  item: Props['list'][number];
};

function CarouselItem({ item, ...other }: CarouselItemProps) {
  const theme = useTheme();

  const renderImage = (
    <Box sx={{ px: 1, pt: 1 }}>
      <Image alt={item.title} src={item.coverImage} ratio="5/4" sx={{ borderRadius: 1.5 }} />
    </Box>
  );

  const renderLabels = (
    <Box
      sx={{
        gap: 1,
        mb: 1.5,
        display: 'flex',
        flexWrap: 'wrap',
        [`& .${labelClasses.root}`]: {
          typography: 'caption',
          color: 'text.secondary',
        },
      }}
    >
      <Label>{`Borrower Time : ${fShortenNumber(item.borrowCount)}`}</Label>
    </Box>
  );

  //   const renderFooter = (
  //     <Box
  //       sx={{
  //         mt: 2.5,
  //         gap: 0.5,
  //         display: 'flex',
  //         alignItems: 'center',
  //       }}
  //     >
  //       <Box component="span" sx={{ typography: 'h6' }}>
  //         {fCurrency(item.price)}
  //       </Box>
  //       <Box component="span" sx={{ typography: 'body2', color: 'text.secondary', flexGrow: 1 }}>
  //         / year
  //       </Box>
  //       <Button variant="contained" size="small">
  //         Join
  //       </Button>
  //     </Box>
  //   );

  return (
    <Box
      sx={{
        width: 1,
        position: 'relative',
        borderRadius: '15px',
        overflow: 'hidden',
        ...other,
      }}
    >
      <Box
        sx={{
          p: 3,
          left: 0,
          width: 1,
          bottom: 0,
          zIndex: 9,
          display: 'flex',
          position: 'absolute',
          color: 'common.white',
          flexDirection: 'column',
        }}
      >
        <Link color="inherit" underline="none" variant="h5" noWrap sx={{ mt: 1, mb: 3 }}>
          {item.title}
        </Link>

        <Box
          sx={{
            gap: 1,
            mb: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            [`& .${labelClasses.root}`]: {
              typography: 'caption',
              color: 'white',
            },
          }}
        >
          <Label>{`Borrower Time : ${fShortenNumber(item.borrowCount)}`}</Label>
        </Box>
      </Box>

      <Image
        alt={item.title}
        src={item.coverImage}
        slotProps={{
          overlay: {
            background: `linear-gradient(to bottom, ${varAlpha(theme.vars.palette.grey['900Channel'], 0)} 0%, ${theme.vars.palette.grey[900]} 75%)`,
          },
        }}
        sx={{
          width: 1,
          height: { xs: 308, xl: 340 },
          borderRadius: 'inherit',
          objectFit: 'cover',
        }}
      />
    </Box>
    // <Card sx={{ width: 1 }} {...other}>
    //     {renderImage}

    //     <Box sx={{ px: 2, py: 2.5 }}>
    //         {renderLabels}

    //         <Link
    //             variant="subtitle2"
    //             color="inherit"
    //             underline="none"
    //             sx={{ ...maxLine({ line: 2, persistent: theme.typography.subtitle2 }) }}
    //         >
    //             {item.title}
    //         </Link>

    //     </Box>
    // </Card>
  );
}
