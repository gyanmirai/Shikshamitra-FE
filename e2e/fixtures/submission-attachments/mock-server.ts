import type { Plugin } from 'vite';

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function pdf() {
  const content = 'BT /F1 18 Tf 20 350 Td (Synthetic homework) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 400] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let text = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((object, i) => {
    offsets.push(text.length);
    text += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = text.length;
  text += `xref\n0 6\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return text;
}

export function submissionAttachmentServer(): Plugin {
  return {
    name: 'synthetic-submission-attachments',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url || '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/')) return next();
        if (request.headers.authorization !== 'Bearer synthetic-local-test') {
          response.writeHead(401).end();
          return undefined;
        }
        if (url.pathname === '/api/files/photo.png') {
          response.writeHead(200, { 'Content-Type': 'image/png' });
          response.end(readFileSync(fileURLToPath(new URL('./work.png', import.meta.url))));
        } else if (url.pathname === '/api/files/answers.pdf') {
          response.writeHead(200, { 'Content-Type': 'application/pdf' });
          response.end(pdf());
        } else if (url.pathname === '/api/academic/rubrics') {
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify([{
            id: 'rubric-1', title: 'Synthetic rubric', status: 1, scoringModel: 0, visibility: 3,
            tags: [], performanceLevels: [], totalMarks: 4, version: 1,
            criteria: [{ id: 'criterion-1', rubricId: 'rubric-1', title: 'Accuracy', isRequired: true, points: 4, displayOrder: 1 }],
          }]));
        } else if (url.pathname.includes('/evaluations/submission/')) {
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({
            id: 'evaluation-1', rubricId: 'rubric-1', studentSubmissionId: url.pathname.split('/').pop(),
            studentId: url.searchParams.get('studentId'), evaluatorId: 'teacher-1', totalMarks: 0,
            remarks: '', status: 0, scores: [],
          }));
        } else response.writeHead(404).end();
        return undefined;
      });
    },
  };
}
