import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  getBookingService,
  DoctorSchedule,
  BlockedSlot,
  formatCairoDate,
  getCairoNow,
} from '../../services/booking';
import {
  Users,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Ban,
  Slash,
} from 'lucide-react';

export const DoctorsManager: React.FC = () => {
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const bookingService = useMemo(() => getBookingService(), []);

  const [doctors, setDoctors] = useState<DoctorSchedule[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab: 'doctors' | 'blocked'
  const [activeTab, setActiveTab] = useState<'doctors' | 'blocked'>('doctors');

  // New Blocked Slot Form State
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({
    doctorId: '', // empty for all clinic doctors
    date: formatCairoDate(getCairoNow()),
    startTime: '13:00',
    endTime: '14:00',
    isFullDay: false,
    reason: '',
  });

  // Edit Doctor Schedule Modal
  const [editingDoc, setEditingDoc] = useState<DoctorSchedule | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [docs, blocked] = await Promise.all([
        bookingService.getDoctors(),
        bookingService.getBlockedSlots(),
      ]);
      setDoctors(docs);
      setBlockedSlots(blocked);
    } catch (err) {
      console.error('Failed to load doctors data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleDoctorActive = async (doc: DoctorSchedule) => {
    if (isViewer) {
      alert(isAr ? 'عفواً، وضع العرض فقط.' : 'Read-only mode.');
      return;
    }
    await bookingService.updateDoctor(doc.doctorId, { isActive: !doc.isActive });
    await fetchData();
  };

  const handleSaveDocSchedule = async () => {
    if (!editingDoc || isViewer) return;
    await bookingService.updateDoctor(editingDoc.doctorId, editingDoc);
    setEditingDoc(null);
    await fetchData();
    alert(isAr ? 'تم تحديث جدول الطبيب بنجاح.' : 'Doctor schedule updated.');
  };

  const handleCreateBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      alert(isAr ? 'وضع العرض فقط.' : 'Read-only mode.');
      return;
    }

    if (!newBlock.reason.trim()) {
      alert(isAr ? 'يرجى كتابة سبب الإغلاق أو الاستراحة.' : 'Please enter a reason.');
      return;
    }

    await bookingService.blockSlot({
      doctorId: newBlock.doctorId || undefined,
      date: newBlock.date,
      startTime: newBlock.isFullDay ? undefined : newBlock.startTime,
      endTime: newBlock.isFullDay ? undefined : newBlock.endTime,
      reason: newBlock.reason.trim(),
    });

    setIsAddBlockOpen(false);
    setNewBlock({
      doctorId: '',
      date: formatCairoDate(getCairoNow()),
      startTime: '13:00',
      endTime: '14:00',
      isFullDay: false,
      reason: '',
    });
    await fetchData();
    alert(isAr ? 'تم حظر الموعد / إضافة العطلة بنجاح.' : 'Slot blocked successfully.');
  };

  const handleDeleteBlockedSlot = async (id: string) => {
    if (isViewer) return;
    if (window.confirm(isAr ? 'إلغاء حظر هذا الموعد وإعادته متاحاً للحجز؟' : 'Unblock this slot?')) {
      await bookingService.unblockSlot(id);
      await fetchData();
    }
  };

  const daysOfWeek = isAr
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة (مغلق)', 'السبت']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday (Closed)', 'Saturday'];

  return (
    <div className="admin-doctors-schedule p-3 p-md-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark">
            {isAr ? 'الأطباء، ساعات العمل والمواعيد المحظورة' : 'Doctors, Working Hours & Blocked Slots'}
          </h3>
          <p className="text-muted small m-0">
            {isAr
              ? 'إدارة جدول الأطباء الأسبوعي، فترات الاستراحة اليومية، وحظر أوقات معينة من الحجز المباشر'
              : 'Configure doctor schedules, breaks, days off and blocked slots'}
          </p>
        </div>

        <div className="btn-group rounded-pill overflow-hidden border">
          <button
            type="button"
            className={`btn px-4 ${activeTab === 'doctors' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setActiveTab('doctors')}
          >
            <Users size={16} className="me-1" />
            <span>{isAr ? 'أطباء العيادة والجدول' : 'Doctors & Hours'}</span>
          </button>
          <button
            type="button"
            className={`btn px-4 ${activeTab === 'blocked' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setActiveTab('blocked')}
          >
            <Ban size={16} className="me-1" />
            <span>{isAr ? 'المواعيد المحظورة والعطلات' : 'Blocked Slots'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DOCTORS & WEEKLY HOURS */}
      {activeTab === 'doctors' && (
        <div className="doctors-tab-container">
          <div className="alert alert-warning rounded-4 border-warning d-flex align-items-center gap-3 mb-4">
            <AlertCircle className="text-warning flex-shrink-0" size={24} />
            <div>
              <strong className="d-block">
                {isAr ? 'ملاحظة خاصة ببيانات الفريق الطبي:' : 'Notice Regarding Medical Team Data:'}
              </strong>
              <span className="small">
                {isAr
                  ? 'بيانات ومسميات الأطباء الحالية هي نماذج استرشادية مؤقتة للحجز والتجربة، وتتطلب استبدالها بأسماء وصور ومؤهلات أطباء العيادة الحقيقيين المعتمدين قبل الإطلاق الرسمي.'
                  : 'Current doctor names and titles are temporary placeholders for demonstration, and should be updated with verified clinic physicians, credentials, and photos before official launch.'}
              </span>
            </div>
          </div>

          <div className="row g-4">
            {doctors.map((doc) => {
              const name = isAr ? doc.doctorName.ar : doc.doctorName.en;
              const title = isAr ? doc.title.ar : doc.title.en;

              return (
                <div key={doc.doctorId} className="col-lg-6">
                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                          <h5 className="fw-bold text-dark m-0">{name}</h5>
                          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle small">
                            {isAr ? 'بيانات مؤقتة تحتاج استبدال' : 'Placeholder'}
                          </span>
                        </div>
                        <span className="small text-muted">{title}</span>
                      </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 ${
                          doc.isActive ? 'btn-outline-success' : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleToggleDoctorActive(doc)}
                        disabled={isViewer}
                      >
                        {doc.isActive ? (isAr ? 'نشط للحجز' : 'Active') : (isAr ? 'موقف مؤقتاً' : 'Inactive')}
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-light border rounded-circle p-2"
                        onClick={() => setEditingDoc(JSON.parse(JSON.stringify(doc)))}
                        title={isAr ? 'تعديل الساعات' : 'Edit schedule'}
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="small text-muted mb-3">
                    <strong>{isAr ? 'الخدمات المتاحة:' : 'Assigned Services:'}</strong>{' '}
                    <span>{doc.services.includes('*') ? (isAr ? 'كافة خدمات العيادة' : 'All Services') : doc.services.join(', ')}</span>
                  </div>

                  {/* Weekly Working Days Badges */}
                  <div className="weekly-hours-grid border-top pt-3">
                    <span className="small fw-bold text-muted d-block mb-2">
                      {isAr ? 'ساعات العمل الأسبوعية (بتوقيت القاهرة):' : 'Weekly Working Hours (Cairo Time):'}
                    </span>
                    <div className="d-flex flex-column gap-1.5 small">
                      {[6, 0, 1, 2, 3, 4, 5].map((dayIdx) => {
                        const sched = doc.weeklyHours[dayIdx];
                        const isWorking = sched?.isWorking;

                        return (
                          <div
                            key={dayIdx}
                            className="d-flex justify-content-between align-items-center py-1 px-2 rounded bg-light"
                          >
                            <span className={dayIdx === 5 ? 'text-danger fw-bold' : 'text-dark'}>
                              {daysOfWeek[dayIdx]}
                            </span>
                            <span className="font-monospace small">
                              {isWorking ? `${sched.start} - ${sched.end}` : (isAr ? 'عطلة' : 'Off')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

      {/* TAB 2: BLOCKED SLOTS & HOLIDAYS */}
      {activeTab === 'blocked' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold m-0 text-dark">
                {isAr ? 'قائمة الفترات المحظورة والعطلات' : 'Blocked Slots & Clinic Holidays'}
              </h5>
              <small className="text-muted">
                {isAr
                  ? 'أي موعد محظور هنا يُستثنى فوراً وتلقائياً من نموذج الحجز للزوار'
                  : 'Slots added here are immediately disabled in the public booking engine'}
              </small>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
              onClick={() => setIsAddBlockOpen(true)}
              disabled={isViewer}
            >
              <Plus size={16} />
              <span>{isAr ? 'حظر موعد / عطلة جديدة' : 'Add Blocked Slot'}</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted">
                <tr>
                  <th>{isAr ? 'التاريخ' : 'Date'}</th>
                  <th>{isAr ? 'الوقت المحظور' : 'Time Range'}</th>
                  <th>{isAr ? 'النطاق' : 'Scope'}</th>
                  <th>{isAr ? 'السبب' : 'Reason'}</th>
                  <th className="text-end">{isAr ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {blockedSlots.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      {isAr ? 'لا توجد مواعيد محظورة حالياً' : 'No blocked slots'}
                    </td>
                  </tr>
                ) : (
                  blockedSlots.map((b) => {
                    const docObj = doctors.find((d) => d.doctorId === b.doctorId);
                    const scopeText = b.doctorId
                      ? (isAr ? docObj?.doctorName.ar : docObj?.doctorName.en) || b.doctorId
                      : (isAr ? 'كافة أطباء العيادة' : 'All Clinic Doctors');

                    const timeText = b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : (isAr ? 'اليوم بالكامل' : 'Full Day');

                    return (
                      <tr key={b.id}>
                        <td>
                          <strong className="text-dark">{b.date}</strong>
                        </td>
                        <td>
                          <span className="badge bg-danger-subtle text-danger font-monospace px-2 py-1">
                            {timeText}
                          </span>
                        </td>
                        <td>
                          <span className="small fw-semibold">{scopeText}</span>
                        </td>
                        <td>
                          <span className="small text-muted">{b.reason}</span>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-circle p-1"
                            onClick={() => handleDeleteBlockedSlot(b.id)}
                            title={isAr ? 'إلغاء الحظر' : 'Remove block'}
                            disabled={isViewer}
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* ADD BLOCKED SLOT MODAL */}
      {isAddBlockOpen && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <form onSubmit={handleCreateBlockedSlot}>
                <div className="modal-header border-bottom p-4">
                  <h5 className="modal-title fw-bold m-0 text-danger d-flex align-items-center gap-2">
                    <Ban size={20} />
                    <span>{isAr ? 'حظر موعد أو تسجيل عطلة' : 'Block Time Slot or Holiday'}</span>
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setIsAddBlockOpen(false)} />
                </div>

                <div className="modal-body p-4">
                  {/* Doctor select */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">
                      {isAr ? 'ينطبق على:' : 'Applies to:'}
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={newBlock.doctorId}
                      onChange={(e) => setNewBlock({ ...newBlock, doctorId: e.target.value })}
                    >
                      <option value="">{isAr ? 'كافة أطباء العيادة (عطلة عامة أو استراحة)' : 'All Clinic Doctors'}</option>
                      {doctors.map((d) => (
                        <option key={d.doctorId} value={d.doctorId}>
                          {isAr ? d.doctorName.ar : d.doctorName.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">{isAr ? 'التاريخ:' : 'Date:'}</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      required
                      value={newBlock.date}
                      onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })}
                    />
                  </div>

                  {/* Full day checkbox */}
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      id="fullDayCheck"
                      className="form-check-input"
                      checked={newBlock.isFullDay}
                      onChange={(e) => setNewBlock({ ...newBlock, isFullDay: e.target.checked })}
                    />
                    <label htmlFor="fullDayCheck" className="form-check-label small fw-bold">
                      {isAr ? 'عطلة اليوم بالكامل' : 'Block entire day'}
                    </label>
                  </div>

                  {/* Start & End Times if not full day */}
                  {!newBlock.isFullDay && (
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold">{isAr ? 'من الساعة:' : 'Start Time:'}</label>
                        <input
                          type="time"
                          className="form-control form-control-sm"
                          value={newBlock.startTime}
                          onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">{isAr ? 'إلى الساعة:' : 'End Time:'}</label>
                        <input
                          type="time"
                          className="form-control form-control-sm"
                          value={newBlock.endTime}
                          onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">{isAr ? 'سبب الحظر أو الاستراحة: *' : 'Reason: *'}</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      placeholder={isAr ? 'مثال: استراحة الغداء اليومية، مؤتمر طبي، صيانة...' : 'e.g. Daily lunch break, maintenance...'}
                      value={newBlock.reason}
                      onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setIsAddBlockOpen(false)}>
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="btn btn-danger rounded-pill px-4">
                    {isAr ? 'تأكيد الحظر' : 'Confirm Block'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DOCTOR SCHEDULE MODAL */}
      {editingDoc && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom p-4">
                <h5 className="modal-title fw-bold m-0">
                  {isAr ? 'تعديل جدول الطبيب: ' : 'Edit Schedule: '}
                  <span className="text-primary">{isAr ? editingDoc.doctorName.ar : editingDoc.doctorName.en}</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setEditingDoc(null)} />
              </div>

              <div className="modal-body p-4">
                <div className="d-flex flex-column gap-2">
                  {[6, 0, 1, 2, 3, 4, 5].map((dayIdx) => {
                    const sched = editingDoc.weeklyHours[dayIdx] || { isWorking: false, start: '10:00', end: '22:00' };

                    return (
                      <div key={dayIdx} className="d-flex align-items-center gap-3 p-2 bg-light rounded border">
                        <div style={{ width: '130px' }} className="fw-bold small text-dark">
                          {daysOfWeek[dayIdx]}
                        </div>

                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={sched.isWorking}
                            onChange={(e) => {
                              const updated = {
                                ...editingDoc,
                                weeklyHours: {
                                  ...editingDoc.weeklyHours,
                                  [dayIdx]: { ...sched, isWorking: e.target.checked },
                                },
                              };
                              setEditingDoc(updated);
                            }}
                          />
                          <label className="form-check-label small">
                            {sched.isWorking ? (isAr ? 'يوم عمل' : 'Working') : (isAr ? 'عطلة' : 'Off')}
                          </label>
                        </div>

                        {sched.isWorking && (
                          <div className="d-flex align-items-center gap-2 ms-auto">
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={sched.start}
                              onChange={(e) => {
                                const updated = {
                                  ...editingDoc,
                                  weeklyHours: {
                                    ...editingDoc.weeklyHours,
                                    [dayIdx]: { ...sched, start: e.target.value },
                                  },
                                };
                                setEditingDoc(updated);
                              }}
                            />
                            <span>-</span>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={sched.end}
                              onChange={(e) => {
                                const updated = {
                                  ...editingDoc,
                                  weeklyHours: {
                                    ...editingDoc.weeklyHours,
                                    [dayIdx]: { ...sched, end: e.target.value },
                                  },
                                };
                                setEditingDoc(updated);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer border-top p-3">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setEditingDoc(null)}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="button" className="btn btn-primary rounded-pill px-4" onClick={handleSaveDocSchedule}>
                  {isAr ? 'حفظ الجدول' : 'Save Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsManager;
