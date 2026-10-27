import { describe, it, expect } from 'vitest';
import { ALL_IMAGE_SLOTS, getImageSlotById, resolveSlotMedia } from '../../data/imageSlots';

describe('Image Slots Resolution Suite', () => {
  it('contains all 40 slots in the central registry', () => {
    expect(ALL_IMAGE_SLOTS.length).toBe(40);
  });

  it('retrieves known slot definitions by id', () => {
    const hero = getImageSlotById('slot-hero');
    expect(hero).toBeDefined();
    expect(hero?.page).toBe('home');
    expect(hero?.allowVideo).toBe(true);

    const logo = getImageSlotById('slot-logo');
    expect(logo).toBeDefined();
    expect(logo?.allowVideo).toBe(false);
  });

  it('returns undefined for non-existent slot id', () => {
    expect(getImageSlotById('slot-unknown-999')).toBeUndefined();
  });

  it('resolves slot media with fallback to defaultUrl when no override exists', () => {
    const hero = getImageSlotById('slot-hero')!;
    const resolved = resolveSlotMedia(hero, undefined);

    expect(resolved.url).toBe(hero.defaultUrl);
    expect(resolved.mediaType).toBe('image');
    expect(resolved.altText.ar).toBe(hero.altText?.ar);
    expect(resolved.altText.en).toBe(hero.altText?.en);
  });

  it('applies override url and mediaType when override is provided', () => {
    const hero = getImageSlotById('slot-hero')!;
    const override = {
      mediaType: 'video' as const,
      url: 'https://res.cloudinary.com/hayaah/video/upload/clinic.mp4',
      posterUrl: 'https://res.cloudinary.com/hayaah/video/upload/so_0/clinic.jpg',
      alt: { ar: 'فيديو مخصص', en: 'Custom video' },
      autoplay: true,
      loop: true,
      muted: true,
      controls: false,
      updatedAt: '2026-10-22T12:00:00Z',
    };

    const resolved = resolveSlotMedia(hero, override);
    expect(resolved.url).toBe(override.url);
    expect(resolved.mediaType).toBe('video');
    expect(resolved.posterUrl).toBe(override.posterUrl);
    expect(resolved.altText.ar).toBe('فيديو مخصص');
  });

  it('enforces allowVideo=false by preventing video mediaType on restricted slots', () => {
    const logo = getImageSlotById('slot-logo')!;
    expect(logo.allowVideo).toBe(false);

    const override = {
      mediaType: 'video' as const,
      url: 'https://res.cloudinary.com/hayaah/video/upload/logo.mp4',
    };

    const resolved = resolveSlotMedia(logo, override);
    expect(resolved.mediaType).toBe('image');
  });

  it('verifies edgeFade behavior: defaults true for slot-hero and respects explicit overrides', () => {
    const hero = getImageSlotById('slot-hero')!;
    expect(hero.edgeFade).toBe(true);

    // Legacy or override without edgeFade defaults to true for slot-hero
    const resolvedDefault = resolveSlotMedia(hero, undefined);
    expect(resolvedDefault.edgeFade).toBe(true);

    const resolvedWithoutProp = resolveSlotMedia(hero, { url: 'https://example.com/custom.mp4' });
    expect(resolvedWithoutProp.edgeFade).toBe(true);

    // Explicit override false
    const resolvedExplicitFalse = resolveSlotMedia(hero, { url: 'https://example.com/custom.mp4', edgeFade: false });
    expect(resolvedExplicitFalse.edgeFade).toBe(false);

    // Other slot defaults false
    const logo = getImageSlotById('slot-logo')!;
    const resolvedLogo = resolveSlotMedia(logo, undefined);
    expect(resolvedLogo.edgeFade).toBe(false);
  });
});
