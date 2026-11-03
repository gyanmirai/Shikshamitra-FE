export const classroomSprite = {
  path: '/assets/illustrations/gyanmirai-school-team.png',
  width: 1774,
  height: 887,
  frameWidth: 443.5,
};

export const classroomActors = [
  {
    name: 'finance',
    title: 'Finance',
    caption: 'Fees, receipts & accounts',
    frame: 0,
    x: 0,
    head: 274,
    eyes: [
      [210, 184],
      [274, 180],
    ],
    pivot: '225px 267px',
    hand: 'M40 390L127 392L167 412L197 412L239 444L224 469L196 470L163 483L70 481L39 460Z',
    handPivot: '80px 438px',
  },
  {
    name: 'hr',
    title: 'HR & Payroll',
    caption: 'Staff, attendance, leave & payroll',
    frame: 1,
    x: 258,
    head: 282,
    eyes: [
      [211, 198],
      [270, 195],
    ],
    pivot: '225px 275px',
    hand: 'M90 385L139 392L184 372L220 381L250 405L231 429L192 450L157 470L103 467Z',
    handPivot: '109px 440px',
  },
  {
    name: 'academics',
    title: 'Academics',
    caption: 'Timetables, homework & exams',
    frame: 2,
    x: 516,
    head: 272,
    eyes: [
      [202, 184],
      [262, 179],
    ],
    pivot: '218px 265px',
    hand: 'M300 335L329 312L383 295L395 309L375 330L370 358L345 385L303 392Z',
    handPivot: '309px 374px',
  },
  {
    name: 'students',
    title: 'Students',
    caption: 'Admissions, records & progress',
    frame: 3,
    x: 774,
    head: 372,
    eyes: [
      [211, 293],
      [272, 287],
    ],
    pivot: '225px 365px',
    hand: 'M296 433L322 412L322 385L337 368L347 378L359 362L371 367L374 379L388 376L401 390L399 417L379 446L357 486L334 510L302 506L288 483Z',
    handPivot: '305px 490px',
  },
];

export type ClassroomActor = (typeof classroomActors)[number];
