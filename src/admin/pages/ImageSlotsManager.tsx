import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { ImageSlot } from '../../types';
import {
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Camera,
  Check,
  AlertTriangle,
  FolderOpen,
  Eye,
  Info,
} from 'lucide-react';

export const ImageSlotsManager: React.FC = () => {
  const { imageSlots, updateImageSlot, refreshData } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const [activeTab, setActiveTab] = useState<'slots' | 'library'>('slots');
  const [selectedSlot, setSelectedSlot] = useState<ImageSlot | null>(null);
  const [mediaFiles, setMediaFiles] = useState<{ id: string; url: string; name: string; size: number; date: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchMedia = async () => {
    const storage = getStorageService();
    const files = await storage.getAllMediaFiles();
    setMediaFiles(files);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(isAr ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, WebP, SVG)' : 'Please choose a valid image file');
      return;
    }

    setIsUploading(true);
    setStatusMsg('');

    try {
      const storage = getStorageService();
      const uploadedUrl = await storage.uploadMedia(file, { isSample: true });

      if (slotId) {
        await updateImageSlot(slotId, {
          currentUrl: uploadedUrl,
          isSample: true,
        });
        setStatusMsg(isAr ? 'تم استبدال الصورة في الموضع المختار بنجاح!' : 'Slot updated with uploaded image!');
      } else {
        setStatusMsg(isAr ? 'تمت إضافة الصورة إلى مكتبة الوسائط بنجاح!' : 'Image added to media library!');
      }

      await fetchMedia();
      await refreshData();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetSlot = async (slot: ImageSlot) => {
    if (isViewer) return;
    await updateImageSlot(slot.id, { currentUrl: slot.defaultUrl });
    await refreshData();
    setStatusMsg(isAr ? 'تمت استعادة الصورة الأصلية للموضع.' : 'Reset to default image.');
  };

  const handlePickFromLibrary = async (slotId: string, url: string) => {
    if (isViewer) return;
    await updateImageSlot(slotId, { currentUrl: url });
    await refreshData();
    setSelectedSlot(null);
    setStatusMsg(isAr ? 'تم تعيين الصورة من المكتبة للموضع بنجاح!' : 'Slot updated from library!');
  };

  return (
    <div className="image-slots-manager-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <ImageIcon className="text-primary" size={24} />
            <span>{isAr ? 'سجل مواضع الصور ومكتبة الوسائط' : 'Image Slots & Media Library'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'إدارة كافة الصور الظاهرة على الموقع، استبدالها في مواضعها دون كسر التصميم، وتخزينها في قاعدة بيانات IndexedDB.'
              : 'Replace in-place, manage alt-texts, and avoid localStorage limits with IndexedDB.'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="btn-group btn-group-sm rounded-pill p-1 bg-white border shadow-sm">
          <button
            type="button"
            className={`btn rounded-pill px-3 ${activeTab === 'slots' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => setActiveTab('slots')}
          >
            {isAr ? 'سجل مواضع الصور (Slots)' : 'Image Slots Registry'}
          </button>
          <button
            type="button"
            className={`btn rounded-pill px-3 ${activeTab === 'library' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => setActiveTab('library')}
          >
            {isAr ? `مكتبة الوسائط (${mediaFiles.length})` : `Media Library (${mediaFiles.length})`}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="alert alert-success py-2 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4">
          <Check size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Slots Registry Tab */}
      {activeTab === 'slots' && (
        <div className="row g-4">
          {imageSlots.map((slot) => {
            const isModified = slot.currentUrl !== slot.defaultUrl;

            return (
              <div key={slot.id} className="col-md-6 col-lg-4">
                <div className="card rounded-4 border shadow-sm overflow-hidden h-100 bg-white d-flex flex-column">
                  {/* Slot Image Preview */}
                  <div
                    className="position-relative bg-light border-bottom d-flex align-items-center justify-content-center p-2"
                    style={{ height: '180px', overflow: 'hidden' }}
                  >
                    <img
                      src={slot.currentUrl}
                      alt={isAr ? slot.altText?.ar : slot.altText?.en}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />

                    {slot.isSample && (
                      <span className="badge bg-dark position-absolute bottom-0 start-0 m-2 small">
                        {isAr ? 'صورة توضيحية' : 'Sample'}
                      </span>
                    )}

                    {isModified && (
                      <span className="badge bg-success position-absolute top-0 end-0 m-2 small">
                        {isAr ? 'مستبدلة' : 'Modified'}
                      </span>
                    )}
                  </div>

                  {/* Slot Details */}
                  <div className="p-3 flex-grow-1 d-flex flex-column">
                    <strong className="text-dark small d-block mb-1">{slot.name}</strong>
                    <div className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                      <span>معرف الموضع: <code>{slot.id}</code></span> • <span>القسم: {slot.section}</span>
                    </div>

                    <p className="text-secondary small mb-3 flex-grow-1" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                      {isAr ? slot.altText?.ar : slot.altText?.en}
                    </p>

                    {/* Action Buttons */}
                    <div className="d-flex align-items-center gap-2 pt-2 border-top mt-auto">
                      <label className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 mb-0 cursor-pointer">
                        <Upload size={13} />
                        <span>{isAr ? 'استبدال ملف' : 'Replace File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="d-none"
                          onChange={(e) => handleFileUpload(e, slot.id)}
                          disabled={isViewer || isUploading}
                        />
                      </label>

                      {isModified && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm p-2"
                          title={isAr ? 'استعادة الصورة الافتراضية' : 'Reset'}
                          onClick={() => handleResetSlot(slot)}
                          disabled={isViewer}
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Library Tab */}
      {activeTab === 'library' && (
        <div className="card rounded-4 border shadow-sm p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="h6 fw-bold mb-0 text-dark">
              {isAr ? 'ملفات الوسائط المخزنة في IndexedDB' : 'IndexedDB Stored Media'}
            </h4>
            <label className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 mb-0 cursor-pointer">
              <Upload size={14} />
              <span>{isAr ? 'رفع ملف صورة جديد' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                className="d-none"
                onChange={(e) => handleFileUpload(e)}
                disabled={isViewer || isUploading}
              />
            </label>
          </div>

          {mediaFiles.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FolderOpen size={40} className="mb-2 text-muted" />
              <p className="small mb-0">
                {isAr ? 'لم يتم رفع صور إضافية بعد. قم برفع صور العيادة الحقيقية لتخزينها هنا.' : 'No uploaded media files yet.'}
              </p>
            </div>
          ) : (
            <div className="row g-3">
              {mediaFiles.map((f) => (
                <div key={f.id} className="col-sm-6 col-md-4 col-lg-3">
                  <div className="border rounded-3 p-2 bg-light text-center h-100 d-flex flex-column">
                    <div style={{ height: '140px', overflow: 'hidden' }} className="d-flex align-items-center justify-content-center mb-2 bg-white rounded">
                      <img src={f.url} alt={f.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <strong className="small text-dark text-truncate d-block mb-1" title={f.name}>{f.name}</strong>
                    <small className="text-muted mb-2">{(f.size / 1024).toFixed(1)} KB</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
