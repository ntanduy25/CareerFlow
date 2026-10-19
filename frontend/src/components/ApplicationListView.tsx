import React from 'react';
import type { Application, ApplicationStatus } from '../types';
import { ExternalLink, Trash2, Eye } from 'lucide-react';

interface ApplicationListViewProps {
  applications: Application[];
  onSelectApplication: (app: Application) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
}

export const ApplicationListView: React.FC<ApplicationListViewProps> = ({
  applications,
  onSelectApplication,
  onStatusChange,
  onDelete,
}) => {
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return '—';
    if (min && max) return `${(min / 1000000).toFixed(0)}M - ${(max / 1000000).toFixed(0)}M đ`;
    if (min) return `Từ ${(min / 1000000).toFixed(0)}M đ`;
    if (max) return `Tới ${(max / 1000000).toFixed(0)}M đ`;
    return '—';
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
        Không tìm thấy đơn ứng tuyển nào phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-10">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3.5 px-4">Công ty</th>
              <th className="py-3.5 px-4">Vị trí</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4">Ngày nộp</th>
              <th className="py-3.5 px-4">Lương</th>
              <th className="py-3.5 px-4">Link</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((app) => (
              <tr
                key={app.id}
                onClick={() => onSelectApplication(app)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
                <td className="py-3 px-4 font-bold text-slate-900">{app.company_name}</td>
                <td className="py-3 px-4 font-medium text-slate-800">{app.job_title}</td>
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={app.status}
                    onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none hover:bg-slate-100 cursor-pointer"
                  >
                    <option value="SAVED">Đã lưu</option>
                    <option value="APPLIED">Đã nộp</option>
                    <option value="INTERVIEW">Phỏng vấn</option>
                    <option value="OFFER">Nhận Offer</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="WITHDRAWN">Rút hồ sơ</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-slate-500">{formatDate(app.applied_at)}</td>
                <td className="py-3 px-4 text-slate-700 font-medium">
                  {formatSalary(app.salary_min, app.salary_max)}
                </td>
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  {app.job_url ? (
                    <a
                      href={app.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Link
                    </a>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onSelectApplication(app)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Xác nhận xóa đơn ứng tuyển tại ${app.company_name}?`)) {
                          onDelete(app.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa đơn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
