import { useState, useEffect } from 'react';

export const LOGIN_TAGLINES = [
  'Academics, students, HR and finance, together.',
  'Manage fees, receipts and school accounts.',
  'Support your staff, from attendance to payroll.',
  'Plan timetables, homework and exams.',
  'Follow every student, from admission onward.',
];

type Frame = {
  message: number;
  length: number;
  phase: 'typing' | 'holding' | 'deleting' | 'waiting';
};
type Props = { paused: boolean; reducedMotion: boolean };
const delays = { typing: 65, holding: 1600, deleting: 30, waiting: 350 };

function nextFrame(frame: Frame): Frame {
  const messageLength = LOGIN_TAGLINES[frame.message].length;
  switch (frame.phase) {
    case 'typing':
      return {
        ...frame,
        length: frame.length + 1,
        phase: frame.length + 1 === messageLength ? 'holding' : 'typing',
      };
    case 'holding':
      return { ...frame, phase: 'deleting' };
    case 'deleting':
      return {
        ...frame,
        length: frame.length - 1,
        phase: frame.length === 1 ? 'waiting' : 'deleting',
      };
    case 'waiting':
      return { message: (frame.message + 1) % LOGIN_TAGLINES.length, length: 0, phase: 'typing' };
    default:
      return frame;
  }
}

export function useLoginTypewriter({ paused, reducedMotion }: Props) {
  const [frame, setFrame] = useState<Frame>({ message: 0, length: 0, phase: 'typing' });

  useEffect(() => {
    if (paused || reducedMotion) return undefined;
    const timeout = window.setTimeout(() => setFrame(nextFrame), delays[frame.phase]);
    return () => window.clearTimeout(timeout);
  }, [frame, paused, reducedMotion]);

  return reducedMotion ? LOGIN_TAGLINES[0] : LOGIN_TAGLINES[frame.message].slice(0, frame.length);
}
