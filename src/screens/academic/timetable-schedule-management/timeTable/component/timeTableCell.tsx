'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Paper, Button, MenuList, MenuItem, TableCell, Typography } from '@mui/material';

import AssignRoom from './assignRoomDialog';
import AssignTeacher from './assignTeacherDialog';

const TimeTableCell = ({
  isTeacherVisible = true,
  isRoomVisible = true,
  isClassVisible = false,
  isDivisionVisible = false,
  timeSlot,
  day,
  isDraggable = true,
  slotData,
  isBreak,
  onDrop,
  rowIndex,
  colIndex,
  isDrag = true,
  item,
  onTeacherSelect,
  onRoomSelect,
  onDeleteSlot,
  showThreeDots = true,
}: any) => {
  /**
   * Dialog state hooks for managing teacher and room assignment dialogs
   */

  const teacherDialog = useBoolean();
  const roomDialog = useBoolean();
  const deleteDialog = useBoolean();
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  /**
   * Unique key for identifying the time slot based on time and day
   * @type {string}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const slotKey = `${timeSlot}-${day}`;

  /**
   * Handles the drag over event for the timetable cell
   * Prevents default behavior to allow dropping only if the cell is empty and not a break slot
   * @param e - The drag over event object
   */
  const handleDragOver = (e: any) => {
    if (!isBreak && isDrag) {
      e.preventDefault();
    }
  };

  /**
   * Handles the drop event for the timetable cell
   * Processes the drop action only if the cell is empty and not a break slot
   * Calls the onDrop callback with the event and cell location data
   * @param e - The drop event object
   */
  const handleDrop = (e: any) => {
    if (!isBreak && isDrag && (!slotData || !slotData.subjects?.length)) {
      e.preventDefault();
      onDrop(e, item, rowIndex, colIndex);
    }
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      teacherDialog.onFalse();
      roomDialog.onFalse();
      dispatch(setIsChanges(false));
      // setSelectedSubject(null);
      // addSubjectDialog.onFalse();
    } else if (!isChanges) {
      teacherDialog.onFalse();
      roomDialog.onFalse();

      // setSelectedSubject(null);
      // addSubjectDialog.onFalse();
    }
  };
  /**
   * Handles the drag start event for the timetable cell
   * Sets the drag data including subject details and source location
   * Only allows dragging if the cell has data and is not a break slot
   * @param e - The drag start event object
   */
  const handleDragStart = (e: any) => {
    if (!isBreak && isDrag && slotData?.subjects?.length) {
      e.dataTransfer.setData('subject', JSON.stringify(slotData));
      e.dataTransfer.setData('rowIndex', rowIndex.toString());
      e.dataTransfer.setData('colIndex', colIndex.toString());
    }
  };

  /**
   * Renders a special break cell in the timetable
   * Displays a non-interactive cell with "Break" text and grey background
   * @returns {JSX.Element} Break cell component
   */
  if (isBreak) {
    return (
      <TableCell
        colSpan={6}
        sx={{
          bgcolor: 'grey.100',
          width: '14%',
          textAlign: 'center',
          padding: '4px',
          cursor: 'not-allowed',
        }}
      >
        <Typography color="text.secondary">Break</Typography>
      </TableCell>
    );
  }

  return (
    <TableCell
      sx={{
        height: 90,
        width: '14%',
        // '&:hover': { bgcolor: !slotData ? 'grey.50' : 'inherit' },

        // '&:hover': { bgcolor: !slotData ? 'grey.50' : 'inherit' },
        padding: '4px',
        cursor: isDrag && slotData?.subjects?.length ? 'grab' : 'default',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      draggable={isDrag && !!slotData?.subjects?.length}
      onDragStart={handleDragStart}
    >
      {slotData?.subjects?.length ? (
        <>
          <Paper
            elevation={0}
            sx={{
              p: 1,
              height: '90%',
              boxShadow: 'var(--shadows-10)',
              borderLeft: `4px solid ${slotData.subjectColor}`, // 👈 Left border
              borderRadius: '8px', // Optional for rounded corners like in image
              // bgcolor: alpha(slotData?.subjectColor, 0.2),
              position: 'relative',
              '& .action-menu': {
                opacity: 0,
                transition: 'opacity 0.2s ease-in-out',
              },
              '&:hover .action-menu': {
                opacity: 1,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                position: 'relative',
              }}
            >
              <CustomTooltip
                arrow
                placement="top"
                title={
                  <Box>
                    {slotData.subjects.map((sub: any, index: number) => (
                      <Typography key={index} variant="caption">
                        {sub.subject} ({sub.subjectCode})
                        {index < slotData.subjects.length - 1 && <br />}
                      </Typography>
                    ))}
                  </Box>
                }
              >
                <Typography variant="subtitle2" fontWeight="medium">
                  {slotData.subjects.map((sub: any) => sub.subject).join('/')}
                </Typography>
              </CustomTooltip>
              <Box className="action-menu">
                {showThreeDots && (
                  <ThreeDotsActions
                    placement="bottom-center"
                    onClickThreeDots={(e) => {
                      e.stopPropagation();
                    }}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      '& .MuiIconButton-root': {
                        padding: '4px',
                      },
                    }}
                    actions={({ popover }) => (
                      <MenuList>
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            teacherDialog.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify icon="mdi:teacher" sx={{ height: '18px', width: '18px' }} />
                          Teacher
                        </MenuItem>
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            roomDialog.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify
                            icon="mdi:google-classroom"
                            sx={{ height: '18px', width: '18px' }}
                          />
                          Room
                        </MenuItem>
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDialog.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify
                            icon={GlobalIcons.delete}
                            sx={{ height: '18px', width: '18px' }}
                            color="red"
                          />
                          Delete
                        </MenuItem>
                      </MenuList>
                    )}
                  />
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {isRoomVisible && (
                <Typography variant="caption" color="text.secondary">
                  {slotData?.subjects?.length
                    ? slotData.subjects.map((sub: any) => sub?.room || 'No Room').join('/')
                    : 'No Room'}
                </Typography>
              )}
              {isTeacherVisible && (
                <Box>
                  <CustomTooltip
                    arrow
                    placement="bottom"
                    title={
                      <Box>
                        {slotData?.subjects?.length
                          ? slotData.subjects.map((sub: any, index: number) => (
                              <Typography key={index} variant="caption">
                                {sub?.teacher || 'No Teacher'}
                                {index < slotData.subjects.length - 1 && <br />}
                              </Typography>
                            ))
                          : 'No Teacher'}
                      </Box>
                    }
                  >
                    <Typography variant="caption" color="text.secondary">
                      {slotData?.subjects?.length
                        ? slotData.subjects.map((sub: any, index: number) => {
                            const teacherName = sub?.teacher || 'No Teacher';
                            const nameParts = teacherName.split(' ');
                            const shortName =
                              nameParts.length > 1
                                ? `${nameParts[0]} ${nameParts[1]}`
                                : teacherName;
                            return `${shortName}${index < slotData.subjects.length - 1 ? '/' : ''}`;
                          })
                        : 'No Teacher'}
                    </Typography>
                  </CustomTooltip>
                </Box>
              )}
              {isClassVisible && isDivisionVisible && (
                <Typography variant="caption" color="text.secondary">
                  {slotData?.subjects?.length
                    ? slotData.subjects
                        .map((sub: any) => {
                          const className = sub?.class || 'No Class';
                          const divisionName = sub?.division || 'No Division';
                          return `${className}-${divisionName}`;
                        })
                        .join('/')
                    : 'No Class/Division'}
                </Typography>
              )}
            </Box>
          </Paper>

          <CustomDialog
            open={teacherDialog.value}
            handleClose={teacherDialog.onFalse}
            title={
              <Box display="flex" flexDirection="row" gap={1} alignItems="center">
                <Typography variant="h5">Assign Teacher</Typography>
                <CustomTooltip
                  arrow
                  placement="right"
                  sx={{ textAlign: 'justify' }}
                  title="Assign teacher for subject for specific lecture"
                >
                  <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
                </CustomTooltip>
              </Box>
            }
            maxWidth="sm"
          >
            <AssignTeacher
              slotData={slotData}
              teacherDialog={teacherDialog}
              onTeacherSelect={(value) => {
                onTeacherSelect(value, rowIndex, colIndex);
                handleClose(null, true);
              }}
              onClose={handleClose}
            />
          </CustomDialog>

          <CustomDialog
            maxWidth="sm"
            open={roomDialog.value}
            handleClose={roomDialog.onFalse}
            title={
              <Box display="flex" flexDirection="row" gap={1} alignItems="center">
                <Typography variant="h5">Assign Room</Typography>
                <CustomTooltip
                  arrow
                  placement="right"
                  sx={{ textAlign: 'justify' }}
                  title="Assign room for subject for specific lecture"
                >
                  <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
                </CustomTooltip>
              </Box>
            }
          >
            <AssignRoom
              roomDialog={roomDialog}
              slotData={slotData}
              onClose={handleClose}
              onRoomSelect={(value) => {
                onRoomSelect(value, rowIndex, colIndex);
                handleClose(null, true);
              }}
            />
          </CustomDialog>

          <ConfirmDialog
            open={deleteDialog.value}
            onClose={() => {
              deleteDialog.onFalse();
            }}
            title="Delete"
            content={
              <>
                Are you sure you want to delete{' '}
                <strong>{slotData?.subjects?.map((sub: any) => sub.subject).join(', ')}</strong> ?
              </>
            }
            action={
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => {
                  onDeleteSlot(rowIndex, colIndex);
                  deleteDialog.onFalse();
                }}
                // startIcon={<Iconify icon={GlobalIcons.delete} />}
              >
                Yes
              </Button>
            }
          />
        </>
      ) : null}
    </TableCell>
  );
};

export default TimeTableCell;
