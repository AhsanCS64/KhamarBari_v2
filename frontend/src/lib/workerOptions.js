export const WORKER_ROLES = [
  { id: 'manager',      label: 'Manager',       labelBn: 'ম্যানেজার',        color: '#245C3A' },
  { id: 'veterinarian', label: 'Veterinarian',  labelBn: 'পশুচিকিৎসক',       color: '#7C3AED' },
  { id: 'caretaker',    label: 'Caretaker',     labelBn: 'তত্ত্বাবধায়ক',     color: '#65A765' },
  { id: 'milker',       label: 'Milker',        labelBn: 'দুধদোহনকারী',      color: '#0EA5E9' },
  { id: 'feeder',       label: 'Feeder',        labelBn: 'খাদ্যদাতা',        color: '#F59E0B' },
  { id: 'laborer',      label: 'Laborer',       labelBn: 'শ্রমিক',           color: '#8B6A43' },
  { id: 'security',     label: 'Security',      labelBn: 'নিরাপত্তা',        color: '#6B7280' },
  { id: 'other',        label: 'Other',         labelBn: 'অন্যান্য',         color: '#0891B2' },
]

export const WORKER_STATUSES = [
  { id: 'active',   label: 'Active',   labelBn: 'সক্রিয়',      color: '#65A765' },
  { id: 'on_leave', label: 'On leave', labelBn: 'ছুটিতে',      color: '#F59E0B' },
  { id: 'inactive', label: 'Inactive', labelBn: 'নিষ্ক্রিয়',   color: '#6B7280' },
]

export const ATTENDANCE_STATUSES = [
  { id: 'present',  label: 'Present',  labelBn: 'উপস্থিত',     color: '#65A765' },
  { id: 'absent',   label: 'Absent',   labelBn: 'অনুপস্থিত',   color: '#DC2626' },
  { id: 'half_day', label: 'Half day', labelBn: 'অর্ধ দিন',    color: '#F59E0B' },
  { id: 'leave',    label: 'Leave',    labelBn: 'ছুটি',         color: '#0EA5E9' },
]

export const PAYMENT_TYPES = [
  { id: 'salary',  label: 'Salary',  labelBn: 'বেতন' },
  { id: 'advance', label: 'Advance', labelBn: 'অগ্রিম' },
  { id: 'bonus',   label: 'Bonus',   labelBn: 'বোনাস' },
  { id: 'deduction', label: 'Deduction', labelBn: 'কর্তন' },
]