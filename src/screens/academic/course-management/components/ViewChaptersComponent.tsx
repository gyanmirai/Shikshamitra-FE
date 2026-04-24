import React, { useMemo, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { Box, Button, DialogActions } from '@mui/material';

import ChapterTabsView from './ChapterTabsView';

import type { ViewChaptersComponentProps } from '../type';

const ViewChaptersComponent: React.FC<ViewChaptersComponentProps> = ({
  onClose,
  selectedCourse,
  chapterData,
}) => {
  const [division, setDivision] = useState<string>('');

  const filteredChapters = useMemo(() => {
    if (!selectedCourse || !selectedCourse.className || !division) {
      return [];
    }

    return chapterData.filter(
      (chapter) =>
        chapter.courseId === selectedCourse.id &&
        chapter.classId === selectedCourse.className &&
        chapter.division === division
    );
  }, [chapterData, selectedCourse, division]);

  return (
    <Box display="flex" flexDirection="column" gap={2} marginBottom={2}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
        <Box display="flex" gap={2}>
          <CustomSelect
            label="Division"
            disabled={!selectedCourse?.className}
            options={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' },
            ]}
            value={division}
            onChange={(val) => {
              setDivision(val as string);
            }}
            formControlProps={{ fullWidth: true, sx: { maxWidth: '200px' } }}
          />
        </Box>
        {selectedCourse?.className && division && filteredChapters.length > 0 && (
          <ChapterTabsView chapters={filteredChapters} />
        )}
      </Scrollbar>
      <DialogActions>
        <Button>Cancel</Button>
        <Button type="submit" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Box>
  );
};

export default ViewChaptersComponent;
