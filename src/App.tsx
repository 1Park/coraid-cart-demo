import { useState } from 'react';
import CartPage from './cart/CartPage';
import { resetCart } from './cart/api';
import { clearCartCache } from './cart/cartCache';
export default function App() {
  const [showCart, setShowCart] = useState(true);
  const [revision, setRevision] = useState(0);
  function resetDemo() {
    resetCart();
    clearCartCache();
    setRevision((value) => value + 1);
    setShowCart(true);
  }
  return <main>
    <header><strong>CoRAID / Demo store</strong><span>BUG-204</span></header>
    <nav aria-label="Demo navigation">
      <button onClick={() => setShowCart((value) => !value)}>{showCart ? 'Leave cart' : 'Open cart'}</button>
      <button onClick={resetDemo}>Reset demo</button>
    </nav>
    {showCart ? <CartPage key={revision} /> : <section className="cart"><h1>Demo store</h1><p>Open your cart to continue shopping.</p></section>}
    <footer>CoRAID BUG-204 · Intentional bug reproduction</footer>
  </main>;
}
