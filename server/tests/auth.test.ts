import { describe, it, expect } from 'vitest';
import { signupSchema, signinSchema } from '../src/validators/auth.validator';

describe('Auth validation schemas', () => {
  it('accepts a valid signup payload', () => {
    const payload = {
      name: 'Alex Carter',
      email: 'alex@example.com',
      password: 'Password123!',
    };

    expect(signupSchema.parse(payload)).toEqual(payload);
  });

  it('rejects a weak password during signup', () => {
    expect(() => signupSchema.parse({
      name: 'Alex Carter',
      email: 'alex@example.com',
      password: 'password',
    })).toThrow();
  });

  it('validates signin payloads', () => {
    expect(signinSchema.parse({
      email: 'alex@example.com',
      password: 'Password123!',
    })).toEqual({
      email: 'alex@example.com',
      password: 'Password123!',
    });
  });
});
