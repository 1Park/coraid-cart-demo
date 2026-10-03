import type { CartItem } from './api';
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}
