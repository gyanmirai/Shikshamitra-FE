import { settings } from './data.mjs';

export const point = (key, label, value, extra = {}) => ({ key, label, value, ...extra });
export const series = (name, points) => ({ name, points });
const metrics = {
  classrooms: [{ key: 'divisions', label: 'Divisions', value: 3 }, { key: 'mapped', label: 'Mapped divisions', value: 2 }],
  curriculum: [
    { key: 'recorded-progress', label: 'Average recorded progress', value: 66.3, unit: '%' },
  ],
  timetable: [{ key: 'timetables', label: 'Timetables', value: 2 }],
  student360: [{ key: 'students', label: 'Enrolled students', value: 3 }],
  lesson: [{ key: 'plans', label: 'Lesson plans', value: 24 }],
  tasks: [{ key: 'published-schedules', label: 'Published task schedules', value: 23 }],
  evaluation: [{ key: 'submissions', label: 'Received submissions', value: 30 }],
  exams: [{ key: 'exams', label: 'Exams', value: 7 }],
};
const make = (key, data = [], items = []) => ({
  key,
  status: 'ready',
  summary: `Synthetic ${key} records for this academic scope.`,
  metrics: metrics[key] ?? [],
  series: data,
  items,
});
const item = (id, label, detail, date) => ({ id, label, detail, date });
export const insightKeys = [
  'classrooms',
  'student360',
  'calendar',
  'curriculum',
  'lesson',
  'timetable',
  'tasks',
  'evaluation',
  'exams',
  'reports',
  'notifications',
  'audits',
  'settings',
];

export function populatedSections() {
  return [
    make('classrooms', [
      series('class-mapping', [
        point('6a', 'Class 6 A', 1, { status: 'mapped' }),
        point('6b', 'Class 6 B', 0, { status: 'unmapped' }),
        point('7a', 'Class 7 A', 1, { status: 'mapped' }),
      ]),
    ]),
    make('student360', [
      series('student-comparison', [
        point('s1', 'Anaya', 84, { x: 96, y: 84 }),
        point('s2', 'Dev', 75, { x: 89, y: 75 }),
        point('s3', 'Meera', 91, { x: 98, y: 91 }),
      ]),
    ]),
    make(
      'calendar',
      [],
      [
        item('c1', 'Science exhibition', 'School event', '2026-11-03T09:00:00Z'),
        item('c2', 'Diwali break', 'Holiday', '2026-11-07T00:00:00Z'),
      ]
    ),
    make('curriculum', [
      series('recorded-progress', [
        point('math', 'Mathematics', 68),
        point('science', 'Science', 54),
        point('english', 'English', 77),
      ]),
    ]),
    make('lesson', [
      series('status', [
        point('draft', 'Draft', 4),
        point('published', 'Published', 12),
        point('completed', 'Completed', 8),
      ]),
    ]),
    make('timetable', [
      series(
        'periods',
        [1, 2, 3, 4, 5].flatMap((day) =>
          [1, 2, 3, 4].map((period) =>
            point(`${day}-${period}`, `Day ${day}, period ${period}`, (day + period) % 4, {
              x: day,
              y: period,
            })
          )
        )
      ),
    ]),
    make('tasks', [
      series('homework', [
        point('overdue', 'Overdue', 3),
        point('today', 'Due today', 5),
        point('upcoming', 'Upcoming', 8),
      ]),
      series('assignment', [
        point('overdue', 'Overdue', 1),
        point('today', 'Due today', 2),
        point('upcoming', 'Upcoming', 4),
      ]),
    ]),
    make('evaluation', [
      series('review', [point('reviewed', 'Reviewed', 23), point('pending', 'Pending', 7)]),
    ]),
    make('exams', [
      series('stages', [point('scheduled', 'Scheduled', 5), point('published', 'Published', 2)]),
    ]),
    make('reports', [
      series('completed-exports', [
        point('curriculum', 'Curriculum', 5),
        point('timetable', 'Timetable', 3),
        point('examination', 'Examination', 8),
      ]),
    ]),
    make(
      'notifications',
      [],
      ['Curriculum', 'Timetable', 'Homework and assignment', 'Examination'].map((name) => ({
        id: name,
        label: name,
        detail: 'Read-only template category',
      }))
    ),
    make(
      'audits',
      [],
      [
        item('a1', 'Lesson plan published', 'Teacher diary', '2026-10-29T08:30:00Z'),
        item('a2', 'Timetable updated', 'Class 6 A', '2026-10-28T08:30:00Z'),
      ]
    ),
    make('settings', [
      series(
        'existence',
        settings.map(([key], index) =>
          point(key, key.replaceAll('-', ' '), index % 3 === 0 ? 0 : 1, {
            status: index % 3 === 0 ? 'empty' : 'configured',
          })
        )
      ),
    ]),
  ];
}
