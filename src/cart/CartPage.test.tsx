import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartPage from './CartPage';
import App from '../App';
import { getCart, resetCart } from './api';
import { clearCartCache, getCachedSummary } from './cartCache';

beforeEach(() => { resetCart(); clearCartCache(); });
async function changeToThree() {
  expect(await screen.findByRole('spinbutton', { name: 'Quantity' })).toHaveValue(1);
  expect(screen.getByLabelText('Cart total')).toHaveTextContent(/^\$20$/);
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } });
  await waitFor(() => expect(screen.getByLabelText('Cart total')).toHaveTextContent(/^\$60$/));
  expect(screen.getByRole('spinbutton')).toHaveValue(3);
}
describe('BUG-204 intentional stale summary', () => {
  it('shows latest quantity but stale $20 total after remount', async () => {
    const view = render(<CartPage />);
    await changeToThree();
    expect((await getCart()).items[0].quantity).toBe(3);
    expect(getCachedSummary()).toEqual({ total: 20 });
    view.unmount();
    render(<CartPage />);
    expect(await screen.findByRole('spinbutton')).toHaveValue(3);
    expect(screen.getByLabelText('Cart total')).toHaveTextContent(/^\$20$/);
  });
  it('persists latest server items and stale summary across module reload', async () => {
    const view = render(<CartPage />);
    await changeToThree();
    view.unmount();
    vi.resetModules();
    const freshApi = await import('./api');
    const freshCache = await import('./cartCache');
    expect((await freshApi.getCart()).items[0].quantity).toBe(3);
    expect(freshCache.getCachedSummary()).toEqual({ total: 20 });
    const { default: ReloadedCart } = await import('./CartPage');
    render(<ReloadedCart />);
    expect(await screen.findByRole('spinbutton')).toHaveValue(3);
    expect(screen.getByLabelText('Cart total')).toHaveTextContent(/^\$20$/);
  });
  it('reproduces through navigation and resets for another demonstration', async () => {
    const user = userEvent.setup();
    render(<App />);
    await changeToThree();
    await user.click(screen.getByRole('button', { name: 'Leave cart' }));
    await user.click(screen.getByRole('button', { name: 'Open cart' }));
    expect(await screen.findByRole('spinbutton')).toHaveValue(3);
    expect(screen.getByLabelText('Cart total')).toHaveTextContent(/^\$20$/);
    await user.click(screen.getByRole('button', { name: 'Reset demo' }));
    expect(await screen.findByRole('spinbutton')).toHaveValue(1);
    expect(screen.getByLabelText('Cart total')).toHaveTextContent(/^\$20$/);
  });
  it.skip('future fix: total should remain $60 after remount', async () => {
    const view = render(<CartPage />);
    await changeToThree();
    view.unmount();
    render(<CartPage />);
    expect(await screen.findByRole('spinbutton')).toHaveValue(3);
    expect(screen.getByLabelText('Cart total')).toHaveTextContent(/^\$60$/);
  });
});
