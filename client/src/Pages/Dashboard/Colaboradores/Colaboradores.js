import React, { useState, useEffect } from 'react';
import './Colaboradores.css';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { HexColorPicker } from "react-colorful"; // Importar o color picker

const Colaboradores = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoColaborador, setNovoColaborador] = useState({ nome_colaborador: '', telefone_colaborador: '', email_colaborador: '',cor_colaborador:'' });
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [colaboradorToDelete, setColaboradorToDelete] = useState(null);
  const [editableColaboradorId, setEditableColaboradorId] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Função para atualizar a cor do colaborador
  const handleColorChange = (colaborador_id, newColor) => {
    handleInputChange(colaborador_id, "cor_colaborador", newColor);
  };


  const handleMouseEnter = (colaboradorId) => {
    setColorPickerVisible(colaboradorId);
  };
  
  const handleMouseLeave = () => {
    setColorPickerVisible(null);
  };

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const colaboradoresPerPage = 3;

  // Carregar colaboradores ao montar o componente
  useEffect(() => {
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${apiUrl}/colaboradores`, {
        method: 'GET', // Método GET
        headers: {
          'Authorization': `Bearer ${token}`, // Adiciona o token no cabeçalho Authorization
          'Content-Type': 'application/json' // Opcional, mas pode ser útil para indicar o tipo de conteúdo
        }
      }); // Atualize a URL da sua API
      const data = await response.json();
      setColaboradores(data);
      
    } catch (error) {
      setNotification({ message: 'Erro ao carregar colaboradores.', type: 'error' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000); // Limpar notificação após 3 segundos
    }
  };

  const validarColaborador = (colaborador) => {
    if (!colaborador.nome_colaborador || !colaborador.telefone_colaborador || !colaborador.email_colaborador) {
      return 'Todos os campos são obrigatórios.';
    }
    if (!/^\d{9}$/.test(colaborador.telefone_colaborador)) {
      return 'O contacto deve ter 9 dígitos.';
    }
    if (!/\S+@\S+\.\S+/.test(colaborador.email_colaborador)) {
      return 'Email inválido.';
    }
    return null;
  };

  const adicionarColaborador = async () => {
    const erro = validarColaborador(novoColaborador);
    const token = localStorage.getItem('token');
    if (erro) {
      setNotification({ message: erro, type: 'error' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000); // Limpar notificação após 3 segundos
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/colaboradores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' , 'Authorization': `Bearer ${token}`}, // Adiciona o token no cabeçalho Authorization},
        body: JSON.stringify(novoColaborador),
       
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar colaborador');
      }

      const newColaborador = await response.json();
      setColaboradores([...colaboradores, newColaborador]);
      setNovoColaborador({ nome_colaborador: '', telefone_colaborador: '', email_colaborador: '',cor_colaborador:'' });
      setIsModalOpen(false);
      setNotification({ message: 'Colaborador adicionado com sucesso!', type: 'success' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000); // Limpar notificação após 3 segundos
    } catch (error) {
      setNotification({ message: 'Erro ao adicionar colaborador.', type: 'error' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000); // Limpar notificação após 3 segundos
    }
  };

  const eliminarColaborador = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${apiUrl}/colaboradores/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Erro ao eliminar colaborador');
      }

      const updatedData = colaboradores.filter(col => col.colaborador_id !== id);
      setColaboradores(updatedData);

       // Verifica se a página atual está vazia após a remoção e ajusta se necessário
    const lastPage = Math.ceil(updatedData.length / colaboradoresPerPage);
    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }

      setIsConfirmDeleteModalOpen(false);
      setNotification({ message: 'Colaborador eliminado com sucesso!', type: 'success' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000); // Limpar notificação após 3 segundos
    } catch (error) {
      setNotification({ message: 'Erro ao eliminar colaborador.', type: 'error' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000); // Limpar notificação após 3 segundos
    }
  };

  const editarColaborador = async (colaborador) => {
    const erro = validarColaborador(colaborador);
    const token = localStorage.getItem('token');
    if (erro) {
      setNotification({ message: erro, type: 'error' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000); // Limpar notificação após 3 segundos
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/colaboradores/${colaborador.colaborador_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(colaborador),
        
      });

      if (!response.ok) {
        throw new Error('Erro ao editar colaborador');
      }

      const updatedColaborador = await response.json();
      setColaboradores(colaboradores.map(col => (col.colaborador_id === updatedColaborador.colaborador_id ? updatedColaborador : col)));
      setEditableColaboradorId(null);
      setNotification({ message: 'Colaborador editado com sucesso!', type: 'success' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000); // Limpar notificação após 3 segundos
    } catch (error) {
      setNotification({ message: 'Erro ao editar colaborador.', type: 'error' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000); // Limpar notificação após 3 segundos
    }
  };

  const handleDeleteClick = (colaborador) => {
    setColaboradorToDelete(colaborador);
    setIsConfirmDeleteModalOpen(true);
  };

  const handleEditClick = (colaborador) => {
    if (editableColaboradorId === colaborador.colaborador_id) {
      editarColaborador(colaborador);
    } else {
      setEditableColaboradorId(colaborador.colaborador_id);
    }
  };

  const handleInputChange = (id, field, value) => {
    setColaboradores(colaboradores.map(col =>
      col.colaborador_id === id ? { ...col, [field]: value } : col
    ));
  };

  // Cálculo de paginação
  const indexOfLastColaborador = currentPage * colaboradoresPerPage;
  const indexOfFirstColaborador = indexOfLastColaborador - colaboradoresPerPage;
  const currentColaboradores = colaboradores.slice(indexOfFirstColaborador, indexOfLastColaborador);

  const totalPages = Math.ceil(colaboradores.length / colaboradoresPerPage);

  

  return (
    <div className="gerir-colaboradores">
      <h1 className="title">Gerir Colaboradores</h1>

      {notification.message && (
        <div className={`notification ${notification.type === 'success' ? 'success' : 'error'}`}>
          {notification.message}
        </div>
      )}

      <div className="add-button-container">
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Adicionar Novo Colaborador
        </button>
      </div>

      <table className="colaborador-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Contacto</th>
          <th>Email</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {currentColaboradores.map((colaborador) => (
          <tr key={colaborador.colaborador_id}>
            <td>
  <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
    {/* Bola colorida com hover para mostrar o color picker */}
    <div
      style={{
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        backgroundColor: colaborador.cor_colaborador,
        marginRight: "10px",
        position: "relative",
        border: "2px solid #ccc",
        cursor: editableColaboradorId === colaborador.colaborador_id ? "pointer" : "default", // Cursor só quando editável
      }}
      onMouseEnter={() => handleMouseEnter(colaborador.colaborador_id)} // Mostra o color picker ao hover
      onMouseLeave={() => handleMouseLeave()} // Esconde o color picker ao sair do hover
    >
      {/* Apenas mostra o color picker no hover quando a edição está ativa */}
      {editableColaboradorId === colaborador.colaborador_id && colorPickerVisible === colaborador.colaborador_id && (
        <div className='box-color'
          style={{
            position: "absolute",
            top: "-60px", // Posição acima da bolinha
            left: "20px",
            zIndex: "1000",
            backgroundColor: "white",
            padding: "15px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
          }}
        >
          <HexColorPicker
            color={colaborador.cor_colaborador}
            onChange={(newColor) => handleColorChange(colaborador.colaborador_id, newColor)}
          />
        </div>
      )}
    </div>

    {/* Nome do colaborador ou input editável */}
    {editableColaboradorId === colaborador.colaborador_id ? (
      <input
        type="text"
        value={colaborador.nome_colaborador}
        onChange={(e) =>
          handleInputChange(colaborador.colaborador_id, "nome_colaborador", e.target.value)
        }
        className="editable-input"
      />
    ) : (
      colaborador.nome_colaborador
    )}
  </div>
</td>

            <td>
              {editableColaboradorId === colaborador.colaborador_id ? (
                <input
                  type="text"
                  value={colaborador.telefone_colaborador}
                  onChange={(e) =>
                    handleInputChange(colaborador.colaborador_id, "telefone_colaborador", e.target.value)
                  }
                  className="editable-input"
                />
              ) : (
                colaborador.telefone_colaborador
              )}
            </td>
            <td>
              {editableColaboradorId === colaborador.colaborador_id ? (
                <input
                  type="email"
                  value={colaborador.email_colaborador}
                  onChange={(e) =>
                    handleInputChange(colaborador.colaborador_id, "email_colaborador", e.target.value)
                  }
                  className="editable-input"
                />
              ) : (
                colaborador.email_colaborador
              )}
            </td>
            <td>
              <div className="button-group">
                {editableColaboradorId === colaborador.colaborador_id ? (
                  <button
                    className="action-button confirm-button"
                    onClick={() => {
                      handleEditClick(colaborador);
                      setColorPickerVisible(false); // Esconde o color picker após confirmar
                    }}
                  >
                    Confirmar
                  </button>
                ) : (
                  <>
                    <button
                      className="action-button edit-button"
                      onClick={() => {
                        handleEditClick(colaborador);
                        setEditableColaboradorId(colaborador.colaborador_id); // Ativa a edição
                        setColorPickerVisible(true); // Mostra o color picker
                      }}
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDeleteClick(colaborador)}
                    >
                      <FaTrashAlt /> Eliminar
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>


      {/* Controles de paginação */}
      
      {totalPages > 1 && (
  <div className="pagination">
    <button 
      className="pagination-button" 
      onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
      disabled={currentPage === 1}
    >
      Anterior
    </button>
    <span>Página {currentPage} de {totalPages}</span>
    <button 
      className="pagination-button" 
      onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}
      disabled={currentPage === totalPages}
    >
      Próxima
    </button>
  </div>
)}

       {/* Modal para adicionar novo colaborador */}
       {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2>Adicionar Novo Colaborador</h2>
            <input
              type="text"
              placeholder="Nome"
              value={novoColaborador.nome_colaborador}
              onChange={(e) => setNovoColaborador({ ...novoColaborador, nome_colaborador: e.target.value })}
              className="modal-input"
            />
            <input
              type="text"
              placeholder="Contacto"
              value={novoColaborador.telefone_colaborador}
              onChange={(e) => setNovoColaborador({ ...novoColaborador, telefone_colaborador: e.target.value })}
              className="modal-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={novoColaborador.email_colaborador}
              onChange={(e) => setNovoColaborador({ ...novoColaborador, email_colaborador: e.target.value })}
              className="modal-input"
            />

             {/* Color Picker */}
            <div className="color-picker-container">
              <label>Escolher Cor</label>
              <HexColorPicker
                color={novoColaborador.cor_colaborador}
                onChange={(color) =>
                  setNovoColaborador({ ...novoColaborador, cor_colaborador: color })
                }
              />

              {/* Retângulo com a cor selecionada */}
              <div
                style={{
                  backgroundColor: novoColaborador.cor_colaborador,
                  color: "#fff",
                  padding: "10px",
                  textAlign: "center",
                  width:"45%",
                  display:"flex",
                  justifyContent:"center",
                  margin:"0 auto",
                  marginBottom:"1em",
                  borderRadius: "5px",
                }}
              >
                Colaborador
              </div>
            </div>

            <button className="confirm-button" onClick={adicionarColaborador}>Adicionar</button>
          </div>
        </div>
      )}

      {/* Modal de confirmação para eliminar colaborador */}
      {isConfirmDeleteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsConfirmDeleteModalOpen(false)}>&times;</span>
            <h2>Confirmar Eliminação</h2>
            <p>Tem certeza de que deseja eliminar o colaborador <strong>{colaboradorToDelete.nome_colaborador}</strong>?</p>
            <button className="confirm-delete-button" onClick={() => eliminarColaborador(colaboradorToDelete.colaborador_id)}>Eliminar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colaboradores;
