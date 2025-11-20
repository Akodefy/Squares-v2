export const formatPrice = (price: number, listingType?: 'sale' | 'rent' | 'lease'): string => {
  if (listingType === 'rent') return `₹${price.toLocaleString('en-IN')}/month`;
  if (listingType === 'lease') return `₹${price.toLocaleString('en-IN')}/year`;
  
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lac`;
  return `₹${price.toLocaleString('en-IN')}`;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};
