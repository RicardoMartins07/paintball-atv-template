import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import './Estatisticas.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar os componentes
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Estatisticas = () => {
  const [totalReservas, setTotalReservas] = useState(0);
  const [mesMaisReservas, setMesMaisReservas] = useState('');
  const [mediaReservasMensal, setMediaReservasMensal] = useState(0);
  const [reservasPorMes, setReservasPorMes] = useState([]);
  const [reservasPorAtividade, setReservasPorAtividade] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Array de nomes dos meses
  const nomesMeses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const nomesMesesCompleto = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Fetch statistics data from API
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`${apiUrl}/estatisticas`, {
          method: 'GET', // Método GET
          headers: {
            'Authorization': `Bearer ${token}`, // Adiciona o token no cabeçalho Authorization
            'Content-Type': 'application/json' // Opcional, mas pode ser útil para indicar o tipo de conteúdo
          }
        });
        const data = await response.json();

        setTotalReservas(data.total_reservas);

        const mesIndex = data.mes_mais_reservas - 1; // Subtrai 1 para obter o índice correto
        setMesMaisReservas(nomesMesesCompleto[mesIndex] || 'Mês desconhecido');

        setMediaReservasMensal(data.media_reservas_mensal);
        setReservasPorMes(data.reservas_por_mes);
        setReservasPorAtividade(data.reservas_por_atividade);
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
      }
    };

    fetchData();
  }, []);

  // Data for bar chart (Reservas por Mês)
  const barData = {
    labels: nomesMeses,
    datasets: [
      {
        label: 'Reservas por Mês',
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
        hoverBorderColor: 'rgba(75, 192, 192, 1)',
        data: reservasPorMes,
      },
    ],
  };

  // Data for pie chart (Reservas por Atividade)
  const pieData = {
    labels: reservasPorAtividade.map(item => item.tipo_atividade),
    datasets: [
      {
        data: reservasPorAtividade.map(item => item.total_por_atividade),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  return (
    <div className="statistics-section">
      <h1>Estatisticas</h1>
      {/* Cards Section */}
      <div className="cards">
        <div className="card">
          <h3>Total de Reservas</h3>
          <p>{totalReservas}</p>
        </div>
        <div className="card">
          <h3>Mês com mais Reservas</h3>
          <p>{mesMaisReservas}</p>
        </div>
        <div className="card">
          <h3>Média de Reservas Mensal</h3>
          <p>{mediaReservasMensal}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts">
        <div className="chart-container">
          <h2 className='chart-title'>Reservas por Mês</h2>
          <Bar data={barData} />
        </div>
        <div className="chart-container">
          <h2 className='chart-title'>Reservas por tipo de atividade</h2>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
};

export default Estatisticas;
