// src/Pages/Dashboard/Dashboard.js

import { Outlet } from 'react-router-dom'; // Para renderizar rotas filhas
import Sidebar from '../../Components/Sidebar/Sidebar'; // Importando a Sidebar
import './Dashboard.css'; // Importando o CSS
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';


const Dashboard = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenExpiration = localStorage.getItem('tokenExpiration');

    // Verificar se o token expirou
    if (!token || Date.now() > tokenExpiration) {
      // Remove o token e expiração do localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');

      // Redireciona o usuário para a página de login
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-dashboard">
        {/* Renderiza as rotas filhas aqui */}
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
