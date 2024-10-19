import React, { useState, useEffect } from 'react';
import { FaCheck, FaTrashAlt, FaPlus } from 'react-icons/fa';
import './GReservas.css';
import DatePicker from 'react-datepicker';

const GReservas = () => {
  const itemsPerPage = 3; // Número de itens por página
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [novaReserva, setNovaReserva] = useState({ nome_cliente: '', data_reserva: null, hora_reserva: '' , atividade:'',role:'admin',phone:'',nPessoas:''});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtros
  const [tipoFilter, setTipoFilter] = useState('');
  const [dataFilter, setDataFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [notification, setNotification] = useState(null); // Estado para controlar a notificação

  const apiUrl = process.env.REACT_APP_API_URL;

  const timeSlots = [
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  // Função para exibir notificação
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null); // Remove a notificação após 3 segundos
    }, 3000);
  };

  const formatarData = (dataString) => {
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
  
    // Converte a string de data para um objeto Date
    const data = new Date(dataString);
    
    // Extrai o dia e o mês
    const dia = data.getDate();
    const mes = meses[data.getMonth()]; // Obtem o mês baseado no índice
  
    const ano = data.getFullYear();
    
    // Retorna a data formatada
    return `${dia} ${mes} ${ano}`;
  };

  // Função para buscar dados do backend
  const fetchData = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${apiUrl}/reservas`, {
        method: 'GET', // Método GET
        headers: {
          'Authorization': `Bearer ${token}`, // Adiciona o token no cabeçalho Authorization
          'Content-Type': 'application/json' // Opcional, mas pode ser útil para indicar o tipo de conteúdo
        }
      });
      const reservas = await response.json();
  
      // Mapeando as reservas e formatando a data e a hora
        const reservasFormatadas = reservas.map((reserva) => {
        const data_formatada = reserva.data_reserva.split('T')[0];
        const hora = reserva.hora_reserva.split(':').slice(0, 2).join(':');
  
        return {
          ...reserva,
          data:formatarData(data_formatada),
          hora
        };
      });
  
      console.log(reservasFormatadas);
      setData(reservasFormatadas);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcula os dados a serem exibidos na página atual com filtros aplicados
  const filteredData = data.filter(item => {
    const searchTerm = searchInput.toLowerCase();
    return (
      (tipoFilter === '' || item.tipo_atividade === tipoFilter) &&
      (dataFilter === '' || item.data_reserva === dataFilter) &&
      (estadoFilter === '' || item.status === estadoFilter) &&
      (item.nome_cliente.toLowerCase().includes(searchTerm) ||
       item.telefone_cliente.includes(searchInput) ||
       item.email_cliente.toLowerCase().includes(searchTerm))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleConfirm = async (item) => {

    const token = localStorage.getItem('token');
    try {
      console.log('Confirming reservation:', item); // Verificar os dados antes da requisição
  
      const response = await fetch(`${apiUrl}/reservas/${item.reserva_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Adiciona o token no cabeçalho Authorization
        },
        body: JSON.stringify({ 
          ...item, 
          status: "Confirmado", 
          data: item.data, // Certificar-se de que estes valores estão corretos
          hora: item.hora,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao atualizar o status');
      }
  
      const updatedReserva = await response.json();
      
      // Garantir que data e hora são preservadas no frontend
      setData((prevData) =>
        prevData.map((dataItem) =>
          dataItem.reserva_id === updatedReserva.reserva_id
            ? {
                ...updatedReserva,
                data: item.data,   // Manter a data original
                hora: item.hora,   // Manter a hora original
              }
            : dataItem
        )
      );
  
      setConfirmModalOpen(false);
      showNotification('Reserva confirmada com sucesso!', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Erro ao confirmar a reserva', 'error');
    }
  };

  const validarReserva = (reserva) => {
    if (!reserva.nome_cliente || !reserva.phone || !reserva.nPessoas || !reserva.data_reserva || !reserva.hora_reserva || !reserva.atividade) {
      return 'Todos os campos são obrigatórios.';
    }
    if (!/^\d{9}$/.test(reserva.phone)) {
      return 'O contacto deve ter 9 dígitos.';
    }
    
    return null;
  };

  const adicionarReserva = async () => {
    const erro = validarReserva(novaReserva);

    
    const token = localStorage.getItem('token');
    if (erro) {
        setNotification({ message: erro, type: 'error' });
        setTimeout(() => setNotification(null), 3000); // Limpar notificação após 3 segundos
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(novaReserva),
            
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar reserva');
        }

        const newReserva = await response.json();

        // Aqui, assumimos que novaReserva.data_reserva já está no formato dd/MM/yyyy
        const data_formatada = novaReserva.data_reserva.split('T')[0];

        // Dividir a data em dia, mês e ano
        const [day, month, year] = data_formatada.split('/').map(Number);

        // Criar uma nova string no formato yyyy/MM/dd
        const formattedDate = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
        const formatDate = formatarData(formattedDate); // Certifique-se de que essa função retorna a data formatada corretamente

        // Adiciona a nova reserva ao estado
        setData((prevData) => [...prevData, {
            ...newReserva,
            data: formatDate,   // Usar a data formatada
            hora: novaReserva.hora_reserva, // Manter a hora original
        }]);

        // Limpa o formulário
        setNovaReserva({ nome_cliente: '', data_reserva: null, hora_reserva: '', atividade: '', role: 'admin', phone: '', nPessoas: '' });
        setIsModalOpen(false);

        // Notificação de sucesso
        setNotification({ message: 'Reserva adicionada com sucesso!', type: 'success' });
        setTimeout(() => setNotification(null), 3000); // Limpar notificação após 3 segundos

    } catch (error) {
        console.error(error); // Para depuração
        setNotification({ message: 'Erro ao adicionar Reserva.', type: 'error' });
        setTimeout(() => setNotification(null), 3000); // Limpar notificação após 3 segundos
    }
};



const handleDelete = async (item) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${apiUrl}/reservas/${item.reserva_id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Erro ao eliminar a reserva');
    }

    // Atualiza os dados removendo o item excluído
    const updatedData = data.filter((dataItem) => dataItem.reserva_id !== item.reserva_id);
    setData(updatedData);


    // Verifica se a página atual está vazia após a remoção e ajusta se necessário
    const lastPage = Math.ceil(updatedData.length / itemsPerPage);
    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }

    setDeleteModalOpen(false);
    showNotification('Reserva eliminada com sucesso!', 'success');
  } catch (error) {
    console.error(error);
    showNotification('Erro ao eliminar a reserva', 'error');
  }
};

  const clearFilters = () => {
    setTipoFilter('');
    setDataFilter('');
    setEstadoFilter('');
    setSearchInput('');
  };

  const handleDateChange = (date) => {
    if (date) {
      // Obtém a data no formato "dd/MM/yyyy"
      const formattedDate = date.toLocaleDateString('pt-BR');
      setNovaReserva({ ...novaReserva, data_reserva: formattedDate })
    } else {
      setNovaReserva(null);
    }
  };

  return (
    <div className="gerir-reservas">
      <h1>Gerir Reservas</h1>
      
      {/* Filtros */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nome, Telemóvel ou Email"
          />
        </div>

        <div className="filter-group">
          <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
            <option value="">Filtrar por Tipo</option>
            <option value="Paintball">Paintball</option>
            <option value="Moto4">Moto4</option>
            <option value="Paintball + Moto4">Paintball + Moto4</option>
          </select>
        </div>
        
        <div className="filter-group">
          <input 
            type="date" 
            value={dataFilter} 
            onChange={(e) => setDataFilter(e.target.value)} 
            placeholder="Filtrar por Data" 
          />
        </div>
        
        <div className="filter-group">
          <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
            <option value="">Filtrar por Estado</option>
            <option value="Pendente">Pendente</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
        
        <button className="clear-filters-button" onClick={clearFilters}>
          Limpar Filtros
        </button>
      </div>

      <div className="add-button-container">
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Adicionar Nova Reserva
        </button>
      </div>

      <table className="reserva-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telemóvel</th>
            <th>Email</th>
            <th>Data</th>
            <th>Hora</th>
            <th>Tipo</th>
            <th>Nº Pessoas</th>
            <th>Estado</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.reserva_id}>
              <td>{item.nome_cliente}</td>
              <td>{item.telefone_cliente}</td>
              <td>{item.email_cliente}</td>
              <td>{item.data}</td>
              <td>{item.hora}</td>
              <td>{item.tipo_atividade}</td>
              <td>{item.numero_pessoas}</td>
              <td>{item.status}</td>
              <td>
                <div className="button-group">
                  <button
                    className="action-button1 confirm-button1"
                    onClick={() => {
                      setSelectedItem(item);
                      setConfirmModalOpen(true);
                    }}
                    disabled={item.status === "Confirmado"} // Desativa o botão se já estiver confirmado
                    style={{ opacity: item.status === "Confirmado" ? 0.5 : 1 }} // Altera a opacidade
                  >
                    <FaCheck /> Confirmar
                  </button>
                  <button
                    className="action-button1 delete-button1"
                    onClick={() => {
                      setSelectedItem(item);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <FaTrashAlt /> Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modais */}
      {confirmModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={() => setConfirmModalOpen(false)}>×</button>
            <h2>Confirmar Reserva</h2>
            <p>Tem certeza de que deseja confirmar a reserva de {selectedItem?.nome_cliente}?</p>
            <button className="confirm-button" onClick={() => handleConfirm(selectedItem)}>Confirmar</button>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={() => setDeleteModalOpen(false)}>×</button>
            <h2>Eliminar Reserva</h2>
            <p>Tem certeza de que deseja eliminar a reserva de {selectedItem?.nome_cliente}?</p>
            <button className="confirm-delete-button" onClick={() => handleDelete(selectedItem)}>Eliminar</button>
          </div>
        </div>
      )}

      {/* Paginação */}
      {filteredData.length > itemsPerPage && (
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

      {/* Notificação */}
      {notification && (
        <div 
          className={`notification ${notification.type}`} 
          style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            padding: '10px 20px', 
            color: 'white', 
            backgroundColor: notification.type === 'success' ? 'green' : 'red', 
            borderRadius: '5px' 
          }}
        >
          {notification.message}
        </div>
      )}

{isModalOpen && (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
      <h2>Adicionar Reserva</h2>

      {/* Input para o Nome */}
      <input
        type="text"
        placeholder="Nome"
        value={novaReserva.nome_cliente}
        onChange={(e) => setNovaReserva({ ...novaReserva, nome_cliente: e.target.value })}
        className="modal-input"
        required
      />

      {/* Input para TEL */}
      <input type="tel" className="modal-input" value={novaReserva.phone} onChange={(e) => {
                const value = e.target.value;

                // Verifica se o valor contém apenas números e tem até 9 dígitos
                if (/^\d*$/.test(value) && value.length <= 9) {
                  setNovaReserva({ ...novaReserva, phone: e.target.value })
                }
              }} required maxLength={9} minLength={9} placeholder='Nº Telemovel'/>

            {/* Input para Npessoas */}
        <input type="number"  min="1" max="20" value={novaReserva.nPessoas}
        onChange={(e) => setNovaReserva({ ...novaReserva, nPessoas: e.target.value })}
        className="modal-input"
        required  placeholder='Nº de Pessoas'/>

      {/* Input para Data */}
      

  

<DatePicker
                selected={novaReserva.data_reserva ? new Date(novaReserva.data_reserva.split('/').reverse().join('-')) : null} // Converte a string de volta para Date
                onChange={handleDateChange}
                className="form-control"
                dateFormat="yyyy/dd/MM"
                placeholderText="Escolha o dia"
                locale="pt-BR"
                filterDate={(date) => date.getDay() === 6 || date.getDay() === 0}
                minDate={new Date()}
                required
              />


      <h4>Escolha o horário</h4>
      {/* Botões para os slots de tempo */}
      <div className="time-slots-reservas">
        
        {timeSlots.map((time) => (
          <button
            key={time}
            type="button"
            className={`time-slot-reservas ${novaReserva.hora_reserva === time ? 'selected' : ''}`}
            onClick={() => setNovaReserva({ ...novaReserva, hora_reserva: time })}
            required
          >
            {time}
          </button>
        ))}
      </div>

      {/* Dropdown para o tipo de atividade */}
      <select
        value={novaReserva.atividade}
        onChange={(e) => setNovaReserva({ ...novaReserva, atividade: e.target.value })}
        className="modal-input"
        required
      >
        <option value="">Selecione uma atividade</option>
        <option value="1">Paintball</option>
        <option value="2">Moto4</option>
        <option value="3">Paintball + Moto4</option>
      
      </select>

      {/* Botão para adicionar a reserva */}
      <button className="confirm-button" onClick={adicionarReserva}>
        Adicionar Reserva
      </button>
    </div>
  </div>
)}


    </div>
  );
};

export default GReservas;
