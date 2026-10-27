import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  getBookingService,
  Appointment,
  BookingStats,
  formatCairoDate,
  getCairoNow,
} from '../../services/booking';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Download,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  RotateCcw,
  Activity,
  Phone,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export const DashboardHome: React.FC = () => {
  const { language } = useLanguage();
  const { role } = useAuth();
  const navigate = useNavigate();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const bookingService = useMemo(() => getBookingService(), []);

  const [stats, setStats] = useState<BookingStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [s, apts] = await Promise.all([
        bookingService.getStats(),
        bookingService.listAppointments(),
      ]);
      setStats(s);
      setAppointments(apts);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleResetDemo = async () => {
    if (isViewer) {
      alert(isAr ? 'عفواً، وضع العرض فقط.' : 'Read-only mode.');
      return;
    }
    if (
      window.confirm(
        isAr
          ? 'هل تريد إعادة ضبط كافة بيانات الحجوزات إلى النموذج التجريبي الأولي؟'
          : 'Reset all booking data to initial demo seed?'
      )
    ) {
      await bookingService.resetDemoData();
      await fetchDashboardData();
      alert(isAr ? 'تم إعادة تعيين البيانات التجريبية بنجاح.' : 'Demo data reset.');
    }
  };

  // Next Upcoming Appointments
  const nextAppointments = useMemo(() => {
    const todayStr = formatCairoDate(getCairoNow());
    return appointments
      .filter((a) => a.date >= todayStr && a.status !== 'cancelled')
      .slice(0, 5);
  }, [appointments]);

  // 14-day trend calculation
  const trendDays = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    const now = getCairoNow();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = formatCairoDate(d);
      const count = appointments.filter((a) => a.date === dateStr).length;
      days.push({
        date: dateStr,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        count,
      });
    }
    return days;
  }, [appointments]);

  const maxTrendCount = useMemo(() => {
    const max = Math.max(...trendDays.map((d) => d.count), 1);
    return Math.max(max, 5);
  }, [trendDays]);

  // Top services breakdown
  const topServices = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    for (const a of appointments) {
      const name = isAr ? a.serviceName.ar : a.serviceName.en;
      if (!counts[name]) counts[name] = { name, count: 0 };
      counts[name].count += 1;
    }
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [appointments, isAr]);

  return (
    <div className="admin-dashboard-home p-3 p-md-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Demo storage banner */}
      {bookingService.isDemo && (
        <div className="alert alert-light border d-flex flex-wrap align-items-center justify-content-between p-3 rounded-4 mb-4 shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-warning text-dark px-2.5 py-1 fw-bold">
              {isAr ? 'وضع تجريبي نشط' : 'Demo Mode Active'}
            </span>
            <span className="small text-muted">
              {isAr
                ? 'البيانات مخزنة في متصفحك محلياً (localStorage) ويمكنك تجربة دورة الحجز كاملة.'
                : 'Data stored locally in your browser. All booking cycles and live conflict checks work instantly.'}
            </span>
          </div>

          <div className="d-flex gap-2 mt-2 mt-sm-0">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1"
              onClick={handleResetDemo}
            >
              <RotateCcw size={14} />
              <span>{isAr ? 'إعادة ضبط البيانات التجريبية' : 'Reset Demo Seed'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Welcome & Quick Actions */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark">
            {isAr ? 'لوحة مؤشرات عيادة حياة لطب الأسنان' : 'Hayaah Dental Clinic Overview'}
          </h3>
          <p className="text-muted small m-0">
            {isAr
              ? 'متابعة العمليات اليومية، مؤشرات الأداء، وحركة الحجوزات المباشرة'
              : 'Live clinic metrics, daily appointment schedules, and booking trends'}
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link
            to="/admin/requests"
            className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm"
          >
            <Plus size={16} />
            <span>{isAr ? 'إدارة المواعيد' : 'Manage Appointments'}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards (5 metrics) */}
      <div className="row g-3 mb-4">
        {/* Today's Appointments */}
        <div className="col-lg col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="small fw-semibold">{isAr ? 'مواعيد اليوم' : "Today's Visits"}</span>
              <div className="p-2 bg-primary-subtle text-primary rounded-3">
                <Calendar size={18} />
              </div>
            </div>
            <h3 className="fw-bold m-0 text-dark">{stats?.todayTotal ?? 0}</h3>
            <small className="text-success mt-1 d-block">
              {stats?.todayConfirmed ?? 0} {isAr ? 'مؤكد' : 'Confirmed'} • {stats?.todayPending ?? 0} {isAr ? 'بانتظار' : 'Pending'}
            </small>
          </div>
        </div>

        {/* This Week */}
        <div className="col-lg col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="small fw-semibold">{isAr ? 'حجوزات الأسبوع' : 'This Week'}</span>
              <div className="p-2 bg-info-subtle text-info rounded-3">
                <TrendingUp size={18} />
              </div>
            </div>
            <h3 className="fw-bold m-0 text-dark">{stats?.thisWeekTotal ?? 0}</h3>
            <small className="text-muted mt-1 d-block">
              {isAr ? 'مواعيد مجدولة خلال ٧ أيام' : 'Scheduled in 7 days'}
            </small>
          </div>
        </div>

        {/* Pending Confirmations */}
        <div className="col-lg col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="small fw-semibold">{isAr ? 'بانتظار التأكيد' : 'Pending Approval'}</span>
              <div className="p-2 bg-warning-subtle text-warning rounded-3">
                <Clock size={18} />
              </div>
            </div>
            <h3 className="fw-bold m-0 text-dark">{stats?.pendingConfirmations ?? 0}</h3>
            <small className="text-warning fw-semibold mt-1 d-block">
              {isAr ? 'يتطلب تواصل الاستقبال' : 'Needs staff confirmation'}
            </small>
          </div>
        </div>

        {/* No-show rate */}
        <div className="col-lg col-md-6 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="small fw-semibold">{isAr ? 'نسبة عدم الحضور' : 'No-Show Rate'}</span>
              <div className="p-2 bg-danger-subtle text-danger rounded-3">
                <AlertCircle size={18} />
              </div>
            </div>
            <h3 className="fw-bold m-0 text-dark">{stats?.noShowRate ?? 0}%</h3>
            <small className="text-muted mt-1 d-block">
              {isAr ? 'معدل الالتزام ممتاز' : 'Reliability benchmark'}
            </small>
          </div>
        </div>

        {/* New Patients */}
        <div className="col-lg col-md-6 col-sm-12">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="small fw-semibold">{isAr ? 'مرضى جدد' : 'New Patients'}</span>
              <div className="p-2 bg-success-subtle text-success rounded-3">
                <Users size={18} />
              </div>
            </div>
            <h3 className="fw-bold m-0 text-dark">{stats?.newPatientsCount ?? 0}</h3>
            <small className="text-muted mt-1 d-block">
              {isAr ? 'من إجمالي المراجعين' : 'First-time visitors'}
            </small>
          </div>
        </div>
      </div>

      {/* Charts Section: 14-Day Trend + Top Services */}
      <div className="row g-4 mb-4">
        {/* 14-Day Bookings SVG Chart */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold m-0 text-dark">
                  {isAr ? 'حركة الحجوزات خلال ١٤ يوماً' : '14-Day Appointment Volume'}
                </h5>
                <small className="text-muted">
                  {isAr ? 'توزيع عدد المواعيد المسجلة يومياً' : 'Daily appointment booking counts'}
                </small>
              </div>
              <span className="badge bg-light text-dark border">
                {isAr ? 'بتوقيت القاهرة' : 'Cairo Time'}
              </span>
            </div>

            {/* SVG Bar Chart */}
            <div className="chart-svg-container" style={{ width: '100%', height: '220px' }}>
              <svg viewBox="0 0 700 200" width="100%" height="100%" className="overflow-visible">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0E5C2F" />
                    <stop offset="100%" stopColor="#7AC143" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference lines */}
                <line x1="0" y1="40" x2="700" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="90" x2="700" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="140" x2="700" y2="140" stroke="#f1f5f9" strokeWidth="1" />

                {trendDays.map((day, idx) => {
                  const barWidth = 32;
                  const x = 20 + idx * 48;
                  const barHeight = (day.count / maxTrendCount) * 130;
                  const y = 160 - barHeight;

                  return (
                    <g key={day.date} className="bar-group">
                      <rect
                        x={x}
                        y={Math.max(20, y)}
                        width={barWidth}
                        height={Math.max(4, barHeight)}
                        rx={6}
                        fill="url(#barGrad)"
                        opacity={day.count > 0 ? 0.9 : 0.25}
                      />
                      {day.count > 0 && (
                        <text
                          x={x + barWidth / 2}
                          y={Math.max(16, y - 5)}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#0E5C2F"
                          fontWeight="bold"
                        >
                          {day.count}
                        </text>
                      )}
                      <text
                        x={x + barWidth / 2}
                        y="185"
                        textAnchor="middle"
                        fontSize="9.5"
                        fill="#64748b"
                      >
                        {day.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Top Services Breakdown */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold m-0 text-dark mb-1">
              {isAr ? 'أكثر الخدمات طلباً' : 'Top Requested Services'}
            </h5>
            <small className="text-muted d-block mb-4">
              {isAr ? 'توزيع المواعيد حسب الإجراء الطبي' : 'Appointments by treatment type'}
            </small>

            <div className="d-flex flex-column gap-3">
              {topServices.map((srv, idx) => {
                const total = appointments.length || 1;
                const percentage = Math.round((srv.count / total) * 100);

                return (
                  <div key={srv.name} className="service-progress-item">
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span className="text-dark">{srv.name}</span>
                      <span className="text-primary">{srv.count} ({percentage}%)</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar rounded-pill"
                        role="progressbar"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: idx === 0 ? '#0E5C2F' : idx === 1 ? '#7AC143' : '#10B981',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Next Upcoming Appointments Table */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold m-0 text-dark">
              {isAr ? 'المواعيد القادمة اليوم وغداً' : 'Next Upcoming Appointments'}
            </h5>
            <small className="text-muted">
              {isAr ? 'قائمة سريعة للمرضى المتوقع حضورهم' : 'Quick view for reception check-in'}
            </small>
          </div>

          <Link to="/admin/requests" className="text-primary text-decoration-none small fw-bold d-flex align-items-center gap-1">
            <span>{isAr ? 'عرض كافة المواعيد' : 'View All'}</span>
            {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted">
              <tr>
                <th>{isAr ? 'كود الحجز' : 'Code'}</th>
                <th>{isAr ? 'المريض' : 'Patient'}</th>
                <th>{isAr ? 'الخدمة' : 'Service'}</th>
                <th>{isAr ? 'الموعد' : 'Schedule'}</th>
                <th>{isAr ? 'الحالة' : 'Status'}</th>
                <th className="text-end">{isAr ? 'تواصل سريع' : 'Contact'}</th>
              </tr>
            </thead>
            <tbody>
              {nextAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    {isAr ? 'لا توجد مواعيد قادمة اليوم' : 'No upcoming visits'}
                  </td>
                </tr>
              ) : (
                nextAppointments.map((apt) => {
                  const cleanPhone = apt.patientPhone.replace(/\D/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}`;

                  return (
                    <tr key={apt.id}>
                      <td>
                        <strong className="text-primary font-monospace">{apt.bookingCode}</strong>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{apt.patientName}</div>
                        <small className="text-muted font-monospace" dir="ltr">{apt.patientPhone}</small>
                      </td>
                      <td>
                        <span className="small">{isAr ? apt.serviceName.ar : apt.serviceName.en}</span>
                      </td>
                      <td>
                        <div className="small fw-bold text-dark">{apt.date}</div>
                        <small className="text-primary">{apt.startTime} - {apt.endTime}</small>
                      </td>
                      <td>
                        <span className={`badge rounded-pill small ${apt.status === 'confirmed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="text-end">
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
                            href={`tel:${apt.patientPhone}`}
                            className="btn btn-sm btn-outline-primary rounded-circle p-1"
                            title="Call"
                          >
                            <Phone size={14} />
                          </a>
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
  );
};

export default DashboardHome;
