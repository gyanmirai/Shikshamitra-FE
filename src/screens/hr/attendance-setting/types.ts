export type ShiftTiming = {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  breakDuration: number; // in minutes
  isNightShift: boolean;
};

export type WeeklyOffPattern = 'sunday' | 'saturday_sunday' | 'custom';

export type DailyAttendanceRule = {
  hoursBasedPayPercentage: number;
};

export type LateEarlyRule = {
  graceTime: number; // minutes
  maxLateAllowedPerMonth: number;
  penaltyType: 'deduct_half_day' | 'deduct_full_day' | 'none';
  penaltyCountThreshold?: number; // e.g., 3 lates
};

export type AttendanceConfiguration = {
  shiftTiming?: ShiftTiming;
  weeklyOff?: WeeklyOffPattern;
  customWeeklyOffs?: number[]; // indices of days, Maintained if pattern is custom
  dailyRules: DailyAttendanceRule;
  lateEarlyRules: LateEarlyRule;
  overtime: {
    enabled: boolean;
    rate: '1.5x' | '2.0x' | 'flat';
    minOvertimeMinutes: number;
  };
  holidayRules?: {
    workOnHolidayBehavior: 'paid' | 'comp_off' | 'ot_payout';
    sandwichRule: boolean;
  };
};

export const INITIAL_ATTENDANCE_CONFIG: AttendanceConfiguration = {
  shiftTiming: {
    startTime: '09:00',
    endTime: '18:00',
    breakDuration: 60,
    isNightShift: false,
  },
  weeklyOff: 'saturday_sunday',
  dailyRules: {
    hoursBasedPayPercentage: 0,
  },
  lateEarlyRules: {
    graceTime: 15,
    maxLateAllowedPerMonth: 3,
    penaltyType: 'deduct_half_day',
    penaltyCountThreshold: 3,
  },
  overtime: {
    enabled: false,
    rate: '1.5x',
    minOvertimeMinutes: 30,
  },
  holidayRules: {
    workOnHolidayBehavior: 'comp_off',
    sandwichRule: false,
  },
};
