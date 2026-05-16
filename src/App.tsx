/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Bell, MoreHorizontal, Flag, BookOpen, User, Plus, Calendar, Clock, Check, CheckCircle2, ArrowRight, Camera, X, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

type TaskStatus = 'open' | 'claimed' | 'completed';

interface Task {
  id: string;
  title: string;
  category: string;
  timeLimit: string;
  points: number;
  status: TaskStatus;
  isUrgent?: boolean;
  requiresPhoto?: boolean;
  assignee?: string;
  assignedGroup?: string;
  description?: string;
  files?: string[];
}

const initialTasks: Task[] = [
  { id: '1', title: 'Restock front shelves', category: 'Floor', points: 3, timeLimit: '30 mins', status: 'completed', requiresPhoto: true, assignee: 'Hasan', description: 'Please ensure all items from the backroom are brought to the front and arranged by size according to the planogram.', files: ['planogram_v2.pdf'] },
  { id: '2', title: 'Organize shoe display', category: 'Floor', points: 4, timeLimit: '45 mins', status: 'claimed', requiresPhoto: true, assignee: 'Hasan', description: 'Make sure all shoes are paired correctly and sizes run from smallest to largest left-to-right.' },
  { id: '3', title: 'Help at register 3', category: 'Service', points: 2, timeLimit: '15 mins', status: 'open', isUrgent: true, requiresPhoto: false, assignedGroup: 'Cashiers', description: 'Line is backing up, need immediate assistance for 15 minutes to clear the rush.' },
  { id: '4', title: 'Clean breakroom', category: 'Maintenance', points: 2, timeLimit: '30 mins', status: 'completed', requiresPhoto: true },
  { id: '5', title: 'Inventory check - electronics', category: 'Stock', points: 5, timeLimit: '1.5 hrs', status: 'open', requiresPhoto: true, files: ['inventory_list_elect.pdf'] },
  { id: '6', title: 'Update promotion signs', category: 'Floor', points: 3, timeLimit: '45 mins', status: 'open', requiresPhoto: true, assignedGroup: 'Floor Staff', description: 'Remove old weekend sale signs and put up the new clearance event signs.', files: ['sign_locations.pdf', 'clearance_guidelines.pdf'] },
  { id: '7', title: 'Worked as cashier (3 hours)', category: 'Service', points: 8, timeLimit: '3 hrs', status: 'open', requiresPhoto: false },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'profile'>('today');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isProcessingTask, setIsProcessingTask] = useState(false);
  
  const dailyGoal = 50;
  // Calculate gamification points
  const pointsEarned = useMemo(() => {
    return tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.points, 0);
  }, [tasks]);

  const handleClaim = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'claimed', assignee: 'Hasan' } : t));
    setSelectedTask(prev => prev?.id === taskId ? { ...prev, status: 'claimed', assignee: 'Hasan' } : prev);
  };

  const handleCompleteRequest = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.requiresPhoto) {
      setTaskToComplete(taskId);
      setPhotoModalOpen(true);
    } else {
      finalizeComplete(taskId);
    }
  };

  const finalizeComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    setSelectedTask(prev => prev?.id === taskId ? { ...prev, status: 'completed' } : prev);
    setPhotoModalOpen(false);
    setTaskToComplete(null);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleAIAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    
    setIsProcessingTask(true);
    
    // Simulate AI evaluating the submission: (difficulty*speed)+consistency - penalties
    setTimeout(() => {
      const calculatedPoints = Math.floor(Math.random() * 4) + 2; 
      
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: title,
        category: 'AI Assessed',
        timeLimit: '30 mins',
        points: calculatedPoints,
        status: 'claimed',
        requiresPhoto: true,
        assignee: 'Hasan',
      };
      setTasks(prev => [newTask, ...prev]);
      setAddTaskModalOpen(false);
      setIsProcessingTask(false);
    }, 1500);
  };

  return (
    <div className="h-[100dvh] bg-[#141416] text-[#F3F4F6] font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] antialiased overflow-hidden flex flex-col relative w-full shadow-2xl selection:bg-[#D2F442] selection:text-black">
      {/* Background ambient gradient */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-br from-[#2f3812] via-[#141416] to-[#141416] opacity-60 pointer-events-none" />

      {/* Main Scrollable Content */}
      <div className="relative z-10 flex flex-col flex-1 h-full overflow-y-auto hide-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'today' ? (
            <motion.div key="today" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col flex-1">
              <TodayView 
                tasks={tasks} 
                pointsEarned={pointsEarned} 
                dailyGoal={dailyGoal} 
                onClaim={handleClaim}
                onComplete={handleCompleteRequest}
                onOpenMore={() => setMoreMenuOpen(true)}
                onTaskClick={setSelectedTask}
              />
            </motion.div>
          ) : (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="flex flex-col flex-1">
              <ProfileView />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Footer */}
        <div className="mt-auto px-6 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-8 text-center text-zinc-500 text-[12px] font-medium shrink-0 pointer-events-none">
          <span className="font-bold text-zinc-400">Bravus</span><br/>
          Copyright © Darvish CO
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] inset-x-0 w-full max-w-[400px] mx-auto px-4 flex justify-between items-center z-50 pointer-events-none">
        {/* Nav Pill */}
        <div className="flex bg-[#28282A] p-1.5 rounded-full shadow-2xl flex-1 mr-3 pointer-events-auto items-center">
          <NavButton 
            icon={<Calendar className="w-5 h-5" />} 
            label="Today" 
            isActive={activeTab === 'today'} 
            onClick={() => setActiveTab('today')} 
          />
          <NavButton 
            icon={<User className="w-5 h-5" />} 
            label="Profile" 
            isActive={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </div>
        {/* FAB */}
        <button 
          onClick={() => setAddTaskModalOpen(true)}
          className="bg-[#28282A] w-[60px] h-[60px] rounded-full flex items-center justify-center shrink-0 shadow-[0_8px_30px_rgba(0,0,0,0.5)] pointer-events-auto hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer border border-zinc-700/50"
        >
          <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
      {photoModalOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white rounded-3xl p-6 w-full max-w-sm mx-auto shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Photo Required</h3>
            <p className="text-zinc-500 text-center text-[15px] mb-6">Please upload a photo of the completed task area for verification.</p>
            <button 
              onClick={() => taskToComplete && finalizeComplete(taskToComplete)}
              className="w-full py-3.5 bg-zinc-900 text-white rounded-xl font-bold text-[15px] mb-3 hover:bg-black transition-colors"
            >
              Take Photo & Complete
            </button>
            <button 
              onClick={() => { setPhotoModalOpen(false); setTaskToComplete(null); }}
              className="w-full py-3.5 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-[15px] hover:bg-zinc-200 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {addTaskModalOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 pb-[env(safe-area-inset-bottom)]">
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white rounded-t-3xl sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 w-full max-w-sm mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Submit New Task</h3>
              <button onClick={() => !isProcessingTask && setAddTaskModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 bg-zinc-100 rounded-full p-1.5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAIAddTask} className="flex flex-col gap-4 text-zinc-900">
              <input name="title" required disabled={isProcessingTask} placeholder="What task did you complete?" className="w-full px-4 py-3 rounded-xl bg-zinc-100 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#D2F442] font-medium disabled:opacity-50" />
              
              <div className="border-2 border-dashed border-zinc-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-50 transition-colors">
                <ImageIcon className="w-8 h-8 text-zinc-400" />
                <span className="text-[14px] font-medium text-zinc-500">Upload Photo Proof</span>
              </div>

              <button type="submit" disabled={isProcessingTask} className="w-full py-3.5 bg-[#D2F442] text-zinc-900 rounded-xl font-bold text-[16px] mt-4 shadow-sm hover:bg-[#c1e331] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isProcessingTask ? (
                   <>
                     <div className="w-4 h-4 rounded-full border-2 border-zinc-900/20 border-t-zinc-900 animate-spin" />
                     AI is calculating points...
                   </>
                ) : 'Submit to AI'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {moreMenuOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center p-0" onClick={() => setMoreMenuOpen(false)}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white rounded-t-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] w-full max-w-[400px] mx-auto shadow-2xl flex flex-col gap-2" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-4" />
            <button className="w-full text-left px-4 py-3.5 rounded-xl font-semibold text-zinc-800 hover:bg-zinc-100 transition-colors">Sort by Urgent First</button>
            <button className="w-full text-left px-4 py-3.5 rounded-xl font-semibold text-zinc-800 hover:bg-zinc-100 transition-colors">Sort by Points</button>
            <button className="w-full text-left px-4 py-3.5 rounded-xl font-semibold text-zinc-800 hover:bg-zinc-100 transition-colors">Clear Completed</button>
            <button onClick={() => setMoreMenuOpen(false)} className="w-full mt-2 py-3.5 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-[15px] hover:bg-zinc-200 transition-colors">Cancel</button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Task Details Overlay */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailView 
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onClaim={() => handleClaim(selectedTask.id)}
            onComplete={() => handleCompleteRequest(selectedTask.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Views ---

function TodayView({ tasks, pointsEarned, dailyGoal, onClaim, onComplete, onOpenMore, onTaskClick }: any) {
  const [filter, setFilter] = useState<'All' | 'Available' | 'My Tasks' | 'Completed' | 'Urgent'>('All');

  const filteredTasks = useMemo(() => {
    let result = tasks;
    switch (filter) {
      case 'Available': result = tasks.filter((t: Task) => t.status === 'open'); break;
      case 'My Tasks': result = tasks.filter((t: Task) => t.status === 'claimed'); break;
      case 'Completed': result = tasks.filter((t: Task) => t.status === 'completed'); break;
      case 'Urgent': result = tasks.filter((t: Task) => t.isUrgent && t.status !== 'completed'); break;
      default: result = tasks.filter((t: Task) => t.status !== 'completed'); // 'All' excludes completed for a cleaner view
    }
    // Always sort urgent tasks first
    return result.sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return 0;
    });
  }, [tasks, filter]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start px-6 pt-[calc(env(safe-area-inset-top)+3rem)] pb-5">
        <div>
          <p className="text-[#a1a1aa] text-[13px] font-medium tracking-wide mb-1">Wednesday, 26 February</p>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Hi, Hasan</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#28282A] flex items-center justify-center shrink-0 hover:bg-zinc-800 transition-colors cursor-pointer">
          <Bell className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Gamification Goal Card */}
      <div className="px-6 mb-7">
        <div className="bg-[#D2F442] rounded-[28px] p-5 flex justify-between items-center shadow-[0_8px_30px_rgb(210,244,66,0.15)] text-[#18181b] relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <h2 className="text-[19px] font-bold tracking-tight">Points Goal</h2>
            </div>
            <p className="text-[#65761a] text-[14px] font-semibold">{pointsEarned} / {dailyGoal} points earned</p>
          </div>
          <div className="relative z-10">
            <CircularProgress value={Math.round((pointsEarned / dailyGoal) * 100)} size={68} strokeWidth={6} color="stroke-[#18181b]" trackColor="stroke-[#18181b]/10" textClass="text-base font-bold" overColor="stroke-[#EAB308]" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 pb-6 overflow-x-auto hide-scrollbar flex gap-2">
        <TabBadge label="All" count={`${tasks.filter((t: Task) => t.status !== 'completed').length}`} isActive={filter === 'All'} onClick={() => setFilter('All')} />
        <TabBadge label="Urgent" count={`${tasks.filter((t: Task) => t.isUrgent).length}`} isActive={filter === 'Urgent'} onClick={() => setFilter('Urgent')} />
        <TabBadge label="Available" count={`${tasks.filter((t: Task) => t.status === 'open').length}`} isActive={filter === 'Available'} onClick={() => setFilter('Available')} />
        <TabBadge label="My Tasks" count={`${tasks.filter((t: Task) => t.status === 'claimed').length}`} isActive={filter === 'My Tasks'} onClick={() => setFilter('My Tasks')} />
        <TabBadge label="Completed" count={`${tasks.filter((t: Task) => t.status === 'completed').length}`} isActive={filter === 'Completed'} onClick={() => setFilter('Completed')} />
      </div>

      {/* White Sheet Content */}
      <div className="bg-[#FFFFFF] mx-0 sm:mx-0 rounded-[32px] mt-4 pt-7 px-5 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] min-h-[400px]">
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="text-[17px] font-bold text-zinc-900 tracking-tight">{filter} Tasks</h3>
          <button onClick={onOpenMore} className="text-zinc-400 p-1 hover:text-zinc-600 transition-colors cursor-pointer"><MoreHorizontal className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-zinc-500 py-10 text-[14px] font-medium"
              >
                No tasks found.
              </motion.div>
            ) : (
              filteredTasks.map((task: Task) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  key={task.id}
                >
                  <StoreTaskItem 
                    task={task} 
                    onClaim={() => onClaim(task.id)} 
                    onComplete={() => onComplete(task.id)}
                    onClick={() => onTaskClick(task)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="flex flex-col px-6 pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-6">
      
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Hasan Hasanov" className="w-[72px] h-[72px] rounded-full ring-4 ring-[#28282A] object-cover" />
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Hasan Hasanov</h1>
          <p className="text-[#a1a1aa] text-[14px]">Store Associate</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex gap-4 mb-8">
         <div className="flex-1 bg-[#28282A] rounded-[24px] p-5 shadow-lg">
            <p className="text-[#a1a1aa] text-[13px] font-medium mb-1">Monthly Points</p>
            <p className="text-[#D2F442] text-[22px] font-semibold">1,420</p>
         </div>
         <div className="flex-1 bg-[#28282A] rounded-[24px] p-5 shadow-lg">
            <p className="text-[#a1a1aa] text-[13px] font-medium mb-1">Overall</p>
            <p className="text-white text-[22px] font-semibold">8,350</p>
         </div>
      </div>

      {/* Activity Calendar (GitHub style) */}
      <div className="bg-[#28282A] rounded-[24px] p-5 shadow-lg mb-8">
        <h3 className="text-white font-semibold text-[15px] mb-3">Activity Calendar</h3>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-2">
           {/* Generate roughly 7 months of 7 days */}
           {Array.from({ length: 24 }).map((_, colIndex) => (
             <div key={colIndex} className="flex flex-col gap-1.5 shrink-0">
               {Array.from({ length: 7 }).map((_, rowIndex) => {
                 const activityLevel = Math.random();
                 // Using github-like colors but matching app theme
                 let bgColor = 'bg-zinc-800/80';
                 if (activityLevel > 0.8) bgColor = 'bg-[#D2F442]';
                 else if (activityLevel > 0.6) bgColor = 'bg-[#c1e331]/80';
                 else if (activityLevel > 0.4) bgColor = 'bg-[#9cad24]';
                 else if (activityLevel > 0.2) bgColor = 'bg-[#4b5413]';
                 
                 return (
                   <div 
                     key={rowIndex} 
                     className={`w-3.5 h-3.5 rounded-sm ${bgColor} hover:ring-1 hover:ring-white transition-all cursor-pointer`}
                     title={`Activity level: ${Math.floor(activityLevel * 10)}`}
                   />
                 );
               })}
             </div>
           ))}
        </div>
        <div className="flex justify-between text-zinc-500 text-[11px] mt-1 font-medium px-1">
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
          <span>Jan</span>
          <span>Feb</span>
        </div>
      </div>

      {/* Task History */}
      <div className="bg-white rounded-[24px] p-5 shadow-lg">
        <h3 className="text-zinc-900 font-semibold text-[15px] mb-4">Recent Task History</h3>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-zinc-900">Restock front shelves</span>
              <span className="text-[12px] text-zinc-500">Today, 2:30 PM</span>
            </div>
            <span className="text-[13px] font-semibold text-zinc-900">+3 pts</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-zinc-900">Clean breakroom</span>
              <span className="text-[12px] text-zinc-500">Today, 11:15 AM</span>
            </div>
            <span className="text-[13px] font-semibold text-zinc-900">+2 pts</span>
          </div>
          <div className="flex justify-between items-center pb-1">
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-zinc-900">End of day deposit</span>
              <span className="text-[12px] text-zinc-500">Yesterday, 9:00 PM</span>
            </div>
            <span className="text-[13px] font-semibold text-zinc-900">+5 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Components ---

function NavButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  if (!label) {
    return null;
  }

  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-2 h-12 flex-1 justify-center rounded-full font-semibold transition-colors duration-300 cursor-pointer ${isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
    >
      {isActive && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 bg-white rounded-full shadow-md z-0"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <span>{icon}</span>
        {isActive && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} className="text-[14px] overflow-hidden whitespace-nowrap">{label}</motion.span>}
      </span>
    </button>
  );
}

function TabBadge({ label, count, isActive = false, onClick }: { label: string, count: string, isActive?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`shrink-0 flex flex-col justify-center px-4 py-2.5 rounded-[18px] cursor-pointer transition-all duration-200 hover:scale-[0.98] active:scale-95 ${isActive ? 'bg-white shadow-sm ring-1 ring-white' : 'bg-[#28282A] hover:bg-zinc-800'}`}>
      <span className={`text-[14px] font-bold text-left ${isActive ? 'text-zinc-900' : 'text-[#e4e4e7]'}`}>{label}</span>
      <span className={`text-[11px] font-semibold text-left ${isActive ? 'text-[#65761a]' : 'text-[#858589]'}`}>{count}</span>
    </button>
  );
}

const StoreTaskItem: React.FC<{ task: Task, onClaim: () => void, onComplete: () => void, onClick: () => void }> = ({ task, onClaim, onComplete, onClick }) => {
  
  // Decide styling accents based on state
  let accentColor = "bg-zinc-300";
  let actionBtn = null;

  if (task.status === 'open') {
    accentColor = task.isUrgent ? "bg-zinc-800" : "bg-[#D2F442]";
    actionBtn = (
      <button onClick={(e) => { e.stopPropagation(); onClaim(); }} className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white text-[13px] font-bold rounded-xl active:scale-95 transition-all shadow-sm">
        Claim <ArrowRight className="w-3.5 h-3.5" />
      </button>
    );
  } else if (task.status === 'claimed') {
    accentColor = "bg-zinc-600";
    actionBtn = (
      <button onClick={(e) => { e.stopPropagation(); onComplete(); }} className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#D2F442] hover:bg-[#c1e331] text-zinc-900 text-[13px] font-bold rounded-xl active:scale-95 transition-all shadow-sm">
        Mark Done <CheckCircle2 className="w-3.5 h-3.5" />
      </button>
    );
  } else {
    accentColor = "bg-zinc-200";
    actionBtn = (
      <div className="flex items-center justify-center gap-1 text-[13px] font-bold text-zinc-500 px-2 py-1 bg-zinc-100 rounded-lg">
        <Check className="w-4 h-4" /> Completed
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`flex-1 rounded-[20px] p-3.5 pl-4 relative border shadow-sm overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md hover:border-zinc-200 
      ${task.status === 'completed' ? 'bg-white border-zinc-200 opacity-70' : 'bg-[#F5F6F8] border-zinc-100'}
    `}>
      {/* Left Color Accent Line */}
      <div className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md ${accentColor}`} />
      
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex flex-col gap-1 w-3/4">
          <h4 className="text-[15px] font-bold text-zinc-900 tracking-tight leading-snug">{task.title}</h4>
          {task.isUrgent && (
            <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-md bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider">
              <Flag className="w-3 h-3 text-white" /> Urgent
            </span>
          )}
        </div>
        <div className="flex items-center justify-center px-2 py-1 bg-zinc-100 rounded-lg shadow-sm border border-zinc-200 text-zinc-900 font-bold text-[12px] whitespace-nowrap">
          +{task.points} pts
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-1">
        <div className="flex flex-col gap-1.5">
          {task.assignedGroup && (
             <div className="flex items-center gap-1.5 text-zinc-500 font-medium tracking-wide">
               <User className="w-3.5 h-3.5 opacity-70" />
               <span className="text-[12px]">For: {task.assignedGroup}</span>
             </div>
          )}
          {task.assignee && (
             <div className="flex items-center gap-1.5 text-zinc-500 font-medium tracking-wide">
               <User className="w-3.5 h-3.5 opacity-70" />
               <span className="text-[12px]">Assigned: {task.assignee}</span>
             </div>
          )}
          <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span className="text-[12px]">{task.timeLimit} limit</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 font-medium tracking-wide">
            <Flag className={`w-3.5 h-3.5 opacity-70 ${task.isUrgent ? 'text-zinc-800' : ''}`} />
            <span className="text-[12px] uppercase">{task.category}</span>
          </div>
        </div>
        
        <div className="ml-2 flex items-center gap-2">
          {task.requiresPhoto && task.status !== 'completed' && <Camera className="w-4 h-4 text-zinc-400" />}
          {actionBtn}
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ value, size = 64, strokeWidth = 6, color = "stroke-current", trackColor = "stroke-current", textClass = "", overColor = "" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const isOver = value > 100;
  const firstLevelOffset = circumference - (Math.min(value, 100) / 100) * circumference;
  const secondLevelOffset = isOver ? circumference - (Math.min(value - 100, 100) / 100) * circumference : circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Base Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className={trackColor} strokeWidth={strokeWidth} />
        
        {/* First 100% */}
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" className={`${isOver ? color : color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={firstLevelOffset}
        />

        {/* Above 100% (Gold overlay) */}
        {isOver && (
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" className={`${overColor} transition-all duration-1000 ease-out drop-shadow-sm`}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={secondLevelOffset}
          />
        )}
      </svg>
      <span className={`absolute flex items-center justify-center tracking-tight ${textClass} ${isOver ? 'text-[#ca8a04]' : ''}`}>
        {value}%
      </span>
    </div>
  );
}

function TaskDetailView({ task, onClose, onClaim, onComplete }: any) {
  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute inset-0 z-[80] bg-[#141416] flex flex-col pt-[calc(env(safe-area-inset-top)+2.5rem)]"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-2 pb-4">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#28282A] flex items-center justify-center shrink-0 hover:bg-zinc-800 transition-colors cursor-pointer text-white">
          <ArrowRight className="w-5 h-5 -scale-x-100" />
        </button>
        <span className="text-white font-semibold flex-1 text-center truncate px-4">{task.category} Task</span>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 hide-scrollbar">
        {task.isUrgent && (
           <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-white text-[12px] font-bold uppercase tracking-wider mb-4 border border-zinc-700">
             <Flag className="w-3 h-3 text-white" /> Urgent
           </div>
        )}
        <h1 className="text-[28px] font-bold text-white leading-tight mb-4">{task.title}</h1>
        
        <div className="flex flex-wrap gap-2 mb-8">
           <div className="flex items-center gap-2 bg-[#D2F442] px-3.5 py-2 rounded-xl text-zinc-900 font-medium text-[14px] shadow-[0_4px_15px_rgb(210,244,66,0.15)]">
             <span className="font-bold">+{task.points} pts</span>
           </div>
           <div className="flex items-center gap-2 bg-[#28282A] px-3.5 py-2 rounded-xl text-zinc-300 font-medium text-[14px]">
             <Clock className="w-4 h-4 text-zinc-400" /> {task.timeLimit} limit
           </div>
           {task.requiresPhoto && (
             <div className="flex items-center gap-2 bg-[#28282A] px-3.5 py-2 rounded-xl text-zinc-300 font-medium text-[14px]">
               <Camera className="w-4 h-4 text-zinc-400" /> Photo proof
             </div>
           )}
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-xl text-zinc-900">
          <h3 className="font-bold text-[16px] mb-2">Description</h3>
          <p className="text-zinc-600 text-[15px] leading-relaxed mb-6">
            {task.description || "No additional description provided for this task. Follow standard procedures."}
          </p>

          {task.files && task.files.length > 0 && (
            <>
              <h3 className="font-bold text-[16px] mb-3">Attached Files</h3>
              <div className="flex flex-col gap-2 mb-6">
                {task.files.map((file: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-zinc-200 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-zinc-500" />
                    </div>
                    <span className="text-[14px] font-semibold flex-1 truncate">{file}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {task.assignee && (
            <div className="mt-2 pt-6 border-t border-zinc-100 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                 <User className="w-5 h-5 text-zinc-400" />
               </div>
               <div>
                 <p className="text-[12px] text-zinc-500 font-medium">Assigned to</p>
                 <p className="text-[14px] font-bold">{task.assignee}</p>
               </div>
            </div>
          )}
          {task.assignedGroup && (
            <div className="mt-2 pt-6 border-t border-zinc-100 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                 <User className="w-5 h-5 text-zinc-400" />
               </div>
               <div>
                 <p className="text-[12px] text-zinc-500 font-medium">Assigned Group</p>
                 <p className="text-[14px] font-bold">{task.assignedGroup}</p>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[#141416] via-[#141416] to-transparent pt-20 pointer-events-none">
        {task.status === 'open' && (
          <button onClick={onClaim} className="pointer-events-auto w-full py-4 rounded-2xl bg-[#D2F442] hover:bg-[#c1e331] text-zinc-900 font-bold text-[16px] flex justify-center items-center gap-2 shadow-lg transition-transform active:scale-95">
            Claim Task <ArrowRight className="w-5 h-5" />
          </button>
        )}
        {task.status === 'claimed' && (
          <button onClick={onComplete} className="pointer-events-auto w-full py-4 rounded-2xl bg-[#D2F442] hover:bg-[#c1e331] text-zinc-900 font-bold text-[16px] flex justify-center items-center gap-2 shadow-lg transition-transform active:scale-95">
            Mark as Completed <CheckCircle2 className="w-5 h-5" />
          </button>
        )}
        {task.status === 'completed' && (
          <div className="pointer-events-auto w-full py-4 rounded-2xl bg-[#28282A] text-[#a1a1aa] font-bold text-[16px] flex justify-center items-center gap-2 border border-zinc-800">
            <Check className="w-5 h-5" /> Completed
          </div>
        )}
      </div>
    </motion.div>
  );
}
