import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isFirebaseConfigured,
  maybeInitAppCheck,
  _resetAppCheckForTesting,
} from '../client';
import type { FirebaseApp } from 'firebase/app';

const mockInitializeAppCheck = vi.fn();
class MockReCaptchaV3Provider {
  siteKey: string;
  constructor(siteKey: string) {
    this.siteKey = siteKey;
  }
}
class MockReCaptchaEnterpriseProvider {
  siteKey: string;
  constructor(siteKey: string) {
    this.siteKey = siteKey;
  }
}

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: mockInitializeAppCheck,
  ReCaptchaV3Provider: MockReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider: MockReCaptchaEnterpriseProvider,
}));

describe('Firebase Client - App Check & Config', () => {
  const fakeApp = { name: '[DEFAULT]' } as unknown as FirebaseApp;

  beforeEach(() => {
    vi.clearAllMocks();
    _resetAppCheckForTesting();
    vi.stubGlobal('window', {});
    // Default environment values
    vi.stubEnv('VITE_DEMO_MODE', 'false');
    vi.stubEnv('VITE_USE_FIREBASE_EMULATOR', 'false');
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id');
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', '');
    vi.stubEnv('VITE_RECAPTCHA_PROVIDER', '');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe('isFirebaseConfigured', () => {
    it('returns true when all 4 Firebase variables are provided and demo mode is false', () => {
      expect(isFirebaseConfigured()).toBe(true);
    });

    it('returns false when VITE_DEMO_MODE is true', () => {
      vi.stubEnv('VITE_DEMO_MODE', 'true');
      expect(isFirebaseConfigured()).toBe(false);
    });

    it('returns false when any required Firebase variable is missing', () => {
      vi.stubEnv('VITE_FIREBASE_API_KEY', '');
      expect(isFirebaseConfigured()).toBe(false);
    });
  });

  describe('maybeInitAppCheck', () => {
    it('does nothing when Firebase mode is off', async () => {
      vi.stubEnv('VITE_DEMO_MODE', 'true');
      vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'recaptcha-key-123');

      await maybeInitAppCheck(fakeApp);
      expect(mockInitializeAppCheck).not.toHaveBeenCalled();
    });

    it('does nothing when VITE_RECAPTCHA_SITE_KEY is unset or whitespace', async () => {
      vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', '   ');

      await maybeInitAppCheck(fakeApp);
      expect(mockInitializeAppCheck).not.toHaveBeenCalled();
    });

    it('defaults to ReCaptchaV3Provider when VITE_RECAPTCHA_PROVIDER is unset', async () => {
      vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'site-key-v3');
      vi.stubEnv('VITE_RECAPTCHA_PROVIDER', '');

      await maybeInitAppCheck(fakeApp);

      expect(mockInitializeAppCheck).toHaveBeenCalledTimes(1);
      const callArgs = mockInitializeAppCheck.mock.calls[0];
      expect(callArgs[0]).toBe(fakeApp);
      expect(callArgs[1].isTokenAutoRefreshEnabled).toBe(true);
      expect(callArgs[1].provider).toBeInstanceOf(MockReCaptchaV3Provider);
      expect(callArgs[1].provider.siteKey).toBe('site-key-v3');
    });

    it('uses ReCaptchaV3Provider explicitly when VITE_RECAPTCHA_PROVIDER is v3', async () => {
      vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'site-key-v3-explicit');
      vi.stubEnv('VITE_RECAPTCHA_PROVIDER', 'v3');

      await maybeInitAppCheck(fakeApp);

      expect(mockInitializeAppCheck).toHaveBeenCalledTimes(1);
      const callArgs = mockInitializeAppCheck.mock.calls[0];
      expect(callArgs[1].provider).toBeInstanceOf(MockReCaptchaV3Provider);
      expect(callArgs[1].provider.siteKey).toBe('site-key-v3-explicit');
    });

    it('uses ReCaptchaEnterpriseProvider when VITE_RECAPTCHA_PROVIDER is enterprise', async () => {
      vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'site-key-enterprise');
      vi.stubEnv('VITE_RECAPTCHA_PROVIDER', 'enterprise');

      await maybeInitAppCheck(fakeApp);

      expect(mockInitializeAppCheck).toHaveBeenCalledTimes(1);
      const callArgs = mockInitializeAppCheck.mock.calls[0];
      expect(callArgs[0]).toBe(fakeApp);
      expect(callArgs[1].isTokenAutoRefreshEnabled).toBe(true);
      expect(callArgs[1].provider).toBeInstanceOf(MockReCaptchaEnterpriseProvider);
      expect(callArgs[1].provider.siteKey).toBe('site-key-enterprise');
    });

    it('handles uppercase and trimmed VITE_RECAPTCHA_PROVIDER= ENTERPRISE ', async () => {
      vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'site-key-enterprise-trimmed');
      vi.stubEnv('VITE_RECAPTCHA_PROVIDER', ' ENTERPRISE ');

      await maybeInitAppCheck(fakeApp);

      expect(mockInitializeAppCheck).toHaveBeenCalledTimes(1);
      const callArgs = mockInitializeAppCheck.mock.calls[0];
      expect(callArgs[1].provider).toBeInstanceOf(MockReCaptchaEnterpriseProvider);
      expect(callArgs[1].provider.siteKey).toBe('site-key-enterprise-trimmed');
    });

    it('is idempotent and only initializes once', async () => {
      vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'site-key-v3');
      vi.stubEnv('VITE_RECAPTCHA_PROVIDER', 'v3');

      await maybeInitAppCheck(fakeApp);
      await maybeInitAppCheck(fakeApp);

      expect(mockInitializeAppCheck).toHaveBeenCalledTimes(1);
    });
  });
});
