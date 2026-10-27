import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  RotateCcw,
  Check,
  AlertCircle,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Play,
  Film,
  ZoomIn,
  Move,
  Info,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  CLOUDINARY_MISSING_MSG,
} from '../../services/storage/cloudinaryService';
import {
  parseVideoEmbedUrl,
  buildCloudinaryVideoPoster,
  isDirectVideoUrl,
} from '../../utils/mediaUrl';
import { MediaType } from '../../types';

export const ImageSlotModal: React.FC = () => {
  const { editingSlot, setEditingSlot, updateImageSlot } = useData();
  const { user, role } = useAuth();

  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'link'>('image');

  // Media values
  const [currentUrl, setCurrentUrl] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [posterUrl, setPosterUrl] = useState('');
  const [altAr, setAltAr] = useState('');
  const [altEn, setAltEn] = useState('');
  const [captionAr, setCaptionAr] = useState('');
  const [captionEn, setCaptionEn] = useState('');
  const [isSample, setIsSample] = useState(false);
  const [isAI, setIsAI] = useState(false);

  // Video toggles
  const [autoplay, setAutoplay] = useState(true);
  const [loop, setLoop] = useState(true);
  const [muted, setMuted] = useState(true);
  const [controls, setControls] = useState(false);

  // Focal point & zoom
  const [focalX, setFocalX] = useState(50);
  const [focalY, setFocalY] = useState(50);
  const [zoom, setZoom] = useState(1);

  // Link input
  const [pastedUrl, setPastedUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  // Dimensions & size warning
  const [uploadedDims, setUploadedDims] = useState<{ width: number; height: number } | null>(null);

  // Upload state & progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const allowVideo = editingSlot?.allowVideo !== false;

  useEffect(() => {
    if (editingSlot) {
      setCurrentUrl(editingSlot.currentUrl || editingSlot.defaultUrl);
      setMediaType(editingSlot.mediaType || 'image');
      setPosterUrl(editingSlot.posterUrl || '');
      setAltAr(editingSlot.altText?.ar || '');
      setAltEn(editingSlot.altText?.en || '');
      setCaptionAr(editingSlot.caption?.ar || '');
      setCaptionEn(editingSlot.caption?.en || '');
      setIsSample(Boolean(editingSlot.isSample));
      setIsAI(Boolean(editingSlot.isAI));
      setAutoplay(editingSlot.autoplay ?? true);
      setLoop(editingSlot.loop ?? true);
      setMuted(editingSlot.muted ?? true);
      setControls(editingSlot.controls ?? false);
      setZoom(editingSlot.zoom || 1);

      if (editingSlot.focalPoint) {
        const parts = editingSlot.focalPoint.split(' ');
        if (parts.length === 2) {
          setFocalX(parseInt(parts[0], 10) || 50);
          setFocalY(parseInt(parts[1], 10) || 50);
        }
      } else {
        setFocalX(50);
        setFocalY(50);
      }

      // Initial tab
      if (editingSlot.mediaType === 'video') {
        setActiveTab('video');
      } else if (editingSlot.mediaType === 'embed') {
        setActiveTab('link');
      } else {
        setActiveTab('image');
      }

      setErrorMsg('');
      setSuccessMsg('');
      setWarningMsg('');
      setPastedUrl('');
      setUrlError('');
      setUploadedDims(null);
    }
  }, [editingSlot]);

  if (!editingSlot) return null;

  const storage = getStorageService();
  const isLive = storage.isLiveMode();

  // Handle image upload with 2000px limit & size checking
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'image/svg+xml') {
      setErrorMsg('رفع ملفات SVG غير مسموح لدواعي الأمان.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMsg('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMsg('');
    setWarningMsg('');

    try {
      // 1. Inspect image dimensions for small image warning
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = objectUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          setUploadedDims({ width: img.naturalWidth, height: img.naturalHeight });
          // Check against recommended size if available
          if (editingSlot.recommendedSize) {
            const match = editingSlot.recommendedSize.match(/([0-9]+)/);
            if (match && match[1]) {
              const recWidth = parseInt(match[1], 10);
              if (img.naturalWidth < recWidth * 0.5) {
                setWarningMsg(
                  `تنبيه: عرض الصورة المرفوعة (${img.naturalWidth}px) أصغر بكثير من الحجم الموصى به لهذا المكان (${editingSlot.recommendedSize}). قد تظهر الصورة مشوشة على الشاشات الكبيرة.`
                );
              }
            }
          }
          resolve(true);
        };
      });

      let uploadedUrl: string;

      if (isLive) {
        if (!isCloudinaryConfigured()) {
          setErrorMsg(CLOUDINARY_MISSING_MSG);
          setIsUploading(false);
          return;
        }
        uploadedUrl = await uploadToCloudinary(file, {
          onProgress: (p) => setUploadProgress(p),
          folder: 'hayaah/images',
        });
      } else {
        // Demo Mode IndexedDB
        uploadedUrl = await storage.uploadMedia(file, { isAI, isSample });
      }

      setCurrentUrl(uploadedUrl);
      setMediaType('image');
      setSuccessMsg('تم رفع الصورة — اضغط حفظ التعديلات لتطبيقها');
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء رفع الصورة: ' + (err.message || 'فشل الرفع'));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle video upload (mp4/webm, 50MB limit, 15MB warning, progress bar)
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validVideo = file.type === 'video/mp4' || file.type === 'video/webm' || /\.(mp4|webm)$/i.test(file.name);
    if (!validVideo) {
      setErrorMsg('نوع الفيديو غير مدعوم. الصيغ المقبولة حصراً هي: MP4 أو WebM.');
      return;
    }

    // 50 MB hard limit
    const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
    if (file.size > MAX_VIDEO_BYTES) {
      setErrorMsg('حجم الفيديو يتجاوز الحد الأقصى المسموح به (50 ميجابايت). يرجى ضغط الفيديو أولاً.');
      return;
    }

    // 15 MB warning
    if (file.size > 15 * 1024 * 1024) {
      setWarningMsg('تنبيه: حجم الفيديو أكبر من 15 ميجابايت. يُفضل استخدام فيديو عالي الضغط لتفادي بطء تحميل الصفحة للزوار.');
    } else {
      setWarningMsg('');
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMsg('');

    try {
      let uploadedUrl: string;

      if (isLive) {
        if (!isCloudinaryConfigured()) {
          setErrorMsg(CLOUDINARY_MISSING_MSG);
          setIsUploading(false);
          return;
        }
        uploadedUrl = await uploadToCloudinary(file, {
          onProgress: (p) => setUploadProgress(p),
          folder: 'hayaah/videos',
        });
        // Auto-build poster URL from Cloudinary video first frame
        const autoPoster = buildCloudinaryVideoPoster(uploadedUrl);
        if (autoPoster) {
          setPosterUrl(autoPoster);
        }
      } else {
        // Demo Mode (Max 25 MB in IndexedDB)
        if (file.size > 25 * 1024 * 1024) {
          throw new Error('الحد الأقصى لحجم الفيديو في الوضع التجريبي المحلي هو 25 ميجابايت.');
        }
        uploadedUrl = await storage.uploadMedia(file, { isAI, isSample });
      }

      setCurrentUrl(uploadedUrl);
      setMediaType('video');
      setSuccessMsg('تم رفع الفيديو — اضغط حفظ التعديلات لتطبيقه');
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء رفع الفيديو: ' + (err.message || 'فشل الرفع'));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle custom poster upload
  const handleCustomPosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      let url: string;
      if (isLive) {
        if (!isCloudinaryConfigured()) {
          setErrorMsg(CLOUDINARY_MISSING_MSG);
          return;
        }
        url = await uploadToCloudinary(file, { folder: 'hayaah/posters' });
      } else {
        url = await storage.uploadMedia(file, { isAI, isSample });
      }
      setPosterUrl(url);
      setSuccessMsg('تم تحديث صورة غلاف الفيديو (Poster)!');
    } catch (err: any) {
      setErrorMsg('فشل رفع الغلاف: ' + err.message);
    }
  };

  // Handle URL Paste (YouTube, Vimeo, or Direct https video/image)
  const handleApplyLink = () => {
    setUrlError('');
    if (!pastedUrl.trim()) return;

    const parsed = parseVideoEmbedUrl(pastedUrl.trim());
    if (parsed.isAllowed) {
      if (parsed.provider === 'youtube' || parsed.provider === 'vimeo') {
        if (!allowVideo) {
          setUrlError('هذا القسم لا يسمح بإضافة مقاطع فيديو (مخصص للصور فقط).');
          return;
        }
        setCurrentUrl(pastedUrl.trim());
        setMediaType('embed');
        if (parsed.posterUrl) {
          setPosterUrl(parsed.posterUrl);
        }
        setSuccessMsg(`تم ربط فيديو ${parsed.provider === 'youtube' ? 'YouTube' : 'Vimeo'} بنجاح!`);
      } else if (parsed.provider === 'direct') {
        if (!allowVideo) {
          setUrlError('هذا القسم لا يسمح بمقاطع الفيديو.');
          return;
        }
        setCurrentUrl(pastedUrl.trim());
        setMediaType('video');
        setSuccessMsg('تم ربط ملف الفيديو المباشر بنجاح!');
      }
    } else {
      // Check if it's a direct https image URL
      if (pastedUrl.startsWith('https://') && /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(pastedUrl)) {
        setCurrentUrl(pastedUrl.trim());
        setMediaType('image');
        setSuccessMsg('تم ربط رابط الصورة بنجاح!');
      } else {
        setUrlError(
          parsed.errorMessage ||
            'الرابط غير صالح. يرجى إدخال رابط https آمن من YouTube أو Vimeo أو رابط مباشر لملف MP4/WebP/JPEG.'
        );
      }
    }
  };

  const handleResetToDefault = () => {
    setCurrentUrl(editingSlot.defaultUrl);
    setMediaType('image');
    setPosterUrl('');
    setZoom(1);
    setFocalX(50);
    setFocalY(50);
    setSuccessMsg('تمت استعادة الإعدادات والوسائط الافتراضية.');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      await updateImageSlot(editingSlot.id, {
        currentUrl,
        mediaType,
        posterUrl,
        altText: { ar: altAr, en: altEn },
        caption: { ar: captionAr, en: captionEn },
        focalPoint: `${focalX}% ${focalY}%`,
        zoom,
        autoplay,
        loop,
        muted,
        controls,
        isSample,
        isAI,
      });

      // Audit Log non-blocking
      try {
        await storage.logActivity(
          role || 'editor',
          user?.name || 'Admin',
          'Update Media Slot',
          `Slot ${editingSlot.id} updated (${mediaType})`
        );
      } catch (logErr) {
        console.warn('[ImageSlotModal] logActivity failed non-fatally:', logErr);
      }

      setSuccessMsg('تم حفظ التعديلات بنجاح!');
      setTimeout(() => {
        setEditingSlot(null);
      }, 700);
    } catch (err: any) {
      console.error('[ImageSlotModal.handleSave] Failed to save media slot:', {
        slotId: editingSlot.id,
        path: 'site_images/global',
        uid: user?.id || 'unauthenticated',
        role: role || 'unknown',
        errorCode: err?.code,
        error: err,
      });

      if (
        err?.code === 'permission-denied' ||
        err?.message?.includes('permission') ||
        err?.message?.includes('صلاحية')
      ) {
        setErrorMsg(
          'لا تملك صلاحية الحفظ على قاعدة البيانات. تأكد أن حسابك مسجل في admins بدور owner أو editor وأن قواعد Firestore المنشورة محدّثة.'
        );
      } else {
        setErrorMsg('فشل الحفظ: ' + (err.message || 'خطأ غير معروف'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(7, 30, 36, 0.72)',
        zIndex: 99999,
        backdropFilter: 'blur(6px)',
        padding: '16px',
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden d-flex flex-column"
        style={{
          maxWidth: '740px',
          width: '100%',
          maxHeight: '92vh',
        }}
      >
        {/* Modal Header */}
        <div className="d-flex align-items-center justify-content-between p-3 px-sm-4 border-bottom bg-light">
          <div>
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '1.15rem' }}>
              <span>تعديل واستبدال الوسائط</span>
              <span className="badge bg-primary text-white" style={{ fontSize: '0.72rem' }}>
                {mediaType === 'video' ? 'فيديو' : mediaType === 'embed' ? 'تضمين فيديو' : 'صورة'}
              </span>
            </h5>
            <small className="text-muted">
              {editingSlot.name || editingSlot.id} • المعرّف: <code>{editingSlot.id}</code>
            </small>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-circle p-1"
            onClick={() => setEditingSlot(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex border-bottom bg-white px-3 px-sm-4 pt-2 gap-2 overflow-x-auto flex-nowrap" style={{ WebkitOverflowScrolling: 'touch' }}>
          <button
            type="button"
            className={`btn btn-sm py-2 px-3 border-0 rounded-top text-nowrap flex-shrink-0 ${
              activeTab === 'image'
                ? 'border-bottom border-primary border-3 fw-bold text-primary bg-light'
                : 'text-muted'
            }`}
            onClick={() => setActiveTab('image')}
          >
            <ImageIcon size={15} className="me-1" />
            <span>صورة (Image)</span>
          </button>

          {allowVideo && (
            <button
              type="button"
              className={`btn btn-sm py-2 px-3 border-0 rounded-top text-nowrap flex-shrink-0 ${
                activeTab === 'video'
                  ? 'border-bottom border-primary border-3 fw-bold text-primary bg-light'
                  : 'text-muted'
              }`}
              onClick={() => setActiveTab('video')}
            >
              <Video size={15} className="me-1" />
              <span>رفع فيديو (MP4/WebM)</span>
            </button>
          )}

          {allowVideo && (
            <button
              type="button"
              className={`btn btn-sm py-2 px-3 border-0 rounded-top text-nowrap flex-shrink-0 ${
                activeTab === 'link'
                  ? 'border-bottom border-primary border-3 fw-bold text-primary bg-light'
                  : 'text-muted'
              }`}
              onClick={() => setActiveTab('link')}
            >
              <LinkIcon size={15} className="me-1" />
              <span>رابط خارجي (YouTube / Vimeo / URL)</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-3 p-sm-4 overflow-y-auto flex-grow-1">
          {errorMsg && (
            <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2 py-2 mb-3" role="alert">
              <div className="d-flex align-items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm py-1 px-3 fw-bold d-inline-flex align-items-center gap-1"
                onClick={handleSave}
                disabled={isSaving || isUploading}
                title="إعادة محاولة الحفظ دون إعادة رفع الملف"
              >
                <RotateCcw size={14} />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          )}
          {warningMsg && (
            <div className="alert alert-warning d-flex align-items-center gap-2 py-2 mb-3" role="alert">
              <Info size={16} className="flex-shrink-0" />
              <span>{warningMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3" role="alert">
              <Check size={16} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Slot Specifications Badge Box */}
          <div className="d-flex flex-wrap gap-2 align-items-center mb-3 p-2 px-3 bg-light rounded-3 border small">
            <span className="text-muted">النسبة المطلوبة:</span>
            <strong className="badge bg-secondary">{editingSlot.aspectRatio || '16:9'}</strong>
            {editingSlot.recommendedSize && (
              <>
                <span className="text-muted ms-2">الأبعاد الموصى بها:</span>
                <strong className="badge bg-info text-dark">{editingSlot.recommendedSize}</strong>
              </>
            )}
            <span className="text-muted ms-2">دعم الفيديو:</span>
            <span className={`badge ${allowVideo ? 'bg-success' : 'bg-warning text-dark'}`}>
              {allowVideo ? 'مسموح بالفيديو' : 'صور فقط'}
            </span>
          </div>

          {/* Live Preview Container */}
          <div className="text-center mb-4 p-3 bg-dark rounded-4 border position-relative overflow-hidden">
            <p className="text-white-50 small mb-2 d-flex justify-content-between align-items-center px-2">
              <span>المعاينة المباشرة (Live Preview)</span>
              <span>{mediaType.toUpperCase()}</span>
            </p>

            <div
              className="d-inline-flex position-relative rounded-3 overflow-hidden shadow-sm justify-content-center align-items-center bg-black"
              style={{
                maxHeight: '260px',
                width: '100%',
                aspectRatio: (editingSlot.aspectRatio || '16:9').replace(':', '/'),
              }}
            >
              {mediaType === 'video' ? (
                <video
                  src={currentUrl}
                  poster={posterUrl || undefined}
                  muted={muted}
                  loop={loop}
                  controls={controls}
                  autoPlay={autoplay}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
              ) : mediaType === 'embed' ? (
                <iframe
                  src={parseVideoEmbedUrl(currentUrl).embedUrl || currentUrl}
                  title="Live Preview Embed"
                  className="w-100 h-100 border-0"
                  allowFullScreen
                />
              ) : (
                <div className="w-100 h-100 overflow-hidden position-relative">
                  <img
                    src={currentUrl}
                    alt={altAr || 'معاينة'}
                    className="w-100 h-100"
                    style={{
                      objectFit: 'contain',
                      objectPosition: `${focalX}% ${focalY}%`,
                      transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                      transformOrigin: `${focalX}% ${focalY}%`,
                      transition: 'transform 0.15s ease-out',
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: IMAGE CONTROLS */}
          {activeTab === 'image' && (
            <div className="tab-pane-image">
              <div className="mb-4">
                <label className="form-label fw-bold small text-dark mb-1">
                  رفع صورة جديدة من جهازك:
                </label>
                <div className="d-flex gap-2">
                  <label
                    className={`btn btn-outline-primary d-flex align-items-center gap-2 flex-grow-1 justify-content-center ${
                      isUploading ? 'disabled' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <Upload size={16} />
                    <span>{isUploading ? 'جاري المعالجة والرفع...' : 'اختيار صورة من الجهاز'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="d-none"
                      onChange={handleImageUpload}
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
                  {isLive
                    ? 'يتم الرفع إلى Cloudinary وتوليد نسخ الويب السريعة f_auto,q_auto.'
                    : 'الوضع التجريبي: تُحفظ الصور محلياً في IndexedDB دون التأثير على الخادم.'}
                </small>
              </div>

              {/* Focal Point & Zoom Adjustment Controls */}
              <div className="p-3 bg-light rounded-3 mb-3 border">
                <h6 className="fw-bold small mb-2 text-dark d-flex align-items-center gap-1">
                  <Move size={15} />
                  <span>ضبط نقطة التركيز والتكبير (Focal Point & Zoom):</span>
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1">
                      التركيز الأفقي (X): {focalX}%
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="100"
                      value={focalX}
                      onChange={(e) => setFocalX(Number(e.target.value))}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1">
                      التركيز الرأسي (Y): {focalY}%
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="100"
                      value={focalY}
                      onChange={(e) => setFocalY(Number(e.target.value))}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1 d-flex align-items-center gap-1">
                      <ZoomIn size={13} />
                      <span>التكبير: {zoom.toFixed(1)}x</span>
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="1"
                      max="2.5"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIDEO CONTROLS */}
          {activeTab === 'video' && allowVideo && (
            <div className="tab-pane-video">
              <div className="mb-4">
                <label className="form-label fw-bold small text-dark mb-1">
                  رفع ملف فيديو جديد (MP4 أو WebM):
                </label>
                <div className="d-flex gap-2">
                  <label
                    className={`btn btn-outline-success d-flex align-items-center gap-2 flex-grow-1 justify-content-center ${
                      isUploading ? 'disabled' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <Film size={16} />
                    <span>{isUploading ? `جاري رفع الفيديو (${uploadProgress}%)...` : 'اختيار ملف فيديو'}</span>
                    <input
                      type="file"
                      accept="video/mp4, video/webm"
                      className="d-none"
                      onChange={handleVideoUpload}
                      disabled={isUploading}
                    />
                  </label>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setMediaType('image');
                      setCurrentUrl(editingSlot.defaultUrl);
                      setActiveTab('image');
                    }}
                  >
                    العودة لوضع الصورة
                  </button>
                </div>

                {isUploading && uploadProgress > 0 && (
                  <div className="progress mt-2" style={{ height: '8px' }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                      role="progressbar"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                <div className="alert alert-info py-2 px-3 mt-3 small mb-0">
                  <div className="fw-bold mb-1">توصيات الفيديو (Video Best Practices):</div>
                  <ul className="mb-0 ps-3">
                    <li>الحد الأقصى للحجم 50 ميجابايت (تحذير فوق 15 ميجابايت).</li>
                    <li>للواجهة الرئيسية (Hero)، استخدم مقاطع قصيرة (5 - 15 ثانية) ومضغوطة لسرعة التصفح.</li>
                    <li>يتم تلقائياً إيقاف تشغيل الفيديو أثناء وضع توفير البيانات أو تقليل الحركة.</li>
                  </ul>
                </div>
              </div>

              {/* Poster & Controls Settings */}
              <div className="p-3 bg-light rounded-3 mb-3 border">
                <h6 className="fw-bold small mb-3 text-dark">إعدادات تشغيل الفيديو وغلاف المعاينة:</h6>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">رفع صورة غلاف مخصصة (Poster Image):</label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="form-control form-control-sm"
                      onChange={handleCustomPosterUpload}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">أو رابط صورة الغلاف مباشرة:</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-6 col-md-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoplaySwitch"
                        checked={autoplay}
                        onChange={(e) => setAutoplay(e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="autoplaySwitch">
                        تشغيل تلقائي
                      </label>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="loopSwitch"
                        checked={loop}
                        onChange={(e) => setLoop(e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="loopSwitch">
                        تكرار مستمر (Loop)
                      </label>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="mutedSwitch"
                        checked={muted}
                        onChange={(e) => setMuted(e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="mutedSwitch">
                        كتم الصوت (Muted)
                      </label>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="controlsSwitch"
                        checked={controls}
                        onChange={(e) => setControls(e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="controlsSwitch">
                        أزرار التحكم (Controls)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LINK / EMBED CONTROLS */}
          {activeTab === 'link' && allowVideo && (
            <div className="tab-pane-link">
              <div className="mb-4">
                <label className="form-label fw-bold small text-dark mb-1">
                  إدخال رابط فيديو أو صورة مباشرة (YouTube / Vimeo / Direct URL):
                </label>
                <div className="input-group">
                  <input
                    type="url"
                    className="form-control"
                    placeholder="مثال: https://www.youtube.com/watch?v=... أو https://vimeo.com/..."
                    value={pastedUrl}
                    onChange={(e) => {
                      setPastedUrl(e.target.value);
                      setUrlError('');
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary px-3"
                    onClick={handleApplyLink}
                  >
                    تطبيق الرابط
                  </button>
                </div>
                {urlError && <small className="text-danger d-block mt-1">{urlError}</small>}

                <div className="p-3 bg-light rounded-3 mt-3 border small">
                  <strong>معايير الأمان والخصوصية:</strong>
                  <ul className="mb-0 ps-3 mt-1 text-muted">
                    <li>تُحوّل فيديوهات YouTube تلقائياً إلى خوادم <code>youtube-nocookie.com</code> لحماية خصوصية المرضى.</li>
                    <li>لا يتم تحميل أي أكواد خارجية حتى ينقر الزائر على زر التشغيل (Click-to-Play Facade) لتسريع تحميل الموقع ومؤشرات Core Web Vitals.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Alt Texts */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">النص البديل (عربي) Alt Text:</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={altAr}
                onChange={(e) => setAltAr(e.target.value)}
                placeholder="وصف المشهد لمحركات البحث وقارئات الشاشة"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Alt Text (English):</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={altEn}
                onChange={(e) => setAltEn(e.target.value)}
                placeholder="Accessible description"
              />
            </div>
          </div>

          {/* Captions */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">التعليق الظاهر أسفل العنصر (عربي):</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={captionAr}
                onChange={(e) => setCaptionAr(e.target.value)}
                placeholder="تعليق إيضاحي ظاهر للزوار"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Visible Caption (English):</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={captionEn}
                onChange={(e) => setCaptionEn(e.target.value)}
                placeholder="Visible caption under media"
              />
            </div>
          </div>

          {/* Golden Rules Flags */}
          <div className="p-3 bg-light rounded-3 mb-2 border">
            <h6 className="fw-bold small mb-2 text-dark">معايير الشفافية الطبية (Medical Transparency):</h6>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="isSampleCheck"
                checked={isSample}
                onChange={(e) => setIsSample(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="isSampleCheck">
                صورة توضيحية تمهيدية (Sample) — إظهار تنبيه توضيحي
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
                صورة مولدة بالذكاء الاصطناعي (AI Generated)
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-sm-4 border-top bg-light d-flex justify-content-end gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-secondary btn-sm px-3 flex-grow-1 flex-sm-grow-0"
            onClick={() => setEditingSlot(null)}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm px-4 d-flex align-items-center justify-content-center gap-1 flex-grow-1 flex-sm-grow-0"
            onClick={handleSave}
            disabled={isSaving || isUploading}
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
