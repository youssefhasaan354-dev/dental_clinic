import React from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface ImageSlotOverlayProps {
  slotId: string;
  className?: string;
  children: React.ReactNode;
}

export const ImageSlotOverlay: React.FC<ImageSlotOverlayProps> = ({ slotId, className = '', children }) => {
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
    if (slot) {
      setEditingSlot(slot);
    }
  };

  return (
    <div className={`position-relative image-slot-wrapper ${className}`} style={{ display: 'inline-block', width: '100%' }}>
      {children}
      <button
        type="button"
        onClick={handleEditClick}
        className="btn btn-sm position-absolute d-flex align-items-center gap-1 shadow-sm"
        style={{
          top: '12px',
          insetInlineEnd: '12px',
          zIndex: 99,
          backgroundColor: 'rgba(12, 102, 116, 0.92)',
          color: '#ffffff',
          borderRadius: '50px',
          fontSize: '0.8rem',
          padding: '6px 14px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.3)',
          transition: 'all 0.2s ease-in-out',
        }}
        title={`تعديل الصورة: ${slot?.name || slotId}`}
      >
        <Camera size={14} />
        <span>تعديل الصورة</span>
      </button>
      {slot?.isSample && (
        <span
          className="badge position-absolute"
          style={{
            bottom: '12px',
            insetInlineStart: '12px',
            backgroundColor: 'rgba(0,0,0,0.65)',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 400,
            zIndex: 98,
            backdropFilter: 'blur(4px)',
            borderRadius: '4px',
            padding: '4px 8px',
          }}
        >
          صورة توضيحية (Sample)
        </span>
      )}
    </div>
  );
};
