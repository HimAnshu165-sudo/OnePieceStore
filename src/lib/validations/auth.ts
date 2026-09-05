import { RegisterInput, LoginInput } from '@/types/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

/**
 * Validates registration input and enforces security rules (e.g. ignoring client role).
 */
export function validateRegisterInput(input: unknown): ValidationResult<RegisterInput> {
  const errors: Record<string, string> = {};

  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: { form: 'Invalid request body' },
    };
  }

  const raw = input as Record<string, unknown>;

  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
  const password = typeof raw.password === 'string' ? raw.password : '';

  if (!name) {
    errors.name = 'Name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 50) {
    errors.name = 'Name cannot exceed 50 characters';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          name,
          email,
          password,
        }
      : undefined,
  };
}

/**
 * Validates login input.
 */
export function validateLoginInput(input: unknown): ValidationResult<LoginInput> {
  const errors: Record<string, string> = {};

  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: { form: 'Invalid request body' },
    };
  }

  const raw = input as Record<string, unknown>;

  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
  const password = typeof raw.password === 'string' ? raw.password : '';

  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          email,
          password,
        }
      : undefined,
  };
}
