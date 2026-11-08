export const PRODUCTION_TYPES = [
  { id: 'milk',      label: 'Milk',      labelBn: 'দুধ',     unit: 'L',   color: '#245C3A', icon: 'Milk',    hasSession: true },
  { id: 'egg',       label: 'Eggs',      labelBn: 'ডিম',     unit: 'pcs', color: '#F59E0B', icon: 'Egg',     hasSession: true },
  { id: 'weight',    label: 'Weight',    labelBn: 'ওজন',     unit: 'kg',  color: '#8B6A43', icon: 'Weight',  hasSession: false },
  { id: 'breeding',  label: 'Breeding',  labelBn: 'প্রজনন',  unit: 'head', color: '#7C3AED', icon: 'Heart', hasSession: false },
  { id: 'birth',     label: 'Birth',     labelBn: 'জন্ম',    unit: 'head', color: '#EC4899', icon: 'Baby',   hasSession: false },
  { id: 'death',     label: 'Death',     labelBn: 'মৃত্যু',  unit: 'head', color: '#6B7280', icon: 'Skull',  hasSession: false },
  { id: 'slaughter', label: 'Meat Processing', labelBn: 'জবাই / মাংস', unit: 'head', color: '#DC2626', icon: 'Ham', hasSession: false, hasMeatYield: true },
  { id: 'harvest',   label: 'Harvest',   labelBn: 'ফসল',     unit: 'kg',  color: '#65A765', icon: 'Wheat',   hasSession: false },
]

export const SESSIONS = [
  { id: 'morning', label: 'Morning', labelBn: 'সকাল' },
  { id: 'evening', label: 'Evening', labelBn: 'সন্ধ্যা' },
  { id: 'full',    label: 'Full day', labelBn: 'সারাদিন' },
]

export const QUALITY_GRADES = ['A', 'B', 'C', 'rejected']