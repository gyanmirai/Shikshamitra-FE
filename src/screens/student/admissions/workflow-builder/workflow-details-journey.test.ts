import { it, expect } from 'vitest';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';

import { getAdmissionWorkflowTemplate } from '../workflow-template';
import { getWorkflowDetailsJourney } from './workflow-details-journey';

const details = { name: 'School admission', code: 'SCHOOL' };

it.each(['assessment', 'post-inquiry'] as const)(
  'retains the exact saved %s graph during ordinary name/description editing',
  (templateId) => {
    const graph = getAdmissionWorkflowTemplate(templateId, 'form-1');
    const result = getWorkflowDetailsJourney(details, graph.stages, graph.transitions);
    expect(result.stages).toBe(graph.stages);
    expect(result.transitions).toBe(graph.transitions);
  }
);

it('changes only the earliest Form attachment, preserving IDs, routes and other settings', () => {
  const graph = getAdmissionWorkflowTemplate('assessment', 'form-1');
  graph.stages[0].configurationJson = JSON.stringify({
    ...readStageConfiguration(graph.stages[0].configurationJson),
    custom: 'retained',
  });
  const secondForm = {
    ...graph.stages[0],
    id: 'second-form',
    displayOrder: 99,
    code: 'SECOND_FORM',
  };
  const stages = [...graph.stages.slice(1), secondForm, graph.stages[0]];
  const result = getWorkflowDetailsJourney(
    { ...details, registrationFormDefinitionId: 'form-2' },
    stages,
    graph.transitions
  );
  expect(result.transitions).toBe(graph.transitions);
  expect(result.stages.map((s) => s.id)).toEqual(stages.map((s) => s.id));
  expect(result.stages.find((s) => s.id === secondForm.id)).toBe(secondForm);
  expect(readStageConfiguration(result.stages.at(-1)?.configurationJson)).toMatchObject({
    formDefinitionId: 'form-2',
    custom: 'retained',
  });
});

it('replaces the graph only for an explicit template choice with fresh IDs and selected form', () => {
  const graph = getAdmissionWorkflowTemplate('assessment', 'form-1');
  const result = getWorkflowDetailsJourney(
    { ...details, starterJourney: 'simple', registrationFormDefinitionId: 'form-2' },
    graph.stages,
    graph.transitions
  );
  expect(result.stages).toHaveLength(3);
  expect(result.transitions).toHaveLength(2);
  expect(result.stages.every((s) => !graph.stages.some((old) => old.id === s.id))).toBe(true);
  expect(readStageConfiguration(result.stages[0].configurationJson)?.formDefinitionId).toBe(
    'form-2'
  );
  expect(graph.stages).toHaveLength(4);
});

it('starts a blank journey only for an explicit blank choice', () => {
  const graph = getAdmissionWorkflowTemplate('standard', 'form-1');
  expect(
    getWorkflowDetailsJourney(
      { ...details, starterJourney: 'empty' },
      graph.stages,
      graph.transitions
    )
  ).toEqual({ stages: [], transitions: [] });
});

it('does not overwrite unreadable existing form configuration', () => {
  const graph = getAdmissionWorkflowTemplate('standard', 'form-1');
  const form = graph.stages.find((stage) => stage.stageType === 1)!;
  form.configurationJson = '{broken';
  expect(() =>
    getWorkflowDetailsJourney(
      { ...details, registrationFormDefinitionId: 'form-2' },
      graph.stages,
      graph.transitions
    )
  ).toThrow();
  expect(form.configurationJson).toBe('{broken');
});
