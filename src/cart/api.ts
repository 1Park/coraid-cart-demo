export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}
export interface Cart { items: CartItem[] }

// Emulates a server database across browser reloads, independent of UI cache.
const SERVER_KEY = 'bug-204:server-cart';
function readCart(): Cart {
  const stored = localStorage.getItem(SERVER_KEY);
  if (stored) return JSON.parse(stored) as Cart;
  const cart = { items: [{ productId: 'canvas-tote', name: 'Canvas Tote', unitPrice: 20, quantity: 1 }] };
  localStorage.setItem(SERVER_KEY, JSON.stringify(cart));
  return cart;
}
export async function getCart(): Promise<Cart> { return readCart(); }
export async function updateCartQuantity(productId: string, quantity: number): Promise<Cart> {
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error('Quantity must be a positive whole number.');
  const cart = readCart();
  const item = cart.items.find((item) => item.productId === productId);
  if (!item) throw new Error('Product not found.');
  item.quantity = quantity;
  localStorage.setItem(SERVER_KEY, JSON.stringify(cart));
  return cart;
}
export function resetCart(): void { localStorage.removeItem(SERVER_KEY); }
