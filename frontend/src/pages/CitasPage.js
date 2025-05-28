import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, Card, CardContent,
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, Box
} from '@mui/material';
import api from '../services/api';

const CitasPage = () => {
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ fecha: '', motivo: '', mascota_id: '' });
  const [selectedId, setSelectedId] = useState(null);

  const fetchCitas = async () => {
    const res = await api.get('/citas');
    setCitas(res.data);
  };

  const fetchMascotas = async () => {
    const res = await api.get('/mascotas');
    setMascotas(res.data);
  };

  useEffect(() => {
    fetchCitas();
    fetchMascotas();
  }, []);

  const handleOpen = () => {
    setEditMode(false);
    setFormData({ fecha: '', motivo: '', mascota_id: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
  };

  const handleSubmit = async () => {
    if (!formData.mascota_id) return alert("Selecciona una mascota");
    if (editMode) {
      await api.put(`/citas/${selectedId}`, formData);
    } else {
      await api.post('/citas', formData);
    }
    fetchCitas();
    handleClose();
  };

  const handleEdit = (cita) => {
    setEditMode(true);
    setFormData({
      fecha: cita.fecha,
      motivo: cita.motivo,
      mascota_id: cita.mascota_id
    });
    setSelectedId(cita.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta cita?')) {
      await api.delete(`/citas/${id}`);
      fetchCitas();
    }
  };

  return (
    <Container>
      <Box mt={4} mb={2} display="flex" justifyContent="space-between">
        <Typography variant="h4">Citas</Typography>
        <Button variant="contained" onClick={handleOpen}>+ Nueva Cita</Button>
      </Box>
      <Grid container spacing={2}>
        {citas.map((cita) => (
          <Grid item xs={12} sm={6} key={cita.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{new Date(cita.fecha).toLocaleString()}</Typography>
                <Typography>Motivo: {cita.motivo}</Typography>
                <Typography>Mascota ID: {cita.mascota_id}</Typography>
                <Box mt={2} display="flex" justifyContent="space-between">
                  <Button variant="outlined" onClick={() => handleEdit(cita)}>Editar</Button>
                  <Button variant="outlined" color="error" onClick={() => handleDelete(cita.id)}>Eliminar</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'Editar Cita' : 'Nueva Cita'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Fecha"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Motivo"
            fullWidth
            margin="normal"
            value={formData.motivo}
            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
          />
          <TextField
            select
            label="Mascota"
            fullWidth
            margin="normal"
            value={formData.mascota_id}
            onChange={(e) => setFormData({ ...formData, mascota_id: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="">Selecciona una mascota</option>
            {mascotas.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CitasPage;