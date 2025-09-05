import React from 'react';
import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Chip, Typography } from '@mui/material';

import DetailRow from '../announcement/components/detailRow';

import type { IMeetingDetailsProps } from './type';

const MeetingDetails: React.FC<IMeetingDetailsProps> = ({ meeting }) => (
  <Box>
    <Scrollbar sx={{ height: '400px' }}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="mdi:calendar-clock" className="text-gray-500 w-6 h-6" />
        <Typography variant="h6" className="font-semibold">
          {meeting?.title}
        </Typography>
      </Box>

      <hr className="my-6 border-gray-200" />

      <DetailRow
        label="Meeting Agenda"
        icon="mdi:clipboard-text-outline"
        value={
          <Typography variant="body2" className="text-gray-700">
            {meeting?.meetingAgenda}
          </Typography>
        }
      />

      <DetailRow
        label="Target Audience"
        icon="mdi:account-group-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {meeting?.audience?.map((aud) => (
              <Chip key={aud} label={aud} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      {meeting?.organization && (
        <DetailRow
          label="Organizations"
          icon="mdi:office-building-outline"
          value={
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {meeting.organization.map((org) => (
                <Chip key={org} label={org} size="small" variant="outlined" />
              ))}
            </Box>
          }
        />
      )}

      {(meeting?.audience?.includes('Students') || meeting?.audience?.includes('Parents')) && (
        <>
          {meeting?.className && (
            <DetailRow
              label="Classes"
              icon="mdi:school-outline"
              value={
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {Array.isArray(meeting.className) ? (
                    meeting.className.map((cls) => (
                      <Chip key={cls} label={cls} size="small" variant="outlined" />
                    ))
                  ) : (
                    <Chip label={meeting.className} size="small" variant="outlined" />
                  )}
                </Box>
              }
            />
          )}

          {meeting?.division && (
            <DetailRow
              label="Divisions"
              icon="mdi:view-grid-outline"
              value={
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {Array.isArray(meeting.division) ? (
                    meeting.division.map((div) => (
                      <Chip key={div} label={div} size="small" variant="outlined" />
                    ))
                  ) : (
                    <Chip label={meeting.division} size="small" variant="outlined" />
                  )}
                </Box>
              }
            />
          )}

          {meeting?.students && (
            <DetailRow
              label="Students"
              icon="mdi:account-school-outline"
              value={
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {Array.isArray(meeting.students) ? (
                    meeting.students.map((student) => (
                      <Chip key={student} label={student} size="small" variant="outlined" />
                    ))
                  ) : (
                    <Chip label={meeting.students} size="small" variant="outlined" />
                  )}
                </Box>
              }
            />
          )}
        </>
      )}

      <DetailRow
        label="Meeting Mode"
        icon="mdi:access-point"
        value={
          <Typography
            component="span"
            variant="body2"
            className={`px-3 py-1 rounded-full ${
              meeting?.meetingType === 'virtual'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-green-50 text-green-600 border border-green-200'
            }`}
          >
            {meeting?.meetingType === 'virtual' ? 'Virtual' : 'Offline'}
          </Typography>
        }
      />

      {meeting?.meetingType === 'virtual' && meeting?.link && (
        <DetailRow
          label="Meeting Link"
          icon="mdi:link-variant"
          value={
            <Typography
              component="a"
              variant="body2"
              href={meeting.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {meeting.link}
            </Typography>
          }
        />
      )}

      {meeting?.meetingType === 'offline' && meeting?.classRoom && (
        <DetailRow
          label="Classroom"
          icon="mdi:door"
          value={
            <Typography variant="body2" className="text-gray-700">
              {meeting.classRoom}
            </Typography>
          }
        />
      )}

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {!meeting?.isRecurring && (
          <>
            {meeting?.meetingDate && (
              <DetailRow
                label="Meeting Date"
                icon="mdi:calendar-outline"
                value={
                  <Typography variant="body2" className="text-gray-700">
                    {dayjs(meeting.meetingDate).format('DD/MM/YYYY')}
                  </Typography>
                }
              />
            )}

            {meeting?.meetingTime && (
              <DetailRow
                label="Meeting Time"
                icon="mdi:clock-outline"
                value={
                  <Typography variant="body2" className="text-gray-700">
                    {dayjs(meeting.meetingTime).format('HH:mm')}
                  </Typography>
                }
              />
            )}
          </>
        )}

        {meeting?.isRecurring && (
          <>
            <DetailRow
              label="Repeat Frequency"
              icon="mdi:repeat"
              value={
                <Typography variant="body2" className="text-gray-700">
                  {meeting.repeatFrequency}
                </Typography>
              }
            />

            {meeting?.repeatFrequency === 'Weekly' && meeting?.day && (
              <DetailRow
                label="Day of Week"
                icon="mdi:calendar-week"
                value={
                  <Typography variant="body2" className="text-gray-700">
                    {meeting.day}
                  </Typography>
                }
              />
            )}

            {meeting?.repeatFrequency === 'Monthly' && meeting?.day && (
              <DetailRow
                label="Day of Month"
                icon="mdi:calendar-month"
                value={
                  <Typography variant="body2" className="text-gray-700">
                    {meeting.day}
                  </Typography>
                }
              />
            )}

            {meeting?.repeatUntil && (
              <DetailRow
                label="Repeat Until"
                icon="mdi:calendar-end"
                value={
                  <Typography variant="body2" className="text-gray-700">
                    {dayjs(meeting.repeatUntil).format('DD/MM/YYYY')}
                  </Typography>
                }
              />
            )}

            {meeting?.meetingTime && (
              <DetailRow
                label="Meeting Time"
                icon="mdi:clock-outline"
                value={
                  <Typography variant="body2" className="text-gray-700">
                    {dayjs(meeting.meetingTime).format('HH:mm')}
                  </Typography>
                }
              />
            )}
          </>
        )}
      </Box>
    </Scrollbar>
  </Box>
);
export default MeetingDetails;
