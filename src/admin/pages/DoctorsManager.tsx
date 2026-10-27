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
import { SERVICES } from '../../data/services';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Shield,
  Ban,
  User,
  Check,
} from 'lucide-react';

const DEFAULT_WEEKLY_HOURS = {
  0: { isWorking: true, start: '10:00', end: '22:00' }, // Sun
  1: { isWorking: true, start: '10:00', end: '22:00' }, // Mon
  2: { isWorking: true, start: '10:00', end: '22:00' }, // Tue
  3: { isWorking: true, start: '10:00', end: '22:00' }, // Wed
  4: { isWorking: true, start: '10:00', end: '22:00' }, // Thu
  5: { isWorking: false, start: '00:00', end: '00:00' }, // Fri (closed)
  6: { isWorking: true, start: '10:00', end: '22:00' }, // Sat
};

interface DoctorFormData {
  doctorId?: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  avatar: string;
  isActive: boolean;
  services: string[];
  weeklyHours: DoctorSchedule['weeklyHours'];
}

const INITIAL_FORM_DATA: DoctorFormData = {
  nameAr: '',
  nameEn: '',
  titleAr: '',
  titleEn: '',
  avatar: '',
  isActive: true,
  services: ['*'],
  weeklyHours: DEFAULT_WEEKLY_HOURS,
};

export const DoctorsManager: React.FC = () => {
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isOwner = role === 'owner';
  const isViewer = role === 'viewer';

  const bookingService = useMemo(() => getBookingService(), []);

  const [doctors, setDoctors] = useState<DoctorSchedule[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab: 'doctors' | 'blocked'
  const [activeTab, setActiveTab] = useState<'doctors' | 'blocked'>('doctors');

  // Doctor Modal: 'create' | 'edit'
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [doctorForm, setDoctorForm] = useState<DoctorFormData>(INITIAL_FORM_DATA);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingDoctor, setIsSavingDoctor] = useState(false);

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
    if (!isOwner) {
      alert(isAr ? 'عفواً، تعديل حالة الأطباء مقتصر على مالك العيادة (Owner).' : 'Modifying doctor status is restricted to clinic owner.');
      return;
    }
    try {
      await bookingService.editDoctor(doc.doctorId, { isActive: !doc.isActive });
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle doctor status:', err);
      alert(isAr ? 'حدث خطأ أثناء تغيير حالة الطبيب.' : 'Failed to update doctor status.');
    }
  };

  const handleOpenAddDoctor = () => {
    if (!isOwner) {
      alert(isAr ? 'عفواً، إضافة أطباء جدد مقتصرة على مالك العيادة (Owner).' : 'Adding doctors is restricted to clinic owner.');
      return;
    }
    setModalMode('create');
    setDoctorForm(INITIAL_FORM_DATA);
    setFormError(null);
    setIsDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: DoctorSchedule) => {
    if (!isOwner) {
      alert(isAr ? 'عفواً، تعديل بيانات وجدول الأطباء مقتصر على مالك العيادة (Owner).' : 'Editing doctors is restricted to clinic owner.');
      return;
    }
    setModalMode('edit');
    setDoctorForm({
      doctorId: doc.doctorId,
      nameAr: doc.doctorName?.ar || '',
      nameEn: doc.doctorName?.en || '',
      titleAr: doc.title?.ar || '',
      titleEn: doc.title?.en || '',
      avatar: doc.avatar || '',
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      services: doc.services || ['*'],
      weeklyHours: doc.weeklyHours || DEFAULT_WEEKLY_HOURS,
    });
    setFormError(null);
    setIsDoctorModalOpen(true);
  };

  const handleDeleteDoctor = async (doc: DoctorSchedule) => {
    if (isViewer) {
      alert(isAr ? 'عفواً، وضع العرض فقط.' : 'Read-only mode.');
      return;
    }
    if (!isOwner) {
      alert(
        isAr
          ? 'عفواً، حذف الأطباء مسموح فقط لحساب المالك (Owner) وفق قواعد الأمان.'
          : 'Deleting doctors is restricted to owner accounts only.'
      );
      return;
    }

    const docName = isAr ? doc.doctorName?.ar : doc.doctorName?.en;
    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف الطبيب "${docName}" نهائياً؟ لن يتمكن المرضى من اختياره للحجز.`
      : `Are you sure you want to permanently delete doctor "${docName}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        await bookingService.deleteDoctor(doc.doctorId);
        await fetchData();
        alert(isAr ? 'تم حذف الطبيب بنجاح.' : 'Doctor deleted successfully.');
      } catch (err) {
        console.error('Failed to delete doctor:', err);
        alert(isAr ? 'حدث خطأ أثناء حذف الطبيب.' : 'Failed to delete doctor.');
      }
    }
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!doctorForm.nameAr.trim() || !doctorForm.nameEn.trim()) {
      setFormError(
        isAr
          ? 'يرجى إدخال اسم الطبيب باللغتين العربية والإنجليزية.'
          : 'Please enter doctor name in both Arabic and English.'
      );
      return;
    }

    if (!doctorForm.titleAr.trim() || !doctorForm.titleEn.trim()) {
      setFormError(
        isAr
          ? 'يرجى إدخال مسمى وتخصص الطبيب باللغتين العربية والإنجليزية.'
          : 'Please enter doctor title/specialty in both Arabic and English.'
      );
      return;
    }

    if (!isOwner && modalMode === 'create') {
      setFormError(
        isAr
          ? 'عفواً، إضافة أطباء جدد تتطلب صلاحية المالك (Owner).'
          : 'Adding doctors requires owner privileges.'
      );
      return;
    }

    setIsSavingDoctor(true);
    try {
      if (modalMode === 'create') {
        await bookingService.addDoctor({
          doctorName: {
            ar: doctorForm.nameAr.trim(),
            en: doctorForm.nameEn.trim(),
          },
          title: {
            ar: doctorForm.titleAr.trim(),
            en: doctorForm.titleEn.trim(),
          },
          avatar: doctorForm.avatar.trim() || undefined,
          isActive: doctorForm.isActive,
          services: doctorForm.services,
          weeklyHours: doctorForm.weeklyHours,
        });
        alert(isAr ? 'تمت إضافة الطبيب بنجاح.' : 'Doctor added successfully.');
      } else {
        await bookingService.editDoctor(doctorForm.doctorId!, {
          doctorName: {
            ar: doctorForm.nameAr.trim(),
            en: doctorForm.nameEn.trim(),
          },
          title: {
            ar: doctorForm.titleAr.trim(),
            en: doctorForm.titleEn.trim(),
          },
          avatar: doctorForm.avatar.trim() || undefined,
          isActive: doctorForm.isActive,
          services: doctorForm.services,
          weeklyHours: doctorForm.weeklyHours,
        });
        alert(isAr ? 'تم تحديث بيانات الطبيب بنجاح.' : 'Doctor updated successfully.');
      }

      setIsDoctorModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to save doctor:', err);
      setFormError(err?.message || (isAr ? 'حدث خطأ أثناء حفظ بيانات الطبيب.' : 'Failed to save doctor.'));
    } finally {
      setIsSavingDoctor(false);
    }
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
            {isAr ? 'إدارة الأطباء، ساعات العمل والمواعيد' : 'Doctors & Schedule Management'}
          </h3>
          <p className="text-muted small m-0">
            {isAr
              ? 'إضافة وتعديل بيانات الأطباء، ضبط ساعات العمل الأسبوعية، وفترات العطلات والاستراحات'
              : 'Add & manage clinic physicians, configure working hours and blocked slots'}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {activeTab === 'doctors' && isOwner && (
            <button
              type="button"
              className="btn btn-primary rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
              onClick={handleOpenAddDoctor}
            >
              <Plus size={16} />
              <span className="fw-semibold">{isAr ? 'إضافة طبيب جديد' : 'Add New Doctor'}</span>
            </button>
          )}

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
      </div>

      {/* Security Info Badge */}
      {!isOwner && (
        <div className="alert alert-info rounded-4 border-info d-flex align-items-center gap-2 mb-4 p-3 small">
          <Shield size={18} className="flex-shrink-0" />
          <span>
            {isAr
              ? 'تنبيه أمني: إضافة وتعديل وحذف الأطباء وجداولهم محصورة بحساب المالك (Owner) وفقاً لقواعد أمان قاعدة البيانات.'
              : 'Security Note: Adding, editing, and deleting doctors and schedules is restricted to the clinic Owner.'}
          </span>
        </div>
      )}

      {/* TAB 1: DOCTORS & WEEKLY HOURS */}
      {activeTab === 'doctors' && (
        <div className="doctors-tab-container">
          <div className="alert alert-warning rounded-4 border-warning d-flex align-items-center gap-3 mb-4">
            <AlertCircle className="text-warning flex-shrink-0" size={24} />
            <div>
              <strong className="d-block">
                {isAr ? 'إدارة الفريق الطبي المعتمد:' : 'Medical Team Management:'}
              </strong>
              <span className="small">
                {isAr
                  ? 'يمكنك إضافة أطباء العيادة الحقيقيين، ضبط تخصصاتهم، إرفاق صورهم الرسمية، وتحديد مواعيد عملهم الأسبوعية لتظهر للمرضى في محرك الحجز.'
                  : 'Manage active clinic physicians, their specialties, avatars, and weekly hours for patient self-service booking.'}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <div className="small text-muted mt-2">{isAr ? 'جاري تحميل قائمة الأطباء...' : 'Loading doctors...'}</div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <Users size={48} className="text-muted mx-auto mb-3" />
              <h5 className="fw-bold">{isAr ? 'لا يوجد أطباء مسجلون حالياً' : 'No doctors found'}</h5>
              <p className="text-muted small mb-3">
                {isAr ? 'انقر على زر "إضافة طبيب جديد" للبدء في إضافة أطباء العيادة.' : 'Click "Add New Doctor" to get started.'}
              </p>
              <div>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={handleOpenAddDoctor}
                  disabled={isViewer}
                >
                  <Plus size={16} className="me-1" />
                  <span>{isAr ? 'إضافة طبيب جديد' : 'Add New Doctor'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {doctors.map((doc) => {
                const name = isAr ? doc.doctorName?.ar : doc.doctorName?.en;
                const title = isAr ? doc.title?.ar : doc.title?.en;

                return (
                  <div key={doc.doctorId} className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3">
                          {doc.avatar ? (
                            <img
                              src={doc.avatar}
                              alt={name || ''}
                              className="rounded-circle object-fit-cover border"
                              style={{ width: '56px', height: '56px' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-primary"
                              style={{ width: '56px', height: '56px' }}
                            >
                              <User size={26} />
                            </div>
                          )}

                          <div>
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                              <h5 className="fw-bold text-dark m-0">{name}</h5>
                              <span
                                className={`badge small ${
                                  doc.isActive
                                    ? 'bg-success-subtle text-success-emphasis border border-success-subtle'
                                    : 'bg-secondary-subtle text-secondary border border-secondary-subtle'
                                }`}
                              >
                                {doc.isActive ? (isAr ? 'متاح للحجز' : 'Active') : (isAr ? 'موقف مؤقتاً' : 'Inactive')}
                              </span>
                            </div>
                            <span className="small text-muted d-block">{title}</span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-2.5 py-1 ${
                              doc.isActive ? 'btn-outline-success' : 'btn-outline-secondary'
                            }`}
                            onClick={() => handleToggleDoctorActive(doc)}
                            disabled={!isOwner}
                            title={!isOwner ? (isAr ? 'مقتصر على مالك العيادة (Owner)' : 'Owner only') : (isAr ? 'تغيير حالة التفعيل' : 'Toggle active state')}
                          >
                            {doc.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'موقف' : 'Off')}
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-light border rounded-circle p-2"
                            onClick={() => handleOpenEditDoctor(doc)}
                            title={!isOwner ? (isAr ? 'مقتصر على مالك العيادة (Owner)' : 'Owner only') : (isAr ? 'تعديل بيانات الطبيب' : 'Edit doctor details')}
                            disabled={!isOwner}
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger border rounded-circle p-2"
                            onClick={() => handleDeleteDoctor(doc)}
                            title={!isOwner ? (isAr ? 'مقتصر على مالك العيادة (Owner)' : 'Owner only') : (isAr ? 'حذف الطبيب' : 'Delete doctor')}
                            disabled={!isOwner}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="small text-muted mb-3">
                        <strong>{isAr ? 'الخدمات المسندة:' : 'Assigned Services:'}</strong>{' '}
                        <span>
                          {doc.services?.includes('*')
                            ? isAr
                              ? 'كافة خدمات العيادة (شامل)'
                              : 'All Clinic Services'
                            : doc.services?.join(', ') || (isAr ? 'عام' : 'General')}
                        </span>
                      </div>

                      {/* Weekly Working Days Badges */}
                      <div className="weekly-hours-grid border-top pt-3 mt-auto">
                        <span className="small fw-bold text-muted d-block mb-2">
                          {isAr ? 'ساعات العمل الأسبوعية (بتوقيت القاهرة):' : 'Weekly Working Hours (Cairo Time):'}
                        </span>
                        <div className="d-flex flex-column gap-1.5 small">
                          {[6, 0, 1, 2, 3, 4, 5].map((dayIdx) => {
                            const sched = doc.weeklyHours?.[dayIdx];
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
                                  {isWorking ? `${sched?.start} - ${sched?.end}` : isAr ? 'عطلة' : 'Off'}
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
          )}
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
                      ? (isAr ? docObj?.doctorName?.ar : docObj?.doctorName?.en) || b.doctorId
                      : isAr
                      ? 'كافة أطباء العيادة'
                      : 'All Clinic Doctors';

                    const timeText =
                      b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : isAr ? 'اليوم بالكامل' : 'Full Day';

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

      {/* DOCTOR CREATE / EDIT MODAL */}
      {isDoctorModalOpen && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <form onSubmit={handleSaveDoctor}>
                <div className="modal-header border-bottom p-4">
                  <h5 className="modal-title fw-bold m-0 d-flex align-items-center gap-2">
                    <User size={20} className="text-primary" />
                    <span>
                      {modalMode === 'create'
                        ? isAr
                          ? 'إضافة طبيب جديد للعيادة'
                          : 'Add New Clinic Doctor'
                        : isAr
                        ? 'تعديل بيانات وجدول الطبيب'
                        : 'Edit Doctor & Schedule'}
                    </span>
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setIsDoctorModalOpen(false)} />
                </div>

                <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {formError && (
                    <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                      {formError}
                    </div>
                  )}

                  {/* Names Row */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">
                        {isAr ? 'الاسم بالكامل (عربي) *' : 'Doctor Name (Arabic) *'}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        placeholder="د. أحمد حسن"
                        value={doctorForm.nameAr}
                        onChange={(e) => setDoctorForm({ ...doctorForm, nameAr: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">
                        {isAr ? 'الاسم بالكامل (إنجليزي) *' : 'Doctor Name (English) *'}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        dir="ltr"
                        placeholder="Dr. Ahmed Hassan"
                        value={doctorForm.nameEn}
                        onChange={(e) => setDoctorForm({ ...doctorForm, nameEn: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Titles Row */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">
                        {isAr ? 'المسمى والتخصص (عربي) *' : 'Specialty / Title (Arabic) *'}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        placeholder="أخصائي علاج الجذور والتركيبات"
                        value={doctorForm.titleAr}
                        onChange={(e) => setDoctorForm({ ...doctorForm, titleAr: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">
                        {isAr ? 'المسمى والتخصص (إنجليزي) *' : 'Specialty / Title (English) *'}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        dir="ltr"
                        placeholder="Endodontics & Restorative Specialist"
                        value={doctorForm.titleEn}
                        onChange={(e) => setDoctorForm({ ...doctorForm, titleEn: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Avatar URL & Active Toggle */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">
                        {isAr ? 'رابط الصورة الشخصية (Avatar URL)' : 'Avatar Image URL'}
                      </label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        dir="ltr"
                        placeholder="https://.../doctor.jpg"
                        value={doctorForm.avatar}
                        onChange={(e) => setDoctorForm({ ...doctorForm, avatar: e.target.value })}
                      />
                      <small className="text-muted">
                        {isAr ? 'اختياري. في حال تركه فارغاً ستظهر أيقونة طبية افتراضية.' : 'Optional. A clean medical avatar is used if left blank.'}
                      </small>
                    </div>

                    <div className="col-md-4 d-flex flex-column justify-content-center">
                      <div className="form-check form-switch mt-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="doctorActiveSwitch"
                          checked={doctorForm.isActive}
                          onChange={(e) => setDoctorForm({ ...doctorForm, isActive: e.target.checked })}
                        />
                        <label htmlFor="doctorActiveSwitch" className="form-check-label small fw-bold">
                          {doctorForm.isActive ? (isAr ? 'متاح للحجز الفعلي' : 'Active for Booking') : (isAr ? 'موقف مؤقتاً' : 'Inactive')}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Services Multi-Select */}
                  <div className="mb-4">
                    <label className="form-label small fw-bold d-block">
                      {isAr ? 'الخدمات التي يقدمها الطبيب:' : 'Assigned Services:'}
                    </label>
                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="allServicesCheck"
                        checked={doctorForm.services.includes('*')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDoctorForm({ ...doctorForm, services: ['*'] });
                          } else {
                            setDoctorForm({ ...doctorForm, services: ['scaling-polishing'] });
                          }
                        }}
                      />
                      <label htmlFor="allServicesCheck" className="form-check-label small fw-bold text-primary">
                        {isAr ? 'كافة خدمات العيادة (*)' : 'All Clinic Services (*)'}
                      </label>
                    </div>

                    {!doctorForm.services.includes('*') && (
                      <div className="p-3 border rounded-3 bg-light d-flex flex-wrap gap-2">
                        {SERVICES.map((srv) => {
                          const isChecked = doctorForm.services.includes(srv.id);
                          return (
                            <label
                              key={srv.id}
                              className={`btn btn-sm rounded-pill px-3 py-1 ${
                                isChecked ? 'btn-primary' : 'btn-outline-secondary'
                              }`}
                              style={{ cursor: 'pointer' }}
                            >
                              <input
                                type="checkbox"
                                className="d-none"
                                checked={isChecked}
                                onChange={() => {
                                  const nextServices = isChecked
                                    ? doctorForm.services.filter((s) => s !== srv.id)
                                    : [...doctorForm.services, srv.id];
                                  setDoctorForm({
                                    ...doctorForm,
                                    services: nextServices.length > 0 ? nextServices : ['*'],
                                  });
                                }}
                              />
                              {isAr ? srv.title?.ar : srv.title?.en}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Weekly Working Hours Accordion / Grid */}
                  <div className="border-top pt-3">
                    <label className="form-label small fw-bold d-block mb-2">
                      {isAr ? 'ساعات العمل الأسبوعية (بتوقيت القاهرة):' : 'Weekly Working Hours (Cairo Time):'}
                    </label>

                    <div className="d-flex flex-column gap-2">
                      {[6, 0, 1, 2, 3, 4, 5].map((dayIdx) => {
                        const sched = doctorForm.weeklyHours?.[dayIdx] || {
                          isWorking: dayIdx !== 5,
                          start: '10:00',
                          end: '22:00',
                        };

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
                                  setDoctorForm({
                                    ...doctorForm,
                                    weeklyHours: {
                                      ...doctorForm.weeklyHours,
                                      [dayIdx]: { ...sched, isWorking: e.target.checked },
                                    },
                                  });
                                }}
                              />
                              <label className="form-check-label small">
                                {sched.isWorking ? (isAr ? 'يوم عمل' : 'Working') : isAr ? 'عطلة' : 'Off'}
                              </label>
                            </div>

                            {sched.isWorking && (
                              <div className="d-flex align-items-center gap-2 ms-auto">
                                <input
                                  type="time"
                                  className="form-control form-control-sm"
                                  value={sched.start}
                                  onChange={(e) => {
                                    setDoctorForm({
                                      ...doctorForm,
                                      weeklyHours: {
                                        ...doctorForm.weeklyHours,
                                        [dayIdx]: { ...sched, start: e.target.value },
                                      },
                                    });
                                  }}
                                />
                                <span>-</span>
                                <input
                                  type="time"
                                  className="form-control form-control-sm"
                                  value={sched.end}
                                  onChange={(e) => {
                                    setDoctorForm({
                                      ...doctorForm,
                                      weeklyHours: {
                                        ...doctorForm.weeklyHours,
                                        [dayIdx]: { ...sched, end: e.target.value },
                                      },
                                    });
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top p-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setIsDoctorModalOpen(false)}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                    disabled={isSavingDoctor}
                  >
                    {isSavingDoctor ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    ) : (
                      <Check size={16} />
                    )}
                    <span>
                      {modalMode === 'create'
                        ? isAr
                          ? 'إضافة الطبيب الآن'
                          : 'Add Doctor Now'
                        : isAr
                        ? 'حفظ التعديلات'
                        : 'Save Changes'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
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
                          {isAr ? d.doctorName?.ar : d.doctorName?.en}
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
    </div>
  );
};

export default DoctorsManager;
