import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { AppointmentRequest, AppointmentStatus } from '../../types';
import {
  Inbox,
  Phone,
  MessageSquare,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  UserX,
  XCircle,
  FileText,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const RequestsInbox: React.FC = () => {
  const { language } = useLanguage();
  const { role } = useAuth();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [retentionDays, setRetentionDays] = useState<number>(60);

  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const storage = getStorageService();
      const data = await storage.getAppointmentRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load appointment requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    if (isViewer) {
      alert(isAr ? 'عفواً، حساب الزائر التجريبي للعرض فقط ولا يملك صلاحية تعديل الحالات.' : 'Viewer account is read-only.');
      return;
    }
    const storage = getStorageService();
    await storage.updateAppointmentStatus(id, newStatus);
    await storage.logActivity(role || 'receptionist', 'Staff', 'Status Update', `Request ${id} status changed to ${newStatus}`);
    await fetchRequests();
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    if (isViewer) {
      alert(isAr ? 'عفواً، لا يمكن حفظ الملاحظات في وضع العرض فقط.' : 'Read-only mode.');
      return;
    }
    const storage = getStorageService();
    await storage.updateAppointmentStatus(selectedRequest.id, selectedRequest.status, internalNoteInput);
    await fetchRequests();
    setSelectedRequest((prev) => (prev ? { ...prev, internalNotes: internalNoteInput } : null));
    alert(isAr ? 'تم حفظ الملاحظات الداخلية بنجاح.' : 'Internal notes saved.');
  };

  const handleDeleteRequest = async (id: string) => {
    if (isViewer) {
      alert(isAr ? 'عفواً، لا يمكن الحذف في وضع العرض فقط.' : 'Read-only mode.');
      return;
    }
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا الطلب نهائياً؟' : 'Permanently delete this request?')) {
      const storage = getStorageService();
      await storage.deleteAppointmentRequest(id);
      await fetchRequests();
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
    }
  };

  const handleExportCSV = () => {
    if (requests.length === 0) {
      alert(isAr ? 'لا توجد طلبات لتصديرها.' : 'No requests to export.');
      return;
    }

    const headers = ['ID', 'Date Submitted', 'Patient Name', 'Phone', 'Service', 'Preferred Date', 'Preferred Time', 'Status', 'Internal Notes'];
    const rows = requests.map((r) => [
      r.id,
      r.createdAt,
      `"${r.patientName.replace(/"/g, '""')}"`,
      `"${r.patientPhone}"`,
      `"${r.serviceName}"`,
      r.preferredDate,
      r.preferredTime,
      r.status,
      `"${(r.internalNotes || '').replace(/"/g, '""')}"`,
    ]);

    // Prepend UTF-8 BOM (\uFEFF) so Excel parses Arabic strings correctly without distortion
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hayaah_appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      r.patientName.toLowerCase().includes(q) ||
      r.patientPhone.includes(q) ||
      r.serviceName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    const map: Record<AppointmentStatus, { labelAr: string; labelEn: string; bg: string }> = {
      new: { labelAr: 'جديد (لم يُرد عليه)', labelEn: 'New', bg: 'bg-primary text-white' },
      contacted: { labelAr: 'تم التواصل', labelEn: 'Contacted', bg: 'bg-info text-white' },
      booked: { labelAr: 'تم تثبيت الموعد', labelEn: 'Booked', bg: 'bg-success text-white' },
      completed: { labelAr: 'اكتمل الكشف', labelEn: 'Completed', bg: 'bg-secondary text-white' },
      no_show: { labelAr: 'لم يحضر (No Show)', labelEn: 'No Show', bg: 'bg-warning text-dark' },
      cancelled: { labelAr: 'ملغي', labelEn: 'Cancelled', bg: 'bg-danger text-white' },
    };
    const s = map[status] || map.new;
    return <span className={`badge rounded-pill px-3 py-1 ${s.bg}`}>{isAr ? s.labelAr : s.labelEn}</span>;
  };

  return (
    <div className="requests-inbox-page">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Inbox className="text-primary" size={24} />
            <span>{isAr ? 'صندوق طلبات المواعيد الواردة' : 'Appointment Requests Inbox'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'مخصص لموظفي الاستقبال لمتابعة المرضى، تأكيد المواعيد عبر الهاتف أو واتساب، وتدوين الملاحظات.'
              : 'Reception desk inbox to confirm bookings, call patients, and update statuses.'}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 rounded-pill px-3"
            onClick={handleExportCSV}
          >
            <Download size={15} />
            <span>{isAr ? 'تصدير Excel (CSV)' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 bg-white rounded-4 border shadow-sm mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-0 bg-light"
                placeholder={isAr ? 'ابحث باسم المريض أو رقم الهاتف أو الخدمة...' : 'Search by name, phone or service...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2">
              <Filter size={16} className="text-muted flex-shrink-0" />
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{isAr ? 'كافة الحالات (الكل)' : 'All Statuses'}</option>
                <option value="new">{isAr ? 'جديد (لم يتم الرد)' : 'New Requests'}</option>
                <option value="contacted">{isAr ? 'تم التواصل' : 'Contacted'}</option>
                <option value="booked">{isAr ? 'تم تأكيد الموعد' : 'Booked'}</option>
                <option value="completed">{isAr ? 'اكتمل الكشف' : 'Completed'}</option>
                <option value="no_show">{isAr ? 'لم يحضر' : 'No Show'}</option>
                <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>
          </div>

          <div className="col-md-3 text-md-end text-muted small">
            <span>{isAr ? `إجمالي النتائج: ${filteredRequests.length} طلب` : `Total: ${filteredRequests.length} requests`}</span>
          </div>
        </div>
      </div>

      {/* Main Content: Split List and Detail View */}
      <div className="row g-4">
        {/* Requests List Column */}
        <div className="col-lg-7">
          <div className="card rounded-4 border shadow-sm overflow-hidden">
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
              <strong className="small text-dark">{isAr ? 'قائمة الطلبات' : 'Requests List'}</strong>
              <small className="text-muted">{isAr ? 'مرتبة من الأحدث للأقدم' : 'Newest first'}</small>
            </div>

            <div className="list-group list-group-flush" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {isLoading ? (
                <div className="p-4 text-center text-muted small">
                  {isAr ? 'جاري تحميل الطلبات...' : 'Loading requests...'}
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <Inbox size={36} className="mb-2 text-muted" />
                  <p className="mb-0 small">{isAr ? 'لا توجد طلبات مواعيد مطابقة.' : 'No appointment requests found.'}</p>
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedRequest?.id === req.id;

                  return (
                    <div
                      key={req.id}
                      className={`list-group-item list-group-item-action p-3 transition ${
                        isSelected ? 'bg-light border-start-primary' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedRequest(req);
                        setInternalNoteInput(req.internalNotes || '');
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <strong className="text-dark d-block mb-1">{req.patientName}</strong>
                          <span className="text-muted small" dir="ltr">{req.patientPhone}</span>
                        </div>
                        <div>{getStatusBadge(req.status)}</div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center small text-secondary">
                        <span className="text-primary fw-semibold">{req.serviceName}</span>
                        <span>{req.preferredDate} • {req.preferredTime}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Selected Request Detail Panel */}
        <div className="col-lg-5">
          {selectedRequest ? (
            <div className="card rounded-4 border shadow-sm p-4 bg-white sticky-top" style={{ top: '20px' }}>
              <div className="d-flex justify-content-between align-items-start pb-3 border-bottom mb-3">
                <div>
                  <h4 className="h5 fw-bold mb-1 text-dark">{selectedRequest.patientName}</h4>
                  <p className="text-muted small mb-0">
                    {isAr ? 'تاريخ التقديم:' : 'Submitted:'}{' '}
                    {new Date(selectedRequest.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>

              {/* Patient Contact & One-Tap Actions */}
              <div className="mb-4 p-3 bg-light rounded-3 border">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small">{isAr ? 'رقم الهاتف:' : 'Phone:'}</span>
                  <strong className="text-dark" dir="ltr">{selectedRequest.patientPhone}</strong>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <a
                    href={`tel:${selectedRequest.patientPhone.replace(/\s+/g, '')}`}
                    className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                  >
                    <Phone size={14} />
                    <span>{isAr ? 'اتصال مباشر' : 'Call'}</span>
                  </a>

                  <a
                    href={`https://wa.me/${selectedRequest.patientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      isAr
                        ? `مرحباً أستاذ/ة ${selectedRequest.patientName}، نتواصل معك من عيادة حياة لطب الأسنان بخصوص طلبك لخدمة ${selectedRequest.serviceName}.`
                        : `Hello ${selectedRequest.patientName}, contacting you from Hayaah Dental Clinic regarding your appointment request for ${selectedRequest.serviceName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 text-white"
                  >
                    <MessageSquare size={14} />
                    <span>{isAr ? 'مراسلة واتساب' : 'WhatsApp'}</span>
                  </a>
                </div>
              </div>

              {/* Service & Timing Info */}
              <div className="mb-3">
                <div className="mb-2">
                  <span className="text-muted small d-block">{isAr ? 'الخدمة المطلوبة:' : 'Requested Service:'}</span>
                  <strong className="text-dark">{selectedRequest.serviceName}</strong>
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <span className="text-muted small d-block">{isAr ? 'اليوم المفضل:' : 'Preferred Date:'}</span>
                    <strong className="text-dark">{selectedRequest.preferredDate}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted small d-block">{isAr ? 'الوقت المفضل:' : 'Preferred Time:'}</span>
                    <strong className="text-dark">{selectedRequest.preferredTime}</strong>
                  </div>
                </div>
              </div>

              {/* Patient Note */}
              {selectedRequest.notes && (
                <div className="mb-3 p-3 bg-light rounded-3 border">
                  <span className="text-muted small d-block mb-1">{isAr ? 'ملاحظة المريض الإدارية:' : 'Patient Note:'}</span>
                  <p className="mb-0 small text-dark" style={{ lineHeight: '1.6' }}>
                    {selectedRequest.notes}
                  </p>
                </div>
              )}

              {/* Status Workflow Selector */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  {isAr ? 'تحديث حالة الطلب:' : 'Update Status:'}
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedRequest.status}
                  onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value as AppointmentStatus)}
                  disabled={isViewer}
                >
                  <option value="new">{isAr ? 'جديد (لم يتم الرد)' : 'New'}</option>
                  <option value="contacted">{isAr ? 'تم التواصل مع المريض' : 'Contacted'}</option>
                  <option value="booked">{isAr ? 'تم تثبيت وتأكيد الحجز' : 'Booked'}</option>
                  <option value="completed">{isAr ? 'اكتملت الزيارة بنجاح' : 'Completed'}</option>
                  <option value="no_show">{isAr ? 'لم يحضر المريض (No-show)' : 'No Show'}</option>
                  <option value="cancelled">{isAr ? 'تم إلغاء الموعد' : 'Cancelled'}</option>
                </select>
              </div>

              {/* Internal Notes for Receptionists */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark">
                  {isAr ? 'ملاحظات الاستقبال الداخلية (لا تظهر للمريض):' : 'Internal Staff Notes:'}
                </label>
                <textarea
                  rows={2}
                  className="form-control form-control-sm mb-2"
                  placeholder={isAr ? 'مثال: تم الاتصال، تم الاتفاق على كشف يوم السبت الساعة 5 م...' : 'Staff notes...'}
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  disabled={isViewer}
                ></textarea>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm w-100"
                  onClick={handleSaveNotes}
                  disabled={isViewer}
                >
                  {isAr ? 'حفظ الملاحظة' : 'Save Note'}
                </button>
              </div>

              {/* Delete Button */}
              <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                  onClick={() => handleDeleteRequest(selectedRequest.id)}
                  disabled={isViewer}
                >
                  <Trash2 size={14} />
                  <span>{isAr ? 'حذف هذا السجل' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="card rounded-4 border shadow-sm p-5 text-center text-muted bg-white">
              <FileText size={32} className="mx-auto mb-2 text-muted" />
              <p className="mb-0 small">
                {isAr ? 'اختر طلباً من القائمة لعرض تفاصيل المريض واتخاذ الإجراء.' : 'Select a request to view details and contact patient.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
