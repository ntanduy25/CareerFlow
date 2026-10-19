import React, { useState, useEffect } from 'react';
import type { Application, ApplicationDetail, ApplicationStatus, Reminder } from '../types';
import { api } from '../services/api';
import {
  X,
  Building2,
  ExternalLink,
  Calendar,
  Banknote,
  FileText,
  Clock,
  Trash2,
  Edit3,
  Bell,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  applicationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (app: Application) => void;
  onDelete: (appId: string) => void;
  onStatusChange: (appId: string, newStatus: ApplicationStatus) => void;
  onApplicationUpdated: () => void;
  onOpenAIAnalyzer?: (jobNotes: string, company: string) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  applicationId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onApplicationUpdated,
  onOpenAIAnalyzer,
}) => {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New reminder form state
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [addingReminder, setAddingReminder] = useState(false);

  const fetchDetail = async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getApplication(applicationId);
      setDetail(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết đơn ứng tuyển.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchDetail();
    } else {
      setDetail(null);
      setError(null);
    }
  }, [isOpen, applicationId]);

  if (!isOpen || !applicationId) return null;

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim() || !reminderDate) return;

    setAddingReminder(true);
    try {
      await api.createReminder({
        application_id: applicationId,
        title: reminderTitle.trim(),
        scheduled_at: new Date(reminderDate).toISOString(),
      });
      setReminderTitle('');
      setReminderDate('');
      await fetchDetail();
      onApplicationUpdated();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi khi tạo lịch hẹn.');
    } finally {
      setAddingReminder(false);
    }
  };

  const handleToggleReminder = async (reminder: Reminder) => {
    try {
      await api.updateReminder(reminder.id, { completed: !reminder.completed });
      await fetchDetail();
      onApplicationUpdated();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi khi cập nhật.');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await api.deleteReminder(reminderId);
      await fetchDetail();
      onApplicationUpdated();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi khi xóa lịch hẹn.');
    }
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Chưa cập nhật';
    if (min && max) return `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')} VNĐ`;
    if (min) return `Từ ${min.toLocaleString('vi-VN')} VNĐ`;
    if (max) return `Tối đa ${max.toLocaleString('vi-VN')} VNĐ`;
    return 'Chưa cập nhật';
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Chưa có';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: ApplicationStatus | string) => {
    const config: Record<string, { label: string; bg: string; text: string }> = {
      SAVED: { label: 'Đã lưu', bg: 'bg-slate-100', text: 'text-slate-700' },
      APPLIED: { label: 'Đã nộp đơn', bg: 'bg-blue-100', text: 'text-blue-700' },
      INTERVIEW: { label: 'Phỏng vấn', bg: 'bg-amber-100', text: 'text-amber-700' },
      OFFER: { label: 'Nhận Offer', bg: 'bg-emerald-100', text: 'text-emerald-700' },
      REJECTED: { label: 'Từ chối', bg: 'bg-rose-100', text: 'text-rose-700' },
      WITHDRAWN: { label: 'Rút hồ sơ', bg: 'bg-purple-100', text: 'text-purple-700' },
    };
    const c = config[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700' };
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {detail ? detail.company_name : 'Chi tiết đơn'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {detail ? detail.job_title : 'Đang tải...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {detail && (
              <>
                {onOpenAIAnalyzer && (
                  <button
                    onClick={() =>
                      onOpenAIAnalyzer(
                        detail.notes || `Tuyển dụng ${detail.job_title} tại ${detail.company_name}`,
                        detail.company_name
                      )
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200 shadow-sm"
                    title="Phân tích độ phù hợp CV với vị trí này"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span className="hidden sm:inline">Phân tích CV</span>
                  </button>
                )}
                <button
                  onClick={() => onEdit(detail)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Bạn có chắc chắn muốn xóa đơn ứng tuyển này?')) {
                      onDelete(detail.id);
                      onClose();
                    }
                  }}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Xóa đơn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="py-12 text-center text-slate-400 text-sm">Đang tải chi tiết đơn...</div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {detail && (
            <>
              {/* Status & Quick Change */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Trạng thái hiện tại:
                  </span>
                  {getStatusBadge(detail.status)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Chuyển sang:</span>
                  <select
                    value={detail.status}
                    onChange={(e) => onStatusChange(detail.id, e.target.value as ApplicationStatus)}
                    className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none hover:border-indigo-500 cursor-pointer shadow-sm"
                  >
                    <option value="SAVED">Đã lưu (SAVED)</option>
                    <option value="APPLIED">Đã nộp đơn (APPLIED)</option>
                    <option value="INTERVIEW">Phỏng vấn (INTERVIEW)</option>
                    <option value="OFFER">Nhận Offer (OFFER)</option>
                    <option value="REJECTED">Từ chối (REJECTED)</option>
                    <option value="WITHDRAWN">Rút hồ sơ (WITHDRAWN)</option>
                  </select>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Ngày nộp</p>
                    <p className="font-semibold text-slate-800">{formatDate(detail.applied_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <Banknote className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Mức lương</p>
                    <p className="font-semibold text-slate-800">
                      {formatSalary(detail.salary_min, detail.salary_max)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job URL Link */}
              {detail.job_url && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <ExternalLink className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-medium text-slate-700 truncate">{detail.job_url}</span>
                  </div>
                  <a
                    href={detail.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shrink-0 ml-2 shadow-sm"
                  >
                    Mở tin tuyển dụng
                  </a>
                </div>
              )}

              {/* Notes */}
              {detail.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Ghi chú
                  </h4>
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">
                    {detail.notes}
                  </div>
                </div>
              )}

              {/* Reminders / Interview Schedule */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-600" /> Lịch hẹn & Vòng phỏng vấn ({detail.reminders.length})
                  </h4>
                </div>

                {/* Reminders List */}
                <div className="space-y-2 mb-4">
                  {detail.reminders.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Chưa có lịch hẹn nào được ghi nhận cho đơn này.</p>
                  ) : (
                    detail.reminders.map((r) => (
                      <div
                        key={r.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                          r.completed
                            ? 'bg-slate-50 border-slate-100 opacity-60'
                            : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <button
                            onClick={() => handleToggleReminder(r)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                          >
                            {r.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span
                            className={`text-xs font-medium truncate ${
                              r.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {r.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {formatDateTime(r.scheduled_at)}
                          </span>
                          <button
                            onClick={() => handleDeleteReminder(r.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Xóa lịch hẹn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Reminder Form */}
                <form
                  onSubmit={handleAddReminder}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs"
                >
                  <p className="font-semibold text-slate-700">Thêm lịch phỏng vấn / việc cần làm:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="VD: Phỏng vấn vòng 1 (Technical)..."
                      value={reminderTitle}
                      onChange={(e) => setReminderTitle(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="datetime-local"
                      required
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={addingReminder}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{addingReminder ? 'Đang thêm...' : 'Lưu lịch hẹn'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Status History Timeline */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Dòng thời gian lịch sử trạng thái ({detail.status_history.length})
                </h4>

                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {detail.status_history.map((h) => (
                    <div key={h.id} className="relative text-xs">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {h.old_status ? (
                            <>
                              <span className="font-medium text-slate-500">{h.old_status}</span>
                              <span className="text-slate-400 font-bold">→</span>
                            </>
                          ) : (
                            <span className="text-slate-400 italic">Khởi tạo:</span>
                          )}
                          {getStatusBadge(h.new_status)}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {formatDateTime(h.changed_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
