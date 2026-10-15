'use client';

import { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';

import { useAcademicOptions } from './use-academic-options';
import { AcademicContextInput } from './academic-context-input';
import { useAcademicSelection } from './use-academic-selection';
import { useAcademicConfirmation } from './use-academic-confirmation';
import { AcademicSelectionWrapper } from './academic-selection-wrapper';

export default function GlobalAcademicSearch() {
  const data = useAcademicOptions();
  const { selectedYearOption, selectedBoardMediumOption, applyAcademicOption } =
    useAcademicSelection(data);
  const selectedOption = data.isYearOnly ? selectedYearOption : selectedBoardMediumOption;
  const { confirmationDialog, changeSelection } = useAcademicConfirmation({
    isYearOnly: data.isYearOnly,
    isStudentModule: data.isStudentModule,
    options: data.options,
    selectedOption,
    applyAcademicOption,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOpenDropdown = () => setIsDropdownOpen(true);
    window.addEventListener('onboarding-open-academic-dropdown', handleOpenDropdown);
    return () =>
      window.removeEventListener('onboarding-open-academic-dropdown', handleOpenDropdown);
  }, []);

  return (
    <Box
      data-onboarding="academic-year"
      sx={{
        flex: '1 1 160px',
        minWidth: { xs: 0, md: data.isYearOnly ? 200 : 300 },
        width: '100%',
        maxWidth: data.isYearOnly ? 200 : 300,
      }}
    >
      {data.isLoading ? (
        <Skeleton variant="rounded" height={56} sx={{ minWidth: 0, width: '100%' }} />
      ) : (
        <>
          {confirmationDialog}
          <CustomTooltip
            arrow
            title={
              !selectedOption
                ? data.isStudentModule
                  ? 'Select academic year'
                  : 'Select Academic Year, Board and Medium'
                : undefined
            }
            placement="bottom"
          >
            <AcademicSelectionWrapper error={!selectedOption} sx={{ minWidth: 0, width: '100%' }}>
              <AcademicContextInput
                key={data.isYearOnly ? 'academic-year-only' : 'academic-year-board-medium'}
                isYearOnly={data.isYearOnly}
                options={data.isYearOnly ? data.yearOptions : data.options}
                value={selectedOption}
                open={isDropdownOpen}
                onOpen={() => setIsDropdownOpen(true)}
                onClose={() => setIsDropdownOpen(false)}
                onChange={changeSelection}
              />
            </AcademicSelectionWrapper>
          </CustomTooltip>
        </>
      )}
    </Box>
  );
}
