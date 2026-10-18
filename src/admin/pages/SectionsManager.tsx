import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { SectionConfig } from '../../types';
import { Layers, ArrowUp, ArrowDown, Eye, EyeOff, Save, Check } from 'lucide-react';

export const SectionsManager: React.FC = () => {
  const { sections, refreshData } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const [localSections, setLocalSections] = useState<SectionConfig[]>(sections);
  const [successMsg, setSuccessMsg] = useState('');

  const handleToggle = (id: string) => {
    setLocalSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s))
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localSections.length) return;

    const copy = [...localSections];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    const reordered = copy.map((item, idx) => ({ ...item, order: idx + 1 }));
    setLocalSections(reordered);
  };

  const handleSave = async () => {
    if (isViewer) return;
    const storage = getStorageService();
    await storage.updateSections(localSections);
    await refreshData();
    setSuccessMsg(isAr ? 'تم حفظ ترتيب وتخصيص الأقسام بنجاح!' : 'Sections saved!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="sections-manager-page">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Layers className="text-primary" size={24} />
            <span>{isAr ? 'مدير أقسام الموقع وترتيب الظهور' : 'Sections Manager'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'إعادة ترتيب الأقسام على الصفحة الرئيسية، إخفاء أو إظهار أي قسم، وتعديل تسميات القائمة العلوية.'
              : 'Reorder sections, toggle visibility, and update navigation labels.'}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm"
          onClick={handleSave}
          disabled={isViewer}
        >
          {isAr ? 'حفظ الترتيب' : 'Save Order'}
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success py-2 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="card rounded-4 border shadow-sm p-4 bg-white">
        <div className="d-flex flex-column gap-2">
          {localSections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`p-3 rounded-3 border d-flex align-items-center justify-content-between gap-3 ${
                sec.isVisible ? 'bg-light' : 'bg-white opacity-75'
              }`}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex flex-column gap-1">
                  <button
                    type="button"
                    className="btn btn-link btn-xs p-0 text-muted"
                    disabled={idx === 0 || isViewer}
                    onClick={() => handleMove(idx, 'up')}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-link btn-xs p-0 text-muted"
                    disabled={idx === localSections.length - 1 || isViewer}
                    onClick={() => handleMove(idx, 'down')}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div>
                  <strong className="text-dark small d-block">{isAr ? sec.nameAr : sec.nameEn}</strong>
                  <small className="text-muted"><code>#{sec.id}</code></small>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className={`btn btn-xs rounded-pill px-3 py-1 ${
                    sec.isVisible ? 'btn-success text-white' : 'btn-outline-secondary'
                  }`}
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => handleToggle(sec.id)}
                  disabled={isViewer}
                >
                  {sec.isVisible ? (isAr ? 'ظاهر' : 'Visible') : (isAr ? 'مخفي' : 'Hidden')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
