import React from 'react';
import { Dialog, DialogTitle, Select, MenuItem, Button } from '@mui/material';

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  subjects: { id: string; name: string; color: string }[];
  teachers: { id: string; name: string }[];
  selectedSubject: string | null;
  selectedTeacher: string | null;
  onSelectSubject: (subject: string) => void;
  onSelectTeacher: (teacher: string) => void;
  onSave: () => void;
}

export const EventDialog: React.FC<EventDialogProps> = ({
  open,
  onClose,
  subjects,
  teachers,
  selectedSubject,
  selectedTeacher,
  onSelectSubject,
  onSelectTeacher,
  onSave,
}) => (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Select Subject and Teacher</DialogTitle>
      <div style={{ padding: '16px' }}>
        <Select
          fullWidth
          value={selectedSubject || ''}
          onChange={(e) => onSelectSubject(e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Select Subject
          </MenuItem>
          {subjects.map((subject) => (
            <MenuItem key={subject.id} value={subject.id}>
              {subject.name}
            </MenuItem>
          ))}
        </Select>

        <Select
          fullWidth
          value={selectedTeacher || ''}
          onChange={(e) => onSelectTeacher(e.target.value)}
          displayEmpty
          style={{ marginTop: '16px' }}
          disabled={!selectedSubject}
        >
          <MenuItem value="" disabled>
            Select Teacher
          </MenuItem>
          {teachers.map((teacher) => (
            <MenuItem key={teacher.id} value={teacher.name}>
              {teacher.name}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onSave}
          style={{ marginTop: '16px' }}
        >
          Save Event
        </Button>
      </div>
    </Dialog>
  );
