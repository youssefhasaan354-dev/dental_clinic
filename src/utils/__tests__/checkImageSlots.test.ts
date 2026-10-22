import { describe, it, expect } from 'vitest';
import { scanFileForMediaViolations } from '../../../scripts/check-image-slots.mjs';

describe('check-image-slots guard script suite', () => {
  it('detects forbidden <img> tag in page or component', () => {
    const fakeFile = 'src/pages/FakePage.jsx';
    const fakeContent = `
      export default function FakePage() {
        return <img src="/assets/test.png" alt="Test" />;
      }
    `;

    const violations = scanFileForMediaViolations(fakeFile, fakeContent);
    expect(violations.length).toBe(1);
    expect(violations[0].type).toBe('<img> tag');
    expect(violations[0].file).toContain('FakePage.jsx');
  });

  it('detects forbidden <video> tag in component', () => {
    const fakeFile = 'src/sections/FakeHero/FakeHero.jsx';
    const fakeContent = `
      export default function FakeHero() {
        return <video src="https://cdn.example.com/video.mp4" controls />;
      }
    `;

    const violations = scanFileForMediaViolations(fakeFile, fakeContent);
    expect(violations.length).toBe(1);
    expect(violations[0].type).toBe('<video> tag');
  });

  it('detects forbidden arbitrary <iframe> outside allowed map components', () => {
    const fakeFile = 'src/sections/FakeEmbed.jsx';
    const fakeContent = `
      export default function FakeEmbed() {
        return <iframe src="https://youtube.com/embed/123" title="Test" />;
      }
    `;

    const violations = scanFileForMediaViolations(fakeFile, fakeContent);
    expect(violations.length).toBe(1);
    expect(violations[0].type).toBe('<iframe> tag');
  });

  it('allows Google Maps iframe in Appointment.jsx and ContactPage.jsx', () => {
    const apptFile = 'src/sections/Appointment/Appointment.jsx';
    const apptContent = '<iframe src="https://maps.google.com/embed" title="Clinic Location" />';
    expect(scanFileForMediaViolations(apptFile, apptContent).length).toBe(0);

    const contactFile = 'src/pages/ContactPage.jsx';
    const contactContent = '<iframe src="https://maps.google.com/embed" title="Google Maps" />';
    expect(scanFileForMediaViolations(contactFile, contactContent).length).toBe(0);
  });

  it('detects asset url() in CSS/SCSS or inline styling', () => {
    const scssFile = 'src/sections/FakeBanner.scss';
    const scssContent = `
      .banner-bg {
        background-image: url('/assets/banner/1.png');
      }
    `;

    const violations = scanFileForMediaViolations(scssFile, scssContent);
    expect(violations.length).toBe(1);
    expect(violations[0].type).toBe('asset url()');
  });

  it('allows clean components utilizing EditableMedia', () => {
    const cleanFile = 'src/sections/CleanBanner.jsx';
    const cleanContent = `
      import EditableMedia from '../../components/VisualEdit/EditableMedia';
      export default function CleanBanner() {
        return <EditableMedia slotId="slot-hero" defaultSrc="/assets/banner/1.png" />;
      }
    `;

    const violations = scanFileForMediaViolations(cleanFile, cleanContent);
    expect(violations.length).toBe(0);
  });
});
