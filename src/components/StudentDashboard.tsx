import React, { useState, useMemo } from "react";
import { 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  AlertCircle,
  Clock,
  Maximize2,
  Minimize2,
  ChevronRight,
  GraduationCap,
  CreditCard,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Info
} from "lucide-react";
import { motion } from "motion/react";
import { Student } from "../types";

interface StudentDashboardProps {
  student: Student;
  onSelectSubject: (subject: string) => void;
  onNavigateToTab: (tab: "Settings") => void;
}

type TileSize = "sm" | "md" | "lg";

export default function StudentDashboard({ 
  student, 
  onSelectSubject,
  onNavigateToTab 
}: StudentDashboardProps) {
  // Tile sizes and card layout reordering states
  const [feesSize, setFeesSize] = useState<TileSize>("md");
  const [attendanceSize, setAttendanceSize] = useState<TileSize>("md");
  const [subjectSizes, setSubjectSizes] = useState<Record<string, TileSize>>(() => {
    const initial: Record<string, TileSize> = {};
    student.enrolledSubjects.forEach(sub => {
      initial[sub] = "md";
    });
    return initial;
  });

  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem(`tuition_student_layout_${student.id}`);
    const allCards = ["attendance", "fees", ...student.enrolledSubjects];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(c => allCards.includes(c));
          const missing = allCards.filter(c => !filtered.includes(c));
          return [...filtered, ...missing];
        }
      } catch (e) {
        console.error("Failed to parse saved layout:", e);
      }
    }
    return allCards;
  });

  const saveOrder = (newOrder: string[]) => {
    setCardOrder(newOrder);
    localStorage.setItem(`tuition_student_layout_${student.id}`, JSON.stringify(newOrder));
  };

  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    if (!draggedCardId || draggedCardId === targetCardId) return;
    
    const dragIndex = cardOrder.indexOf(draggedCardId);
    const targetIndex = cardOrder.indexOf(targetCardId);
    
    if (dragIndex !== -1 && targetIndex !== -1) {
      const updated = [...cardOrder];
      updated.splice(dragIndex, 1);
      updated.splice(targetIndex, 0, draggedCardId);
      saveOrder(updated);
    }
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
  };

  const handleMoveUp = (cardId: string) => {
    const idx = cardOrder.indexOf(cardId);
    if (idx > 0) {
      const updated = [...cardOrder];
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
      saveOrder(updated);
    }
  };

  const handleMoveDown = (cardId: string) => {
    const idx = cardOrder.indexOf(cardId);
    if (idx !== -1 && idx < cardOrder.length - 1) {
      const updated = [...cardOrder];
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
      saveOrder(updated);
    }
  };

  const handleSetSubjectSize = (subject: string, size: TileSize) => {
    setSubjectSizes(prev => ({
      ...prev,
      [subject]: size
    }));
  };

  // Compute attendance stats
  const attendanceStats = useMemo(() => {
    const records = Object.values(student.attendance).filter(r => r !== "na");
    const total = records.length;
    const presents = records.filter(r => r === true).length;
    const rate = total > 0 ? Math.round((presents / total) * 100) : 100;
    return { presents, total, rate };
  }, [student.attendance]);

  // Compute subject progress stats
  const subjectProgress = useMemo(() => {
    return student.enrolledSubjects.map(sub => {
      const notes = student.notes[sub] || [];
      const total = notes.length;
      const completed = notes.filter(n => n.isCompleted).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        name: sub,
        total,
        completed,
        rate,
        notes
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [student.enrolledSubjects, student.notes]);

  // Calendar history for attendance card
  const recentAttendance = useMemo(() => {
    const dates = ["2026-07-14", "2026-07-13", "2026-07-12", "2026-07-11", "2026-07-10", "2026-07-09", "2026-07-08"];
    return dates.map(date => {
      const dateObj = new Date(date);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = dayNames[dateObj.getDay()];
      const dayNum = dateObj.getDate();
      const val = student.attendance[date];
      return { date, dayName, dayNum, val };
    });
  }, [student.attendance]);

  const currentMonthName = useMemo(() => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date();
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  const currentMonthStatus = student.feeMonths?.[currentMonthName] || (student.feePaidThisMonth ? "paid" : "unpaid");

  const feeStats = useMemo(() => {
    const entries = student.feeMonths ? Object.entries(student.feeMonths) : [];
    const paidCount = entries.filter(([_, status]) => status === "paid").length;
    const unpaidCount = entries.filter(([_, status]) => status === "unpaid").length;
    return { paidCount, unpaidCount };
  }, [student.feeMonths]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn" id="student-dashboard-root">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col gap-1.5" id="student-welcome-banner">
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <GraduationCap className="w-48 h-48" />
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-100 bg-white/10 px-2.5 py-1 rounded-full self-start">
          Personal Student Space
        </span>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
          Welcome back, {student.name}!
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-sm">
          Keep track of your subject revision notes, attendance stats, and chapter completeness.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="student-bento-grid">
        {cardOrder.map((cardId) => {
          if (cardId === "attendance") {
            return (
              <motion.div 
                layout
                draggable
                onDragStart={(e) => handleDragStart(e, "attendance")}
                onDragOver={(e) => handleDragOver(e, "attendance")}
                onDragEnd={handleDragEnd}
                key="attendance"
                className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-3xs overflow-hidden flex flex-col transition-all duration-300 ${
                  attendanceSize === "sm" ? "p-4 h-auto md:col-span-1" :
                  attendanceSize === "md" ? "p-5 h-[280px] md:col-span-1" : "p-6 h-auto md:col-span-2"
                } ${draggedCardId === "attendance" ? "opacity-40 border-dashed border-blue-500 scale-95" : ""}`}
                id="student-attendance-tile"
              >
                {/* Tile Header */}
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2.5 mb-3">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                    <Calendar className="w-4.5 h-4.5 text-indigo-500" />
                    Attendance Performance
                  </span>
                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-850 rounded-lg p-0.5 border border-slate-200/20">
                      <button 
                        onClick={() => handleMoveUp("attendance")}
                        className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleMoveDown("attendance")}
                        className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-100 dark:border-slate-700">
                      {(["sm", "md", "lg"] as TileSize[]).map(sz => (
                        <button
                          key={sz}
                          onClick={() => setAttendanceSize(sz)}
                          className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md transition-all cursor-pointer ${
                            attendanceSize === sz 
                              ? "bg-indigo-600 text-white shadow-xs" 
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tile Body - Conditional on Sizing */}
                {attendanceSize === "sm" ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-slate-800 dark:text-white">
                        {attendanceStats.rate}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Overall Ratio ({attendanceStats.presents}/{attendanceStats.total} marked)
                      </span>
                    </div>
                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 justify-between h-full">
                    <div className="flex items-center gap-5">
                      <div className="relative flex items-center justify-center">
                        {/* Circular visual percentage indicator */}
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="5" />
                          <circle 
                            cx="32" 
                            cy="32" 
                            r="28" 
                            className="stroke-indigo-600 fill-none" 
                            strokeWidth="5" 
                            strokeDasharray={176} 
                            strokeDashoffset={176 - (176 * attendanceStats.rate) / 100}
                            strokeLinecap="round" 
                          />
                        </svg>
                        <span className="absolute text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {attendanceStats.rate}%
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {attendanceStats.rate >= 75 ? "Excellent Attendance!" : "Requires Consistency"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {attendanceStats.presents} present out of {attendanceStats.total} marked classes
                        </span>
                      </div>
                    </div>

                    {/* Attendance micro calendar row */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        Recent 7 Days Logs
                      </span>
                      <div className="grid grid-cols-7 gap-1.5">
                        {recentAttendance.map(day => (
                          <div 
                            key={day.date}
                            className="flex flex-col items-center p-1.5 rounded-lg border border-slate-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-center"
                          >
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{day.dayName}</span>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300 my-0.5">{day.dayNum}</span>
                            {day.val === true ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white font-extrabold">P</span>
                            ) : day.val === false ? (
                              <span className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-[8px] text-white font-extrabold">A</span>
                            ) : day.val === "na" ? (
                              <span className="w-4 h-4 rounded-full bg-slate-400 flex items-center justify-center text-[8px] text-white font-extrabold">-</span>
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-[8px] text-slate-300">?</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Extra log text on Large size */}
                    {attendanceSize === "lg" && (
                      <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800/80 pt-2">
                        Not applicable (N/A) marked days do not decrease or affect your performance percentage ratio negatively, acting purely as administrative schedule exceptions.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          }

          if (cardId === "fees") {
            return (
              <motion.div 
                layout
                draggable
                onDragStart={(e) => handleDragStart(e, "fees")}
                onDragOver={(e) => handleDragOver(e, "fees")}
                onDragEnd={handleDragEnd}
                key="fees"
                className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-3xs overflow-hidden flex flex-col transition-all duration-300 ${
                  feesSize === "sm" ? "p-4 h-auto md:col-span-1" :
                  feesSize === "md" ? "p-5 h-[280px] md:col-span-1" : "p-6 h-auto md:col-span-2"
                } ${draggedCardId === "fees" ? "opacity-40 border-dashed border-blue-500 scale-95" : ""}`}
                id="student-fees-tile"
              >
                {/* Tile Header */}
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2.5 mb-3">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                    <CreditCard className="w-4.5 h-4.5 text-emerald-500" />
                    Fees & Billing Status
                  </span>
                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-850 rounded-lg p-0.5 border border-slate-200/20">
                      <button 
                        onClick={() => handleMoveUp("fees")}
                        className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleMoveDown("fees")}
                        className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-100 dark:border-slate-700">
                      {(["sm", "md", "lg"] as TileSize[]).map(sz => (
                        <button
                          key={sz}
                          onClick={() => setFeesSize(sz)}
                          className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md transition-all cursor-pointer ${
                            feesSize === sz 
                              ? "bg-emerald-600 text-white shadow-xs" 
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tile Body - Conditional on Sizing */}
                {feesSize === "sm" ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-slate-800 dark:text-white">
                        ₹{student.monthlyFee}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          Monthly Tuition Fee
                        </span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                          currentMonthStatus === "paid" ? "bg-emerald-50 text-emerald-655 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}>
                          {currentMonthName}: {currentMonthStatus === "paid" ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </div>
                    <div className={`w-1.5 h-8 rounded-full ${currentMonthStatus === "paid" ? "bg-emerald-500" : "bg-rose-500"}`} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 justify-between h-full">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-bold uppercase">Monthly Tuition Rate</span>
                        <span className="text-3xl font-black text-slate-800 dark:text-white mt-0.5">₹{student.monthlyFee}</span>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] text-slate-400 font-black uppercase">Paid Months</span>
                          <span className="text-lg font-black text-emerald-600">{feeStats.paidCount}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] text-slate-400 font-black uppercase">Pending</span>
                          <span className="text-lg font-black text-rose-500">{feeStats.unpaidCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Fee months list */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">
                        <Info className="w-3 h-3 text-blue-500" />
                        Monthly Billing History
                      </span>
                      <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1 text-slate-800 dark:text-slate-100">
                        {student.feeMonths && Object.keys(student.feeMonths).length > 0 ? (
                          Object.entries(student.feeMonths).slice(0, feesSize === "lg" ? undefined : 3).map(([mName, mStatus]) => {
                            const pDate = student.feePaymentDates?.[mName];
                            return (
                              <div 
                                key={mName}
                                className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs"
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{mName}</span>
                                  {mStatus === "paid" && pDate && (
                                    <span className="text-[9px] text-slate-400">Paid on {pDate}</span>
                                  )}
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  mStatus === "paid" 
                                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400" 
                                    : mStatus === "na" 
                                    ? "bg-slate-105 dark:bg-slate-800 text-slate-450" 
                                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                                }`}>
                                  {mStatus === "paid" ? "Paid" : mStatus === "na" ? "N/A" : "Unpaid"}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-105 dark:border-slate-850 rounded-xl text-xs flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{currentMonthName}</span>
                              <span className="text-[9px] text-slate-400">Current active tuition month</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              student.feePaidThisMonth 
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" 
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                            }`}>
                              {student.feePaidThisMonth ? "Paid" : "Unpaid"}
                            </span>
                          </div>
                        )}
                        {feesSize === "md" && student.feeMonths && Object.keys(student.feeMonths).length > 3 && (
                          <span className="text-[9px] text-slate-400 text-center font-bold italic mt-0.5">
                            + {Object.keys(student.feeMonths).length - 3} more bills (make card Large to view full ledger)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Extra payment notice for Large size */}
                    {feesSize === "lg" && (
                      <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800/80 pt-2 flex items-center gap-2">
                        <div className="p-1 bg-emerald-50 text-emerald-600 rounded-full shrink-0">✔</div>
                        <span>Please clear any outstanding fees before the 10th of every active academic month. Pay securely via cash or Google Pay/PhonePe QR code scanner under Settings.</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          }

          // Subject Progress Card
          const sub = subjectProgress.find(s => s.name === cardId);
          if (!sub) return null;
          const size = subjectSizes[sub.name] || "md";

          return (
            <motion.div
              layout
              draggable
              onDragStart={(e) => handleDragStart(e, sub.name)}
              onDragOver={(e) => handleDragOver(e, sub.name)}
              onDragEnd={handleDragEnd}
              key={sub.name}
              className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-3xs overflow-hidden flex flex-col transition-all duration-300 ${
                size === "sm" ? "p-4 h-auto md:col-span-1" :
                size === "md" ? "p-5 h-[280px] md:col-span-1" : "p-6 h-auto md:col-span-2"
              } ${draggedCardId === sub.name ? "opacity-40 border-dashed border-blue-500 scale-95" : ""}`}
            >
              {/* Tile Header */}
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2.5 mb-3">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                  <BookOpen className="w-4.5 h-4.5 text-blue-500" />
                  {sub.name} Progress
                </span>
                {/* Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-850 rounded-lg p-0.5 border border-slate-200/20">
                    <button 
                      onClick={() => handleMoveUp(sub.name)}
                      className="p-1 text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleMoveDown(sub.name)}
                      className="p-1 text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-100 dark:border-slate-700">
                    {(["sm", "md", "lg"] as TileSize[]).map(sz => (
                      <button
                        key={sz}
                        onClick={() => handleSetSubjectSize(sub.name, sz)}
                        className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md transition-all cursor-pointer ${
                          size === sz 
                            ? "bg-blue-600 text-white shadow-xs" 
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tile Body - Conditional on Sizing */}
              {size === "sm" ? (
                <div className="flex flex-col gap-2 cursor-pointer group" onClick={() => onSelectSubject(sub.name)}>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-800 dark:text-white">
                      {sub.rate}%
                    </span>
                    <span className="text-[10px] text-blue-500 font-extrabold uppercase flex items-center gap-0.5 group-hover:translate-x-1 transition-all">
                      View Notes <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                  {/* Compact Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${sub.rate}%` }} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 justify-between h-full">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-slate-800 dark:text-white">
                        {sub.rate}%
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {sub.completed} / {sub.total} Chapters Done
                      </span>
                    </div>

                    {/* Styled Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${sub.rate}%` }} />
                    </div>
                  </div>

                  {/* Chapters List (Show 3 inside Medium, All inside Large) */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                      Revision Syllabus Coverage
                    </span>
                    <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {sub.notes.length === 0 ? (
                        <div className="text-xs text-slate-400 italic">No revision notes uploaded yet.</div>
                      ) : (
                        sub.notes.slice(0, size === "lg" ? undefined : 3).map(ch => (
                          <div 
                            key={ch.id} 
                            className="flex items-center justify-between p-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                          >
                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[180px] sm:max-w-xs">
                              Ch {ch.chapterNo}: {ch.chapterName}
                            </span>
                            {ch.isCompleted ? (
                              <span className="text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Done
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </div>
                        ))
                      )}
                      {size === "md" && sub.notes.length > 3 && (
                        <span className="text-[9px] text-slate-400 text-center font-bold italic mt-0.5">
                          + {sub.notes.length - 3} more chapters (make card Large to view all)
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectSubject(sub.name)}
                    className="w-full mt-1.5 py-2 px-3 bg-slate-50 hover:bg-blue-50 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-700 text-blue-600 dark:text-blue-400 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>View All Subject Notes & Chapter PDFs</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
