import React from 'react';
import { Navigate } from 'react-router-dom';

// Componente para proteger rotas privadas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Pega o token do localStorage

  return token ? children : <Navigate to="/login" />; // Redireciona se não estiver logado
};

export default PrivateRoute;
