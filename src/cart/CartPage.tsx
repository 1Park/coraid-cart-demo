import { useEffect, useState } from 'react';
import { getCart, updateCartQuantity, type Cart } from './api';
import { cacheSummary, getCachedSummary } from './cartCache';
import { calculateCartTotal, formatPrice } from './cartSelectors';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getCart().then((latestCart) => {
      if (!active) return;
      const summary = getCachedSummary();
      const calculatedTotal = calculateCartTotal(latestCart.items);
      if (!summary) cacheSummary(calculatedTotal);
      setCart(latestCart);
      // BUG-204: mount trusts a cached summary without checking item freshness.
      setTotal(summary?.total ?? calculatedTotal);
    }).catch(() => { if (active) setError('Unable to load your cart.'); });
    return () => { active = false; };
  }, []);

  async function changeQuantity(productId: string, quantity: number) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    setSaving(true);
    setError('');
    try {
      const latestCart = await updateCartQuantity(productId, quantity);
      setCart(latestCart);
      setTotal(calculateCartTotal(latestCart.items));
      // BUG-204: mutation updates the visible total but misses cache invalidation.
    } catch { setError('Unable to update quantity. Please try again.'); }
    finally { setSaving(false); }
  }

  return <section className="cart" aria-label="Shopping cart">
    <h1>Your cart</h1>
    {error && <p role="alert">{error}</p>}
    {!cart ? <p role="status">Loading cart…</p> : <>
      {cart.items.map((item) => <article className="item" key={item.productId}>
        <div><h2>{item.name}</h2><p>{formatPrice(item.unitPrice)} each</p></div>
        <div className="quantity">
          <label htmlFor={`quantity-${item.productId}`}>Quantity</label>
          <div className="quantity-controls">
            <button aria-label="Decrease quantity" disabled={saving || item.quantity === 1}
              onClick={() => void changeQuantity(item.productId, item.quantity - 1)}>−</button>
            <input id={`quantity-${item.productId}`} type="number" min="1" step="1"
              value={item.quantity} disabled={saving}
              onChange={(event) => void changeQuantity(item.productId, event.target.valueAsNumber)} />
            <button aria-label="Increase quantity" disabled={saving}
              onClick={() => void changeQuantity(item.productId, item.quantity + 1)}>+</button>
          </div>
        </div>
      </article>)}
      <div className="total"><span>Total</span><output aria-label="Cart total">{formatPrice(total)}</output></div>
    </>}
  </section>;
}
