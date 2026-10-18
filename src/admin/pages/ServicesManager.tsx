import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { ServiceItem } from '../../types';
import {
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

export const ServicesManager: React.FC = () => {
  const { services, refreshData, settings } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const emptyService: ServiceItem = {
    id: '',
    slug: '',
    title: { ar: '', en: '' },
    category: 'preventive',
    categoryAr: 'طب الأسنان الوقائي',
    shortDesc: { ar: '', en: '' },
    fullDesc: { ar: '', en: '' },
    duration: { ar: '30 دقيقة', en: '30 mins' },
    startingPrice: null,
    isConfirmed: true,
    isVisible: true,
    order: services.length + 1,
    steps: [],
    symptoms: [],
  };

  const handleCreateNew = () => {
    setEditingService({
      ...emptyService,
      id: 'srv_' + Date.now(),
      slug: 'service-' + (services.length + 1),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (service: ServiceItem) => {
    setEditingService(JSON.parse(JSON.stringify(service)));
    setIsModalOpen(true);
  };

  const handleDuplicate = async (service: ServiceItem) => {
    if (isViewer) return;
    const duplicated: ServiceItem = {
      ...JSON.parse(JSON.stringify(service)),
      id: 'srv_' + Date.now(),
      slug: `${service.slug}-copy`,
      title: {
        ar: `${service.title.ar} (نسخة)`,
        en: `${service.title.en} (Copy)`,
      },
      order: services.length + 1,
    };
    const storage = getStorageService();
    await storage.saveService(duplicated);
    await refreshData();
  };

  const handleDelete = async (id: string) => {
    if (isViewer) return;
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Delete this service?')) {
      const storage = getStorageService();
      await storage.deleteService(id);
      await refreshData();
    }
  };

  const handleToggleVisibility = async (service: ServiceItem) => {
    if (isViewer) return;
    const storage = getStorageService();
    await storage.saveService({ ...service, isVisible: !service.isVisible });
    await refreshData();
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (isViewer) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const listCopy = [...services];
    const [moved] = listCopy.splice(index, 1);
    listCopy.splice(targetIndex, 0, moved);

    const storage = getStorageService();
    await storage.reorderServices(listCopy.map((s) => s.id));
    await refreshData();
  };

  const handleSaveModal = async () => {
    if (!editingService) return;
    if (isViewer) return;

    if (!editingService.title.ar.trim() || !editingService.title.en.trim()) {
      alert(isAr ? 'يرجى إدخال اسم الخدمة بالعربية والإنجليزية.' : 'Please provide both AR and EN service titles.');
      return;
    }

    const storage = getStorageService();
    await storage.saveService(editingService);
    await refreshData();
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Slug', 'Category', 'Title AR', 'Title EN', 'Short Desc AR', 'Short Desc EN', 'Starting Price', 'Visible'];
    const rows = services.map((s) => [
      s.id,
      s.slug,
      s.category,
      `"${s.title.ar.replace(/"/g, '""')}"`,
      `"${s.title.en.replace(/"/g, '""')}"`,
      `"${s.shortDesc.ar.replace(/"/g, '""')}"`,
      `"${s.shortDesc.en.replace(/"/g, '""')}"`,
      s.startingPrice ?? '',
      s.isVisible,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hayaah_services_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="services-manager-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Stethoscope className="text-primary" size={24} />
            <span>{isAr ? 'إدارة الخدمات السريرية' : 'Services Manager'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'تخصيص التخصصات والخدمات، ضبط الوصف ثنائي اللغة، وترتيب الظهور وإعدادات الأسعار الاسترشادية.'
              : 'Add, reorder, localize and manage clinical dental services.'}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
            onClick={handleExportCSV}
          >
            <Download size={15} />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
            onClick={handleCreateNew}
            disabled={isViewer}
          >
            <Plus size={15} />
            <span>{isAr ? 'إضافة خدمة جديدة' : 'Add Service'}</span>
          </button>
        </div>
      </div>

      {/* Global Price Warning per Rule 11 */}
      {!settings.showPrices && (
        <div className="alert alert-info py-2 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={16} />
          <span>
            {isAr
              ? 'تنبيه: ميزة إظهار الأسعار معطلة حالياً في الإعدادات العامة (مخفية عن الزوار). يمكنك تفعيلها من قسم الهوية والإعدادات عند اعتماد قائمة الأسعار رسمياً.'
              : 'Prices are hidden by default per clinic guidelines. Enable in Branding & Settings once confirmed.'}
          </span>
        </div>
      )}

      {/* Services Table Card */}
      <div className="card rounded-4 border shadow-sm overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-muted">
                <th style={{ width: '60px' }}>{isAr ? 'الترتيب' : 'Order'}</th>
                <th>{isAr ? 'اسم الخدمة (عربي / English)' : 'Service Name'}</th>
                <th>{isAr ? 'التصنيف' : 'Category'}</th>
                <th>{isAr ? 'السعر الاسترشادي' : 'Fee'}</th>
                <th>{isAr ? 'الحالة' : 'Status'}</th>
                <th className="text-end" style={{ width: '180px' }}>{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv, idx) => (
                <tr key={srv.id}>
                  <td>
                    <div className="d-flex flex-column gap-1">
                      <button
                        type="button"
                        className="btn btn-link btn-xs p-0 text-muted"
                        disabled={idx === 0 || isViewer}
                        onClick={() => handleMoveOrder(idx, 'up')}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-link btn-xs p-0 text-muted"
                        disabled={idx === services.length - 1 || isViewer}
                        onClick={() => handleMoveOrder(idx, 'down')}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong className="text-dark d-block">{srv.title.ar}</strong>
                      <small className="text-muted">{srv.title.en}</small>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-secondary border small">
                      {isAr ? srv.categoryAr || srv.category : srv.category}
                    </span>
                  </td>
                  <td>
                    {srv.startingPrice ? (
                      <span className="fw-semibold text-primary small">
                        {isAr ? `تبدأ من ${srv.startingPrice} ج.م` : `From ${srv.startingPrice} EGP`}
                      </span>
                    ) : (
                      <span className="text-muted small">{isAr ? 'غير محدد (مخفي)' : 'Unset'}</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`btn btn-xs rounded-pill px-2 py-1 ${
                        srv.isVisible ? 'btn-success text-white' : 'btn-outline-secondary'
                      }`}
                      style={{ fontSize: '0.72rem' }}
                      onClick={() => handleToggleVisibility(srv)}
                      disabled={isViewer}
                    >
                      {srv.isVisible ? (
                        <>
                          <Eye size={12} className="me-1" />
                          <span>{isAr ? 'ظاهرة بالموقع' : 'Visible'}</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} className="me-1" />
                          <span>{isAr ? 'مخفية' : 'Hidden'}</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="text-end">
                    <div className="d-flex align-items-center justify-content-end gap-1">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm p-1 rounded"
                        title={isAr ? 'تعديل الخدمة' : 'Edit'}
                        onClick={() => handleEdit(srv)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm p-1 rounded"
                        title={isAr ? 'تكرار الخدمة' : 'Duplicate'}
                        onClick={() => handleDuplicate(srv)}
                        disabled={isViewer}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm p-1 rounded"
                        title={isAr ? 'حذف الخدمة' : 'Delete'}
                        onClick={() => handleDelete(srv.id)}
                        disabled={isViewer}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && editingService && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 99999, backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-4 shadow-lg overflow-hidden d-flex flex-column" style={{ maxWidth: '720px', width: '100%', maxHeight: '90vh' }}>
            <div className="p-3 px-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark">
                {editingService.id ? (isAr ? 'تعديل الخدمة الطبية' : 'Edit Service') : (isAr ? 'إضافة خدمة جديدة' : 'Add New Service')}
              </h5>
              <button type="button" className="btn btn-sm btn-outline-secondary rounded-circle p-1" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow-1">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">اسم الخدمة (عربي): *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingService.title.ar}
                    onChange={(e) => setEditingService({ ...editingService, title: { ...editingService.title, ar: e.target.value } })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Service Title (English): *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingService.title.en}
                    onChange={(e) => setEditingService({ ...editingService, title: { ...editingService.title, en: e.target.value } })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">المعرف الرابط (Slug):</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingService.slug}
                    onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">التصنيف الطبي (Category):</label>
                  <select
                    className="form-select form-select-sm"
                    value={editingService.category}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  >
                    <option value="preventive">طب الأسنان الوقائي (Preventative)</option>
                    <option value="endodontics">علاج الجذور والعصب (Endodontics)</option>
                    <option value="restorative">الحشوات والترميم (Restorative)</option>
                    <option value="prosthodontics">التركيبات والتيجان (Prosthodontics)</option>
                    <option value="orthodontics">تقويم الأسنان (Orthodontics)</option>
                    <option value="surgery">الجراحة والزراعة (Surgery & Implants)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">السعر الاسترشادي (ج.م) - اختياري:</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="مثال: 500 (يظهر كتبدأ من)"
                    value={editingService.startingPrice ?? ''}
                    onChange={(e) => setEditingService({ ...editingService, startingPrice: e.target.value ? Number(e.target.value) : null })}
                  />
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    وفقاً للقاعدة الذهبية 11: يظهر بصيغة "تبدأ من" فقط مع تأكيد الطبيب.
                  </small>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">المدة التقريبية للجلسة:</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingService.duration?.ar || ''}
                    placeholder="مثال: 30 - 45 دقيقة"
                    onChange={(e) => setEditingService({
                      ...editingService,
                      duration: { ar: e.target.value, en: e.target.value }
                    })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">الوصف المختصر (عربي):</label>
                  <textarea
                    rows={2}
                    className="form-control form-control-sm"
                    value={editingService.shortDesc.ar}
                    onChange={(e) => setEditingService({ ...editingService, shortDesc: { ...editingService.shortDesc, ar: e.target.value } })}
                  ></textarea>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">Short Description (English):</label>
                  <textarea
                    rows={2}
                    className="form-control form-control-sm"
                    value={editingService.shortDesc.en}
                    onChange={(e) => setEditingService({ ...editingService, shortDesc: { ...editingService.shortDesc, en: e.target.value } })}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-3 px-4 border-top bg-light d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="btn btn-primary btn-sm px-4" onClick={handleSaveModal}>
                {isAr ? 'حفظ الخدمة' : 'Save Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
