import React, { Fragment, useCallback, useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';
import * as XLSX from 'xlsx';  // Biblioteca para gerar Excel
import './Mapa.css';
import { FaFileExcel } from 'react-icons/fa'; 

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const ColoredDateCellWrapper = ({ children }) =>
  React.cloneElement(React.Children.only(children), {
    style: { backgroundColor: 'lightblue' },
  });

const CustomToolbar = ({ toolbar, setSelectedDate, exportToExcel, hasEvents }) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
      setSelectedDate(moment(toolbar.date).subtract(1, 'month').toDate()); // Atualiza a data selecionada ao navegar
    };
  
    const goToNext = () => {
      toolbar.onNavigate('NEXT');
      setSelectedDate(moment(toolbar.date).add(1, 'month').toDate()); // Atualiza a data selecionada ao navegar
    };
  
    return (
      <div className="custom-toolbar">

      <div className="custom-toolbar">
        <button onClick={goToBack} className="nav-button">Anterior</button>
        <span className="toolbar-label">{moment(toolbar.date).format('MMMM YYYY')}</span>
        <button onClick={goToNext} className="nav-button">Próximo</button>
        
      </div>
      
                <button
                className='btn-excel'
          onClick={exportToExcel}
          disabled={!hasEvents}  // Desabilita o botão caso não haja eventos no mês
        >
          <FaFileExcel 
            size={24} 
            color={hasEvents ? 'green' : 'gray'}  // Muda a cor dependendo do estado
          />
        </button>

      </div>
    );
};

const CustomEvent1 = ({ event }) => (
  <div style={{ color: 'white', fontSize: '15px', marginTop: '0.3em', height:"fit-content" }}>
    <strong>{event.title}</strong>
    <p style={{ fontSize: '11px', marginBottom: '0.8em' }}>
      Hora: {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
    </p>
  </div>
);

const Mapa = () => {
  const [myEvents, setEvents] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedColaborador, setSelectedColaborador] = useState('');
  const [confirmChange, setConfirmChange] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [hasEvents, setHasEvents] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  const exportToExcel = () => {
    const currentDate = moment(selectedDate);
    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');

    const filteredEvents = myEvents.filter((event) => {
      const eventDate = moment(event.start);
      return eventDate.isBetween(startOfMonth, endOfMonth, null, '[]');
    });

    const data = filteredEvents.map((event) => ({
      'Reserva': event.title,
      'Data': moment(event.start).format('DD/MM/YYYY'),
      'Hora de Início': moment(event.start).format('HH:mm'),
      'Hora de Fim': moment(event.end).format('HH:mm'),
      'Número de Pessoas': event.nPessoas,
      'Tipo de Atividade': event.atividade,
      'Colaborador Responsavel': event.colaborador ? event.colaborador : 'Nenhum Associado',
      'Estado da Reserva': event.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const columnWidths = [
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
    ];

    worksheet['!cols'] = columnWidths;

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
      for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
        if (!worksheet[cellAddress]) continue;

        worksheet[cellAddress].s = {
          alignment: {
            horizontal: 'center',
            vertical: 'center',
          }
        };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Eventos do Mês');
    const nomeMes = currentDate.format('MMMM');
    XLSX.writeFile(workbook, `Eventos_${nomeMes}.xlsx`);
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');

    try {
      const reservasResponse = await fetch(`${apiUrl}/reservas`, {
        method: 'GET', // Método GET
        headers: {
          'Authorization': `Bearer ${token}`, // Adiciona o token no cabeçalho Authorization
          'Content-Type': 'application/json' // Opcional, mas pode ser útil para indicar o tipo de conteúdo
        }
      });
      if (!reservasResponse.ok) {
        throw new Error('Erro ao buscar reservas');
      }
      const reservasData = await reservasResponse.json();

      const colaboradoresResponse = await fetch(`${apiUrl}/colaboradores`, {
        method: 'GET', // Método GET
        headers: {
          'Authorization': `Bearer ${token}`, // Adiciona o token no cabeçalho Authorization
          'Content-Type': 'application/json' // Opcional, mas pode ser útil para indicar o tipo de conteúdo
        }
      });
      if (!colaboradoresResponse.ok) {
        throw new Error('Erro ao buscar colaboradores');
      }
      const colaboradoresData = await colaboradoresResponse.json();

      const assignColaboradoresResponse = await fetch(`${apiUrl}/assign_colaborador`, {
        method: 'GET', // Método GET
        headers: {
          'Authorization': `Bearer ${token}`, // Adiciona o token no cabeçalho Authorization
          'Content-Type': 'application/json' // Opcional, mas pode ser útil para indicar o tipo de conteúdo
        }
      });
      if (!assignColaboradoresResponse.ok) {
        throw new Error('Erro ao buscar colaboradores atribuídos');
      }
      const assignColaboradoresData = await assignColaboradoresResponse.json();

      const eventos = reservasData.map(reserva => {
        const reservaData = new Date(reserva.data_reserva);
        const [hora, minutos] = reserva.hora_reserva.split(':');
        reservaData.setHours(hora, minutos);

        const colaboradorAssociation = assignColaboradoresData.find(assign => assign.reserva_id === reserva.reserva_id);
        const colaboradorNome = colaboradorAssociation ? colaboradoresData.find(col => col.colaborador_id === colaboradorAssociation.colaborador_id)?.nome_colaborador : null;

        const colaborador = colaboradoresData.find(col => col.nome_colaborador === colaboradorNome);
        const corColaborador = colaborador ? colaborador.cor_colaborador : null;

        return {
          id: reserva.reserva_id,
          title: reserva.nome_cliente || 'Reserva sem nome',
          start: reservaData,
          end: new Date(reservaData.getTime() + 30 * 60000),
          allDay: false,
          color: corColaborador ? corColaborador : (reserva.status === 'Confirmado' ? 'lightgreen' : 'lightcoral'),
          colaborador: colaboradorNome,
          nPessoas: reserva.numero_pessoas,
          atividade: reserva.tipo_atividade,
          status: reserva.status,
        };
      });

      setEvents(eventos);
      setColaboradores(colaboradoresData);

      const currentMonthEvents = eventos.filter(event =>
        moment(event.start).isSame(moment(selectedDate), 'month')
      );
      setHasEvents(currentMonthEvents.length > 0);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      showNotification('Erro ao buscar dados.', 'error');
    }
  }, [apiUrl, selectedDate]);

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, [fetchData]);

  useEffect(() => {
    const currentMonthEvents = myEvents.filter(event =>
      moment(event.start).isSame(moment(selectedDate), 'month')
    );
    setHasEvents(currentMonthEvents.length > 0);
  }, [selectedDate, myEvents]);

  const handleSelectEvent = useCallback(
    (event) => {
      setSelectedEvent(event);
      setSelectedColaborador(event.colaborador || '');

      const eventosNoDia = myEvents.filter(evt =>
        moment(evt.start).isSame(event.start, 'day')
      );

      if (eventosNoDia.length > 0) {
        setModalIsOpen(true);
      }
    },
    [myEvents]
  );

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
    setConfirmChange(false);
  };

  const handleDropdownChange = (e) => {
    const colaboradorId = e.target.value;
    setSelectedColaborador(colaboradorId);
    if (selectedEvent && selectedEvent.colaborador !== colaboradorId) {
      setConfirmChange(true);
    } else {
      updateEvent(colaboradorId);
    }
  };

  const showNotification = (message, type) => {
    const id = new Date().getTime();
    setNotificacoes((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotificacoes((prev) => prev.filter(notif => notif.id !== id));
    }, 3000);
  };



  const updateEvent = async (colaboradorId) => {
    const colaborador = colaboradores.find(col => col.colaborador_id == colaboradorId);
    const corColaborador = colaborador ? colaborador.cor_colaborador : null; // Obtém a cor_colaborador, se existir

    const token = localStorage.getItem('token');

    const updatedEvent = {
      ...selectedEvent,
      colaborador: colaborador ? colaborador.nome_colaborador : '',
      color:corColaborador,
    };

   

    

    setEvents((prevEvents) =>
      prevEvents.map((evt) =>
        evt.id === selectedEvent.id ? updatedEvent : evt
      )
    );

    try {
      const existingAssignment = await fetch(`${apiUrl}/assign_colaborador/${selectedEvent.id}`, {
        method: 'GET', // Método GET
        headers: {
          'Authorization': `Bearer ${token}`, // Adiciona o token no cabeçalho Authorization
          'Content-Type': 'application/json' // Opcional, mas pode ser útil para indicar o tipo de conteúdo
        }
      });

      if (existingAssignment.ok) {
        const assignmentData = await existingAssignment.json();
        const response = await fetch(`${apiUrl}/assign_colaborador/${assignmentData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Adiciona o token no cabeçalho Authorization
          },
          body: JSON.stringify({
            reserva_id: selectedEvent.id,
            colaborador_id: colaboradorId,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar colaborador');
        }

      } else if (existingAssignment.status === 404) {
        const response = await fetch(`${apiUrl}/assign_colaborador`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Adiciona o token no cabeçalho Authorization
          },
          body: JSON.stringify({
            reserva_id: selectedEvent.id,
            colaborador_id: colaboradorId,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao atribuir colaborador');
        }
      }

      showNotification('Colaborador atribuído com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atribuir colaborador:', error);
      showNotification('Erro ao atribuir colaborador.', 'error');
    }

    handleCloseModal();
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color || 'lightgrey',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontFamily:'Inter'
        
        
      },
    };
  };



  
  return (
    <Fragment>
      <div className="mapa">
        <h1>Mapa de Reservas</h1>
        
<Calendar
        localizer={localizer}
        events={myEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 530, width:"93%" }}
        views={['month']}
        
        onSelectEvent={handleSelectEvent}
        components={{
          event: CustomEvent1,
          toolbar: (toolbarProps) => (
            <CustomToolbar toolbar={toolbarProps} setSelectedDate={setSelectedDate} hasEvents={hasEvents} 
            exportToExcel={exportToExcel}  />
          ),
          timeSlotWrapper: ColoredDateCellWrapper,
        }}
        view={view}
        eventPropGetter={eventStyleGetter}
        onView={(view) => setView(view)}
        onNavigate={(newDate) => setSelectedDate(newDate)}
        popup
        
        
      />


<Modal
  isOpen={modalIsOpen}
  onRequestClose={handleCloseModal}
  className="Modal"
  overlayClassName="Overlay"
>
  <button className="close-modal" onClick={handleCloseModal}>✖</button>
  <h2>{selectedEvent ? selectedEvent.title : ''}</h2>
  <p>Data: {selectedEvent ? moment(selectedEvent.start).format('DD/MM/YYYY') : ''}</p>
  <p>Hora: {selectedEvent ? moment(selectedEvent.start).format('HH:mm') : ''}</p>
  
  {/* Exibir número de pessoas e tipo de atividade */}
  <p>Número de Pessoas: {selectedEvent && selectedEvent.nPessoas ? selectedEvent.nPessoas : 'Não informado'}</p>
  <p>Tipo de Atividade: {selectedEvent && selectedEvent.atividade ? selectedEvent.atividade : 'Não informado'}</p>
  
  {/* Condicional para mostrar dropdown ou botão de atualização */}
  {selectedEvent && !selectedEvent.colaborador ? (
    <select
      className="collaborator-dropdown"
      onChange={handleDropdownChange}
      value={selectedColaborador}
    >
      <option value="">Selecione um colaborador</option>
      {colaboradores.map(colaborador => (
        <option key={colaborador.colaborador_id} value={colaborador.colaborador_id}>
          {colaborador.nome_colaborador}
        </option>
      ))}
    </select>
  ) : (
    <div>
      <p>Colaborador: {selectedEvent && selectedEvent.colaborador ? selectedEvent.colaborador : 'Nenhum colaborador associado'}</p>
      {!confirmChange && (
        <button className="confirm-button" onClick={() => setConfirmChange(true)}>
          Atualizar Colaborador
        </button>
      )}
      {confirmChange && (
        <select
          className="collaborator-dropdown"
          onChange={handleDropdownChange}
          value={selectedColaborador}
        >
          <option value="">Selecione um colaborador</option>
          {colaboradores.map(colaborador => (
            <option key={colaborador.colaborador_id} value={colaborador.colaborador_id}>
              {colaborador.nome_colaborador}
            </option>
          ))}
        </select>
      )}
    </div>
  )}

  {confirmChange && (
    <div>
      <p>Você tem certeza que deseja mudar o colaborador associado?</p>
      <button className="confirm-button" onClick={() => updateEvent(selectedColaborador)}>Confirmar Mudança</button>
    </div>
  )}
</Modal>

        <div className="colaboradores-list">
          {colaboradores.map((colaborador, index) => (
            <div key={colaborador.colaborador_id} style={{ backgroundColor: colaborador.cor_colaborador, padding: '10px', margin: '5px', borderRadius: '5px', color:"white",fontFamily:"Inter" }}>
              {colaborador.nome_colaborador}
            </div>
          ))}
        </div>

        <div className="notificacoes">
          {notificacoes.map((notif) => (
            <div key={notif.id} className={`notification ${notif.type}`}>
              {notif.message}
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default Mapa;
