type FormattingRules = {
  board: number;
  medium: number;
  stage: number;
  standard: number;
  division: number;
};
type FixtureWrite = { method: string; path: string; body: Record<string, unknown> };

// Known .NET outputs for the synthetic Unicode preview endpoint.
const unicodePreviews = [
  { value: 'İSTANBUL', textCase: 2, result: 'İstanbul' },
  { value: 'ΟΣ', textCase: 2, result: 'οσ' },
  { value: 'ßeta', textCase: 3, result: 'ßeta' },
  { value: 'école primaire', textCase: 4, result: 'ÉCOLE PRIMAIRE' },
];

export function createAcademicFormattingFixture() {
  let rules: FormattingRules = { board: 0, medium: 0, stage: 0, standard: 0, division: 0 };
  let failNextSave = false;
  const writes: FixtureWrite[] = [];
  const previewRequests: Record<string, unknown>[] = [];
  const year = {
    id: 'fixture-year',
    name: '2026-2027',
    startDate: '2026-06-01',
    endDate: '2027-05-31',
  };
  const boards = [
    {
      id: 'fixture-board',
      name: 'CBSE',
      type: 0,
      academicYearId: year.id,
      educationMediums: [
        {
          id: 'fixture-medium',
          name: 'English',
          educationBoardId: 'fixture-board',
          educationMediumStages: [
            {
              id: 'fixture-stage',
              name: 'primary stage',
              educationMediumId: 'fixture-medium',
              standards: [
                {
                  id: 'fixture-standard',
                  name: 'standard one',
                  educationMediumStageId: 'fixture-stage',
                  divisions: [
                    {
                      id: 'fixture-division',
                      name: 'section a',
                      strength: 30,
                      standardId: 'fixture-standard',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  return {
    respond(method: string, path: string, body: Record<string, unknown> = {}) {
      if (path === '/fixture/fail-next-save') {
        failNextSave = true;
        return { status: 200, json: { ok: true } };
      }
      if (path === '/fixture/state')
        return { status: 200, json: { rules, writes, boards, previewRequests } };
      if (method === 'POST' && path === '/api/app/academic-field-formatting/preview') {
        previewRequests.push(body);
        const known = unicodePreviews.find(
          (item) => item.value === body.value && item.textCase === body.textCase
        );
        return known
          ? { status: 200, json: { value: known.result } }
          : {
              status: 400,
              json: {
                error: {
                  message:
                    'This synthetic fixture supports only its explicitly listed Unicode preview cases.',
                },
              },
            };
      }
      if (method === 'GET' && path === '/api/app/academic-field-formatting')
        return { status: 200, json: rules };
      if (method === 'PUT' && path === '/api/app/academic-field-formatting') {
        if (failNextSave) {
          failNextSave = false;
          return {
            status: 503,
            json: { error: { message: 'Synthetic save failure. Retry your changes.' } },
          };
        }
        rules = { ...rules, ...body } as FormattingRules;
        writes.push({ method, path, body });
        return { status: 200, json: rules };
      }
      if (method === 'GET' && path === '/api/app/academic-year')
        return { status: 200, json: { items: [year], totalCount: 1 } };
      if (method === 'GET' && path === '/api/app/education-board')
        return { status: 200, json: { items: boards, totalCount: 1 } };
      if (method === 'GET' && path === '/api/app/education-board/options')
        return {
          status: 200,
          json: [
            { value: 0, label: 'CBSE' },
            { value: 1, label: 'GSEB' },
          ],
        };
      if (path === '/api/auth/session')
        return { status: 200, json: { accessToken: 'synthetic-local-test' } };
      return {
        status: 404,
        json: { error: { message: `Unknown synthetic route: ${method} ${path}` } },
      };
    },
  };
}
