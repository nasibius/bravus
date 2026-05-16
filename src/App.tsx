/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Bell, MoreHorizontal, Flag, BookOpen, User, Plus, Calendar, Clock, Check, CheckCircle2, ArrowRight, Camera, X, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

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
  { id: '3', title: 'Help at register 3', category: 'Service', points: 2, timeLimit: '15 mins', status: 'open', isUrgent: true, requiresPhoto: false, assignedGroup: 'Cashiers', description: 'Line is backing up, need immediate assistance for 15 minutes to clear the rush.' },
  { id: '6', title: 'Update promotion signs', category: 'Floor', points: 3, timeLimit: '45 mins', status: 'open', requiresPhoto: true, assignedGroup: 'Floor Staff', description: 'Remove old weekend sale signs and put up the new clearance event signs.', files: ['sign_locations.pdf', 'clearance_guidelines.pdf'] },
  { id: '7', title: 'Work as cashier (3 hours)', category: 'Service', points: 8, timeLimit: '3 hrs', status: 'open', requiresPhoto: false },
  { id: '8', title: 'Organizing products on shelves', category: 'Stock', points: 4, timeLimit: '1 hr', status: 'open', requiresPhoto: false },
  { id: '9', title: 'Chaning price tags in drink area', category: 'Floor', points: 3, timeLimit: '30 mins', status: 'open', requiresPhoto: true }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'profile'>('today');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isProcessingTask, setIsProcessingTask] = useState(false);

  // Prevent background scrolling when overlays are open
  useEffect(() => {
    if (selectedTask || photoModalOpen || addTaskModalOpen || moreMenuOpen || notificationsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedTask, photoModalOpen, addTaskModalOpen, moreMenuOpen, notificationsOpen]);
  
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
    <div className="min-h-[100dvh] w-full bg-[#141416] text-[#F3F4F6] font-sans antialiased flex flex-col relative shadow-2xl selection:bg-[#D2F442] selection:text-black">
      {/* Background ambient gradient */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-br from-[#2f3812] via-[#141416] to-[#141416] opacity-60 pointer-events-none z-0" />
      <BackgroundHexagon />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col flex-1 w-full">
        <AnimatePresence mode="popLayout">
          {activeTab === 'today' ? (
            <motion.div key="today" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15, ease: "easeOut" }} className="flex flex-col flex-1">
              <TodayView 
                tasks={tasks} 
                pointsEarned={pointsEarned} 
                dailyGoal={dailyGoal} 
                onClaim={handleClaim}
                onComplete={handleCompleteRequest}
                onOpenMore={() => setMoreMenuOpen(true)}
                onOpenNotifications={() => setNotificationsOpen(true)}
                onTaskClick={setSelectedTask}
              />
            </motion.div>
          ) : (
            <motion.div key="profile" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15, ease: "easeOut" }} className="flex flex-col flex-1">
              <ProfileView />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Footer */}
        <div className="mt-auto px-6 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-8 text-center text-zinc-500 text-[11px] font-medium shrink-0 pointer-events-none opacity-50">
          <span className="font-bold text-zinc-400">BrHive</span> • Copyright © Darvish CO
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] inset-x-0 w-full max-w-[400px] mx-auto px-4 flex justify-between items-center z-50 pointer-events-none">
        {/* Nav Pill */}
        <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-full shadow-lg flex-1 mr-3 pointer-events-auto items-center border border-white/10">
          <NavButton 
            icon={<Calendar className="w-4 h-4" />} 
            label="Today" 
            isActive={activeTab === 'today'} 
            onClick={() => setActiveTab('today')} 
          />
          <NavButton 
            icon={<User className="w-4 h-4" />} 
            label="Profile" 
            isActive={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </div>
        {/* FAB */}
        <button 
          onClick={() => setAddTaskModalOpen(true)}
          className="bg-white/10 backdrop-blur-md w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 shadow-lg pointer-events-auto hover:bg-white/20 active:scale-95 transition-all cursor-pointer border border-white/10"
        >
          <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
      {photoModalOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 pb-[env(safe-area-inset-bottom)]">
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 w-full max-w-sm mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Submit New Task</h3>
              <button onClick={() => !isProcessingTask && setAddTaskModalOpen(false)} className="text-zinc-400 hover:text-white bg-zinc-800 rounded-full p-1.5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAIAddTask} className="flex flex-col gap-4 text-zinc-900">
              <input name="title" required disabled={isProcessingTask} placeholder="What task did you complete?" className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#D2F442] font-medium disabled:opacity-50 text-white placeholder-zinc-500" />
              
              <div className="border border-dashed border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-800/50 transition-colors bg-[#0A0A0A]/50">
                <ImageIcon className="w-8 h-8 text-zinc-500" />
                <span className="text-[14px] font-medium text-zinc-500">Upload Photo Proof</span>
              </div>

              <button type="submit" disabled={isProcessingTask} className="w-full py-3.5 bg-[#D2F442] text-black rounded-xl font-bold text-[15px] mt-4 shadow-sm hover:bg-[#c1e331] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isProcessingTask ? (
                   <>
                     <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                     Processing...
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center p-0" onClick={() => setMoreMenuOpen(false)}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white/5 backdrop-blur-md rounded-t-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] w-full max-w-[400px] mx-auto shadow-2xl flex flex-col gap-2 border-t border-white/10" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-zinc-700/50 rounded-full mx-auto mb-4" />
            <button className="w-full text-left px-4 py-3.5 rounded-xl font-semibold text-white hover:bg-zinc-800/50 transition-colors">Sort by Urgent First</button>
            <button className="w-full text-left px-4 py-3.5 rounded-xl font-semibold text-white hover:bg-zinc-800/50 transition-colors">Sort by Points</button>
            <button className="w-full text-left px-4 py-3.5 rounded-xl font-semibold text-white hover:bg-zinc-800/50 transition-colors">Clear Completed</button>
            <button onClick={() => setMoreMenuOpen(false)} className="w-full mt-2 py-3.5 bg-zinc-800 text-zinc-300 rounded-xl font-bold text-[15px] hover:bg-zinc-700 transition-colors">Cancel</button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {notificationsOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center p-0" onClick={() => setNotificationsOpen(false)}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white/5 backdrop-blur-md rounded-t-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] w-full max-w-[400px] mx-auto shadow-2xl flex flex-col gap-4 border-t border-white/10" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-zinc-700/50 rounded-full mx-auto mb-2" />
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg">
                <Bell className="w-8 h-8 text-white/50" />
              </div>
              <h3 className="text-[17px] font-bold text-white mb-2">No notifications for now</h3>
              <p className="text-[14px] text-zinc-400">We'll alert you when there's an update.</p>
            </div>
            <button onClick={() => setNotificationsOpen(false)} className="w-full py-3.5 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-[15px] hover:bg-white/20 transition-colors border border-white/10">Close</button>
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

function TodayView({ tasks, pointsEarned, dailyGoal, onClaim, onComplete, onOpenMore, onOpenNotifications, onTaskClick }: any) {
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
    <div className="flex flex-col flex-1 pb-6">
      {/* Header */}
      <div className="flex justify-between items-start px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-5">
        <div>
          <p className="text-[#a1a1aa] text-[13px] font-medium tracking-wide mb-1">Sunday, 17 May</p>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Hi, Hasan</h1>
        </div>
        <button onClick={onOpenNotifications} className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center shrink-0 hover:bg-white/10 transition-colors cursor-pointer border border-white/10 shadow-lg">
          <Bell className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 pb-6 overflow-x-auto hide-scrollbar flex gap-2">
        <TabBadge label="All" count={`${tasks.filter((t: Task) => t.status !== 'completed').length}`} isActive={filter === 'All'} onClick={() => setFilter('All')} />
        <TabBadge label="Urgent" count={`${tasks.filter((t: Task) => t.isUrgent).length}`} isActive={filter === 'Urgent'} onClick={() => setFilter('Urgent')} />
        <TabBadge label="Available" count={`${tasks.filter((t: Task) => t.status === 'open').length}`} isActive={filter === 'Available'} onClick={() => setFilter('Available')} />
        <TabBadge label="My Tasks" count={`${tasks.filter((t: Task) => t.status === 'claimed').length}`} isActive={filter === 'My Tasks'} onClick={() => setFilter('My Tasks')} />
        <TabBadge label="Completed" count={`${tasks.filter((t: Task) => t.status === 'completed').length}`} isActive={filter === 'Completed'} onClick={() => setFilter('Completed')} />
      </div>

      {/* Task List Content */}
      <div className="mx-0 sm:mx-0 mt-0 pt-0 px-5 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-[17px] font-bold text-white tracking-tight">{filter} Tasks</h3>
          <button onClick={onOpenMore} className="text-zinc-400 p-1 hover:text-white transition-colors cursor-pointer"><MoreHorizontal className="w-5 h-5" /></button>
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
              filteredTasks.map((task: Task, index: number) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.05 }}
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
    <div className="flex flex-col px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-6 flex-1">
      
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Hasan Hasanov" className="w-[72px] h-[72px] rounded-full ring-4 ring-[#1C1C1E] object-cover" />
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Hasan Hasanov</h1>
          <p className="text-[#a1a1aa] text-[14px]">Store Associate</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex gap-4 mb-8">
         <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-5 shadow-lg">
            <p className="text-[#a1a1aa] text-[13px] font-medium mb-1">Monthly Points</p>
            <p className="text-[#D2F442] text-[22px] font-semibold">1,420</p>
         </div>
         <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-5 shadow-lg">
            <p className="text-[#a1a1aa] text-[13px] font-medium mb-1">Overall</p>
            <p className="text-white text-[22px] font-semibold">8,350</p>
         </div>
      </div>

      {/* Activity Calendar (GitHub style) */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-5 shadow-lg mb-8">
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
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-5 shadow-lg mb-[calc(7rem+env(safe-area-inset-bottom))]">
        <h3 className="text-white font-semibold text-[15px] mb-4">Recent Task History</h3>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-zinc-700/50 pb-3">
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-white">Restock front shelves</span>
              <span className="text-[12px] text-zinc-400">Today, 2:30 PM</span>
            </div>
            <span className="text-[13px] font-semibold text-[#D2F442]">+3 pts</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-700/50 pb-3">
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-white">Clean breakroom</span>
              <span className="text-[12px] text-zinc-400">Today, 11:15 AM</span>
            </div>
            <span className="text-[13px] font-semibold text-[#D2F442]">+2 pts</span>
          </div>
          <div className="flex justify-between items-center pb-1">
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-white">End of day deposit</span>
              <span className="text-[12px] text-zinc-400">Yesterday, 9:00 PM</span>
            </div>
            <span className="text-[13px] font-semibold text-[#D2F442]">+5 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Components ---

function HexagonGeometry() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // outer hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = Math.cos(angle) * 1;
      const y = Math.sin(angle) * 1;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();

    // inner hole
    const hole = new THREE.Path();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * 0.7; // 30% thickness
        const y = Math.sin(angle) * 0.7;
        if (i === 0) hole.moveTo(x, y);
        else hole.lineTo(x, y);
    }
    hole.closePath();
    s.holes.push(hole);

    return s;
  }, []);

  const extrudeSettings = {
    depth: 0.3, // depth of hexagon
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.05
  };

  return (
    <mesh castShadow receiveShadow>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color="#6bad5b" roughness={0.3} metalness={0.7} />
    </mesh>
  );
}

function SpinningGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const [targetRotation, setTargetRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTargetRotation(prev => prev + Math.PI * 2);
    }, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotation,
        1,
        delta
      );
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function BackgroundHexagon() {
  return (
    <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none z-0 opacity-40 mix-blend-screen" style={{ transform: 'translateZ(0)' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <Environment preset="city" />
        <Float speed={2} rotationIntensity={0.8} floatIntensity={1.5}>
           <Center>
             <group rotation={[Math.PI / 8, Math.PI / 10, 0]} scale={1.5}>
               <SpinningGroup>
                 <HexagonGeometry />
               </SpinningGroup>
             </group>
           </Center>
        </Float>
      </Canvas>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  if (!label) {
    return null;
  }

  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-1.5 h-8 flex-1 justify-center rounded-full font-medium text-[12px] transition-colors duration-300 cursor-pointer ${isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
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
      className={`shrink-0 flex flex-col justify-center px-4 py-2.5 rounded-[18px] cursor-pointer transition-all duration-200 hover:scale-[0.98] active:scale-95 backdrop-blur-md ${isActive ? 'bg-[#D2F442]/20 border-[#D2F442]/30 border shadow-lg' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}>
      <span className={`text-[14px] font-bold text-left ${isActive ? 'text-[#D2F442]' : 'text-[#e4e4e7]'}`}>{label}</span>
      <span className={`text-[11px] font-semibold text-left ${isActive ? 'text-[#D2F442]/80' : 'text-[#858589]'}`}>{count}</span>
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
    accentColor = "bg-zinc-700";
    actionBtn = (
      <div className="flex items-center justify-center gap-1 text-[13px] font-bold text-zinc-400 px-2 py-1 bg-zinc-800/50 rounded-lg">
        <Check className="w-4 h-4" /> Completed
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`flex-1 rounded-[20px] p-3.5 pl-4 relative border shadow-lg overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-white/20 backdrop-blur-md
      ${task.status === 'completed' ? 'bg-white/5 border-white/5 opacity-60' : 'bg-white/5 border-white/10'}
    `}>
      {/* Left Color Accent Line */}
      <div className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md ${accentColor}`} />
      
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex flex-col gap-1 w-3/4">
          <h4 className="text-[15px] font-bold text-white tracking-tight leading-snug">{task.title}</h4>
          {task.isUrgent && (
            <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-md bg-[#D2F442]/20 text-[#D2F442] text-[10px] font-bold uppercase tracking-wider mt-0.5">
              <Flag className="w-3 h-3 text-[#D2F442]" /> Urgent
            </span>
          )}
        </div>
        <div className="flex items-center justify-center px-2 py-1 bg-zinc-800/80 rounded-lg shadow-sm border border-zinc-700/50 text-[#D2F442] font-bold text-[12px] whitespace-nowrap">
          +{task.points} pts
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-1">
        <div className="flex flex-col gap-1.5">
          {task.assignedGroup && (
             <div className="flex items-center gap-1.5 text-zinc-400 font-medium tracking-wide">
               <User className="w-3.5 h-3.5 opacity-70" />
               <span className="text-[12px]">For: {task.assignedGroup}</span>
             </div>
          )}
          {task.assignee && (
             <div className="flex items-center gap-1.5 text-zinc-400 font-medium tracking-wide">
               <User className="w-3.5 h-3.5 opacity-70" />
               <span className="text-[12px]">Assigned: {task.assignee}</span>
             </div>
          )}
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span className="text-[12px]">{task.timeLimit} limit</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium tracking-wide">
            <Flag className={`w-3.5 h-3.5 opacity-70 ${task.isUrgent ? 'text-[#D2F442]' : ''}`} />
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

function TaskDetailView({ task, onClose, onClaim, onComplete }: any) {
  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 w-full h-[100dvh] z-[80] bg-[#000000] flex flex-col pt-[calc(env(safe-area-inset-top)+2.5rem)]"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-2 pb-4">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0 hover:bg-zinc-800 transition-colors cursor-pointer text-white border border-zinc-800/50">
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
           <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl text-zinc-200 font-medium text-[14px]">
             <Clock className="w-4 h-4 text-zinc-300" /> {task.timeLimit} limit
           </div>
           {task.requiresPhoto && (
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl text-zinc-200 font-medium text-[14px]">
               <Camera className="w-4 h-4 text-zinc-300" /> Photo proof
             </div>
           )}
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 shadow-xl text-white mt-4 border border-white/10 mb-[120px] flex flex-col">
          <h3 className="font-bold text-[16px] mb-2 text-white">Description</h3>
          <p className="text-zinc-400 text-[15px] leading-relaxed mb-6">
            {task.description || "No additional description provided for this task. Follow standard procedures."}
          </p>

          {task.files && task.files.length > 0 && (
            <>
              <h3 className="font-bold text-[16px] mb-3 text-white">Attached Files</h3>
              <div className="flex flex-col gap-2 mb-6">
                {task.files.map((file: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/20 cursor-pointer hover:bg-black/40 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-zinc-400" />
                    </div>
                    <span className="text-[14px] font-semibold text-zinc-200 flex-1 truncate">{file}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {task.assignee && (
            <div className="mt-2 pt-6 border-t border-white/10 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center border border-white/5">
                 <User className="w-5 h-5 text-zinc-400" />
               </div>
               <div>
                 <p className="text-[12px] text-zinc-400 font-medium">Assigned to</p>
                 <p className="text-[14px] font-bold text-white">{task.assignee}</p>
               </div>
            </div>
          )}
          {task.assignedGroup && (
            <div className="mt-2 pt-6 border-t border-white/10 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center border border-white/5">
                 <User className="w-5 h-5 text-zinc-400" />
               </div>
               <div>
                 <p className="text-[12px] text-zinc-400 font-medium">Assigned Group</p>
                 <p className="text-[14px] font-bold text-white">{task.assignedGroup}</p>
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
          <div className="pointer-events-auto w-full py-4 rounded-2xl bg-white/5 backdrop-blur-md text-[#a1a1aa] font-bold text-[16px] flex justify-center items-center gap-2 border border-white/10">
            <Check className="w-5 h-5" /> Completed
          </div>
        )}
      </div>
    </motion.div>
  );
}
