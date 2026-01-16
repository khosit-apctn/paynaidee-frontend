/**
 * Zod validation schemas for forms and API requests
 */

import { z } from 'zod';

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be at most 50 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters'),
  phone_number: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .optional()
    .or(z.literal('')),
  display_name: z
    .string()
    .max(100, 'Display name must be at most 100 characters')
    .optional()
    .or(z.literal('')),
});

// ============================================
// Group Schemas
// ============================================

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, 'Group name is required')
    .max(100, 'Group name must be at most 100 characters'),
  avatar: z
    .string()
    .url('Avatar must be a valid URL')
    .optional()
    .or(z.literal('')),
});

// ============================================
// Bill Schemas
// ============================================

const billParticipantSchema = z.object({
  user_id: z.number().int().positive('User ID must be a positive integer'),
  amount: z.number().positive('Amount must be positive').optional(),
});

export const createBillSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be at most 200 characters'),
    description: z
      .string()
      .max(500, 'Description must be at most 500 characters')
      .optional()
      .or(z.literal('')),
    total_amount: z
      .number()
      .positive('Total amount must be positive'),
    service_charge: z
      .number()
      .min(0, 'Service charge cannot be negative')
      .max(100, 'Service charge cannot exceed 100%')
      .optional(),
    split_type: z.enum(['equal', 'custom']),
    qr_header: z
      .string()
      .max(100, 'QR header must be at most 100 characters')
      .optional()
      .or(z.literal('')),
    participants: z
      .array(billParticipantSchema)
      .min(1, 'At least one participant is required'),
  })
  .refine(
    (data) => {
      // For custom split, validate that amounts sum to total (with service charge)
      if (data.split_type === 'custom') {
        const participantTotal = data.participants.reduce(
          (sum, p) => sum + (p.amount || 0),
          0
        );
        const expectedTotal =
          data.total_amount * (1 + (data.service_charge || 0) / 100);
        // Allow small floating point tolerance
        return Math.abs(participantTotal - expectedTotal) < 0.01;
      }
      return true;
    },
    {
      message: 'Custom split amounts must equal the total amount (including service charge)',
      path: ['participants'],
    }
  );

// ============================================
// Profile Schemas
// ============================================

export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .max(100, 'Display name must be at most 100 characters')
    .optional()
    .or(z.literal('')),
  avatar: z
    .string()
    .url('Avatar must be a valid URL')
    .optional()
    .or(z.literal('')),
  phone_number: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .optional()
    .or(z.literal('')),
});

// ============================================
// Inferred TypeScript Types
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateBillInput = z.infer<typeof createBillSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
