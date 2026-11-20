const attendanceAndResult = 'Record the required assessment attendance and result.';
const sessionNotStarted = 'Attendance and results become available when the session starts.';

/** Translate known routine guidance without concealing other server-owned restrictions. */
export function assessmentGuidance(blockers: string[]): string[] {
  const waitingForSession = blockers.includes(sessionNotStarted);
  return [
    ...new Set(
      blockers.flatMap((message) => {
        if (message === attendanceAndResult) {
          return waitingForSession ? [] : ['Record attendance and enter the result to continue.'];
        }
        if (message === sessionNotStarted) {
          return ['After the session starts, record attendance and enter the result.'];
        }
        if (message === 'Create an assessment attempt or record an authorized waiver.') {
          return ['Start an assessment or record a waiver.'];
        }
        return [message];
      })
    ),
  ];
}
