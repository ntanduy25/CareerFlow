import React, { useState } from 'react';
import type { ResumeAnalysisResult } from '../types';
import { api } from '../services/api';
import {
  X,
  Sparkles,
  Upload,
  FileCheck,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  FileText,
} from 'lucide-react';

interface ResumeAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialJobDescription?: string;
  targetCompany?: string;
}

export const ResumeAnalyzerModal: React.FC<ResumeAnalyzerModalProps> = ({
  isOpen,
  onClose,
  initialJobDescription = '',
  targetCompany = '',
}) => {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>(initialJobDescription);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Vui lòng chọn file định dạng PDF.');
        return;
      }
      setCvFile(file);
      setError(null);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) {
      setError('Vui lòng tải lên file CV (PDF).');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Vui lòng nhập mô tả công việc (Job Description).');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.analyzeResume(cvFile, jobDescription.trim());
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi phân tích CV.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">AI Resume Analyzer</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  NLP Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {targetCompany ? `Đối chiếu CV cho vị trí tại ${targetCompany}` : 'Trích xuất kỹ năng & đo lường mức độ phù hợp'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-4">
            {/* CV File Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tải lên CV của bạn (Định dạng PDF) <span className="text-rose-500">*</span>
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-5 bg-slate-50/50 hover:bg-indigo-50/20 cursor-pointer transition-all">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {cvFile ? (
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
                    <FileCheck className="w-5 h-5" />
                    <span>{cvFile.name} ({(cvFile.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Kéo thả hoặc bấm để chọn file PDF</p>
                    <p className="text-[11px] text-slate-400">Hỗ trợ các file PDF văn bản tiêu chuẩn</p>
                  </div>
                )}
              </label>
            </div>

            {/* Job Description Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mô tả công việc (Job Description / Yêu cầu tuyển dụng) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder="Dán nội dung tin tuyển dụng hoặc các yêu cầu kỹ thuật (Python, FastAPI, Docker, SQL, v.v.)..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Đang trích xuất & đối chiếu...' : 'Bắt đầu phân tích CV bằng AI'}</span>
            </button>
          </form>

          {/* Analysis Results Display */}
          {result && (
            <div className="pt-4 border-t border-slate-100 space-y-5 animate-fade-in">
              {/* Score Banner */}
              <div className={`p-4 rounded-2xl border text-center ${getScoreColor(result.match_score)}`}>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Mức độ tương thích tổng thể</p>
                <div className="text-4xl font-black mt-1">{result.match_score}%</div>
                <p className="text-xs font-medium mt-1">
                  {result.match_score >= 80 ? '🌟 Rất phù hợp với yêu cầu tuyển dụng' : result.match_score >= 50 ? '⚡ Phù hợp cơ bản, cần tinh chỉnh thêm' : '⚠️ Cần bổ sung kỹ năng trọng tâm'}
                </p>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Matched */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Kỹ năng đã đáp ứng ({result.matched_skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.matched_skills.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">Chưa trùng khớp kỹ năng nào trong JD</span>
                    ) : (
                      result.matched_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Missing */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Kỹ năng còn thiếu ({result.missing_skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.missing_skills.length === 0 ? (
                      <span className="text-[11px] text-emerald-600 font-semibold">CV đã bao phủ tất cả kỹ năng trong JD!</span>
                    ) : (
                      result.missing_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-700 text-[11px] font-semibold">
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>Lời khuyên tối ưu CV từ AI:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Extracted CV Skills summary */}
              {result.cv_skills.length > 0 && (
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1.5">
                    <FileText className="w-3.5 h-3.5" /> Toàn bộ kỹ năng nhận diện được trong CV ({result.cv_skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.cv_skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
