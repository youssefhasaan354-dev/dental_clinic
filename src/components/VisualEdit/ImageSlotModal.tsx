import React, { useState, useEffect } from 'react';
import { X, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getStorageService } from '../../services/storage';

export const ImageSlotModal: React.FC = () => {
  const { editingSlot, setEditingSlot, updateImageSlot } = useData();

  const [currentUrl, setCurrentUrl] = useState('');
  const [altAr, setAltAr] = useState('');
  const [altEn, setAltEn] = useState('');
  const [captionAr, setCaptionAr] = useState('');
  const [captionEn, setCaptionEn] = useState('');
  const [isSample, setIsSample] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (editingSlot) {
      setCurrentUrl(editingSlot.currentUrl || editingSlot.defaultUrl);
      setAltAr(editingSlot.altText?.ar || '');
      setAltEn(editingSlot.altText?.en || '');
      setCaptionAr(editingSlot.caption?.ar || '');
      setCaptionEn(editingSlot.caption?.en || '');
      setIsSample(Boolean(editingSlot.isSample));
      setIsAI(Boolean(editingSlot.isAI));
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [editingSlot]);

  if (!editingSlot) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP, SVG)');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    try {
      const storage = getStorageService();
      const uploadedUrl = await storage.uploadMedia(file, { isAI, isSample });
      setCurrentUrl(uploadedUrl);
      setSuccessMsg('تم رفع الصورة بنجاح وتخزينها في قاعدة بيانات الوسائط!');
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء رفع الصورة: ' + (err.message || 'فشل الرفع'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetToDefault = () => {
    setCurrentUrl(editingSlot.defaultUrl);
    setSuccessMsg('تمت استعادة الصورة الافتراضية.');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      await updateImageSlot(editingSlot.id, {
        currentUrl,
        altText: { ar: altAr, en: altEn },
        caption: { ar: captionAr, en: captionEn },
        isSample,
        isAI,
      });
      setSuccessMsg('تم حفظ تعديلات الصورة بنجاح!');
      setTimeout(() => {
        setEditingSlot(null);
      }, 700);
    } catch (err: any) {
      setErrorMsg('فشل الحفظ: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 99999,
        backdropFilter: 'blur(5px)',
        padding: '16px',
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden d-flex flex-column"
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
        }}
      >
        {/* Modal Header */}
        <div className="d-flex align-items-center justify-content-between p-3 px-4 border-bottom bg-light">
          <div>
            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
              تعديل واستبدال الصورة (In-Place Edit)
            </h5>
            <small className="text-muted">{editingSlot.name} — معرف: {editingSlot.id}</small>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-circle p-1"
            onClick={() => setEditingSlot(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-grow-1">
          {errorMsg && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2" role="alert">
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current / Preview Image */}
          <div className="text-center mb-4 p-3 bg-light rounded-3 border">
            <p className="text-muted small mb-2">معاينة الصورة الحالية</p>
            <div
              className="d-inline-block position-relative rounded-3 overflow-hidden shadow-sm"
              style={{ maxHeight: '220px', maxWidth: '100%' }}
            >
              <img
                src={currentUrl}
                alt={altAr || 'معاينة'}
                style={{
                  maxHeight: '200px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: '6px',
                }}
              />
            </div>
          </div>

          {/* File Upload Controls */}
          <div className="mb-4">
            <label className="form-label fw-bold small text-dark mb-1">
              استبدال بصورة جديدة من جهازك:
            </label>
            <div className="d-flex gap-2">
              <label
                className={`btn btn-outline-primary d-flex align-items-center gap-2 flex-grow-1 justify-content-center ${
                  isUploading ? 'disabled' : ''
                }`}
                style={{ cursor: 'pointer' }}
              >
                <Upload size={16} />
                <span>{isUploading ? 'جاري الرفع والمعالجة...' : 'اختيار صورة جديدة'}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="d-none"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>

              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-1"
                onClick={handleResetToDefault}
                title="استعادة الصورة الأصلية"
              >
                <RotateCcw size={15} />
                <span>استعادة الافتراضية</span>
              </button>
            </div>
            <small className="text-muted d-block mt-1">
              يتم تخزين الصور محلياً في IndexedDB دون قيود حجم الـ LocalStorage.
            </small>
          </div>

          {/* Alt Texts */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">النص البديل (عربي) Alt Text:</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={altAr}
                onChange={(e) => setAltAr(e.target.value)}
                placeholder="وصف الصورة لمحركات البحث وقارئات الشاشة"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Alt Text (English):</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={altEn}
                onChange={(e) => setAltEn(e.target.value)}
                placeholder="Accessible image description"
              />
            </div>
          </div>

          {/* Captions */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">التعليق الظاهر (عربي):</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={captionAr}
                onChange={(e) => setCaptionAr(e.target.value)}
                placeholder="تعليق إيضاحي أسفل الصورة"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Caption (English):</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={captionEn}
                onChange={(e) => setCaptionEn(e.target.value)}
                placeholder="Visible caption under image"
              />
            </div>
          </div>

          {/* Golden Rules Flags */}
          <div className="p-3 bg-light rounded-3 mb-2 border">
            <h6 className="fw-bold small mb-2 text-dark">معايير الشفافية الطبية (Golden Rules):</h6>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="isSampleCheck"
                checked={isSample}
                onChange={(e) => setIsSample(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="isSampleCheck">
                صورة توضيحية تمهيدية (Sample / Illustrative) — إظهار تنبيه توضيحي
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="isAICheck"
                checked={isAI}
                onChange={(e) => setIsAI(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="isAICheck">
                صورة مولدة بالذكاء الاصطناعي (ممنوع لوجوه الأطباء والنتائج الحقيقية)
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-4 border-top bg-light d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm px-3"
            onClick={() => setEditingSlot(null)}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm px-4 d-flex align-items-center gap-1"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <span>جاري الحفظ...</span>
            ) : (
              <>
                <Check size={16} />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
