import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthModal from '../AuthModal';

describe('AuthModal', () => {
  it('renders login and register forms', () => {
    render(<AuthModal open={true} onClose={() => {}} onAuth={() => {}} />);
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
    // Optionally, also check the Register button is present
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('displays error on failed submit', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ detail: 'Invalid' }) });
    render(<AuthModal open={true} onClose={() => {}} onAuth={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => expect(screen.getByText(/Invalid/)).toBeInTheDocument());
  });
});

describe('AuthModal additional coverage', () => {
  it('handles registration flow and auto-login', async () => {
    let calledAuth = false;
    let calledClose = false;
    (global.fetch as any) = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // register
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'authtoken' }) }); // login
    render(<AuthModal open={true} onClose={() => { calledClose = true; }} onAuth={() => { calledAuth = true; }} />);
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'reg@ex.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => expect(calledAuth).toBe(true));
    expect(calledClose).toBe(true);
    expect(localStorage.getItem('token')).toBe('authtoken');
  });

  it('shows loading state', async () => {
    let resolveFetch;
    (global.fetch as any) = jest.fn(() => new Promise(r => { resolveFetch = r; }));
    render(<AuthModal open={true} onClose={() => {}} onAuth={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    // The button now says 'Logging in...' and should be disabled
    expect(screen.getByRole('button', { name: /Logging in.../i })).toBeDisabled();
    resolveFetch({ ok: false, json: async () => ({ detail: 'fail' }) });
    await waitFor(() => expect(screen.getByText(/fail/)).toBeInTheDocument());
  });

  it('does not render when open is false', () => {
    render(<AuthModal open={false} onClose={() => {}} onAuth={() => {}} />);
    expect(screen.queryByRole('heading', { name: /login/i })).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<AuthModal open={true} onClose={onClose} onAuth={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /×/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
