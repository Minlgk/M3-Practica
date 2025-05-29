import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // ✅ Necesario para toBeInTheDocument
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import api from '../services/api';

// ✅ Corrige mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// ✅ Mock de API
jest.mock('../services/api', () => ({
  post: jest.fn(),
}));

describe('LoginPage', () => {
  it('muestra el formulario de inicio de sesión', () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    expect(screen.getByLabelText(/Correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('realiza el login correctamente', async () => {
    const mockToken = 'fake-token';
    const mockRol = 'admin';
    api.post.mockResolvedValueOnce({ data: { token: mockToken, rol: mockRol } });

    render(<LoginPage />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: '123456' } });

    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(localStorage.getItem('rol')).toBe(mockRol);
    });
  });

  it('muestra error con credenciales incorrectas', async () => {
    api.post.mockRejectedValueOnce(new Error('Credenciales inválidas'));

    render(<LoginPage />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument();
    });
  });
});
