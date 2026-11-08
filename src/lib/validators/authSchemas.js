import { z } from 'zod'

// Bangladeshi 11-digit mobile starting with 01
const bdMobile = /^01[3-9]\d{8}$/
// NID: 10, 13, or 17 digits
const nidRe = /^(\d{10}|\d{13}|\d{17})$/

export function buildSignupSchema(t) {
  return z
    .object({
      farmName: z.string().min(2, t('errors.required')),
      license: z.string().min(3, t('errors.required')),
      division: z.string().min(1, t('errors.required')),
      district: z.string().min(1, t('errors.required')),
      zilla: z.string().min(1, t('errors.required')),
      upazila: z.string().min(1, t('errors.required')),
      address: z.string().min(5, t('errors.required')),
      ownerName: z.string().min(2, t('errors.required')),
      nid: z.string().regex(nidRe, t('errors.nid')),
      email: z.union([z.string().email(t('errors.email')), z.literal('')]).optional(),
      contact: z.string().regex(bdMobile, t('errors.mobile')),
      password: z.string().min(6, t('errors.password')),
      confirm: z.string(),
      terms: z.literal(true, { errorMap: () => ({ message: t('errors.terms') }) }),
    })
    .refine((d) => d.password === d.confirm, {
      path: ['confirm'],
      message: t('errors.passwordMatch'),
    })
}

export function buildLoginSchema(t) {
  return z.object({
    contact: z.string().regex(/^01[3-9]\d{8}$/, t('errors.mobile')),
    password: z.string().min(1, t('errors.required')),
  })
}