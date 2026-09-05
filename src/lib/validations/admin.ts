import { UserRole } from '@/types/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface AdminValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

/**
 * Validates a MongoDB ObjectId string.
 */
export function isValidObjectId(id: string): boolean {
  if (typeof id !== 'string') return false;
  return OBJECT_ID_REGEX.test(id);
}

/**
 * Validates admin user update payload.
 * Strictly ignores password and arbitrary fields.
 */
export function validateUpdateUserInput(
  input: unknown
): AdminValidationResult<UpdateUserInput> {
  const errors: Record<string, string> = {};

  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: { form: 'Invalid request body' },
    };
  }

  const raw = input as Record<string, unknown>;
  const data: UpdateUserInput = {};

  if ('name' in raw) {
    if (typeof raw.name !== 'string' || !raw.name.trim()) {
      errors.name = 'Name cannot be empty';
    } else if (raw.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (raw.name.trim().length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
    } else {
      data.name = raw.name.trim();
    }
  }

  if ('email' in raw) {
    if (typeof raw.email !== 'string' || !raw.email.trim()) {
      errors.email = 'Email cannot be empty';
    } else {
      const email = raw.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) {
        errors.email = 'Please provide a valid email address';
      } else {
        data.email = email;
      }
    }
  }

  if ('role' in raw) {
    if (raw.role !== 'user' && raw.role !== 'admin') {
      errors.role = 'Role must be either "user" or "admin"';
    } else {
      data.role = raw.role as UserRole;
    }
  }

  if (Object.keys(data).length === 0 && Object.keys(errors).length === 0) {
    errors.form = 'At least one field (name, email, or role) must be provided to update';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid ? data : undefined,
  };
}
