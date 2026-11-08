// Production-to-sale item mapping rules & helpers.
export const SALE_ITEM_TYPES = [
  { id: 'animal',       label: 'Live Animal / Stock',   labelBn: 'জীবন্ত পশু/পাখি',  unit: 'head', fromProduction: false, fromEnclosure: true,  icon: 'Beef' },
  { id: 'beef',         label: 'Beef (গরুর মাংস)',       labelBn: 'গরুর মাংস',       unit: 'kg',   fromProduction: true,  fromEnclosure: false, icon: 'Beef' },
  { id: 'mutton',       label: 'Mutton / Goat Meat',    labelBn: 'খাসির মাংস',      unit: 'kg',   fromProduction: true,  fromEnclosure: false, icon: 'Beef' },
  { id: 'chicken_meat', label: 'Chicken Meat',          labelBn: 'মুরগির মাংস',     unit: 'kg',   fromProduction: true,  fromEnclosure: false, icon: 'Bird' },
  { id: 'fish',         label: 'Fresh Fish (মাছ)',       labelBn: 'মাছ',            unit: 'kg',   fromProduction: true,  fromEnclosure: false, icon: 'Fish' },
  { id: 'milk',         label: 'Milk (দুধ)',             labelBn: 'দুধ',            unit: 'L',    fromProduction: true,  fromEnclosure: false, icon: 'Milk' },
  { id: 'egg',          label: 'Eggs (ডিম)',             labelBn: 'ডিম',            unit: 'pcs',  fromProduction: true,  fromEnclosure: false, icon: 'Egg' },
  { id: 'harvest',      label: 'Crops & Field Harvest', labelBn: 'ফসল / শস্য',      unit: 'kg',   fromProduction: true,  fromEnclosure: false, icon: 'Wheat' },
  { id: 'meat',         label: 'Other Meat',            labelBn: 'অন্যান্য মাংস',   unit: 'kg',   fromProduction: true,  fromEnclosure: false, icon: 'Ham' },
  { id: 'other',        label: 'Other Supplies',        labelBn: 'অন্যান্য',        unit: 'unit', fromProduction: false, fromEnclosure: false, icon: 'Package' },
]

// Meat categories available during slaughter / meat processing in production
export const MEAT_CATEGORIES = [
  { id: 'beef',         label: 'Beef (গরুর মাংস)',        species: ['cow'] },
  { id: 'mutton',       label: 'Mutton / Goat (খাসির মাংস)', species: ['goat', 'sheep'] },
  { id: 'chicken_meat', label: 'Chicken / Poultry (মুরগি)', species: ['chicken', 'duck', 'rabbit'] },
  { id: 'fish',         label: 'Fish / Seafood (মাছ)',   species: ['fish', 'shrimp'] },
  { id: 'meat',         label: 'Other Meat (অন্যান্য)',  species: [] },
]

export const PAYMENT_STATUSES = [
  { id: 'paid',    label: 'Paid',    labelBn: 'পরিশোধিত',  color: '#65A765' },
  { id: 'partial', label: 'Partial', labelBn: 'আংশিক',    color: '#F59E0B' },
  { id: 'unpaid',  label: 'Unpaid',  labelBn: 'অপরিশোধিত', color: '#DC2626' },
]

export const PAYMENT_METHODS_SALE = ['cash', 'bkash', 'nagad', 'rocket', 'bank', 'card', 'credit', 'other']
