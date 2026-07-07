/** Shared password rules for the login/reset flows. */

export const PASSWORD_RULE_HINT = '8-16 位，需同时包含大写字母、小写字母和数字'

/** Validate a new password against the enterprise complexity policy. */
export function validatePassword(pw: string): string | null {
  if (pw.length < 8 || pw.length > 16) return '密码长度需为 8-16 位'
  if (!/[A-Z]/.test(pw)) return '密码需包含至少一个大写字母'
  if (!/[a-z]/.test(pw)) return '密码需包含至少一个小写字母'
  if (!/\d/.test(pw)) return '密码需包含至少一个数字'
  return null
}

/** Coarse strength score for the visual meter (0-4). */
export function passwordStrength(pw: string): { score: number; label: string; tone: string } {
  if (!pw) return { score: 0, label: '', tone: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score: 1, label: '弱', tone: 'bg-destructive' }
  if (score === 2) return { score: 2, label: '中', tone: 'bg-warning' }
  if (score === 3) return { score: 3, label: '强', tone: 'bg-primary' }
  return { score: 4, label: '很强', tone: 'bg-success' }
}

/** Front-end format check for an 11-digit mainland China mobile number. */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}
