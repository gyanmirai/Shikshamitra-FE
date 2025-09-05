import React from 'react';
import { Box, Typography } from '@mui/material';

const IcardPreview = ({ field, children }: any) => (
  <Box
    position="absolute"
    sx={{
      // border: "1px dashed gray",
      zIndex: 1,
      padding: '0px',
      cursor: 'move',
      ...field.style,
      ...(field.type === 'text' ? { backgroundColor: 'none' } : {}),
      //   '&:hover .field-actions': {
      //     display: isDrag ? 'flex' : 'none',
      //   },
    }}
  >
    {field.type === 'text' ? (
      <Box sx={{ width: `${field.fieldWidth}px` }}>
        {field.showFieldName && (
          <>
            <Typography
              component="span"
              fontWeight={field?.filedNameStyle?.fontWeight}
              fontSize={field?.filedNameStyle?.fontSize}
            >
              {field.name}
            </Typography>
            <Typography
              component="span"
              fontWeight={field?.filedNameStyle?.fontWeight}
              fontSize={field?.filedNameStyle?.fontSize}
            >
              {field.fieldSeparator}
            </Typography>
          </>
        )}
        <Typography
          component="span"
          fontWeight={field?.style?.fontWeight}
          fontSize={field?.style?.fontSize}
        >
          {' '}
          {children}
        </Typography>
      </Box>
    ) : field.type === 'box' ? (
      <Box
        sx={{
          width: field.dimensions.width,
          height: field.dimensions.height,
          backgroundColor: field.style.backgroundColor || '#ffffff',
          zIndex: 0,
          // border: '1px solid #000',
        }}
      />
    ) : (
      <img
        src={field.dummyValue}
        alt={field.name}
        draggable={false}
        style={{
          width: field.dimensions.width,
          height: field.dimensions.height,
          //   border: '1px dashed gray',
        }}
      />
    )}
  </Box>
);

export default IcardPreview;
