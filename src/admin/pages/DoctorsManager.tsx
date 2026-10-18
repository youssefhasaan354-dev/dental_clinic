import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { DoctorProfile } from '../../types';
import { Users, Plus, Edit2, Trash2, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const DoctorsManager: React.FC = () => {
  const { doctors, refreshData } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emptyDoctor: DoctorProfile = {
    id: '',
    name: { ar: '', en: '' },
    title: { ar: '', en: '' },
    specialty: { ar: '', en: '' },
    bio: { ar: '', en: '' },
    languages: ['العربية', 'English'],
    credentials: [],
    photoUrl: '/images/team-placeholder.svg',
    isRealPhoto: false,
    isVisible: true,
    order: doctors.length + 1,
  };

  const handleCreateNew = () => {
    setEditingDoctor({
      ...emptyDoctor,
      id: 'doc_' + Date.now(),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (doc: DoctorProfile) => {
    setEditingDoctor(JSON.parse(JSON.stringify(doc)));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (isViewer) return;
    if (window.confirm(isAr ? 'حذف هذا الطبيب من الكادر؟' : 'Delete this doctor profile?')) {
      const storage = getStorageService();
      await storage.deleteDoctor(id);
      await refreshData();
    }
  };

  const handleSaveModal = async () => {
    if (!editingDoctor || isViewer) return;
    if (!editingDoctor.name.ar.trim()) {
      alert(isAr ? 'يرجى إدخال اسم الطبيب.' : 'Please enter doctor name.');
      return;
    }
    const storage = getStorageService();
    await storage.saveDoctor(editingDoctor);
    await refreshData();
    setIsModalOpen(false);
  };

  return (
    <div className="doctors-manager-page">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Users className="text-primary" size={24} />
            <span>{isAr ? 'إدارة الكادر الطبي والبيانات النقابية' : 'Doctors & Team Manager'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'وفقاً للقاعدة الذهبية 7: يُعرض فقط الاسم والمؤهل الحقيقي الصادر من النقابة، ويُمنع استخدام وجوه AI للأطباء.'
              : 'Rule 7: only real verified practitioner names and syndicate credentials allowed; no AI faces.'}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
          onClick={handleCreateNew}
          disabled={isViewer}
        >
          <Plus size={15} />
          <span>{isAr ? 'إضافة طبيب / تخصص' : 'Add Doctor'}</span>
        </button>
      </div>

      <div className="card rounded-4 border shadow-sm p-4 bg-white">
        <div className="row g-4">
          {doctors.map((doc) => (
            <div key={doc.id} className="col-md-6">
              <div className="p-3 rounded-4 border bg-light h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong className="h6 fw-bold text-dark d-block mb-1">{doc.name.ar}</strong>
                    <small className="text-muted">{doc.name.en} • {doc.specialty.ar}</small>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm p-1 rounded"
                      onClick={() => handleEdit(doc)}
                      disabled={isViewer}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm p-1 rounded"
                      onClick={() => handleDelete(doc.id)}
                      disabled={isViewer}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-secondary small mb-3 flex-grow-1" style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                  {doc.bio.ar}
                </p>

                <div className="pt-2 border-top small text-muted d-flex justify-content-between align-items-center">
                  <span>{doc.credentials?.length || 0} مؤهلات مسجلة</span>
                  <span className={`badge ${doc.isVisible ? 'bg-success' : 'bg-secondary'}`}>
                    {doc.isVisible ? (isAr ? 'ظاهر' : 'Visible') : (isAr ? 'مخفي' : 'Hidden')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && editingDoctor && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 99999, backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-4 shadow-lg overflow-hidden d-flex flex-column" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh' }}>
            <div className="p-3 px-4 border-bottom bg-light">
              <h5 className="mb-0 fw-bold text-dark">{isAr ? 'تعديل بيانات الطبيب' : 'Edit Doctor Profile'}</h5>
            </div>
            <div className="p-4 overflow-y-auto flex-grow-1">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">الاسم (عربي): *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingDoctor.name.ar}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, name: { ...editingDoctor.name, ar: e.target.value } })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Name (English): *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingDoctor.name.en}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, name: { ...editingDoctor.name, en: e.target.value } })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">المسمى الوظيفي (Title):</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingDoctor.title.ar}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, title: { ...editingDoctor.title, ar: e.target.value } })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">التخصص الدقيق (Specialty):</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingDoctor.specialty.ar}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialty: { ...editingDoctor.specialty, ar: e.target.value } })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">النبذة المهنية (Bio):</label>
                  <textarea
                    rows={3}
                    className="form-control form-control-sm"
                    value={editingDoctor.bio.ar}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: { ...editingDoctor.bio, ar: e.target.value } })}
                  />
                </div>
              </div>
            </div>
            <div className="p-3 px-4 border-top bg-light d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="btn btn-primary btn-sm px-4" onClick={handleSaveModal}>
                {isAr ? 'حفظ البيانات' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
