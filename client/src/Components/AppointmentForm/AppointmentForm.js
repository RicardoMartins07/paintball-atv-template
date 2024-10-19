import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AppointmentForm.css';
import { ptBR } from 'date-fns/locale';
import { registerLocale } from 'react-datepicker';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

registerLocale('pt-BR', ptBR);
Modal.setAppElement('#root'); // Certifica-te que este ID está correto

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success'); 
  const [selectedService, setSelectedService] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSubmit = async (e) => {

    
    e.preventDefault();

    // Regex para validar nome (apenas letras e espaços)
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

    // Regex para validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validação de telemóvel (apenas dígitos e 9 caracteres)
    const phoneRegex = /^[0-9]{9}$/;

    // Validação de número de pessoas (deve ser um número entre 1 e 20, por exemplo)
    const numberOfPeopleValid = numberOfPeople >= 1 && numberOfPeople <= 20;

    // Validação de campos obrigatórios
    if (!name || !email || !phone || !numberOfPeople || !selectedDate || !timeSlot || !selectedService) {
        const missingFields = [];

        if (!name) missingFields.push('Nome');
        if (!email) missingFields.push('Email');
        if (!phone) missingFields.push('Telemóvel');
        if (!numberOfPeople) missingFields.push('Número de pessoas');
        if (!selectedDate) missingFields.push('Data');
        if (!timeSlot) missingFields.push('Hora');
        if (!selectedService) missingFields.push('Serviço');

        setModalMessage(`Os seguintes campos são obrigatórios: ${missingFields.join(', ')}.`);
        setModalType('error');
        setModalIsOpen(true);
        setTimeout(() => {
            closeModal();
        }, 5000);
        return;
    }

    // Validação do nome
    if (!nameRegex.test(name)) {
        setModalMessage('Nome inválido. Por favor, use apenas letras e espaços.');
        setModalType('error');
        setModalIsOpen(true);
        setTimeout(() => {
            closeModal();
        }, 5000);
        return;
    }

    // Validação do email
    if (!emailRegex.test(email)) {
        setModalMessage('Email inválido. Por favor, insira um email válido.');
        setModalType('error');
        setModalIsOpen(true);
        setTimeout(() => {
            closeModal();
        }, 5000);
        return;
    }

    // Validação do telemóvel
    if (!phoneRegex.test(phone)) {
        setModalMessage('Telemóvel inválido. Deve conter apenas 9 dígitos.');
        setModalType('error');
        setModalIsOpen(true);
        setTimeout(() => {
            closeModal();
        }, 5000);
        return;
    }

    // Validação do número de pessoas
    if (!numberOfPeopleValid) {
        setModalMessage('Número de pessoas inválido. Deve ser um número entre 1 e 20.');
        setModalType('error');
        setModalIsOpen(true);
        setTimeout(() => {
            closeModal();
        }, 5000);
        return;
    }

    const appointmentData = {
        name,
        email,
        phone,
        numberOfPeople,
        date: selectedDate,
        time: timeSlot,
        service: selectedService,
        role:'client'
    };

    
    

    try {
        const response = await fetch(`${apiUrl}/reservas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData),
        });

        if (!response.ok) {
            throw new Error('Erro ao fazer a reserva');
        }

        setModalMessage('A sua reserva foi efetuada com sucesso!');
        setModalType('success');
        setModalIsOpen(true);

        // Limpar os dados do formulário
        setName('');
        setEmail('');
        setPhone('');
        setNumberOfPeople('');
        setSelectedDate(null);
        setTimeSlot('');
        setSelectedService('');

        // Redirecionar para a página principal após 5 segundos
        setTimeout(() => {
            closeModal();
            navigate('/');
        }, 5000);

    } catch (error) {
        console.error('Erro:', error);
        setModalMessage('Ocorreu um erro ao efetuar a reserva.');
        setModalType('error');
        setModalIsOpen(true);

        setTimeout(() => {
            closeModal();
        }, 5000);
    }
};

const handleDateChange = (date) => {
  if (date) {
    // Obtém a data no formato "dd/MM/yyyy"
    const formattedDate = date.toLocaleDateString('pt-BR');
    setSelectedDate(formattedDate);
  } else {
    setSelectedDate(null);
  }
};


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

  const services = [
    { id: 1, name: 'Paintball', description: 'Experiência de Paintball emocionante.' },
    { id: 2, name: 'Moto4', description: 'Aventura em Moto4 por trilhos incríveis.' },
    { id: 3, name: 'Paintball + Moto4', description: 'Combinação de Paintball e Moto4.' },
  ];

  return (
    <div>
      <form onSubmit={handleSubmit} className="appointment-form">
        <h2>Faça a sua Reserva</h2>

        <div className="form-group">
          <label>Nome:</label>
          <input className="form-control" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Email:</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group half">
            <label>Telemóvel:</label>
            <input type="tel" className="form-control" value={phone} onChange={(e) => {
                const value = e.target.value;

                // Verifica se o valor contém apenas números e tem até 9 dígitos
                if (/^\d*$/.test(value) && value.length <= 9) {
                  setPhone(value);
                }
              }} required maxLength={9} minLength={9} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Nº de pessoas:</label>
            <input type="number" className="form-control" min="1" max="20" value={numberOfPeople} onChange={(e) => setNumberOfPeople(e.target.value)} required />
          </div>
          <div className="form-group half">
            <label>Dia:</label>
                    <DatePicker
                selected={selectedDate ? new Date(selectedDate.split('/').reverse().join('-')) : null} // Converte a string de volta para Date
                onChange={handleDateChange}
                className="form-control"
                dateFormat="dd/MM/yyyy"
                placeholderText="Escolha o dia"
                locale="pt-BR"
                filterDate={(date) => date.getDay() === 6 || date.getDay() === 0}
                minDate={new Date()}
                required
              />
          </div>
        </div>

        <div className="form-group">
          <label>Hora:</label>
          <div className="time-slots">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                className={`time-slot ${timeSlot === time ? 'selected' : ''}`}
                onClick={() => setTimeSlot(time)}
                required
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Serviço:</label>
          <div className="service-cards">
            {services.map((service) => (
              <div
                key={service.id}
                className={`service-card ${selectedService === service.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(service.id)}
                required
              >
                <h3>{service.name}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-submit">
          Reservar
        </button>
      </form>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className={`modal-content ${modalType === 'success' ? 'modal-success' : 'modal-error'}`}
        overlayClassName="modal-overlay"
      >
        <h2>{modalMessage}</h2>
        {modalType === 'success' && (
          <p>Em breve será contactado pela equipa para gerir informações adicionais da reserva.</p>
        )}
        
      </Modal>
    </div>
  );
};

export default AppointmentForm;
