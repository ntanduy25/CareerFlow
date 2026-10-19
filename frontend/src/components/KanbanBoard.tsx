import React, { useState } from 'react';
import type { Application, ApplicationStatus } from '../types';
import { ApplicationCard } from './ApplicationCard';
import {
  Bookmark,
  Send,
  Calendar,
  Award,
  XCircle,
  Plus,
} from 'lucide-react';

interface KanbanColumnConfig {
  status: ApplicationStatus;
  title: string;
  icon: React.ReactNode;
  bgLight: string;
  headerColor: string;
  countBadge: string;
}

const COLUMNS: KanbanColumnConfig[] = [
  {
    status: 'SAVED',
    title: 'Đã lưu',
    icon: <Bookmark className="w-4 h-4 text-slate-500" />,
    bgLight: 'bg-slate-100/70',
    headerColor: 'text-slate-700',
    countBadge: 'bg-slate-200 text-slate-700',
  },
  {
    status: 'APPLIED',
    title: 'Đã nộp đơn',
    icon: <Send className="w-4 h-4 text-blue-600" />,
    bgLight: 'bg-blue-50/50',
    headerColor: 'text-blue-900',
    countBadge: 'bg-blue-100 text-blue-700',
  },
  {
    status: 'INTERVIEW',
    title: 'Phỏng vấn',
    icon: <Calendar className="w-4 h-4 text-amber-600" />,
    bgLight: 'bg-amber-50/50',
    headerColor: 'text-amber-900',
    countBadge: 'bg-amber-100 text-amber-700',
  },
  {
    status: 'OFFER',
    title: 'Nhận Offer',
    icon: <Award className="w-4 h-4 text-emerald-600" />,
    bgLight: 'bg-emerald-50/50',
    headerColor: 'text-emerald-900',
    countBadge: 'bg-emerald-100 text-emerald-700',
  },
  {
    status: 'REJECTED',
    title: 'Từ chối',
    icon: <XCircle className="w-4 h-4 text-rose-600" />,
    bgLight: 'bg-rose-50/50',
    headerColor: 'text-rose-900',
    countBadge: 'bg-rose-100 text-rose-700',
  },
];

interface KanbanBoardProps {
  applications: Application[];
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
  onSelectApplication: (application: Application) => void;
  onOpenCreateModalWithStatus: (status: ApplicationStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onStatusChange,
  onSelectApplication,
  onOpenCreateModalWithStatus,
}) => {
  const [activeDropColumn, setActiveDropColumn] = useState<ApplicationStatus | null>(null);

  const handleDragOver = (e: React.DragEvent, colStatus: ApplicationStatus) => {
    e.preventDefault();
    if (activeDropColumn !== colStatus) {
      setActiveDropColumn(colStatus);
    }
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);
    const applicationId = e.dataTransfer.getData('application/id');
    if (applicationId) {
      onStatusChange(applicationId, targetStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start min-h-[600px] pb-10">
      {COLUMNS.map((col) => {
        const columnApps = applications.filter((app) => app.status === col.status);
        const isTarget = activeDropColumn === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex flex-col rounded-2xl p-3.5 transition-all duration-200 border ${
              isTarget
                ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-200 scale-[1.01]'
                : `${col.bgLight} border-slate-200/70`
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                {col.icon}
                <span className={`font-bold text-xs uppercase tracking-wider ${col.headerColor}`}>
                  {col.title}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.countBadge}`}
                >
                  {columnApps.length}
                </span>
              </div>

              <button
                onClick={() => onOpenCreateModalWithStatus(col.status)}
                title={`Thêm đơn vào ${col.title}`}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Application Cards List */}
            <div className="space-y-3 min-h-[150px]">
              {columnApps.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onClick={() => onSelectApplication(app)}
                  onStatusChange={(newStatus) => onStatusChange(app.id, newStatus)}
                />
              ))}

              {columnApps.length === 0 && (
                <div
                  className={`h-24 rounded-xl border border-dashed flex items-center justify-center text-xs font-medium ${
                    isTarget
                      ? 'border-indigo-400 bg-white/70 text-indigo-600'
                      : 'border-slate-300/80 text-slate-400'
                  }`}
                >
                  {isTarget ? 'Thả vào đây' : 'Chưa có đơn nào'}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
