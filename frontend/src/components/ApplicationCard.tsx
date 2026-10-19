import React from 'react';
import { Application, ApplicationStatus } from '../types';
import { ExternalLink, Calendar, Banknote, MoreHorizontal } from 'lucide-react';

interface ApplicationCardProps {
  application: Application;
  onClick: () => void;
  onStatusChange: (newStatus: ApplicationStatus) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onClick,
  onStatusChange,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/id', application.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    const format = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
      return n.toLocaleString('vi-VN');
    };
    if (min && max) return `${format(min)} - ${format(max)} đ`;
    if (min) return `Từ ${format(min)} đ`;
    if (max) return `Tới ${format(max)} đ`;
    return null;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group relative"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
            {application.company_name}
          </span>
          <h4 className="font-bold text-slate-900 text-sm mt-0.5 leading-snug group-hover:text-indigo-600 transition-colors">
            {application.job_title}
          </h4>
        </div>

        {/* Quick status selector */}
        <div
          className="relative shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={application.status}
            onChange={(e) => onStatusChange(e.target.value as ApplicationStatus)}
            className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none hover:bg-slate-100 cursor-pointer"
          >
            <option value="SAVED">Đã lưu</option>
            <option value="APPLIED">Đã nộp</option>
            <option value="INTERVIEW">Phỏng vấn</option>
            <option value="OFFER">Nhận Offer</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Badges / Meta */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {formatSalary(application.salary_min, application.salary_max) && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-100 font-medium">
            <Banknote className="w-3 h-3 text-slate-400" />
            {formatSalary(application.salary_min, application.salary_max)}
          </span>
        )}

        {application.applied_at && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3" />
            {formatDate(application.applied_at)}
          </span>
        )}
      </div>

      {/* External Link */}
      {application.job_url && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <a
            href={application.job_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors font-medium truncate max-w-[200px]"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="truncate">Link tuyển dụng</span>
          </a>
        </div>
      )}
    </div>
  );
};
