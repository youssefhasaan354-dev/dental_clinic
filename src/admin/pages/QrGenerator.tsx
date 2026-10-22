import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { QrCode, Download, Printer, ExternalLink, Sparkles } from 'lucide-react';
import EditableMedia from '../../components/VisualEdit/EditableMedia';

export const QrGenerator: React.FC = () => {
  const { clinicInfo } = useData();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [qrType, setQrType] = useState<'appointment' | 'whatsapp' | 'maps'>('appointment');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [customLabel, setCustomLabel] = useState<string>('امسح الرمز لطلب موعدك في عيادة حياة لطب الأسنان');
  const printCardRef = useRef<HTMLDivElement>(null);

  const siteUrl = window.location.origin;
  const whatsappNum = clinicInfo.whatsapp.replace(/[^0-9]/g, '');

  const getTargetUrl = () => {
    switch (qrType) {
      case 'appointment':
        return `${siteUrl}/contact`;
      case 'whatsapp':
        return `https://wa.me/${whatsappNum}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن كشف في عيادة حياة لطب الأسنان.')}`;
      case 'maps':
        return clinicInfo.mapDirectionsUrl || 'https://maps.google.com';
    }
  };

  useEffect(() => {
    const generateCode = async () => {
      const url = getTargetUrl();
      try {
        // Generate high resolution 300 DPI (width: 1000px)
        const dataUrl = await QRCode.toDataURL(url, {
          width: 800,
          margin: 2,
          color: {
            dark: '#0c6674',
            light: '#ffffff',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('QR Generation failed:', err);
      }
    };
    generateCode();
  }, [qrType, siteUrl, whatsappNum]);

  const handleDownload = (format: 'png' | 'svg') => {
    const link = document.createElement('a');
    link.download = `hayaah_qr_${qrType}_300dpi.${format}`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="qr-generator-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <QrCode className="text-primary" size={24} />
            <span>{isAr ? 'مولد رموز QR لكونتر الاستقبال (300 DPI)' : 'Reception QR Generator'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'إنشاء وطباعة بطاقات QR عالية الدقة لتوضع على مكتب الاستقبال لمسح الحجز أو محادثة واتساب الفورية.'
              : 'Printable high-resolution reception cards for instant WhatsApp or appointment booking.'}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
            onClick={handlePrint}
          >
            <Printer size={15} />
            <span>{isAr ? 'طباعة كارت الاستقبال' : 'Print Card'}</span>
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Controls Column */}
        <div className="col-lg-5">
          <div className="card rounded-4 border shadow-sm p-4 bg-white mb-4">
            <h5 className="h6 fw-bold mb-3 text-dark">{isAr ? 'إعدادات رمز الـ QR:' : 'QR Settings:'}</h5>

            <div className="mb-3">
              <label className="form-label small fw-bold">{isAr ? 'نوع الوجهة والمحتوى:' : 'Target Action:'}</label>
              <div className="d-flex flex-column gap-2">
                <label className="p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer">
                  <div>
                    <strong className="d-block small">{isAr ? 'نموذج طلب حجز موعد' : 'Appointment Booking Form'}</strong>
                    <small className="text-muted">{siteUrl}/contact</small>
                  </div>
                  <input
                    type="radio"
                    name="qrType"
                    checked={qrType === 'appointment'}
                    onChange={() => {
                      setQrType('appointment');
                      setCustomLabel(isAr ? 'امسح الرمز لطلب موعدك في عيادة حياة لطب الأسنان' : 'Scan to request an appointment');
                    }}
                    className="form-check-input"
                  />
                </label>

                <label className="p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer">
                  <div>
                    <strong className="d-block small">{isAr ? 'محادثة واتساب مباشرة مع الاستقبال' : 'Direct WhatsApp Chat'}</strong>
                    <small className="text-muted">wa.me/{whatsappNum}</small>
                  </div>
                  <input
                    type="radio"
                    name="qrType"
                    checked={qrType === 'whatsapp'}
                    onChange={() => {
                      setQrType('whatsapp');
                      setCustomLabel(isAr ? 'تواصل فورياً عبر واتساب مع موظف الاستقبال' : 'Chat with reception on WhatsApp');
                    }}
                    className="form-check-input"
                  />
                </label>

                <label className="p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer">
                  <div>
                    <strong className="d-block small">{isAr ? 'موقع العيادة على خرائط Google' : 'Google Maps Location'}</strong>
                    <small className="text-muted">مصر الجديدة، القاهرة</small>
                  </div>
                  <input
                    type="radio"
                    name="qrType"
                    checked={qrType === 'maps'}
                    onChange={() => {
                      setQrType('maps');
                      setCustomLabel(isAr ? 'امسح الرمز للوصول لموقع العيادة عبر الخرائط' : 'Scan for Google Maps directions');
                    }}
                    className="form-check-input"
                  />
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">{isAr ? 'العنوان الظاهر على الكارت:' : 'Card Label:'}</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
            </div>

            <div className="d-flex gap-2 pt-2 border-top">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                onClick={() => handleDownload('png')}
              >
                <Download size={14} />
                <span>تحميل PNG عالي الدقة (300 DPI)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Card Preview Column */}
        <div className="col-lg-7">
          <div className="card rounded-4 border shadow-sm p-4 bg-light text-center">
            <span className="text-muted small mb-3 d-block">
              {isAr ? 'معاينة بطاقة الاستقبال الجاهزة للطباعة والعرض على الكونتر:' : 'Printable Countertop Card Preview:'}
            </span>

            {/* Print Card Container */}
            <div
              ref={printCardRef}
              className="bg-white rounded-4 shadow p-5 mx-auto border"
              style={{
                maxWidth: '400px',
                width: '100%',
                borderTop: '8px solid #0c6674',
              }}
            >
              <div className="mb-3">
                <EditableMedia
                  slotId="slot-logo"
                  defaultSrc="/assets/logo.svg"
                  alt={{ ar: 'شعار عيادة حياة', en: 'Hayaah Clinic' }}
                  disableOverlay
                  inline
                  style={{ height: '48px', maxWidth: '200px' }}
                />
              </div>

              <h4 className="fw-bold text-dark h5 mb-1">
                {isAr ? clinicInfo.name.ar : clinicInfo.name.en}
              </h4>
              <p className="text-muted small mb-4">
                {isAr ? 'رعاية طبية هادئة ودقيقة • مصر الجديدة' : 'Gentle Dental Care • Heliopolis'}
              </p>

              {/* QR Code */}
              <div className="p-3 bg-white rounded-3 border d-inline-block shadow-sm mb-3">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                ) : (
                  <div style={{ width: '200px', height: '200px' }} className="d-flex align-items-center justify-content-center text-muted">
                    Loading...
                  </div>
                )}
              </div>

              <p className="fw-semibold text-primary small mb-2 px-3">
                {customLabel}
              </p>

              <div className="pt-3 border-top mt-3 text-muted small" style={{ fontSize: '0.75rem' }}>
                <span>{clinicInfo.phone}</span> • <span>شارع فريد سميكة، القاهرة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
