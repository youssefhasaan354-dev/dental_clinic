import { describe, it, expect, vi } from 'vitest';
import { performEmailLogin } from '../AuthContext';

describe('AuthContext - performEmailLogin', () => {
  describe('1. Demo Mode Enabled (isDemoAllowed = true, isFirebaseMode = false)', () => {
    it('successfully authenticates owner with admin@hayaah.demo and demo1234', async () => {
      const onDemoLogin = vi.fn().mockResolvedValue(undefined);

      const result = await performEmailLogin({
        email: 'admin@hayaah.demo',
        password: 'demo1234',
        isFirebaseMode: false,
        isDemoAllowed: true,
        onDemoLogin,
      });

      expect(result.success).toBe(true);
      expect(onDemoLogin).toHaveBeenCalledWith('owner');
    });

    it('successfully authenticates owner with owner@hayaahclinic.com and demo1234', async () => {
      const onDemoLogin = vi.fn().mockResolvedValue(undefined);

      const result = await performEmailLogin({
        email: 'owner@hayaahclinic.com',
        password: 'demo1234',
        isFirebaseMode: false,
        isDemoAllowed: true,
        onDemoLogin,
      });

      expect(result.success).toBe(true);
      expect(onDemoLogin).toHaveBeenCalledWith('owner');
    });

    it('successfully authenticates receptionist with receptionist@hayaah.demo and demo1234', async () => {
      const onDemoLogin = vi.fn().mockResolvedValue(undefined);

      const result = await performEmailLogin({
        email: 'receptionist@hayaah.demo',
        password: 'demo1234',
        isFirebaseMode: false,
        isDemoAllowed: true,
        onDemoLogin,
      });

      expect(result.success).toBe(true);
      expect(onDemoLogin).toHaveBeenCalledWith('receptionist');
    });

    it('catches error if onDemoLogin throws and returns neutral error without crash', async () => {
      const onDemoLogin = vi.fn().mockRejectedValue(new Error('Demo internal error'));

      const result = await performEmailLogin({
        email: 'admin@hayaah.demo',
        password: 'demo1234',
        isFirebaseMode: false,
        isDemoAllowed: true,
        onDemoLogin,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('بيانات الدخول غير صحيحة / Invalid credentials');
    });

    it('returns error with hint when wrong credentials entered and demo is enabled', async () => {
      const onDemoLogin = vi.fn();

      const result = await performEmailLogin({
        email: 'wrong@example.com',
        password: 'wrongpassword',
        isFirebaseMode: false,
        isDemoAllowed: true,
        onDemoLogin,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('admin@hayaah.demo');
      expect(onDemoLogin).not.toHaveBeenCalled();
    });
  });

  describe('2. Demo Mode Disabled (isDemoAllowed = false, isFirebaseMode = false)', () => {
    it('rejects admin@hayaah.demo / demo1234 without calling onDemoLogin and without throwing', async () => {
      const onDemoLogin = vi.fn();

      const result = await performEmailLogin({
        email: 'admin@hayaah.demo',
        password: 'demo1234',
        isFirebaseMode: false,
        isDemoAllowed: false,
        onDemoLogin,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('بيانات الدخول غير صحيحة / Invalid credentials');
      expect(result.error).not.toContain('admin@hayaah.demo');
      expect(result.error).not.toContain('demo1234');
      expect(onDemoLogin).not.toHaveBeenCalled();
    });

    it('rejects any arbitrary credentials with neutral message without mentioning demo credentials', async () => {
      const onDemoLogin = vi.fn();

      const result = await performEmailLogin({
        email: 'doctor@clinic.com',
        password: 'secretPassword123',
        isFirebaseMode: false,
        isDemoAllowed: false,
        onDemoLogin,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('بيانات الدخول غير صحيحة / Invalid credentials');
      expect(result.error).not.toContain('admin@hayaah.demo');
      expect(result.error).not.toContain('demo1234');
    });
  });

  describe('3. Firebase Mode (isFirebaseMode = true)', () => {
    it('delegates to onFirebaseSignIn and does not allow demo bypass', async () => {
      const onDemoLogin = vi.fn();
      const mockUser = {
        id: 'firebase-uid-1',
        name: 'Dr. Owner',
        role: 'owner' as const,
        email: 'owner@clinic.com',
      };
      const onFirebaseSignIn = vi.fn().mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const result = await performEmailLogin({
        email: 'admin@hayaah.demo',
        password: 'demo1234',
        isFirebaseMode: true,
        isDemoAllowed: false,
        onFirebaseSignIn,
        onDemoLogin,
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(onFirebaseSignIn).toHaveBeenCalledWith('admin@hayaah.demo', 'demo1234');
      expect(onDemoLogin).not.toHaveBeenCalled();
    });

    it('returns error when Firebase authentication fails', async () => {
      const onFirebaseSignIn = vi.fn().mockResolvedValue({
        success: false,
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة / Invalid email or password',
      });

      const result = await performEmailLogin({
        email: 'wrong@clinic.com',
        password: 'badpassword',
        isFirebaseMode: true,
        isDemoAllowed: false,
        onFirebaseSignIn,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('البريد الإلكتروني أو كلمة المرور غير صحيحة / Invalid email or password');
    });
  });
});
