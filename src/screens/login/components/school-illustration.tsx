import Image from 'next/image';
import Box from '@mui/material/Box';

export function SchoolIllustration() {
  return (
    <Box
      aria-hidden="true"
      sx={(theme) => ({
        width: 1,
        mixBlendMode: 'multiply',
        '& img': {
          width: 'auto',
          maxWidth: 1,
          height: 'auto',
          display: 'block',
          mx: 'auto',
        },
        ...theme.applyStyles('dark', { mixBlendMode: 'normal' }),
        '& .school-campus-light': {
          ...theme.applyStyles('dark', { display: 'none' }),
        },
        '& .school-campus-dark': {
          display: 'none',
          ...theme.applyStyles('dark', { display: 'block' }),
        },
      })}
    >
      <Image
        className="school-campus-light"
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/illustrations/school-campus-light.webp`}
        width={1619}
        height={972}
        sizes="(min-width: 900px) 45vw, (min-width: 600px) 40vw, 0px"
        alt=""
      />
      <Image
        className="school-campus-dark"
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/illustrations/school-campus-transparent.webp`}
        width={1619}
        height={971}
        sizes="(min-width: 900px) 45vw, (min-width: 600px) 40vw, 0px"
        alt=""
      />
    </Box>
  );
}
