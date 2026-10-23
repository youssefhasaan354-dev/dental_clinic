import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  getBookingService,
  Appointment,
  AppointmentStatus,
  DoctorSchedule,
  formatCairoDate,
  getCairoNow,
  SERVICE_DURATIONS,
} from '../../services/booking';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  List,
  Columns,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export const AppointmentsManager: React.FC = () => {
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const bookingService = useMemo(() => getBookingService(), []);

  // View state: 'table' | 'day' | 'week' | 'month'
  const [viewMode, setViewMode] = useState<'table' | 'day' | 'week' | 'month'>('table');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Selected single appointment for drawer / modal
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [internalNoteInput, setInternalNoteInput] = useState('');

  // Manual Walk-in / Phone Booking Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    patientName: '',
    patientPhone: '',
    serviceId: 'checkup-cleaning',
    doctorId: 'any',
    date: formatCairoDate(getCairoNow()),
    startTime: '11:00',
    notes: '',
  });
  const [manualError, setManualError] = useState<string | null>(null);
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  // Calendar anchor date
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() => formatCairoDate(getCairoNow()));

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [apts, docs] = await Promise.all([
        bookingService.listAppointments({
          searchQuery,
          status: statusFilter as any,
          doctorId: doctorFilter,
          dateFrom: dateFilter || undefined,
          dateTo: dateFilter || undefined,
        }),
        bookingService.getDoctors(),
      ]);
      setAppointments(apts);
      setDoctors(docs);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [searchQuery, statusFilter, doctorFilter, dateFilter]);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    if (isViewer) {
      alert(isAr ? 'عفواً، حساب الزائر التجريبي للعرض فقط.' : 'Viewer account is read-only.');
      return;
    }
    try {
      await bookingService.updateStatus(id, newStatus);
      await fetchAllData();
      if (activeAppointment && activeAppointment.id === id) {
        setActiveAppointment((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error('Status change error:', err);
    }
  };

  const handleSaveInternalNotes = async () => {
    if (!activeAppointment) return;
    if (isViewer) {
      alert(isAr ? 'وضع العرض فقط.' : 'Read-only mode.');
      return;
    }
    try {
      await bookingService.updateAppointment(activeAppointment.id, {
        internalNotes: internalNoteInput,
      });
      await fetchAllData();
      setActiveAppointment((prev) => (prev ? { ...prev, internalNotes: internalNoteInput } : null));
      alert(isAr ? 'تم حفظ الملاحظات بنجاح.' : 'Notes saved.');
    } catch (err) {
      console.error('Notes update error:', err);
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = async (newStatus: AppointmentStatus) => {
    if (isViewer || selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => bookingService.updateStatus(id, newStatus)));
      setSelectedIds([]);
      await fetchAllData();
    } catch (err) {
      console.error('Bulk update error:', err);
    }
  };

  // Export CSV with UTF-8 BOM for perfect Arabic in Excel
  const handleExportCSV = () => {
    if (appointments.length === 0) return;

    const headers = [
      'Booking Code (كود الحجز)',
      'Patient Name (اسم المريض)',
      'Phone (الهاتف)',
      'Service (الخدمة)',
      'Doctor (الطبيب)',
      'Date (التاريخ)',
      'Time (الوقت)',
      'Status (الحالة)',
      'Notes (الملاحظات)',
    ];

    const rows = appointments.map((a) => [
      a.bookingCode,
      `"${a.patientName.replace(/"/g, '""')}"`,
      `"${a.patientPhone}"`,
      `"${(isAr ? a.serviceName.ar : a.serviceName.en).replace(/"/g, '""')}"`,
      `"${(a.doctorName ? (isAr ? a.doctorName.ar : a.doctorName.en) : 'Any').replace(/"/g, '""')}"`,
      a.date,
      a.startTime,
      a.status,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    // UTF-8 BOM '\uFEFF' ensures Microsoft Excel handles Arabic characters properly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Hayaah_Appointments_${formatCairoDate(getCairoNow())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create Manual Appointment (Walk-in / Phone)
  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingManual(true);
    setManualError(null);

    try {
      const res = await bookingService.createAppointment({
        patientName: manualForm.patientName,
        patientPhone: manualForm.patientPhone,
        serviceId: manualForm.serviceId,
        doctorId: manualForm.doctorId,
        date: manualForm.date,
        startTime: manualForm.startTime,
        notes: manualForm.notes || undefined,
        consentGiven: true,
        isWalkIn: true,
      });

      if (!res.success) {
        setManualError(res.error || 'Failed to create appointment');
        setIsCreatingManual(false);
        return;
      }

      setIsManualModalOpen(false);
      setManualForm({
        patientName: '',
        patientPhone: '',
        serviceId: 'checkup-cleaning',
        doctorId: 'any',
        date: formatCairoDate(getCairoNow()),
        startTime: '11:00',
        notes: '',
      });
      await fetchAllData();
      alert(isAr ? 'تم تسجيل الحجز بنجاح!' : 'Appointment created successfully!');
    } catch (err: any) {
      setManualError(err.message || 'Creation error');
    } finally {
      setIsCreatingManual(false);
    }
  };

  const statusBadge = (status: AppointmentStatus) => {
    const map: Record<AppointmentStatus, { labelAr: string; labelEn: string; cls: string }> = {
      pending: { labelAr: 'قيد التأكيد', labelEn: 'Pending', cls: 'bg-warning text-dark' },
      confirmed: { labelAr: 'مؤكد', labelEn: 'Confirmed', cls: 'bg-success text-white' },
      completed: { labelAr: 'مكتمل', labelEn: 'Completed', cls: 'bg-info text-white' },
      cancelled: { labelAr: 'ملغي', labelEn: 'Cancelled', cls: 'bg-danger text-white' },
      no_show: { labelAr: 'لم يحضر', labelEn: 'No Show', cls: 'bg-secondary text-white' },
    };
    const s = map[status] || map.pending;
    return <span className={`badge rounded-pill px-2.5 py-1 ${s.cls}`}>{isAr ? s.labelAr : s.labelEn}</span>;
  };

  return (
    <div className="admin-appointments-page p-3 p-md-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark">
            {isAr ? 'إدارة المواعيد والحجوزات' : 'Appointments & Booking Manager'}
          </h3>
          <p className="text-muted small m-0">
            {isAr
              ? 'متابعة المواعيد الواردة، التأكيد الفوري، إنشاء حجوزات العيادة، وجدول الأطباء'
              : 'Track live incoming bookings, instant confirmation, walk-in creation & calendars'}
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Create Walk-in / Phone Button */}
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-3 shadow-sm"
            onClick={() => setIsManualModalOpen(true)}
          >
            <Plus size={18} />
            <span>{isAr ? 'حجز جديد (استقبال/هاتف)' : 'New Walk-in Booking'}</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2 rounded-pill px-3"
            onClick={handleExportCSV}
            disabled={appointments.length === 0}
          >
            <Download size={16} />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            className="btn btn-light border rounded-circle p-2"
            onClick={fetchAllData}
            title={isAr ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Controls Bar: Search, Filters, View Modes */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="row g-2 align-items-center">
          {/* Search */}
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder={isAr ? 'بحث بالاسم، الهاتف، أو الكود...' : 'Search by name, phone, code...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-md-2 col-6">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="pending">{isAr ? 'قيد التأكيد (Pending)' : 'Pending'}</option>
              <option value="confirmed">{isAr ? 'مؤكد (Confirmed)' : 'Confirmed'}</option>
              <option value="completed">{isAr ? 'مكتمل (Completed)' : 'Completed'}</option>
              <option value="cancelled">{isAr ? 'ملغي (Cancelled)' : 'Cancelled'}</option>
              <option value="no_show">{isAr ? 'لم يحضر (No Show)' : 'No Show'}</option>
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="col-md-2 col-6">
            <select
              className="form-select form-select-sm"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
            >
              <option value="all">{isAr ? 'جميع الأطباء' : 'All Doctors'}</option>
              {doctors.map((d) => (
                <option key={d.doctorId} value={d.doctorId}>
                  {isAr ? d.doctorName.ar : d.doctorName.en}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="col-md-2 col-6">
            <input
              type="date"
              className="form-control form-control-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {/* View Mode Toggle: Table / Day / Week / Month */}
          <div className="col-md-2 col-6 d-flex justify-content-end">
            <div className="btn-group btn-group-sm rounded-pill overflow-hidden border">
              <button
                type="button"
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setViewMode('table')}
                title={isAr ? 'عرض جدول' : 'Table view'}
              >
                <List size={15} />
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setViewMode('day')}
                title={isAr ? 'عرض اليوم' : 'Day view'}
              >
                {isAr ? 'يوم' : 'Day'}
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setViewMode('week')}
                title={isAr ? 'عرض الأسبوع' : 'Week view'}
              >
                {isAr ? 'أسبوع' : 'Week'}
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setViewMode('month')}
                title={isAr ? 'عرض الشهر' : 'Month view'}
              >
                {isAr ? 'شهر' : 'Month'}
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar if items selected */}
        {selectedIds.length > 0 && (
          <div className="bulk-bar mt-3 p-2 px-3 bg-light rounded-3 d-flex align-items-center justify-content-between border">
            <span className="small text-muted fw-bold">
              {isAr ? `تم تحديد ${selectedIds.length} موعد:` : `${selectedIds.length} items selected:`}
            </span>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-success rounded-pill px-3"
                onClick={() => handleBulkStatusChange('confirmed')}
              >
                {isAr ? 'تأكيد المحددة' : 'Confirm Selected'}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger rounded-pill px-3"
                onClick={() => handleBulkStatusChange('cancelled')}
              >
                {isAr ? 'إلغاء المحددة' : 'Cancel Selected'}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-light border rounded-pill px-2"
                onClick={() => setSelectedIds([])}
              >
                {isAr ? 'إلغاء التحديد' : 'Deselect'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW: TABLE */}
      {viewMode === 'table' && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted">
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.length === appointments.length && appointments.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(appointments.map((a) => a.id));
                        else setSelectedIds([]);
                      }}
                    />
                  </th>
                  <th>{isAr ? 'كود الحجز' : 'Code'}</th>
                  <th>{isAr ? 'المريض' : 'Patient'}</th>
                  <th>{isAr ? 'الخدمة' : 'Service'}</th>
                  <th>{isAr ? 'الطبيب' : 'Doctor'}</th>
                  <th>{isAr ? 'الموعد' : 'Schedule'}</th>
                  <th>{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="text-end">{isAr ? 'إجراءات سريعة' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((rowIdx) => (
                    <tr key={`skel-row-${rowIdx}`} className="placeholder-glow">
                      <td><span className="placeholder col-12 rounded" /></td>
                      <td><span className="placeholder col-8 rounded" /></td>
                      <td>
                        <span className="placeholder col-10 rounded d-block mb-1" />
                        <span className="placeholder col-6 rounded" />
                      </td>
                      <td><span className="placeholder col-7 rounded" /></td>
                      <td><span className="placeholder col-6 rounded" /></td>
                      <td>
                        <span className="placeholder col-9 rounded d-block mb-1" />
                        <span className="placeholder col-5 rounded" />
                      </td>
                      <td><span className="placeholder col-8 rounded-pill py-2" /></td>
                      <td className="text-end"><span className="placeholder col-8 rounded" /></td>
                    </tr>
                  ))
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      <Calendar className="mb-2 d-block mx-auto" size={32} />
                      <span>{isAr ? 'لا توجد مواعيد مطابقة لخيارات البحث' : 'No appointments matching filters'}</span>
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => {
                    const isSelected = selectedIds.includes(apt.id);
                    const cleanPhone = apt.patientPhone.replace(/\D/g, '');
                    const waText = isAr
                      ? `مرحباً ${apt.patientName}، نتواصل معك من عيادة حياة لطب الأسنان بخصوص موعدك (${apt.bookingCode}) يوم ${apt.date} الساعة ${apt.startTime}.`
                      : `Hello ${apt.patientName}, contacting you from Hayaah Dental Clinic regarding appointment (${apt.bookingCode}) on ${apt.date} at ${apt.startTime}.`;
                    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;

                    return (
                      <tr key={apt.id} className={isSelected ? 'table-active' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedIds((prev) =>
                                prev.includes(apt.id) ? prev.filter((id) => id !== apt.id) : [...prev, apt.id]
                              );
                            }}
                          />
                        </td>
                        <td>
                          <span
                            className="fw-bold text-primary cursor-pointer font-monospace"
                            onClick={() => {
                              setActiveAppointment(apt);
                              setInternalNoteInput(apt.internalNotes || '');
                            }}
                          >
                            {apt.bookingCode}
                          </span>
                          {apt.isWalkIn && (
                            <span className="badge bg-secondary-subtle text-secondary ms-1 small">
                              {isAr ? 'حضور' : 'Walk-in'}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{apt.patientName}</div>
                          <small className="text-muted font-monospace" dir="ltr">
                            {apt.patientPhone}
                          </small>
                        </td>
                        <td>
                          <span className="small">{isAr ? apt.serviceName.ar : apt.serviceName.en}</span>
                          <span className="d-block small text-muted">{apt.serviceDuration} min</span>
                        </td>
                        <td>
                          <span className="small">
                            {apt.doctorName
                              ? (isAr ? apt.doctorName.ar : apt.doctorName.en)
                              : (isAr ? 'أي طبيب متاح' : 'Any')}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{apt.date}</div>
                          <small className="text-primary fw-bold">{apt.startTime} - {apt.endTime}</small>
                        </td>
                        <td>{statusBadge(apt.status)}</td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            {/* WhatsApp Direct */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-success rounded-circle p-1"
                              title={isAr ? 'محادثة المريض عبر واتساب' : 'WhatsApp Patient'}
                            >
                              <FaWhatsapp size={14} />
                            </a>

                            {/* Call Direct */}
                            <a
                              href={`tel:${apt.patientPhone}`}
                              className="btn btn-sm btn-outline-primary rounded-circle p-1"
                              title={isAr ? 'اتصال بالمريض' : 'Call Patient'}
                            >
                              <Phone size={14} />
                            </a>

                            {/* Confirm Action */}
                            {apt.status === 'pending' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-success rounded-pill px-2 py-0 small"
                                onClick={() => handleStatusChange(apt.id, 'confirmed')}
                                title={isAr ? 'تأكيد الموعد' : 'Confirm'}
                              >
                                <CheckCircle size={13} className="me-1" />
                                {isAr ? 'تأكيد' : 'Confirm'}
                              </button>
                            )}

                            {/* Complete Action */}
                            {apt.status === 'confirmed' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info rounded-pill px-2 py-0 small"
                                onClick={() => handleStatusChange(apt.id, 'completed')}
                                title={isAr ? 'اكتمال الزيارة' : 'Mark Completed'}
                              >
                                {isAr ? 'تم الحضور' : 'Completed'}
                              </button>
                            )}

                            {/* Drawer details */}
                            <button
                              type="button"
                              className="btn btn-sm btn-light border rounded-pill px-2 py-0 small"
                              onClick={() => {
                                setActiveAppointment(apt);
                                setInternalNoteInput(apt.internalNotes || '');
                              }}
                            >
                              {isAr ? 'تفاصيل' : 'Details'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: DAY / WEEK / MONTH CALENDAR */}
      {viewMode !== 'table' && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
              <Calendar className="text-primary" />
              <span>
                {isAr
                  ? `جدول المواعيد (${viewMode === 'day' ? 'اليومي' : viewMode === 'week' ? 'الأسبوعي' : 'الشهري'})`
                  : `Calendar View (${viewMode.toUpperCase()})`}
              </span>
            </h5>

            <div className="d-flex gap-2 align-items-center">
              <input
                type="date"
                className="form-control form-control-sm"
                value={calendarAnchorDate}
                onChange={(e) => setCalendarAnchorDate(e.target.value)}
              />
            </div>
          </div>

          {/* Grid representation */}
          <div className="calendar-view-container">
            {appointments.length === 0 ? (
              <p className="text-muted text-center py-5">{isAr ? 'لا توجد مواعيد في هذا النطاق' : 'No appointments in range'}</p>
            ) : (
              <div className="row g-3">
                {appointments.slice(0, 24).map((apt) => (
                  <div key={apt.id} className="col-md-4 col-sm-6">
                    <div
                      className="p-3 bg-light rounded-3 border h-100 cursor-pointer hover-shadow"
                      onClick={() => {
                        setActiveAppointment(apt);
                        setInternalNoteInput(apt.internalNotes || '');
                      }}
                    >
                      <div className="d-flex justify-content-between mb-2">
                        <span className="badge bg-primary text-white font-monospace">{apt.bookingCode}</span>
                        {statusBadge(apt.status)}
                      </div>
                      <div className="fw-bold text-dark">{apt.patientName}</div>
                      <div className="small text-muted mb-1">{isAr ? apt.serviceName.ar : apt.serviceName.en}</div>
                      <div className="small text-primary fw-bold d-flex align-items-center gap-1">
                        <Clock size={13} />
                        <span>{apt.date} • {apt.startTime} - {apt.endTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* APPOINTMENT DETAIL DRAWER / MODAL */}
      {activeAppointment && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom p-4">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modal-title fw-bold m-0">
                    {isAr ? 'تفاصيل الموعد: ' : 'Appointment: '}
                    <span className="text-primary font-monospace">{activeAppointment.bookingCode}</span>
                  </h5>
                  {statusBadge(activeAppointment.status)}
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setActiveAppointment(null)}
                />
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <span className="text-muted small d-block">{isAr ? 'المريض:' : 'Patient:'}</span>
                    <strong className="d-block text-dark">{activeAppointment.patientName}</strong>
                    <span className="small text-muted font-monospace" dir="ltr">{activeAppointment.patientPhone}</span>
                  </div>

                  <div className="col-sm-6">
                    <span className="text-muted small d-block">{isAr ? 'الخدمة:' : 'Service:'}</span>
                    <strong className="d-block text-dark">{isAr ? activeAppointment.serviceName.ar : activeAppointment.serviceName.en}</strong>
                    <span className="small text-muted">{activeAppointment.serviceDuration} {isAr ? 'دقيقة' : 'mins'}</span>
                  </div>

                  <div className="col-sm-6">
                    <span className="text-muted small d-block">{isAr ? 'الطبيب المعالج:' : 'Doctor:'}</span>
                    <strong className="d-block text-dark">
                      {activeAppointment.doctorName
                        ? (isAr ? activeAppointment.doctorName.ar : activeAppointment.doctorName.en)
                        : (isAr ? 'أي طبيب متاح' : 'Any')}
                    </strong>
                  </div>

                  <div className="col-sm-6">
                    <span className="text-muted small d-block">{isAr ? 'التاريخ والوقت:' : 'Date & Time:'}</span>
                    <strong className="d-block text-primary">
                      {activeAppointment.date} ({activeAppointment.startTime} - {activeAppointment.endTime})
                    </strong>
                  </div>

                  {activeAppointment.notes && (
                    <div className="col-12">
                      <span className="text-muted small d-block">{isAr ? 'ملاحظات المريض:' : 'Patient Notes:'}</span>
                      <div className="p-2 bg-light rounded small border">{activeAppointment.notes}</div>
                    </div>
                  )}

                  {/* Internal Staff Notes */}
                  <div className="col-12 mt-3">
                    <label className="form-label small fw-bold text-dark">
                      {isAr ? 'ملاحظات الفريق الداخلي (Internal Staff Notes):' : 'Internal Staff Notes:'}
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder={isAr ? 'سجل ملاحظات الاستقبال أو الطبيب...' : 'Add staff notes...'}
                      value={internalNoteInput}
                      onChange={(e) => setInternalNoteInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary mt-2 rounded-pill px-3"
                      onClick={handleSaveInternalNotes}
                    >
                      {isAr ? 'حفظ الملاحظات الداخلية' : 'Save Internal Notes'}
                    </button>
                  </div>
                </div>

                {/* Status Transition Buttons */}
                <div className="border-top pt-3">
                  <span className="small fw-bold text-muted d-block mb-2">
                    {isAr ? 'تغيير حالة الحجز:' : 'Change Status:'}
                  </span>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-success rounded-pill px-3"
                      onClick={() => handleStatusChange(activeAppointment.id, 'confirmed')}
                    >
                      {isAr ? 'تأكيد الموعد' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-info text-white rounded-pill px-3"
                      onClick={() => handleStatusChange(activeAppointment.id, 'completed')}
                    >
                      {isAr ? 'اكتملت الزيارة' : 'Mark Completed'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary rounded-pill px-3"
                      onClick={() => handleStatusChange(activeAppointment.id, 'no_show')}
                    >
                      {isAr ? 'لم يحضر (No Show)' : 'No Show'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger rounded-pill px-3"
                      onClick={() => handleStatusChange(activeAppointment.id, 'cancelled')}
                    >
                      {isAr ? 'إلغاء الموعد' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MANUAL WALK-IN MODAL */}
      {isManualModalOpen && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <form onSubmit={handleCreateManual}>
                <div className="modal-header border-bottom p-4">
                  <h5 className="modal-title fw-bold m-0">
                    {isAr ? 'إنشاء حجز جديد (حضور شخصي أو هاتف)' : 'New Walk-in / Phone Booking'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsManualModalOpen(false)}
                  />
                </div>

                <div className="modal-body p-4">
                  {manualError && (
                    <div className="alert alert-danger small mb-3">{manualError}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-bold">{isAr ? 'اسم المريض *' : 'Patient Name *'}</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="أحمد محمد"
                      value={manualForm.patientName}
                      onChange={(e) => setManualForm({ ...manualForm, patientName: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">{isAr ? 'رقم الهاتف *' : 'Phone *'}</label>
                    <input
                      type="tel"
                      className="form-control"
                      required
                      dir="ltr"
                      placeholder="01012345678"
                      value={manualForm.patientPhone}
                      onChange={(e) => setManualForm({ ...manualForm, patientPhone: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">{isAr ? 'الخدمة' : 'Service'}</label>
                      <select
                        className="form-select form-select-sm"
                        value={manualForm.serviceId}
                        onChange={(e) => setManualForm({ ...manualForm, serviceId: e.target.value })}
                      >
                        <option value="checkup-cleaning">{isAr ? 'كشف وتنظيف' : 'Checkup'}</option>
                        <option value="teeth-whitening">{isAr ? 'تبييض الأسنان' : 'Whitening'}</option>
                        <option value="root-canal">{isAr ? 'علاج الجذور' : 'Root Canal'}</option>
                        <option value="dental-implants">{isAr ? 'زراعة الأسنان' : 'Implants'}</option>
                        <option value="cosmetic-fillings">{isAr ? 'حشو تجميلي' : 'Fillings'}</option>
                        <option value="pediatric-dentistry">{isAr ? 'أسنان أطفال' : 'Pediatric'}</option>
                        <option value="orthodontics-consult">{isAr ? 'تقويم أسنان' : 'Ortho'}</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold">{isAr ? 'الطبيب' : 'Doctor'}</label>
                      <select
                        className="form-select form-select-sm"
                        value={manualForm.doctorId}
                        onChange={(e) => setManualForm({ ...manualForm, doctorId: e.target.value })}
                      >
                        <option value="any">{isAr ? 'أي طبيب متاح' : 'Any Doctor'}</option>
                        {doctors.map((d) => (
                          <option key={d.doctorId} value={d.doctorId}>
                            {isAr ? d.doctorName.ar : d.doctorName.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">{isAr ? 'التاريخ' : 'Date'}</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        required
                        value={manualForm.date}
                        onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">{isAr ? 'الوقت' : 'Time'}</label>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        required
                        value={manualForm.startTime}
                        onChange={(e) => setManualForm({ ...manualForm, startTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">{isAr ? 'ملاحظات' : 'Notes'}</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={manualForm.notes}
                      onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top p-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setIsManualModalOpen(false)}
                    disabled={isCreatingManual}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={isCreatingManual}
                  >
                    {isCreatingManual ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'تأكيد الحجز' : 'Book')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManager;
