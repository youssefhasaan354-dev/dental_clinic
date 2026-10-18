import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { ArticleItem } from '../../types';
import { BookOpen, Plus, Edit2, Trash2, ShieldCheck, Check } from 'lucide-react';

export const ArticlesManager: React.FC = () => {
  const { articles, refreshData } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emptyArticle: ArticleItem = {
    id: '',
    slug: '',
    title: { ar: '', en: '' },
    summary: { ar: '', en: '' },
    content: { ar: '', en: '' },
    authorDoctorName: { ar: 'فريق عيادة حياة لطب الأسنان', en: 'Hayaah Dental Clinic Medical Team' },
    publishDate: new Date().toISOString().split('T')[0],
    readTimeMinutes: 4,
    isApprovedByDoctor: true,
    isVisible: true,
  };

  const handleCreateNew = () => {
    setEditingArticle({
      ...emptyArticle,
      id: 'art_' + Date.now(),
      slug: 'article-' + (articles.length + 1),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (art: ArticleItem) => {
    setEditingArticle(JSON.parse(JSON.stringify(art)));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (isViewer) return;
    if (window.confirm(isAr ? 'حذف هذا المقال التوعوي؟' : 'Delete article?')) {
      const storage = getStorageService();
      await storage.deleteArticle(id);
      await refreshData();
    }
  };

  const handleSaveModal = async () => {
    if (!editingArticle || isViewer) return;
    if (!editingArticle.title.ar.trim()) {
      alert(isAr ? 'يرجى إدخال عنوان المقال.' : 'Please enter article title.');
      return;
    }
    const storage = getStorageService();
    await storage.saveArticle(editingArticle);
    await refreshData();
    setIsModalOpen(false);
  };

  return (
    <div className="articles-manager-page">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <BookOpen className="text-primary" size={24} />
            <span>{isAr ? 'إدارة المقالات والتوعية الطبية' : 'Articles & Health Education'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'وفقاً للقاعدة الذهبية 13: تتضمن كل مقالة اسم الطبيب المعتمد وتاريخ النشر وإخلاء المسؤولية الطبية الصريح.'
              : 'Rule 13: each educational article includes doctor attribution and mandatory medical disclaimer.'}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
          onClick={handleCreateNew}
          disabled={isViewer}
        >
          <Plus size={15} />
          <span>{isAr ? 'كتابة مقال جديد' : 'Add Article'}</span>
        </button>
      </div>

      <div className="card rounded-4 border shadow-sm p-4 bg-white">
        <div className="row g-4">
          {articles.map((art) => (
            <div key={art.id} className="col-md-6">
              <div className="p-3 rounded-4 border bg-light h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong className="h6 fw-bold text-dark d-block mb-1">{art.title.ar}</strong>
                    <small className="text-muted">{art.publishDate} • بقلم: {art.authorDoctorName.ar}</small>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm p-1 rounded"
                      onClick={() => handleEdit(art)}
                      disabled={isViewer}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm p-1 rounded"
                      onClick={() => handleDelete(art.id)}
                      disabled={isViewer}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-secondary small mb-3 flex-grow-1" style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                  {art.summary.ar}
                </p>

                <div className="pt-2 border-top small text-muted d-flex justify-content-between align-items-center">
                  <span>وقت القراءة: {art.readTimeMinutes} دقائق</span>
                  <span className="badge bg-success">معتمد طبياً</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && editingArticle && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 99999, backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-4 shadow-lg overflow-hidden d-flex flex-column" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh' }}>
            <div className="p-3 px-4 border-bottom bg-light">
              <h5 className="mb-0 fw-bold text-dark">{isAr ? 'تعديل المقال الطبي' : 'Edit Article'}</h5>
            </div>
            <div className="p-4 overflow-y-auto flex-grow-1">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">عنوان المقال (عربي): *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingArticle.title.ar}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: { ...editingArticle.title, ar: e.target.value } })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Article Title (English): *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingArticle.title.en}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: { ...editingArticle.title, en: e.target.value } })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">الملخص التوعوي (Summary):</label>
                  <textarea
                    rows={2}
                    className="form-control form-control-sm"
                    value={editingArticle.summary.ar}
                    onChange={(e) => setEditingArticle({ ...editingArticle, summary: { ...editingArticle.summary, ar: e.target.value } })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">نص المقال الكامل (عربي):</label>
                  <textarea
                    rows={6}
                    className="form-control form-control-sm"
                    value={editingArticle.content.ar}
                    onChange={(e) => setEditingArticle({ ...editingArticle, content: { ...editingArticle.content, ar: e.target.value } })}
                  />
                </div>
              </div>
            </div>
            <div className="p-3 px-4 border-top bg-light d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="btn btn-primary btn-sm px-4" onClick={handleSaveModal}>
                {isAr ? 'حفظ المقال' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
