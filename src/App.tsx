/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Flame, 
  Notebook, 
  LayoutGrid, 
  Settings, 
  Clock, 
  Calendar as CalendarIcon,
  ChevronRight,
  SquareCheckBig,
  StickyNote,
  Languages,
  RefreshCcw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Task, Habit, Note, WordOfTheDay } from './types';
import { fetchAdvancedWord } from './services/vocabularyService';

export default function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('zenith_tasks', []);
  const [habits, setHabits] = useLocalStorage<Habit[]>('zenith_habits', [
    { id: '1', name: 'Meditation', streak: 5, lastCompleted: null },
    { id: '2', name: 'Read 20 Pages', streak: 12, lastCompleted: null },
    { id: '3', name: 'Gym', streak: 3, lastCompleted: null }
  ]);
  const [notes, setNotes] = useLocalStorage<Note[]>('zenith_notes', [
    { id: '1', content: 'Design Zenith Utility App', updatedAt: Date.now() }
  ]);
  const [word, setWord] = useLocalStorage<WordOfTheDay | null>('zenith_word', null);
  
  const [newTask, setNewTask] = useState('');
  const [time, setTime] = useState(new Date());
  const [isLoadingWord, setIsLoadingWord] = useState(false);

  // Focus Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [workDuration, setWorkDuration] = useLocalStorage('zenith_work_duration', 25);
  const [breakDuration, setBreakDuration] = useLocalStorage('zenith_break_duration', 5);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [timerSeconds, setTimerSeconds] = useState(workDuration * 60);
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false);

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    
    let timer: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      timer = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      // Play sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
      
      // Auto-switch mode
      const nextMode = timerMode === 'work' ? 'break' : 'work';
      setTimerMode(nextMode);
      setTimerSeconds((nextMode === 'work' ? workDuration : breakDuration) * 60);
      
      if (window.confirm(`${timerMode === 'work' ? 'Work session' : 'Break'} complete! Ready for ${nextMode}?`)) {
        setTimerRunning(true);
      }
    }

    return () => {
      clearInterval(clock);
      if (timer) clearInterval(timer);
    };
  }, [timerRunning, timerSeconds, timerMode, workDuration, breakDuration]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds((timerMode === 'work' ? workDuration : breakDuration) * 60);
  };

  const switchMode = (mode: 'work' | 'break') => {
    setTimerRunning(false);
    setTimerMode(mode);
    setTimerSeconds((mode === 'work' ? workDuration : breakDuration) * 60);
  };

  const [activeTab, setActiveTab] = useState('home');

  const scrollToSection = (id: string, tab: string) => {
    setActiveTab(tab);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!word) {
      handleRefreshWord();
    }
  }, []);

  const handleRefreshWord = async () => {
    setIsLoadingWord(true);
    const newWord = await fetchAdvancedWord();
    setWord(newWord);
    setIsLoadingWord(false);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      text: newTask,
      completed: false,
      createdAt: Date.now()
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completeHabit = (id: string) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        return { ...h, streak: h.streak + 1, lastCompleted: Date.now() };
      }
      return h;
    }));
  };

  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const submitHabit = () => {
    if (newHabitName.trim()) {
      setHabits([...habits, { id: crypto.randomUUID(), name: newHabitName, streak: 0, lastCompleted: null }]);
      setNewHabitName('');
      setIsAddingHabit(false);
    }
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const submitNote = () => {
    if (newNoteContent.trim()) {
      setNotes([{ id: crypto.randomUUID(), content: newNoteContent, updatedAt: Date.now() }, ...notes]);
      setNewNoteContent('');
      setIsAddingNote(false);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100 p-4 md:p-8 lg:p-12 pb-32 md:pb-8">
      <div className="max-w-6xl mx-auto" id="top">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-medium mb-1 tracking-wide uppercase text-[10px]">
              <LayoutGrid size={14} />
              <span>ZENITH UTILITY</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              Hello, <span className="text-gray-400">Monty.</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-500 font-mono">
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} className="text-gray-400" />
              <span>{time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span>{time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,_auto)]">
          
          {/* Main Tasks Widget */}
          <section id="tasks-widget" className="md:col-span-8 md:row-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                  <SquareCheckBig size={20} />
                </div>
                <h2 className="text-xl font-semibold">Priority Focus</h2>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {tasks.filter(t => !t.completed).length} Pending
              </span>
            </div>

            <form onSubmit={addTask} className="relative mb-6">
              <input 
                type="text" 
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-5 pr-12 text-base focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
              />
              <button type="submit" className="absolute right-2 top-1.5 p-2.5 bg-white shadow-sm border border-gray-100 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors">
                <Plus size={18} />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px] pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                  <motion.div 
                    layout
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`group flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      task.completed ? 'bg-gray-50 opacity-60' : 'hover:bg-blue-50/30'
                    }`}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`shrink-0 transition-colors ${task.completed ? 'text-blue-500' : 'text-gray-300 hover:text-blue-400'}`}
                    >
                      {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {task.text}
                    </span>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <CheckCircle2 size={32} strokeWidth={1} />
                  </div>
                  <p className="text-sm">All clear for today.</p>
                </div>
              )}
            </div>
          </section>

          {/* Habit Tracker Widget */}
          <section id="habits-widget" className="md:col-span-4 bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-2 rounded-xl text-orange-600">
                  <Flame size={20} />
                </div>
                <h2 className="text-lg font-semibold">Streaks</h2>
              </div>
              <button 
                onClick={() => setIsAddingHabit(true)}
                className="text-gray-400 hover:text-orange-600 transition-colors"
                title="Add Habit"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {isAddingHabit && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="flex gap-2">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Habit name..."
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitHabit()}
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-base focus:ring-1 focus:ring-orange-200"
                      />
                      <button onClick={submitHabit} className="bg-orange-500 text-white px-3 rounded-xl text-xs font-medium">Add</button>
                      <button onClick={() => setIsAddingHabit(false)} className="text-gray-400 text-xs">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {habits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                       <h3 className="text-sm font-medium text-gray-700">{habit.name}</h3>
                       <button onClick={() => deleteHabit(habit.id)} className="opacity-100 sm:opacity-40 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                         <Trash2 size={12} />
                       </button>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`h-1 w-4 rounded-full ${i < habit.streak % 6 ? 'bg-orange-400' : 'bg-gray-100'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 ml-1">{habit.streak}d</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => completeHabit(habit.id)}
                    className="p-2.5 bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Vocabulary Widget */}
          <section id="vocab-widget" className="md:col-span-4 bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col scroll-mt-24">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                  <Languages size={20} />
                </div>
                <h2 className="text-lg font-semibold">Vocabulary</h2>
              </div>
              <button 
                onClick={handleRefreshWord}
                disabled={isLoadingWord}
                className="text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
              >
                {isLoadingWord ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              {word && (
                <motion.div 
                  key={word.word}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-bold text-gray-800">{word.word}</h3>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{word.level}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{word.meaning}</p>
                  </div>
                  
                  <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50 italic">
                    <p className="text-xs text-indigo-900/70 leading-relaxed">
                      "{word.context}"
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleRefreshWord}
                    className="mt-4 w-full py-2.5 text-xs font-semibold text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors"
                  >
                    I know this, next word
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Quick Notes Widget */}
          <section id="notes-widget" className="md:col-span-4 bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col scroll-mt-24">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-2 rounded-xl text-purple-600">
                  <StickyNote size={20} />
                </div>
                <h2 className="text-lg font-semibold">Thought Pool</h2>
              </div>
              <button 
                onClick={() => setIsAddingNote(true)}
                className="text-gray-400 hover:text-purple-600 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
              <AnimatePresence>
                {isAddingNote && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4"
                  >
                    <textarea 
                      autoFocus
                      placeholder="Note content..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-base focus:ring-1 focus:ring-purple-200 resize-none min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setIsAddingNote(false)} className="text-xs text-gray-400 font-medium px-2">Cancel</button>
                      <button onClick={submitNote} className="bg-purple-600 text-white px-4 py-1.5 rounded-xl text-xs font-semibold">Save Note</button>
                    </div>
                  </motion.div>
                )}
                {notes.map(note => (
                  <motion.div 
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-100/50 transition-all cursor-pointer relative group"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                      className="absolute top-2 right-2 opacity-100 sm:opacity-40 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] font-mono text-gray-400">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                      <ChevronRight size={14} className="text-gray-300" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Focus Timer Mini Widget */}
          <section id="focus-widget" className={`md:col-span-4 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-center items-center group transition-colors duration-500 scroll-mt-24 ${timerMode === 'work' ? 'bg-[#1A1A1A] text-white' : 'bg-blue-600 text-white'}`}>
            <div className={`absolute top-0 right-0 p-4 opacity-20 transform transition-transform ${timerRunning ? 'animate-spin-slow' : 'group-hover:scale-110'}`}>
              <Clock size={80} />
            </div>

            <div className="absolute top-4 left-4 flex gap-2 z-20">
              <button 
                onClick={() => switchMode('work')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${timerMode === 'work' ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
              >
                Work
              </button>
              <button 
                onClick={() => switchMode('break')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${timerMode === 'break' ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
              >
                Break
              </button>
            </div>

            <button 
              onClick={() => setIsTimerSettingsOpen(!isTimerSettingsOpen)}
              className="absolute top-4 right-4 z-20 p-2 text-white/40 hover:text-white transition-colors"
            >
              <Settings size={18} />
            </button>

            <AnimatePresence mode="wait">
              {isTimerSettingsOpen ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="z-10 flex flex-col items-center gap-4 py-4"
                >
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Work (min)</p>
                      <input 
                        type="number" 
                        value={workDuration}
                        onChange={(e) => setWorkDuration(Number(e.target.value))}
                        className="w-16 bg-white/10 border-none rounded-xl text-center py-1 text-base focus:ring-1 focus:ring-white/50"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Break (min)</p>
                      <input 
                        type="number" 
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(Number(e.target.value))}
                        className="w-16 bg-white/10 border-none rounded-xl text-center py-1 text-base focus:ring-1 focus:ring-white/50"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => { setIsTimerSettingsOpen(false); resetTimer(); }}
                    className="bg-white text-black text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest"
                  >
                    Save & Reset
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key={timerMode}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center z-10"
                >
                  <h2 className="text-sm font-medium text-white/40 mb-2 uppercase tracking-widest text-[10px]">
                    {timerMode === 'work' ? 'Deep Focus' : 'Recovery Time'}
                  </h2>
                  <div className="text-5xl font-mono tracking-tighter mb-4">{formatTimer(timerSeconds)}</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleTimer}
                      className={`px-8 py-2.5 rounded-2xl text-xs font-semibold transition-colors ${timerRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-white text-black hover:bg-gray-100'}`}
                    >
                      {timerRunning ? 'Pause' : 'Start Session'}
                    </button>
                    {(timerSeconds < (timerMode === 'work' ? workDuration : breakDuration) * 60) && (
                      <button 
                        onClick={resetTimer}
                        className="bg-white/10 hover:bg-white/20 px-3 rounded-2xl transition-colors"
                      >
                        <RefreshCcw size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>


          {/* Future Scaling Placeholder */}
          <section id="settings-widget" className="md:col-span-8 bg-white/50 border border-dashed border-gray-200 rounded-3xl p-8 flex items-center justify-center text-gray-400 hover:border-blue-200 hover:bg-blue-50/10 transition-all group cursor-pointer scroll-mt-24">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full border border-gray-200 group-hover:border-blue-200 transition-colors">
                <Plus size={24} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium">Add modular API integration (Spotify, Weather, etc.)</p>
            </div>
          </section>

        </div>

        {/* Global Nav for Mobile */}
        <nav className="fixed bottom-6 pb-[env(safe-area-inset-bottom)] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-3xl px-8 py-4 flex items-center justify-between md:hidden z-50">
          <button 
            onClick={() => scrollToSection('top', 'home')} 
            className={`transition-all active:scale-95 ${activeTab === 'home' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
          >
            <LayoutGrid size={22} />
          </button>
          <button 
            onClick={() => scrollToSection('tasks-widget', 'tasks')} 
            className={`transition-all active:scale-95 ${activeTab === 'tasks' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
          >
            <SquareCheckBig size={22} />
          </button>
          <button 
            onClick={() => scrollToSection('vocab-widget', 'vocab')} 
            className={`transition-all active:scale-95 ${activeTab === 'vocab' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
          >
            <Languages size={22} />
          </button>
          <button 
            onClick={() => scrollToSection('notes-widget', 'notes')} 
            className={`transition-all active:scale-95 ${activeTab === 'notes' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
          >
            <Notebook size={22} />
          </button>
        </nav>
      </div>
      
      {/* Footer / Info */}
      <footer className="max-w-6xl mx-auto mt-20 mb-8 flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-gray-300 font-medium">
        <span>ZENITH UTILITY SYSTEM v1.0.0</span>
      </footer>
    </div>
  );
}
