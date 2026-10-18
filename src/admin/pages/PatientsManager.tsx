import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getBookingService, PatientRecord, Appointment } from '../../services/booking';
import {
  Users,
  Search,
  Phone,
  Calendar,
  Clock,
  Trash2,
  ExternalLink,
  ChevronRight,
  Shield,
  FileText,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export const PatientsManager: React.FC = () => {
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const bookingService = useMemo(() => getBookingService(), []);

  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const [pts, apts] = await Promise.all([
        bookingService.listPatients(),
        bookingService.listAppointments(),
      ]);
      setPatients(pts);
      setAppointments(apts);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDeletePatient = async (phone: string) => {
    if (isViewer) {
      alert(isAr ? 'عفواً، وضع العرض فقط.' : 'Read-only mode.');
      return;
    }

    if (
      window.confirm(
        isAr
          ? 'هل أنت متأكد من حذف سجلات هذا المريض نهائياً؟ (حق الخصوصية وحذف البيانات)'
          : 'Are you sure you want to permanently delete this patient record?'
      )
    ) {
      await bookingService.deletePatient(phone);
      if (selectedPatient?.phone === phone) setSelectedPatient(null);
      await fetchPatients();
    }
  };

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q));
  }, [patients, searchQuery]);

  const selectedPatientAppointments = useMemo(() => {
    if (!selectedPatient) return [];
    return appointments.filter((a) => a.patientPhone === selectedPatient.phone);
  }, [selectedPatient, appointments]);

  return (
    <div className="admin-patients-page p-3 p-md-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark">
            {isAr ? 'سجل المرضى والمراجعين' : 'Patients Directory'}
          </h3>
          <p className="text-muted small m-0">
            {isAr
              ? 'قائمة المرضى المشتقة تلقائياً من الحجوزات مع تتبع عدد الزيارات وتاريخ آخر كشف'
              : 'Aggregated directory of clinic patients derived from appointments & visit history'}
          </p>
        </div>

        <div className="badge bg-light text-primary border px-3 py-2 rounded-pill fw-bold">
          <Users size={16} className="me-1" />
          <span>
            {patients.length} {isAr ? 'مريض مسجل' : 'Registered Patients'}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder={isAr ? 'بحث بالاسم أو رقم الهاتف...' : 'Search by name or phone...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Patients List + Detail Drawer */}
      <div className="row g-4">
        <div className={selectedPatient ? 'col-lg-7' : 'col-12'}>
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted">
                  <tr>
                    <th>{isAr ? 'المريض' : 'Patient'}</th>
                    <th>{isAr ? 'النوع' : 'Type'}</th>
                    <th>{isAr ? 'الزيارات' : 'Visits'}</th>
                    <th>{isAr ? 'آخر زيارة' : 'Last Visit'}</th>
                    <th className="text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2" />
                        <span>{isAr ? 'جاري التحميل...' : 'Loading...'}</span>
                      </td>
                    </tr>
                  ) : filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        {isAr ? 'لا يوجد مرضى مطابقين' : 'No patients found'}
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => {
                      const isSelected = selectedPatient?.phone === p.phone;
                      const cleanPhone = p.phone.replace(/\D/g, '');
                      const waUrl = `https://wa.me/${cleanPhone}`;

                      return (
                        <tr
                          key={p.phone}
                          className={`cursor-pointer ${isSelected ? 'table-active' : ''}`}
                          onClick={() => setSelectedPatient(p)}
                        >
                          <td>
                            <div className="fw-bold text-dark">{p.name}</div>
                            <small className="text-muted font-monospace" dir="ltr">
                              {p.phone}
                            </small>
                          </td>
                          <td>
                            <span
                              className={`badge rounded-pill small ${
                                p.patientType === 'new'
                                  ? 'bg-primary-subtle text-primary'
                                  : 'bg-secondary-subtle text-secondary'
                              }`}
                            >
                              {p.patientType === 'new'
                                ? (isAr ? 'جديد' : 'New')
                                : (isAr ? 'سابق' : 'Returning')}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border px-2 py-1">
                              {p.appointmentsCount} {isAr ? 'مواعيد' : 'visits'}
                            </span>
                          </td>
                          <td>
                            <span className="small text-muted">{p.lastVisitDate || '-'}</span>
                          </td>
                          <td className="text-end" onClick={(e) => e.stopPropagation()}>
                            <div className="d-inline-flex gap-1">
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-success rounded-circle p-1"
                                title="WhatsApp"
                              >
                                <FaWhatsapp size={14} />
                              </a>
                              <a
                                href={`tel:${p.phone}`}
                                className="btn btn-sm btn-outline-primary rounded-circle p-1"
                                title="Call"
                              >
                                <Phone size={14} />
                              </a>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-circle p-1"
                                onClick={() => handleDeletePatient(p.phone)}
                                title={isAr ? 'حذف بيانات المريض' : 'Delete patient'}
                              >
                                <Trash2 size={14} />
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
        </div>

        {/* Patient Detail Drawer */}
        {selectedPatient && (
          <div className="col-lg-5">
            <div className="card border-0 shadow rounded-4 p-4 sticky-top" style={{ top: '80px' }}>
              <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                <div>
                  <h5 className="fw-bold text-dark mb-1">{selectedPatient.name}</h5>
                  <span className="small text-muted font-monospace" dir="ltr">{selectedPatient.phone}</span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedPatient(null)}
                />
              </div>

              <div className="patient-stats-summary d-flex gap-3 mb-3">
                <div className="p-2 bg-light rounded-3 border text-center flex-grow-1">
                  <span className="small text-muted d-block">{isAr ? 'إجمالي الزيارات' : 'Visits'}</span>
                  <strong className="fs-5 text-primary">{selectedPatient.appointmentsCount}</strong>
                </div>
                <div className="p-2 bg-light rounded-3 border text-center flex-grow-1">
                  <span className="small text-muted d-block">{isAr ? 'آخر زيارة' : 'Last Visit'}</span>
                  <strong className="small text-dark">{selectedPatient.lastVisitDate || '-'}</strong>
                </div>
              </div>

              <h6 className="fw-bold small text-muted mb-2">
                {isAr ? 'سجل مواعيد المريض:' : 'Appointment History:'}
              </h6>

              <div className="patient-history-list d-flex flex-column gap-2" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {selectedPatientAppointments.length === 0 ? (
                  <p className="text-muted small">{isAr ? 'لا توجد مواعيد سابقة' : 'No prior history'}</p>
                ) : (
                  selectedPatientAppointments.map((apt) => (
                    <div key={apt.id} className="p-3 bg-light rounded-3 border small">
                      <div className="d-flex justify-content-between mb-1">
                        <strong className="text-primary font-monospace">{apt.bookingCode}</strong>
                        <span className="badge bg-secondary-subtle text-secondary">{apt.status}</span>
                      </div>
                      <div className="text-dark fw-semibold">{isAr ? apt.serviceName.ar : apt.serviceName.en}</div>
                      <div className="text-muted d-flex align-items-center gap-1 mt-1">
                        <Calendar size={13} />
                        <span>{apt.date} • {apt.startTime}</span>
                      </div>
                      {apt.internalNotes && (
                        <div className="mt-2 p-1.5 bg-white rounded border small text-muted">
                          <strong>{isAr ? 'ملاحظة:' : 'Note:'}</strong> {apt.internalNotes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsManager;
