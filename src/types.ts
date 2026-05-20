export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Note {
  id: string;
  content: string;
  updatedAt: number;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  lastCompleted: number | null; // Timestamp
}

export interface WordOfTheDay {
  word: string;
  meaning: string;
  context: string;
  level: 'Advanced' | 'Mastery';
}

export interface AppState {
  tasks: Task[];
  notes: Note[];
  habits: Habit[];
  theme: 'light' | 'dark';
}
