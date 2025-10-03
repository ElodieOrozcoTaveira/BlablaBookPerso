import { vi } from 'vitest';

// Helper to create a typed mock function without spreading casts
export function typedMock<T extends (...args: any[]) => any>(fn = vi.fn()) {
  return fn as unknown as T;
}

// Spy on a method and set an implementation
export function spyOnMethod<T extends object, K extends keyof T>(target: T, method: K, impl: any) {
  return vi.spyOn(target as any, String(method)).mockImplementation(impl);
}
