export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type NotificationSound = 'silent' | 'arcade' | 'digital' | 'bell' | 'ding' | 'meow';

export interface AppSettings {
  focusDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  roundsBeforeLongBreak: number;
  dailyGoal: number; // minutes
  isDarkMode: boolean;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  keepScreenOn: boolean;
  volume: number; // 0-100
  notificationSound: NotificationSound;
  accentColor: string; // Hex code
  glassTheme: boolean;
  timerIncrement: 1 | 5; // Step for sliders
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface Session {
  id: string;
  date: string; // ISO String
  duration: number; // minutes
  mode: TimerMode;
  taskTitle?: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  achievements: Achievement[];
  totalSessions: number;
  history: Session[];
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export type ViewState = 'timer' | 'stats' | 'settings' | 'profile';