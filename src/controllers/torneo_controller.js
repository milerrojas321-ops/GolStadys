import Torneo from '../models/torneo_model.js'; // Con guion bajo y .js

export const obtenerTorneos = async (req, res) => {
  try {
    const torneos = await Torneo.obtenerTodos();
    res.json(torneos);
  } catch (error) {
    console.error('❌ Error en torneo_controller:', error);
    res.status(500).json({ mensaje: 'Error al obtener los torneos' });
  }
};