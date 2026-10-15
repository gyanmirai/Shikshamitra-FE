import { randomUUID } from 'node:crypto';

export function createSetupAcademics() {
  const boards = [];
  const boardNames = ['CBSE', 'GSEB', 'ICSE', 'IB', 'State Board', 'IGCSE', '+ Add Custom Board'];
  function addBranch(yearId, draft, divisionId) {
    let board = boards.find(
      (item) => item.academicYearId === yearId && item.type === draft.boardType
    );
    if (!board) {
      board = {
        id: randomUUID(),
        academicYearId: yearId,
        type: draft.boardType,
        name: draft.boardType === 6 ? draft.customBoardName : boardNames[draft.boardType],
        educationMediums: [],
      };
      boards.push(board);
    }
    let medium = board.educationMediums.find((item) => item.name === draft.medium);
    if (!medium) {
      medium = {
        id: randomUUID(),
        name: draft.medium,
        educationBoardId: board.id,
        educationMediumStages: [],
      };
      board.educationMediums.push(medium);
    }
    let stage = medium.educationMediumStages.find((item) => item.name === draft.stage);
    if (!stage) {
      stage = { id: randomUUID(), name: draft.stage, educationMediumId: medium.id, standards: [] };
      medium.educationMediumStages.push(stage);
    }
    let standard = stage.standards.find((item) => item.name === draft.className);
    if (!standard) {
      standard = {
        id: randomUUID(),
        name: draft.className,
        educationMediumStageId: stage.id,
        ageLowerLimit: draft.ageLowerLimit,
        divisions: [],
      };
      stage.standards.push(standard);
    }
    if (!standard.divisions.some((item) => item.id === divisionId))
      standard.divisions.push({
        id: divisionId,
        name: draft.divisionName,
        strength: draft.strength,
        standardId: standard.id,
        roomNumber: draft.roomNumber,
      });
  }
  const stages = () =>
    boards.flatMap((board) =>
      board.educationMediums.flatMap((medium) => medium.educationMediumStages)
    );
  function handle(url, method, body, send) {
    if (url.pathname === '/api/app/education-board/options') {
      send(
        200,
        boardNames.map((label, value) => ({ value, label }))
      );
      return true;
    }
    if (url.pathname === '/api/app/education-board' && method === 'GET') {
      send(200, { items: boards, totalCount: boards.length });
      return true;
    }
    if (url.pathname === '/api/app/education-board' && method === 'POST') {
      const board = {
        ...body,
        id: randomUUID(),
        name: body.type === 6 ? body.customName : boardNames[body.type],
        educationMediums: [],
      };
      boards.push(board);
      send(200, board);
      return true;
    }
    if (url.pathname === '/api/app/shift-management' || url.pathname === '/api/app/room') {
      send(200, { items: [], totalCount: 0 });
      return true;
    }
    if (url.pathname === '/api/app/standard' && method === 'POST') {
      const stage = stages().find((item) => item.id === body.educationMediumStageId);
      if (!stage) {
        send(404, {});
        return true;
      }
      const standard = { ...body, id: randomUUID(), divisions: [] };
      stage.standards.push(standard);
      send(200, standard);
      return true;
    }
    if (url.pathname === '/api/app/division' && method === 'POST') {
      const standard = stages()
        .flatMap((stage) => stage.standards)
        .find((item) => item.id === body.standardId);
      if (!standard) {
        send(404, {});
        return true;
      }
      const division = { ...body, id: randomUUID() };
      standard.divisions.push(division);
      send(200, division);
      return true;
    }
    return false;
  }
  return { addBranch, handle };
}
