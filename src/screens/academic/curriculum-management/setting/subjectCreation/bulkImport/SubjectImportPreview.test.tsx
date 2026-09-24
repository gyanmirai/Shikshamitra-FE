import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SubjectImportPreview } from './SubjectImportPreview';

describe('SubjectImportPreview', () => {
  it('shows ready and invalid rows with actionable validation text', () => {
    render(
      <SubjectImportPreview
        rows={[
          {
            rowNumber: 2,
            name: 'Science',
            displayName: '',
            category: 'Scholastic',
            color: '#2196F3',
            icon: 'flask',
            status: 'Active',
            sortOrder: '1',
            description: '',
            issues: [],
          },
          {
            rowNumber: 3,
            name: 'English',
            displayName: '',
            category: 'Language',
            color: '#8E24AA',
            icon: 'book',
            status: 'Active',
            sortOrder: '2',
            description: '',
            issues: ['Subject already exists.'],
          },
        ]}
      />
    );

    expect(screen.getByText('1 rows need attention')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('Subject already exists.')).toBeInTheDocument();
  });
});
