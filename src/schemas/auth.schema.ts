import { z } from 'zod';

export const registerInput = z.object({
  name: z.string().min(4),
  email: z.string().email(),
  password: z.string().min(4),
  passwordConfirm: z.string().min(4),
});
export const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const changePasswordInput = z.object({
  currentPassword: z.string().min(3),
  newPassword: z.string().min(3),
  confirmPassword: z.string().min(3),
});
export type RegisterDto = z.infer<typeof registerInput>;
export type LoginDto = z.infer<typeof loginInput>;
export type changePasswordDto = z.infer<typeof changePasswordInput>;
