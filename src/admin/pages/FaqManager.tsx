import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { FaqItem } from '../../types';
import { HelpCircle, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

export const FaqManager: React.FC = () => {
  const { faqs, refreshData } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emptyFaq: FaqItem = {
    id: '',
    question: { ar: '', en: '' },
    answer: { ar: '', en: '' },
    category: 'general',
    isSample: true,
    isApproved: false,
    order: faqs.length + 1,
  };

  const handleCreateNew = () => {
    setEditingFaq({
      ...emptyFaq,
      id: 'faq_' + Date.now(),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (faq: FaqItem) => {
    setEditingFaq(JSON.parse(JSON.stringify(faq)));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (isViewer) return;
    if (window.confirm(isAr ? 'حذف هذا السؤال؟' : 'Delete question?')) {
      const storage = getStorageService();
      await storage.deleteFaq(id);
      await refreshData();
    }
  };

  const handleSaveModal = async () => {
    if (!editingFaq || isViewer) return;
    if (!editingFaq.question.ar.trim()) {
      alert(isAr ? 'يرجى إدخال نص السؤال.' : 'Please enter question text.');
      return;
    }
    const storage = getStorageService();
    await storage.saveFaq(editingFaq);
    await refreshData();
    setIsModalOpen(false);
  };

  return (
    <div className="faq-manager-page">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <HelpCircle className="text-primary" size={24} />
            <span>{isAr ? 'إدارة الأسئلة الشائعة والأجوبة' : 'FAQ Manager'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'الأسئلة غير المعتمدة رسمياً من العيادة تظل موسومة بـ "سؤال استرشادي / Sample" لحين التأكيد.'
              : 'Unconfirmed answers remain tagged with a "Sample" badge until approved by clinic.'}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
          onClick={handleCreateNew}
          disabled={isViewer}
        >
          <Plus size={15} />
          <span>{isAr ? 'إضافة سؤال جديد' : 'Add FAQ'}</span>
        </button>
      </div>

      <div className="card rounded-4 border shadow-sm p-4 bg-white">
        <div className="d-flex flex-column gap-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-3 rounded-3 border bg-light">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <strong className="text-dark small">{faq.question.ar}</strong>
                  {faq.isSample && (
                    <span className="badge bg-warning text-dark small" style={{ fontSize: '0.65rem' }}>
                      Sample (استرشادي)
                    </span>
                  )}
                </div>
                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm p-1 rounded"
                    onClick={() => handleEdit(faq)}
                    disabled={isViewer}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm p-1 rounded"
                    onClick={() => handleDelete(faq.id)}
                    disabled={isViewer}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p className="text-secondary small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                {faq.answer.ar}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && editingFaq && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 99999, backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-4 shadow-lg overflow-hidden d-flex flex-column" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh' }}>
            <div className="p-3 px-4 border-bottom bg-light">
              <h5 className="mb-0 fw-bold text-dark">{isAr ? 'تعديل السؤال والإجابة' : 'Edit FAQ'}</h5>
            </div>
            <div className="p-4 overflow-y-auto flex-grow-1">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">السؤال (عربي): *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingFaq.question.ar}
                    onChange={(e) => setEditingFaq({ ...editingFaq, question: { ...editingFaq.question, ar: e.target.value } })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Question (English): *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingFaq.question.en}
                    onChange={(e) => setEditingFaq({ ...editingFaq, question: { ...editingFaq.question, en: e.target.value } })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">الإجابة المعتمدة (عربي):</label>
                  <textarea
                    rows={3}
                    className="form-control form-control-sm"
                    value={editingFaq.answer.ar}
                    onChange={(e) => setEditingFaq({ ...editingFaq, answer: { ...editingFaq.answer, ar: e.target.value } })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Answer (English):</label>
                  <textarea
                    rows={3}
                    className="form-control form-control-sm"
                    value={editingFaq.answer.en}
                    onChange={(e) => setEditingFaq({ ...editingFaq, answer: { ...editingFaq.answer, en: e.target.value } })}
                  />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="faqSampleCheck"
                      checked={editingFaq.isSample}
                      onChange={(e) => setEditingFaq({ ...editingFaq, isSample: e.target.checked })}
                    />
                    <label className="form-check-label small" htmlFor="faqSampleCheck">
                      سؤال استرشادي يحتاج تأكيد العيادة (Sample)
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 px-4 border-top bg-light d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="btn btn-primary btn-sm px-4" onClick={handleSaveModal}>
                {isAr ? 'حفظ السؤال' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
