import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CitasPage from './CitasPage';
import api from '../services/api';

jest.mock('../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('CitasPage', () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url === '/citas') {
        return Promise.resolve({
          data: [{ id: 1, fecha: '2025-06-01T10:00', motivo: 'Chequeo', mascota_id: 2 }],
        });
      }
      if (url === '/mascotas') {
        return Promise.resolve({
          data: [{ id: 2, nombre: 'Firulais' }, { id: 3, nombre: 'Pelusa' }],
        });
      }
    });
  });

  it('renderiza el título y botón correctamente', async () => {
    await waitFor(() => {
      render(<CitasPage />);
    });
    expect(screen.getByText('Citas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Nueva Cita/i })).toBeInTheDocument();
  });

  it('muestra citas cargadas desde la API', async () => {
    render(<CitasPage />);
    await waitFor(() => {
      expect(screen.getByText(/Chequeo/i)).toBeInTheDocument();
      expect(screen.getByText(/Mascota ID: 2/i)).toBeInTheDocument();
    });
  });

  it('abre el diálogo al hacer clic en "+ Nueva Cita"', async () => {
    render(<CitasPage />);
    fireEvent.click(screen.getByRole('button', { name: /\+ Nueva Cita/i }));

    await waitFor(() => {
      expect(screen.getByText(/Nueva Cita/i, { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByLabelText(/Fecha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Motivo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mascota/i)).toBeInTheDocument();
    });
  });
});
