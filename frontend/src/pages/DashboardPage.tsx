import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Application, ApplicationCreateInput, ApplicationStatus, DashboardSummary, Reminder } from '../types';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { DashboardStats } from '../components/DashboardStats';
import { FilterBar } from '../components/FilterBar';
import { KanbanBoard } from '../components/KanbanBoard';
import { ApplicationListView } from '../components/ApplicationListView';
import { ApplicationModal } from '../components/ApplicationModal';
import { ApplicationDetailModal } from '../components/ApplicationDetailModal';
import { ResumeAnalyzerModal } from '../components/ResumeAnalyzerModal';

export const DashboardPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters & Views
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createModalDefaultStatus, setCreateModalDefaultStatus] = useState<ApplicationStatus>('SAVED');
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [selectedAppIdForDetail, setSelectedAppIdForDetail] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiInitialJD, setAiInitialJD] = useState<string>('');
  const [aiTargetCompany, setAiTargetCompany] = useState<string>('');

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const [appsData, summaryData] = await Promise.all([
        api.getApplications(),
        api.getDashboardSummary(),
      ]);
      setApplications(appsData);
      setSummary(summaryData);
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !searchTerm.trim() ||
        app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job_title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  // Handle status change (Optimistic update)
  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    // Optimistic update
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );

    try {
      await api.updateApplicationStatus(appId, newStatus);
      // Refresh summary to update counts and conversion rates accurately
      const summaryData = await api.getDashboardSummary();
      setSummary(summaryData);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi khi cập nhật trạng thái.');
      // Revert if error
      fetchData();
    }
  };

  const handleCreateOrUpdateApplication = async (data: ApplicationCreateInput) => {
    if (editingApplication) {
      await api.updateApplication(editingApplication.id, data);
      setEditingApplication(null);
    } else {
      await api.createApplication(data);
    }
    await fetchData();
  };

  const handleDeleteApplication = async (appId: string) => {
    try {
      await api.deleteApplication(appId);
      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi khi xóa đơn ứng tuyển.');
    }
  };

  const handleToggleReminder = async (reminder: Reminder) => {
    try {
      await api.updateReminder(reminder.id, { completed: !reminder.completed });
      const summaryData = await api.getDashboardSummary();
      setSummary(summaryData);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi khi cập nhật lịch hẹn.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        onOpenCreateModal={() => {
          setEditingApplication(null);
          setCreateModalDefaultStatus('SAVED');
          setIsCreateModalOpen(true);
        }}
        onOpenAIAnalyzer={() => {
          setAiInitialJD('');
          setAiTargetCompany('');
          setIsAIModalOpen(true);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Dashboard */}
        <DashboardStats
          summary={summary}
          onToggleReminder={handleToggleReminder}
          onSelectApplicationById={(id) => setSelectedAppIdForDetail(id)}
        />

        {/* Filter & View Switcher */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={() => fetchData(true)}
          isRefreshing={isRefreshing}
        />

        {/* Loading Skeleton */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm font-medium">Đang tải danh sách ứng tuyển...</p>
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            applications={filteredApplications}
            onStatusChange={handleStatusChange}
            onSelectApplication={(app) => setSelectedAppIdForDetail(app.id)}
            onOpenCreateModalWithStatus={(status) => {
              setEditingApplication(null);
              setCreateModalDefaultStatus(status);
              setIsCreateModalOpen(true);
            }}
          />
        ) : (
          <ApplicationListView
            applications={filteredApplications}
            onSelectApplication={(app) => setSelectedAppIdForDetail(app.id)}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteApplication}
          />
        )}
      </main>

      {/* Modals */}
      <ApplicationModal
        isOpen={isCreateModalOpen || editingApplication !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingApplication(null);
        }}
        onSubmit={handleCreateOrUpdateApplication}
        initialData={editingApplication}
        defaultStatus={createModalDefaultStatus}
      />

      <ApplicationDetailModal
        applicationId={selectedAppIdForDetail}
        isOpen={selectedAppIdForDetail !== null}
        onClose={() => setSelectedAppIdForDetail(null)}
        onEdit={(app) => {
          setSelectedAppIdForDetail(null);
          setEditingApplication(app);
        }}
        onDelete={handleDeleteApplication}
        onStatusChange={handleStatusChange}
        onApplicationUpdated={fetchData}
        onOpenAIAnalyzer={(notes, company) => {
          setAiInitialJD(notes);
          setAiTargetCompany(company);
          setIsAIModalOpen(true);
        }}
      />

      <ResumeAnalyzerModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        initialJobDescription={aiInitialJD}
        targetCompany={aiTargetCompany}
      />
    </div>
  );
};
