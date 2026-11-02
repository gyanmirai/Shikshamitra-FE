import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function samplePdf() {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 400] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length 49 >>\nstream\nBT /F1 18 Tf 20 350 Td (Synthetic homework) Tj ET\nendstream',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}

for (const width of [1440, 390]) {
  test(`attachment preview preserves feedback at ${width}px @module-academic @critical @regression`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const authenticated: string[] = [];
    await page.route('**/api/academic/rubrics**', async (route) => {
      const url = new URL(route.request().url());
      await route.fulfill({
        json: url.pathname.endsWith('/rubrics')
          ? [
              {
                id: 'rubric-1',
                title: 'Synthetic rubric',
                status: 1,
                scoringModel: 0,
                visibility: 3,
                tags: [],
                performanceLevels: [],
                totalMarks: 4,
                version: 1,
                criteria: [
                  {
                    id: 'criterion-1',
                    rubricId: 'rubric-1',
                    title: 'Accuracy',
                    isRequired: true,
                    points: 4,
                    displayOrder: 1,
                  },
                ],
              },
            ]
          : {
              id: 'evaluation-1',
              rubricId: 'rubric-1',
              studentSubmissionId: url.pathname.split('/').pop(),
              studentId: url.searchParams.get('studentId'),
              evaluatorId: 'teacher-1',
              totalMarks: 0,
              remarks: '',
              status: 0,
              scores: [],
            },
      });
    });
    await page.route('**/api/files/*', async (route) => {
      expect(route.request().headers().authorization).toBe('Bearer synthetic-local-test');
      authenticated.push(route.request().url());
      const pdf = route.request().url().endsWith('.pdf');
      await route.fulfill({
        contentType: pdf ? 'application/pdf' : 'image/png',
        body: pdf
          ? samplePdf()
          : readFileSync(path.resolve('e2e/fixtures/submission-attachments/work.png')),
      });
    });
    await page.goto('/');
    await expect(page.getByText('Student Submission Attachments', { exact: true })).toBeVisible();
    await expect(page.getByText('Rubric Assessment', { exact: true })).toBeVisible();
    await expect(page.getByRole('img', { name: 'work.png', exact: true })).toBeVisible();
    const feedback = page.getByRole('textbox', { name: 'Feedback *', exact: true });
    await feedback.fill('Feedback draft survives preview');
    await page.getByRole('button', { name: 'Preview work.png', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(feedback).toHaveValue('Feedback draft survives preview');
    await page.getByRole('button', { name: 'Preview answers.pdf', exact: true }).click();
    const preview = page.getByRole('dialog', { name: 'answers.pdf', exact: true });
    await expect(preview.getByLabel('answers.pdf, page 1', { exact: true })).toBeVisible();
    await preview.getByRole('button', { name: 'close', exact: true }).click();
    await expect(feedback).toHaveValue('Feedback draft survives preview');
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download answers.pdf', exact: true }).click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe('answers.pdf');
    expect(authenticated.some((url) => url.endsWith('photo.png'))).toBeTruthy();
    expect(authenticated.filter((url) => url.endsWith('answers.pdf')).length).toBe(2);
    await page.screenshot({ path: `.artifacts/submission-attachments/feedback-${width}.png` });
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Synthetic Student 2', { exact: true })).toBeVisible();
    await expect(
      page.getByText('No student attachments submitted.', { exact: true })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preview work.png', exact: true })).toHaveCount(
      0
    );
    await expect(page.getByRole('textbox', { name: 'Feedback *', exact: true })).toHaveValue('');
  });
}
