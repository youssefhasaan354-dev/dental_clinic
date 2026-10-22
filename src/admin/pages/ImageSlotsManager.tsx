import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { ImageSlot } from '../../types';
import {
  Image as ImageIcon,
  RotateCcw,
  Edit3,
  Check,
  Video,
  Search,
  Eye,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ImageSlotsManager: React.FC = () => {
  const { imageSlots, updateImageSlot, refreshData, setEditingSlot } = useData();
  const { language } = useLanguage();
  const { user, role, isVisualEditActive, setVisualEditActive } = useAuth();
  const isAr = language === 'ar';
  const canEdit = role === 'owner' || role === 'editor';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [statusMsg, setStatusMsg] = useState('');

  // Sections translation dictionary
  const sectionLabels: Record<string, { ar: string; en: string }> = {
    header: { ar: 'الترويسة والشعار (Header)', en: 'Header & Logo' },
    footer: { ar: 'تذييل الموقع (Footer)', en: 'Footer' },
    hero: { ar: 'واجهة الموقع (Hero Banner)', en: 'Hero Banner' },
    about: { ar: 'عن العيادة وقيمنا (About)', en: 'About & Values' },
    emergency: { ar: 'طوارئ الأسنان (Emergency)', en: 'Emergency' },
    services: { ar: 'خدمات العيادة (Services)', en: 'Services' },
    gallery: { ar: 'معرض الصور والمقارنة (Gallery)', en: 'Gallery' },
    symptoms: { ar: 'الأعراض والعلامات (Symptoms)', en: 'Symptoms' },
    team: { ar: 'الفريق الطبي (Team)', en: 'Medical Team' },
    articles: { ar: 'المقالات والتوعية (Articles)', en: 'Articles' },
    notfound: { ar: 'صفحة 404 (Not Found)', en: 'Not Found' },
    general: { ar: 'عام (General)', en: 'General' },
    custom: { ar: 'مواضع مخصصة (Custom)', en: 'Custom' },
  };

  // Group slots by section
  const filteredSlots = useMemo(() => {
    return imageSlots.filter((slot) => {
      if (selectedSection !== 'all' && slot.section !== selectedSection) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (slot.name || '').toLowerCase();
      const id = (slot.id || '').toLowerCase();
      const sec = (slot.section || '').toLowerCase();
      const altAr = (slot.altText?.ar || '').toLowerCase();
      const altEn = (slot.altText?.en || '').toLowerCase();
      return (
        name.includes(q) ||
        id.includes(q) ||
        sec.includes(q) ||
        altAr.includes(q) ||
        altEn.includes(q)
      );
    });
  }, [imageSlots, selectedSection, searchQuery]);

  // Unique sections list
  const availableSections = useMemo(() => {
    const set = new Set<string>();
    imageSlots.forEach((s) => {
      if (s.section) set.add(s.section);
    });
    return Array.from(set);
  }, [imageSlots]);

  const handleResetSlot = async (slot: ImageSlot) => {
    if (!canEdit) return;
    if (
      window.confirm(
        isAr
          ? `هل أنت متأكد من استعادة الوسائط الافتراضية للموضع "${slot.name || slot.id}"؟`
          : `Reset slot "${slot.name || slot.id}" to default?`
      )
    ) {
      try {
        await updateImageSlot(slot.id, {
          currentUrl: slot.defaultUrl,
          mediaType: 'image',
          posterUrl: '',
          zoom: 1,
          focalPoint: '50% 50%',
        });

        const storage = getStorageService();
        await storage.logActivity(
          role || 'editor',
          user?.name || 'Admin',
          'Reset Media Slot',
          `Restored slot ${slot.id} to default`
        );

        await refreshData();
        setStatusMsg(isAr ? `تمت استعادة الموضع "${slot.name || slot.id}" إلى الأصل!` : `Slot reset to default!`);
      } catch (err: any) {
        alert('Reset failed: ' + err.message);
      }
    }
  };

  return (
    <div className="image-slots-manager-page">
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <ImageIcon className="text-primary" size={24} />
            <span>{isAr ? 'إدارة وسائط وصور الموقع (Media & Slots Manager)' : 'Media & Slots Manager'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'تعديل واستبدال كافة الصور ومقاطع الفيديو الظاهرة على الموقع من مكان واحد، أو في أماكنها مباشرة.'
              : 'Manage and replace all images and videos across public pages with in-place live edit.'}
          </p>
        </div>

        {/* Visual Edit Mode Toggle Card */}
        <div className="card border rounded-4 px-3 py-2 bg-white shadow-sm d-flex flex-row align-items-center gap-3">
          <div className="d-flex flex-column">
            <span className="small fw-bold text-dark d-flex align-items-center gap-1">
              <Sparkles size={14} className="text-warning" />
              <span>{isAr ? 'وضع التعديل البصري المباشر:' : 'In-Place Visual Edit:'}</span>
            </span>
            <small className="text-muted" style={{ fontSize: '0.73rem', maxWidth: '240px' }}>
              {isAr
                ? 'إظهار أزرار "تعديل" فوق الصور أثناء تصفح الموقع'
                : 'Display floating edit buttons on public pages'}
            </small>
          </div>
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="visualEditToggle"
              checked={isVisualEditActive}
              onChange={(e) => setVisualEditActive(e.target.checked)}
              style={{ width: '2.4em', height: '1.3em', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="alert alert-success py-2 px-3 rounded-3 small d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <Check size={16} />
            <span>{statusMsg}</span>
          </div>
          <button type="button" className="btn-close btn-sm" onClick={() => setStatusMsg('')} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card rounded-4 border shadow-sm p-3 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={15} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder={isAr ? 'بحث بالاسم، المعرف، أو القسم...' : 'Search by name, ID, or section...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="btn btn-outline-secondary" onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="col-md-7 d-flex align-items-center gap-2 flex-wrap justify-content-md-end">
            <span className="small text-muted d-flex align-items-center gap-1">
              <Layers size={14} />
              <span>{isAr ? 'تصفية بالقسم:' : 'Filter section:'}</span>
            </span>
            <div className="d-flex flex-wrap gap-1">
              <button
                type="button"
                className={`btn btn-xs py-1 px-2 rounded-pill ${
                  selectedSection === 'all' ? 'btn-primary' : 'btn-light border text-muted'
                }`}
                style={{ fontSize: '0.78rem' }}
                onClick={() => setSelectedSection('all')}
              >
                {isAr ? 'الكل' : 'All'} ({imageSlots.length})
              </button>
              {availableSections.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  className={`btn btn-xs py-1 px-2 rounded-pill ${
                    selectedSection === sec ? 'btn-primary' : 'btn-light border text-muted'
                  }`}
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => setSelectedSection(sec)}
                >
                  {isAr ? sectionLabels[sec]?.ar || sec : sectionLabels[sec]?.en || sec}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="row g-4">
        {filteredSlots.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p className="text-muted mb-0">{isAr ? 'لا توجد مواضع وسائط مطابقة لبحثك.' : 'No matching media slots found.'}</p>
          </div>
        ) : (
          filteredSlots.map((slot) => {
            const isVideo = slot.mediaType === 'video' || slot.mediaType === 'embed';
            const isModified = slot.currentUrl !== slot.defaultUrl;
            const updatedDate = slot.updatedAt
              ? new Date(slot.updatedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : isAr
              ? 'الافتراضي'
              : 'Default';

            return (
              <div key={slot.id} className="col-md-6 col-lg-4">
                <div className="card rounded-4 border shadow-sm overflow-hidden h-100 bg-white d-flex flex-column">
                  {/* Thumbnail Banner */}
                  <div
                    className="position-relative bg-dark d-flex align-items-center justify-content-center overflow-hidden"
                    style={{
                      height: '180px',
                      backgroundColor: '#0a1d22',
                    }}
                  >
                    {slot.mediaType === 'video' ? (
                      <video
                        src={slot.currentUrl}
                        poster={slot.posterUrl || undefined}
                        muted
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : slot.mediaType === 'embed' ? (
                      <div className="w-100 h-100 position-relative d-flex align-items-center justify-content-center bg-black">
                        {slot.posterUrl ? (
                          <img src={slot.posterUrl} alt="Poster" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="text-white small">Embed Video</div>
                        )}
                      </div>
                    ) : (
                      <img
                        src={slot.currentUrl}
                        alt={isAr ? slot.altText?.ar : slot.altText?.en}
                        style={{
                          maxHeight: '100%',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          objectPosition: slot.focalPoint || 'center center',
                        }}
                      />
                    )}

                    {/* Media Type Badge */}
                    <div className="position-absolute top-0 start-0 m-2 d-flex gap-1">
                      {isVideo ? (
                        <span className="badge bg-danger d-flex align-items-center gap-1 shadow-sm">
                          <Video size={12} />
                          <span>{slot.mediaType === 'embed' ? 'تضمين فيديو' : 'فيديو'}</span>
                        </span>
                      ) : (
                        <span className="badge bg-secondary d-flex align-items-center gap-1 opacity-75">
                          <ImageIcon size={12} />
                          <span>صورة</span>
                        </span>
                      )}
                    </div>

                    {/* Modified Indicator */}
                    {isModified && (
                      <span className="badge bg-success position-absolute top-0 end-0 m-2 shadow-sm">
                        {isAr ? 'معدل' : 'Modified'}
                      </span>
                    )}

                    {/* Aspect Ratio Badge */}
                    <span
                      className="badge bg-dark position-absolute bottom-0 end-0 m-2 small opacity-75"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {slot.aspectRatio || '16:9'}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="p-3 flex-grow-1 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong className="text-dark small flex-grow-1" style={{ fontSize: '0.9rem' }}>
                        {slot.name || slot.id}
                      </strong>
                    </div>

                    <div className="text-muted small mb-2 d-flex flex-wrap gap-2" style={{ fontSize: '0.73rem' }}>
                      <span>معرّف: <code>{slot.id}</code></span>
                      <span>•</span>
                      <span>قسم: {sectionLabels[slot.section]?.ar || slot.section}</span>
                    </div>

                    <p className="text-secondary small mb-3 flex-grow-1" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                      {isAr ? slot.altText?.ar || 'لا يوجد نص بديل' : slot.altText?.en || 'No alt text'}
                    </p>

                    {/* Meta info & Action row */}
                    <div className="pt-2 border-top mt-auto d-flex align-items-center justify-content-between">
                      <small className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                        <Calendar size={12} />
                        <span>{updatedDate}</span>
                      </small>

                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm py-1 px-3 d-flex align-items-center gap-1"
                          onClick={() => setEditingSlot(slot)}
                          disabled={!canEdit}
                          title={isAr ? 'تعديل الوسائط' : 'Edit media'}
                        >
                          <Edit3 size={13} />
                          <span>{isAr ? 'تعديل' : 'Edit'}</span>
                        </button>

                        {isModified && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm p-1 px-2"
                            onClick={() => handleResetSlot(slot)}
                            disabled={!canEdit}
                            title={isAr ? 'استعادة الافتراضي' : 'Reset default'}
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
