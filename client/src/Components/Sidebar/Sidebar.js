// src/Components/Sidebar/Sidebar.js
import React, { useState, useEffect } from "react";
import './Sidebar.css'; // CSS para estilizar
import estatisticas from '../../Assets/estatisticas.png';
import reservas from '../../Assets/reserva.png';
import colaboradores from '../../Assets/colaboradores.png';
import agenda from '../../Assets/agenda.png';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { FaSignOutAlt } from 'react-icons/fa'; // Importa ícone de logout

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Estatísticas");
  const [isMobile, setIsMobile] = useState(false); // Estado para detectar mobile view
  const navigate = useNavigate(); // Inicializa o hook useNavigate

  const handleItemClick = (item, path) => {
    setActiveItem(item);
    navigate(path); // Redireciona para o caminho especificado
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove o token
    navigate('/login'); // Redireciona para a página de login
  };

  // Verifica o tamanho da tela para condicionar o botão de logout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Considera mobile se a largura for <= 768px
    };

    // Adiciona o listener de resize
    window.addEventListener("resize", handleResize);

    // Chama a função no primeiro render
    handleResize();

    // Remove o listener ao desmontar o componente
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside className="sidebar-container">
      <header className="sidebar">
        {/* Logo da Empresa */}
        <div className="logo">
          <p>LOGO</p>
        </div>

        {/* Navegação */}
        <nav className="menu">
          <ul>
            <li
              className={activeItem === "Estatísticas" ? "active" : ""}
              onClick={() => handleItemClick("Estatísticas", "/dash")}
            >
              <img className="icon" src={estatisticas} alt="Estatísticas" />
              <span>Estatísticas</span>
            </li>
            <li
              className={activeItem === "Gerir Reservas" ? "active" : ""}
              onClick={() => handleItemClick("Gerir Reservas", "/dash/gerir-reservas")}
            >
              <img className="icon" src={reservas} alt="Gerir Reservas" />
              <span>Gerir Reservas</span>
            </li>
            <li
              className={activeItem === "Colaboradores" ? "active" : ""}
              onClick={() => handleItemClick("Colaboradores", "/dash/colaboradores")}
            >
              <img className="icon" src={colaboradores} alt="Colaboradores" />
              <span>Colaboradores</span>
            </li>
            <li
              className={activeItem === "Mapa" ? "active" : ""}
              onClick={() => handleItemClick("Mapa", "/dash/mapa")}
            >
              <img className="icon" src={agenda} alt="Mapa" />
              <span>Mapa</span>
            </li>
          </ul>
        </nav>

        {/* Botão de Log Out no fundo */}
        <div className="logout">
          <button className="logout-button" onClick={handleLogout}>
            {isMobile ? (
              <FaSignOutAlt className="logout-icon" />
            ) : (
              <>
                
                <span className="logout-text">Log Out</span>
              </>
            )}
          </button>
        </div>
      </header>
    </aside>
  );
};

export default Sidebar;
