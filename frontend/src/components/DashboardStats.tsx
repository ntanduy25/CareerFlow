import React from 'react';
import type { DashboardSummary, Reminder } from '../types';
import {
  Briefcase,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Bell,
} from 'lucide-react';

interface DashboardStatsProps {
  summary: DashboardSummary | null;
  onToggleReminder: (reminder: Reminder) => void;
  onSelectApplicationById?: (applicationId: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  summary,
  onToggleReminder,
  onSelectApplicationById,
}) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl border border-slate-200" />
        ))}
      </div>
    );
  }

  const formatSchedule = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng đơn</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{summary.total_applications}</h3>
            <p className="text-xs text-slate-400 mt-1">Đã lưu & nộp</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang theo dõi</p>
            <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">{summary.active_applications}</h3>
            <p className="text-xs text-indigo-500/80 mt-1">Đang xử lý tích cực</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Interviews & Conversion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phỏng vấn</p>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {summary.interview_rate}%
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{summary.interviews_count}</h3>
            <p className="text-xs text-slate-400 mt-1">Tỷ lệ được gọi PV</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Offers & Offer Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nhận Offer</p>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {summary.offer_rate}%
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{summary.offers_count}</h3>
            <p className="text-xs text-slate-400 mt-1">Tỷ lệ thành công</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 2: Status Breakdown & Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-slate-900 text-sm">Phân bố trạng thái tuyển dụng</h4>
            </div>
            <span className="text-xs text-slate-500">Cập nhật theo thời gian thực</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Đã lưu', count: summary.by_status['SAVED'] || 0, bg: 'bg-slate-50 border-slate-200 text-slate-700' },
              { label: 'Đã nộp', count: summary.by_status['APPLIED'] || 0, bg: 'bg-blue-50 border-blue-200 text-blue-700' },
              { label: 'Phỏng vấn', count: summary.by_status['INTERVIEW'] || 0, bg: 'bg-amber-50 border-amber-200 text-amber-700' },
              { label: 'Nhận Offer', count: summary.by_status['OFFER'] || 0, bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              { label: 'Từ chối', count: summary.by_status['REJECTED'] || 0, bg: 'bg-rose-50 border-rose-200 text-rose-700' },
            ].map((col) => (
              <div key={col.label} className={`p-3 rounded-xl border ${col.bg} text-center`}>
                <p className="text-xs font-medium opacity-80">{col.label}</p>
                <p className="text-xl font-bold mt-0.5">{col.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Reminders Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span>Lịch hẹn & PV sắp tới</span>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                {summary.upcoming_reminders.length}
              </span>
            </div>

            {summary.upcoming_reminders.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Chưa có lịch phỏng vấn nào sắp tới. Bạn có thể thêm trong chi tiết đơn!
              </div>
            ) : (
              <div className="space-y-2.5">
                {summary.upcoming_reminders.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 overflow-hidden">
                      <button
                        onClick={() => onToggleReminder(r)}
                        title="Đánh dấu hoàn thành"
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div className="truncate">
                        <p
                          onClick={() => onSelectApplicationById && onSelectApplicationById(r.application_id)}
                          className="text-xs font-semibold text-slate-800 truncate hover:text-indigo-600 cursor-pointer"
                        >
                          {r.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {r.company_name} • {r.job_title}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                      {formatSchedule(r.scheduled_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
