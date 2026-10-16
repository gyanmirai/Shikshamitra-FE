import { useFormik } from 'formik';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { getChapterInitialValues } from '../initialValues';
import { ChapterPublicationSection } from './ChapterPublicationSection';
import { buildChapterMultipartPayload } from '../chapterMultipartPayload';

import type { IChapter, IChapterFormValues } from '../type';

vi.mock('@iconify/react', async () => {
  const { forwardRef } = await import('react');
  return {
    disableCache: () => {},
    Icon: forwardRef<SVGSVGElement>((_, ref) => <svg ref={ref} />),
  };
});

function Form({ chapter, submit }: { chapter?: IChapter; submit: (data: FormData) => void }) {
  const formik = useFormik<IChapterFormValues>({
    initialValues: getChapterInitialValues(chapter),
    onSubmit: (values) => submit(buildChapterMultipartPayload(values)),
  });
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <form onSubmit={formik.handleSubmit}>
        <ChapterPublicationSection formik={formik} />
        <button type="submit">Submit</button>
      </form>
    </ThemeProvider>
  );
}

async function choose(label: string, option: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(await screen.findByRole('option', { name: option }));
}

describe('Chapter publication', () => {
  it('keeps new chapters private until the school chooses to publish them', () => {
    render(<Form submit={() => {}} />);
    expect(screen.getByRole('combobox', { name: 'Publication status' })).toHaveTextContent('Draft');
    expect(screen.getByRole('combobox', { name: 'Visible to' })).toHaveTextContent('Teacher');
    expect(
      screen.getByText('Only published chapters appear in the mobile syllabus.')
    ).toBeVisible();
    expect(
      screen.getByText('Teacher-only chapters stay hidden from students and parents.')
    ).toBeVisible();
  });

  it('lets staff publish an existing draft for students and parents in the saved payload', async () => {
    let payload: Record<string, unknown> | undefined;
    render(
      <Form
        submit={(data) => {
          payload = JSON.parse(String(data.get('Payload')));
        }}
      />
    );
    await choose('Publication status', 'Published');
    await choose('Visible to', 'All');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(payload).toMatchObject({ publishStatus: 'Published', visibility: 'All' })
    );
  });

  it('preserves published parent-only settings when editing other details', async () => {
    let payload: Record<string, unknown> | undefined;
    const chapter = { publishStatus: 'Published', visibility: 'Parents' } as IChapter;
    render(
      <Form
        chapter={chapter}
        submit={(data) => {
          payload = JSON.parse(String(data.get('Payload')));
        }}
      />
    );
    expect(screen.getByRole('combobox', { name: 'Visible to' })).toHaveTextContent('Parents');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(payload).toMatchObject({ publishStatus: 'Published', visibility: 'Parents' })
    );
  });

  it('can return a chapter to a private draft without changing its audience', async () => {
    let payload: Record<string, unknown> | undefined;
    const chapter = { publishStatus: 'Published', visibility: 'Students' } as IChapter;
    render(
      <Form
        chapter={chapter}
        submit={(data) => {
          payload = JSON.parse(String(data.get('Payload')));
        }}
      />
    );
    await choose('Publication status', 'Draft');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(payload).toMatchObject({ publishStatus: 'Draft', visibility: 'Students' })
    );
  });
});
