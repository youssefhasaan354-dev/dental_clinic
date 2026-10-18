import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { VersionSnapshot, ActivityLog } from '../../types';
import { History, RotateCcw, Save, ShieldAlert, Check, Clock, User } from 'lucide-react';

export const VersionsManager: React.FC = () => {
  const { refreshData } = useData();
  const { language } = useLanguage();
  const { user, role } = useAuth();
  const isAr = language === 'ar';
  const isOwner = role === 'owner';
  const isViewer = role === 'viewer';

  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchVersionsAndLogs = async () => {
    const storage = getStorageService();
    const snaps = await storage.getSnapshots();
    const lgs = await storage.getActivityLogs();
    setSnapshots(snaps);
    setLogs(lgs);
  };

  useEffect(() => {
    fetchVersionsAndLogs();
  }, []);

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    if (!snapshotLabel.trim()) return;

    setIsCreating(true);
    try {
      const storage = getStorageService();
      await storage.createSnapshot(snapshotLabel.trim(), user?.name || 'Admin');
      await storage.logActivity(role || 'owner', user?.name || 'Admin', 'Create Snapshot', `Snapshot created: ${snapshotLabel}`);
      setSnapshotLabel('');
      setStatusMsg(isAr ? 'تم حفظ نسخة احتياطية جديدة بنجاح!' : 'New snapshot created!');
      await fetchVersionsAndLogs();
    } catch (err: any) {
      alert('Error creating snapshot: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async (id: string, label: string) => {
    if (isViewer) return;
    if (window.confirm(isAr ? `هل أنت متأكد من استعادة النسخة الاحتياطية "${label}"؟ سيتم استبدال البيانات الحالية.` : `Restore snapshot "${label}"?`)) {
      try {
        const storage = getStorageService();
        await storage.restoreSnapshot(id);
        await storage.logActivity(role || 'owner', user?.name || 'Admin', 'Restore Snapshot', `Restored snapshot: ${label}`);
        await refreshData();
        setStatusMsg(isAr ? `تمت استعادة النسخة "${label}" بنجاح!` : `Snapshot restored!`);
        await fetchVersionsAndLogs();
      } catch (err: any) {
        alert('Restore failed: ' + err.message);
      }
    }
  };

  const handleResetData = async () => {
    if (!isOwner) {
      alert(isAr ? 'هذا الإجراء مقتصر على مالك العيادة (Owner) فقط.' : 'Owner privileges required.');
      return;
    }
    if (window.confirm(isAr ? 'تنبيه: سيتم مسح كافة التعديلات واستعادة بيانات العيادة الأصلية تماماً. هل تريد المتابعة؟' : 'Reset all data to seed initial state?')) {
      const storage = getStorageService();
      await storage.resetDemoData();
      await refreshData();
      await fetchVersionsAndLogs();
      alert(isAr ? 'تمت إعادة ضبط البيانات إلى الحالة الابتدائية.' : 'Data reset to defaults.');
    }
  };

  return (
    <div className="versions-manager-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <History className="text-primary" size={24} />
            <span>{isAr ? 'النسخ الاحتياطية وسجل تدقيق النشاط (Audit Log)' : 'Snapshots & Activity Audit Log'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'إنشاء واستعادة حتى 20 نسخة احتياطية لكافة بيانات الموقع بنقرة واحدة، ومتابعة سجل العمليات.'
              : 'Save up to 20 restorable versions with instant rollback and audit logging.'}
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
            onClick={handleResetData}
          >
            <RotateCcw size={14} />
            <span>{isAr ? 'إعادة ضبط البيانات الأصلية' : 'Reset Demo Data'}</span>
          </button>
        )}
      </div>

      {statusMsg && (
        <div className="alert alert-success py-2 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4">
          <Check size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Snapshots Column */}
        <div className="col-lg-6">
          <div className="card rounded-4 border shadow-sm p-4 bg-white mb-4">
            <h5 className="h6 fw-bold mb-3 text-dark">{isAr ? 'إنشاء نقطة استعادة جديدة (Snapshot):' : 'Create New Snapshot:'}</h5>

            <form onSubmit={handleCreateSnapshot} className="d-flex gap-2 mb-4">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder={isAr ? 'اسم النسخة (مثال: قبل تعديل مواعيد رمضان)...' : 'Snapshot label (e.g. Before Ramadan hours)...'}
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                disabled={isViewer || isCreating}
                required
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm flex-shrink-0 rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
                disabled={isViewer || isCreating}
              >
                <Save size={14} />
                <span>{isCreating ? 'جاري الحفظ...' : (isAr ? 'حفظ نسخة' : 'Save')}</span>
              </button>
            </form>

            <h6 className="small fw-bold text-muted mb-3">
              {isAr ? `النسخ المحفوظة (${snapshots.length} من أصل 20):` : `Saved Snapshots (${snapshots.length}/20):`}
            </h6>

            {snapshots.length === 0 ? (
              <div className="p-4 text-center text-muted small bg-light rounded-3 border">
                {isAr ? 'لا توجد نسخ احتياطية محفوظة حالياً.' : 'No snapshots recorded yet.'}
              </div>
            ) : (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {snapshots.map((snap) => (
                  <div key={snap.id} className="p-3 rounded-3 border bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <strong className="text-dark small d-block mb-1">{snap.label}</strong>
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {new Date(snap.timestamp).toLocaleString(isAr ? 'ar-EG' : 'en-US')} • {snap.createdBy}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handleRestore(snap.id, snap.label)}
                      disabled={isViewer}
                    >
                      <RotateCcw size={12} />
                      <span>{isAr ? 'استعادة' : 'Restore'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Logs Column */}
        <div className="col-lg-6">
          <div className="card rounded-4 border shadow-sm p-4 bg-white mb-4">
            <h5 className="h6 fw-bold mb-3 text-dark">{isAr ? 'سجل العمليات والنشاط (Audit Trail):' : 'Audit Trail Logs:'}</h5>

            <div className="d-flex flex-column gap-2" style={{ maxHeight: '480px', overflowY: 'auto' }}>
              {logs.map((log) => (
                <div key={log.id} className="p-2 px-3 rounded-3 border bg-light small">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="text-primary">{log.action}</strong>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {new Date(log.timestamp).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-dark mb-1" style={{ fontSize: '0.78rem' }}>
                    {log.details}
                  </p>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {log.userName} ({log.userRole})
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
