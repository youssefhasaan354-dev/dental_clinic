import React from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ImageSlot } from '../../types';

export interface ImageSlotOverlayProps {
  slotId: string;
  className?: string;
  style?: React.CSSProperties;
  inline?: boolean;
  initialSlotProps?: {
    defaultUrl?: string;
    altText?: { ar: string; en: string };
    aspectRatio?: string;
    allowVideo?: boolean;
    section?: string;
  };
  children: React.ReactNode;
}

export const ImageSlotOverlay: React.FC<ImageSlotOverlayProps> = ({
  slotId,
  className = '',
  style,
  inline = false,
  initialSlotProps,
  children,
}) => {
  const { isAuthenticated, canEditContent, isVisualEditActive } = useAuth();
  const { getImageSlot, setEditingSlot } = useData();

  const slot = getImageSlot(slotId);

  // If not logged in as admin editor/owner or visual edit is turned off, render clean children
  if (!isAuthenticated || !canEditContent || !isVisualEditActive) {
    return <>{children}</>;
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If slot id is unknown, auto-register from EditableMedia props
    const effectiveSlot: ImageSlot = slot || {
      id: slotId,
      name: slotId,
      nameAr: slotId,
      nameEn: slotId,
      section: initialSlotProps?.section || 'general',
      defaultUrl: initialSlotProps?.defaultUrl || '',
      currentUrl: initialSlotProps?.defaultUrl || '',
      altText: initialSlotProps?.altText || { ar: '', en: '' },
      aspectRatio: initialSlotProps?.aspectRatio || '16:9',
      allowVideo: initialSlotProps?.allowVideo ?? true,
      isAI: false,
      isSample: false,
    };

    setEditingSlot(effectiveSlot);
  };

  return (
    <div
      className={`position-relative image-slot-wrapper ${className}`}
      style={{
        display: inline ? 'inline-flex' : 'inherit',
        alignItems: inline ? 'center' : undefined,
        ...style,
      }}
    >
      {children}
      <button
        type="button"
        onClick={handleEditClick}
        className="btn btn-sm position-absolute d-flex align-items-center gap-1 shadow-sm edit-media-overlay-btn"
        style={{
          top: '8px',
          insetInlineEnd: '8px',
          zIndex: 99,
          backgroundColor: 'rgba(12, 102, 116, 0.92)',
          color: '#ffffff',
          borderRadius: '50px',
          fontSize: '0.75rem',
          padding: '4px 10px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.4)',
          transition: 'all 0.2s ease-in-out',
          whiteSpace: 'nowrap',
        }}
        title={`تعديل الوسائط: ${slot?.name || slotId}`}
      >
        <Camera size={13} />
        <span>تعديل</span>
      </button>
      {slot?.isSample && (
        <span
          className="badge position-absolute"
          style={{
            bottom: '8px',
            insetInlineStart: '8px',
            backgroundColor: 'rgba(0,0,0,0.65)',
            color: '#ffffff',
            fontSize: '0.7rem',
            fontWeight: 400,
            zIndex: 98,
            backdropFilter: 'blur(4px)',
            borderRadius: '4px',
            padding: '3px 6px',
            pointerEvents: 'none',
          }}
        >
          صورة توضيحية
        </span>
      )}
    </div>
  );
};
