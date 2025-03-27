import * as React from 'react';

import { useTheme } from '@mui/material';

const ProgressSvg = ({ title, ...props }: { title: string } & React.SVGProps<SVGSVGElement>) => {
  const theme = useTheme();
  return (
    <svg
      width={130}
      height={60}
      viewBox="0 0 450 120"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
    >
      <path d="M0 0 L75 60 L0 120 L350 120 L450 60 L350 0 Z" fill={theme.palette.primary.main} />
      <text
        x={225}
        y={70}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize={50}
        fontFamily="Arial"
        fontWeight="bold"
        dominantBaseline="middle"
      >
        {title}
      </text>
    </svg>
  );
};
export default ProgressSvg;
