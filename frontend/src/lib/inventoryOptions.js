export const INVENTORY_CATEGORIES = [
  { id: 'feed',      label: 'Feed',      labelBn: 'খাদ্য',    color: '#65A765' },
  { id: 'medicine',  label: 'Medicine',  labelBn: 'ঔষধ',     color: '#DC2626' },
  { id: 'equipment', label: 'Equipment', labelBn: 'সরঞ্জাম', color: '#7C3AED' },
  { id: 'supplies',  label: 'Supplies',  labelBn: 'সরবরাহ',  color: '#0891B2' },
  { id: 'other',     label: 'Other',     labelBn: 'অন্যান্য', color: '#6B7280' },
]

export const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'bag', 'box', 'bottle', 'vial', 'packet']

export const MOVEMENT_TYPES = [
  { id: 'purchase',   label: 'Purchase',   labelBn: 'ক্রয়' },
  { id: 'usage',      label: 'Usage',      labelBn: 'ব্যবহার' },
  { id: 'adjustment', label: 'Adjustment', labelBn: 'সমন্বয়' },
  { id: 'transfer',   label: 'Transfer',   labelBn: 'স্থানান্তর' },
]

export const STOCK_FILTERS = [
  { id: 'all',     label: 'All',         labelBn: 'সব' },
  { id: 'low',     label: 'Low stock',   labelBn: 'কম স্টক' },
  { id: 'expiring','label': 'Expiring',  labelBn: 'মেয়াদ শেষ হচ্ছে' },
  { id: 'expired', label: 'Expired',     labelBn: 'মেয়াদোত্তীর্ণ' },
  { id: 'ok',      label: 'In stock',    labelBn: 'স্টকে আছে' },
]