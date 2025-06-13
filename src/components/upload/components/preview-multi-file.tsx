import { useState } from 'react';

import Box from '@mui/material/Box';
import { Button, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

import { Iconify } from '../../iconify';
import { fileData, FileThumbnail } from '../../file-thumbnail';

import type { MultiFilePreviewProps } from '../types';

// ----------------------------------------------------------------------

export function MultiFilePreview({
  sx,
  onRemove,
  lastNode,
  thumbnail,
  slotProps,
  firstNode,
  onView,
  files = [],
}: MultiFilePreviewProps) {
  const [visibleCount, setVisibleCount] = useState(2);
  const visibleFiles = files.slice(0, visibleCount);
  const dialog = useBoolean();
  const [previewFile, setPreviewFile] = useState<File | string | null>(null);

  const renderFirstNode = firstNode && (
    <Box
      component="li"
      sx={{
        ...(thumbnail && {
          width: 'auto',
          display: 'inline-flex',
        }),
      }}
    >
      {firstNode}
    </Box>
  );

  const renderLastNode = lastNode && (
    <Box
      component="li"
      sx={{
        ...(thumbnail && { width: 'auto', display: 'inline-flex' }),
      }}
    >
      {lastNode}
    </Box>
  );

  const remainingFiles = files.slice(visibleCount);

  return (
    <>
      <Box
        component="ul"
        sx={{
          gap: 1,
          display: 'flex',
          flexDirection: 'column',
          ...(thumbnail && {
            flexWrap: 'wrap',
            flexDirection: 'row',
          }),
          ...sx,
        }}
      >
        {renderFirstNode}

        {visibleFiles.map((file) => {
          const { name } = fileData(file);
          return (
            <Box
              key={name}
              component="li"
              sx={{
                border: 1,
                borderColor: 'grey.300',
                p: 2,
                gap: 1,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
              }}
            >
              <FileThumbnail
                file={file}
                {...slotProps?.thumbnail}
                sx={{ height: '25px', width: '25px' }}
              />

              <ListItemText
                primaryTypographyProps={{ variant: 'body2' }}
                primary={name}
                sx={{ flex: 1, ml: thumbnail ? 2 : 0 }}
              />
              <Box sx={{ display: 'flex' }}>
                <Tooltip title="Preview">
                  <IconButton size="small" onClick={() => onView?.(file)}>
                    <Iconify icon="mdi:eye" width={16} height={16} />
                  </IconButton>
                </Tooltip>

                {onRemove && (
                  <Tooltip title="Remove">
                    <IconButton size="small" onClick={() => onRemove(file)}>
                      <Iconify icon="mingcute:close-line" width={16} height={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          );
        })}

        {files.length > visibleCount && (
          <Button size="small" onClick={dialog.onTrue}>
            Show more ({files.length - visibleCount} more)
          </Button>
        )}

        {visibleCount > 2 && (
          <Button size="small" onClick={() => setVisibleCount(2)}>
            Show less
          </Button>
        )}

        {renderLastNode}
      </Box>

      <CustomDialog
        title="Remaining Files"
        open={dialog.value}
        handleClose={dialog.onFalse}
        maxWidth="sm"
        fullWidth
      >
        <Scrollbar sx={{ maxHeight: 400 }}>
          <Box sx={{ p: 3 }}>
            {remainingFiles.map((file) => {
              const { name } = fileData(file);
              return (
                <Box
                  key={name}
                  sx={{
                    border: 1,
                    borderColor: 'grey.300',
                    p: 2,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 2,
                    gap: 1,
                  }}
                >
                  <FileThumbnail
                    file={file}
                    {...slotProps?.thumbnail}
                    sx={{ height: '25px', width: '25px' }}
                  />

                  <ListItemText
                    primaryTypographyProps={{ variant: 'body2' }}
                    primary={name}
                    sx={{ flex: 1, ml: thumbnail ? 2 : 0 }}
                  />
                  <Box sx={{ display: 'flex' }}>
                    <IconButton size="small" onClick={() => onView?.(file)}>
                      <Iconify icon="mdi:eye" width={16} height={16} />
                    </IconButton>

                    {onRemove && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          onRemove(file);
                          // Close dialog if this is the last remaining file
                          if (remainingFiles.length === 1) {
                            dialog.onFalse();
                          }
                        }}
                      >
                        <Iconify icon="mingcute:close-line" width={16} height={16} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Scrollbar>
      </CustomDialog>
    </>
  );
}
