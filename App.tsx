import React, { useState, useEffect, useCallback } from 'react';
import { AppSettings, ViewState, UserProgress, Task, Session } from './types';
import { useTimer } from './hooks/useTimer';
import { BottomNav } from './components/BottomNav';
import { Settings } from './components/Settings';
import { Statistics } from './components/Statistics';
import { PomoKitty } from './components/PomoKitty';
import { Profile } from './components/Profile';
import { soundEngine } from './utils/soundEngine';

const DEFAULT_SETTINGS: AppSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  roundsBeforeLongBreak: 4,
  dailyGoal: 4, // hours
  isDarkMode: false,
  soundEnabled: true,
  autoStartBreaks: false,
  keepScreenOn: false,
  volume: 80,
  notificationSound: 'ding',
  accentColor: '#3b82f6',
  glassTheme: false,
  timerIncrement: 5,
};

const ACHIEVEMENT_LIST = [
  { id: '1', title: 'Novice', description: '1 Session', icon: 'looks_one' },
  { id: '2', title: 'Getting Started', description: '5 Sessions', icon: 'looks_5' },
  { id: '3', title: 'Regular', description: '10 Sessions', icon: 'looks_two' },
  { id: '4', title: 'Dedicated', description: '25 Sessions', icon: 'military_tech' },
  { id: '5', title: 'Expert', description: '50 Sessions', icon: 'workspace_premium' },
  { id: '6', title: 'Master', description: '100 Sessions', icon: 'diamond' },
  { id: '7', title: 'Grandmaster', description: '250 Sessions', icon: 'local_police' },
  { id: '8', title: 'Legend', description: '500 Sessions', icon: 'stars' },
  { id: '9', title: 'Mythic', description: '1000 Sessions', icon: 'auto_awesome' },
  { id: '10', title: 'Unstoppable', description: '2000 Sessions', icon: 'bolt' },
  { id: '11', title: 'Hat Trick', description: '3 Day Streak', icon: 'filter_3' },
  { id: '12', title: 'Week Warrior', description: '7 Day Streak', icon: 'date_range' },
  { id: '13', title: 'Two Weeks', description: '14 Day Streak', icon: 'event_repeat' },
  { id: '14', title: 'Monthly Master', description: '30 Day Streak', icon: 'calendar_month' },
  { id: '15', title: 'Quarterly', description: '90 Day Streak', icon: 'history' },
  { id: '16', title: 'Half Year', description: '180 Day Streak', icon: 'update' },
  { id: '17', title: 'Yearly', description: '365 Day Streak', icon: 'celebration' },
  { id: '18', title: 'Sprinter', description: 'Focus for 25m', icon: 'timer' },
  { id: '19', title: 'Marathoner', description: 'Focus for 60m', icon: 'timer_10_alt_1' },
  { id: '20', title: 'Endurance', description: 'Focus for 90m', icon: 'timelapse' },
  { id: '21', title: 'Early Bird', description: 'Session before 7AM', icon: 'wb_twilight' },
  { id: '22', title: 'Morning Glory', description: 'Session 7AM-12PM', icon: 'wb_sunny' },
  { id: '23', title: 'Afternoon Tea', description: 'Session 12PM-5PM', icon: 'coffee' },
  { id: '24', title: 'Night Owl', description: 'Session after 10PM', icon: 'dark_mode' },
  { id: '25', title: 'Midnight Oil', description: 'Session after 12AM', icon: 'bedtime' },
  { id: '26', title: 'Task Master', description: 'Complete a task', icon: 'check_circle' },
  { id: '27', title: 'Planner', description: 'Add 5 tasks', icon: 'list' },
  { id: '28', title: 'Cleaner', description: 'Clear 5 tasks', icon: 'delete_sweep' },
  { id: '29', title: 'Settings', description: 'Change a setting', icon: 'settings' },
  { id: '30', title: 'Customizer', description: 'Change accent color', icon: 'palette' },
  { id: '31', title: 'Clicker', description: 'Click the kitty', icon: 'touch_app' },
  { id: '32', title: 'Bored Cat', description: 'Let cat get bored', icon: 'sentiment_dissatisfied' },
  { id: '33', title: 'Happy Cat', description: 'Complete a session', icon: 'sentiment_satisfied' },
  { id: '34', title: 'Purrfect', description: '100% Focus Score', icon: 'pets' },
  { id: '35', title: 'Pawsome', description: 'Level 5', icon: 'cruelty_free' },
  { id: '36', title: 'Meowgical', description: 'Level 10', icon: 'magic_button' },
  { id: '37', title: 'Feline Good', description: 'Level 20', icon: 'mood' },
  { id: '38', title: 'Cat Nap', description: 'Take a break', icon: 'snooze' },
  { id: '39', title: 'Big Stretch', description: 'Long break', icon: 'accessibility_new' },
  { id: '40', title: 'Laser Focus', description: 'No pauses', icon: 'center_focus_strong' },
  { id: '41', title: 'Level 25', description: 'Reach Level 25', icon: 'star_half' },
  { id: '42', title: 'Level 50', description: 'Reach Level 50', icon: 'star' },
  { id: '43', title: 'Level 75', description: 'Reach Level 75', icon: 'stars' },
  { id: '44', title: 'Level 100', description: 'Reach Level 100', icon: 'hotel_class' },
  { id: '45', title: 'Workaholic', description: '10 sessions in a day', icon: 'work_history' },
  { id: '46', title: 'Weekend Warrior', description: 'Session on Saturday', icon: 'weekend' },
  { id: '47', title: 'Sunday Funday', description: 'Session on Sunday', icon: 'emoji_food_beverage' },
  { id: '48', title: 'Consistent', description: '3 Days in a row', icon: 'linear_scale' },
  { id: '49', title: 'Persistent', description: '5 Days in a row', icon: 'timeline' },
  { id: '50', title: 'Champion', description: 'Unlock 10 achievements', icon: 'trophy' },
].map(a => ({ ...a, unlocked: false }));

// Initial empty progress
const INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  totalSessions: 0,
  achievements: ACHIEVEMENT_LIST,
  history: []
};

const LoadingScreen = ({ onComplete, accentColor, isDarkMode }: { onComplete: () => void, accentColor: string, isDarkMode: boolean }) => {
  const [count, setCount] = useState(3);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev === 1) {
          clearInterval(timer);
          setOpacity(0);
          setTimeout(onComplete, 500); // Fade out time
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 font-display ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}
      style={{ opacity }}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: accentColor }}></div>
        <div className="relative z-10 text-9xl font-bold font-fun animate-bounce-slow" style={{ color: accentColor }}>
          {count > 0 ? count : 'GO!'}
        </div>
      </div>
      <div className="mt-8 text-slate-400 font-bold tracking-widest uppercase text-sm animate-pulse">
        Initializing Pomo Kitty...
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('timer');
  const [currentRound, setCurrentRound] = useState(1);
  const [showTaskQueue, setShowTaskQueue] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  
  // State with Initializers from LocalStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('pomokitty_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
     try {
      const saved = localStorage.getItem('pomokitty_progress');
      // Ensure history array exists if loading from old version
      const parsed = saved ? JSON.parse(saved) : INITIAL_PROGRESS;
      return { ...INITIAL_PROGRESS, ...parsed, history: parsed.history || [] };
    } catch {
      return INITIAL_PROGRESS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('pomokitty_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('pomokitty_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomokitty_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    localStorage.setItem('pomokitty_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Helper for sound and notifications
  const triggerAlarm = useCallback(() => {
    // 1. Play Sound (5 seconds loop)
    if (settings.soundEnabled) {
      soundEngine.playAlarm(settings.notificationSound, settings.volume);
    }

    // 2. System Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Pomo Kitty", {
        body: "Time is up! Great work! 😺",
        icon: "/icon.png" // Fallback if exists, or browser default
      });
    }
  }, [settings.soundEnabled, settings.notificationSound, settings.volume]);
  
  // Update Progress Logic
  const awardProgress = useCallback((durationMinutes: number, taskTitle?: string) => {
    setUserProgress(prev => {
      const xpGained = durationMinutes * 10; // 10 XP per minute
      const newXp = prev.xp + xpGained;
      // Simple level up logic: 1 level per 500 XP
      const newLevel = Math.floor(newXp / 500) + 1; 
      
      const newSession: Session = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration: durationMinutes,
        mode: 'focus',
        taskTitle: taskTitle
      };

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        totalSessions: prev.totalSessions + 1,
        history: [newSession, ...prev.history] // Recent first
      };
    });
  }, []);

  const timer = useTimer({
    focusDuration: settings.focusDuration,
    shortBreakDuration: settings.shortBreakDuration,
    longBreakDuration: settings.longBreakDuration,
    onComplete: (completedMode) => {
      triggerAlarm();

      if (completedMode === 'focus') {
        const nextRound = currentRound; 
        
        // Find active task name if any
        const activeTask = tasks.find(t => t.id === activeTaskId);
        
        // Award XP & Record Session
        awardProgress(settings.focusDuration, activeTask?.title);

        if (nextRound >= settings.roundsBeforeLongBreak) {
          timer.switchMode('longBreak');
          setCurrentRound(1); 
        } else {
          timer.switchMode('shortBreak');
          setCurrentRound(prev => prev + 1);
        }

        if (settings.autoStartBreaks) {
           setTimeout(() => timer.startTimer(), 50);
        }
      } else {
        // Break is finished
        timer.switchMode('focus');
      }
    }
  });

  const handleSkip = useCallback(() => {
    timer.stopTimer();
    // Logic similar to onComplete but manually triggered
    if (timer.mode === 'focus') {
        const nextRound = currentRound;
        if (nextRound >= settings.roundsBeforeLongBreak) {
          timer.switchMode('longBreak');
          setCurrentRound(1);
        } else {
          timer.switchMode('shortBreak');
          setCurrentRound(prev => prev + 1);
        }
    } else {
        timer.switchMode('focus');
    }
  }, [timer, currentRound, settings.roundsBeforeLongBreak]);

  // Handle Theme
  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.isDarkMode]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Task Handlers
  const addTask = (title: string) => {
    const newTask = { id: Date.now().toString(), title, completed: false };
    setTasks(prev => [...prev, newTask]);
    // If no active task, make this one active automatically
    if (!activeTaskId) setActiveTaskId(newTask.id);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  return (
    <>
      {isLoading && (
        <LoadingScreen 
          onComplete={() => setIsLoading(false)} 
          accentColor={settings.accentColor} 
          isDarkMode={settings.isDarkMode} 
        />
      )}
      
      <div className={`h-[100dvh] font-display flex flex-col overflow-hidden transition-colors duration-200 ${settings.glassTheme ? 'bg-gradient-to-b from-blue-100 via-white to-purple-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-900' : 'bg-background-light dark:bg-background-dark'}`}>
        <main className="flex-1 w-full max-w-lg mx-auto relative overflow-hidden h-full">
          
          {currentView === 'timer' && (
             <div className="animate-in fade-in duration-300 h-full">
                <PomoKitty 
                  timeLeft={timer.timeLeft}
                  progress={timer.progress}
                  isRunning={timer.isRunning}
                  mode={timer.mode}
                  currentRound={currentRound}
                  totalRounds={settings.roundsBeforeLongBreak}
                  onToggle={timer.toggleTimer}
                  onSkip={handleSkip}
                  onReset={() => {
                    timer.resetTimer();
                    setCurrentRound(1);
                  }}
                  accentColor={settings.accentColor}
                  onOpenSettings={() => setCurrentView('settings')}
                  onUpdateDuration={(newDuration) => {
                     updateSettings({ focusDuration: newDuration });
                  }}
                  settings={settings}
                  tasks={tasks}
                  onAddTask={addTask}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  showTaskQueue={showTaskQueue}
                  setShowTaskQueue={setShowTaskQueue}
                  activeTaskId={activeTaskId}
                  setActiveTaskId={setActiveTaskId}
                />
             </div>
          )}

          {currentView === 'stats' && (
            <div className="h-full overflow-y-auto no-scrollbar">
              <Statistics accentColor={settings.accentColor} userProgress={userProgress} />
            </div>
          )}
          
          {currentView === 'profile' && (
            <div className="h-full overflow-hidden">
              <Profile progress={userProgress} accentColor={settings.accentColor} />
            </div>
          )}

          {currentView === 'settings' && (
            <div className="h-full overflow-y-auto no-scrollbar">
              <Settings 
                settings={settings}
                updateSettings={updateSettings}
                onBack={() => setCurrentView('timer')}
                onChangeView={setCurrentView}
              />
            </div>
          )}
        </main>
        
        {/* Conditionally hide BottomNav when Task Queue is open or in Settings */}
        {currentView !== 'settings' && !showTaskQueue && (
          <BottomNav 
            currentView={currentView} 
            onChangeView={setCurrentView} 
            accentColor={settings.accentColor}
          />
        )}
      </div>
    </>
  );
};

export default App;