import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Reservas from './Pages/Reservas';
import Mainpage from './Pages/Mainpage';
import ScrollTop from './Components/ScrollTop/ScrollTop';
import Dashboard from './Pages/Dashboard/Dashboard';
import Estatisticas from './Pages/Dashboard/Estatisticas/Estatisticas'; 
import GerirReservas from './Pages/Dashboard/Reservas/GReservas'; 
import Colaboradores from './Pages/Dashboard/Colaboradores/Colaboradores'; 
import Mapa from './Pages/Dashboard/Mapa/Mapa'; 
import Login from './Pages/Login/Login';


// Importa o PrivateRoute
import PrivateRoute from './Privateroute';

function App() {

    // Efeito para limpar o localStorage ao fechar o navegador ou a aba
    useEffect(() => {
      const handleBeforeUnload = () => {
        localStorage.removeItem('token'); // Remove o token ao fechar a aba ou o navegador
      };
  
      // Adiciona o listener para o evento 'beforeunload'
      window.addEventListener('beforeunload', handleBeforeUnload);
  
      return () => {
        // Remove o listener quando o componente é desmontado
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, []);

  return (
    <Router>
      <ScrollTop />
      <Routes>
        {/* Rotas principais */}
        <Route path="/" element={<Mainpage />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/login" element={<Login />} />
        

        {/* Rota da dashboard com rotas internas, protegidas pelo PrivateRoute */}
        <Route 
          path="/dash" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Renderiza Estatísticas por padrão quando acessa /dash */}
          <Route index element={<Estatisticas />} />
          <Route path="gerir-reservas" element={<GerirReservas />} />
          <Route path="colaboradores" element={<Colaboradores />} />
          <Route path="mapa" element={<Mapa />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
