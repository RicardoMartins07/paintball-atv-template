const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Importando cors
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');


const app = express();
const port = process.env.PORT || 5000;

// Limitar tentativas de login a 5 por minuto
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // Máximo de 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 1 minuto.',
});


// Configuração da Pool de Conexão com o PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432, // Porta padrão do PostgreSQL
});

// Middleware para permitir CORS
app.use(cors({
  origin: 'YOUR_ORIGIN_REQUESTS', // Permitir apenas solicitações do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
}));

// Middleware para parsear JSON
app.use(express.json());

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // O token deve ser enviado no cabeçalho Authorization como "Bearer <token>"

  if (!token) {
    return res.sendStatus(401); // Não autorizado
  }

  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) {
      return res.sendStatus(403); // Proibido
    }
    req.user = user; // Armazena informações do usuário na requisição
    next(); // Chama a próxima função middleware
  });
};


// Rota para lidar com login
app.post('/login', loginLimiter,async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar se o usuário existe no banco de dados
    const result = await pool.query(
      'SELECT user_id, email, password_hash FROM users WHERE email = $1 OR username = $1', 
      [email]
    );

    // Se não encontrar o usuário
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
    }

    const user = result.rows[0];

    // Comparar a senha fornecida com a senha armazenada (hash)
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Senha incorreta' });
    }

    // Gerar um token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, 'secretKey', { expiresIn: '1h' });

    // Responder com sucesso e enviar o token
    res.json({ success: true, message: 'Login bem-sucedido!', token });

  } catch (error) {
    console.error('Erro ao tentar efetuar login:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});


// Rota para obter todas as reservas
app.get('/reservas',authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservas');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter reservas');
  }
});

// Rota para adicionar uma nova reserva
app.post('/reservas', async (req, res) => {


    if (req.body.role === 'admin') {
        
        
        let { nome_cliente, phone, nPessoas, data_reserva, hora_reserva, atividade } = req.body;

        console.log(data_reserva)
    
        
        switch (atividade) {
            case '1':
                atividade = 'Paintball';
                break;
            case '2':
                atividade = 'Moto4';
                break;
            case '3':
                atividade = 'Paintball + Moto4';
                break;
            default:
                atividade = 'Atividade desconhecida'; // Pode personalizar ou lançar erro, conforme o caso
        }
    
        // Validações (omitas para brevidade)
        // ...
    
        try {
            const query = `
                INSERT INTO reservas (nome_cliente, email_cliente, telefone_cliente, numero_pessoas, data_reserva, hora_reserva, tipo_atividade)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
            `;
            const values = [nome_cliente, 'Admin', phone, nPessoas, data_reserva, hora_reserva, atividade];
    
            const result = await pool.query(query, values);
    
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao criar reserva');
        }
    }
    
    else{
        let { name, email, phone, numberOfPeople, date, time, service} = req.body;
        
        switch (service) {
            case 1:
                service = 'Paintball';
                break;
            case 2:
                service = 'Moto4';
                break;
            case 3:
                service = 'Paintball + Moto4';
                break;
            default:
                service = 'Atividade desconhecida'; // Pode personalizar ou lançar erro, conforme o caso
        }

        // Validações (omitas para brevidade)
        // ...
      
        try {
          const query = `
            INSERT INTO reservas (nome_cliente, email_cliente, telefone_cliente, numero_pessoas, data_reserva, hora_reserva, tipo_atividade)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
          `;
          const values = [name, email, phone, numberOfPeople, date, time, service];
          const result = await pool.query(query, values);
      
          res.status(201).json(result.rows[0]);
        } catch (err) {
          console.error(err);
          res.status(500).send('Erro ao criar reserva');
        }
    }
  
});

// Rota para atualizar o status da reserva
app.put('/reservas/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query('UPDATE reservas SET status = $1 WHERE reserva_id = $2 RETURNING *', [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reserva não encontrada' });
    }

    res.json(result.rows[0]); // Retorna a reserva atualizada
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar a reserva' });
  }
});

// Rota para eliminar a reserva
app.delete('/reservas/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM reservas WHERE reserva_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reserva não encontrada' });
    }

    res.json({ message: 'Reserva eliminada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao eliminar a reserva' });
  }
});

// Rota para obter todos os colaboradores
app.get('/colaboradores',authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM colaboradores');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter colaboradores');
  }
});

// Rota para adicionar um novo colaborador
app.post('/colaboradores',authenticateToken, async (req, res) => {
  const { nome_colaborador, telefone_colaborador, email_colaborador, cor_colaborador } = req.body;

  // Validações simples
  if (!nome_colaborador || !telefone_colaborador || !email_colaborador) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO colaboradores (nome_colaborador, telefone_colaborador, email_colaborador,cor_colaborador)
      VALUES ($1, $2, $3,$4)
      RETURNING *;
    `;
    const values = [nome_colaborador, telefone_colaborador, email_colaborador,cor_colaborador];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar colaborador');
  }
});

// Rota para atualizar um colaborador
app.put('/colaboradores/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { nome_colaborador, telefone_colaborador, email_colaborador,cor_colaborador } = req.body;
  
    // Verificações simples
    if (!nome_colaborador || nome_colaborador.trim() === '') {
      return res.status(400).json({ message: 'O nome do colaborador é obrigatório.' });
    }
  
    if (!telefone_colaborador || telefone_colaborador.trim() === '') {
      return res.status(400).json({ message: 'O telefone do colaborador é obrigatório.' });
    }
  
    if (!email_colaborador || email_colaborador.trim() === '') {
      return res.status(400).json({ message: 'O email do colaborador é obrigatório.' });
    }
  
    // Verifica se o telefone tem 9 dígitos
    if (!/^\d{9}$/.test(telefone_colaborador)) {
      return res.status(400).json({ message: 'O telefone deve conter exatamente 9 dígitos.' });
    }
  
    // Verifica se o email é válido
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email_colaborador)) {
      return res.status(400).json({ message: 'O email deve ser válido.' });
    }

    
  
    try {
      const result = await pool.query(
        'UPDATE colaboradores SET nome_colaborador = $1, telefone_colaborador = $2, email_colaborador = $3 , cor_colaborador=$4 WHERE colaborador_id = $5 RETURNING *',
        [nome_colaborador, telefone_colaborador, email_colaborador,cor_colaborador, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Colaborador não encontrado' });
      }
  
      res.json(result.rows[0]); // Retorna o colaborador atualizado
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar o colaborador' });
    }
});
  
// Rota para eliminar um colaborador
app.delete('/colaboradores/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM colaboradores WHERE colaborador_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Colaborador não encontrado' });
    }

    res.json({ message: 'Colaborador eliminado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao eliminar o colaborador' });
  }
});

// Atribuir colaborador a uma reserva
app.post('/assign_colaborador',authenticateToken, async (req, res) => {
    const { reserva_id, colaborador_id } = req.body;

    // Data de atribuição como a data atual
    const assign_date = new Date();

    

    try {
      // Query para inserir a atribuição
      const insertQuery = `
        INSERT INTO assign_colaborador (reserva_id, colaborador_id, assign_date)
        VALUES ($1, $2, $3) RETURNING *;
      `;
      const values = [reserva_id, colaborador_id, assign_date];

      const insertResult = await pool.query(insertQuery, values); // Use pool ao invés de client
      
      res.status(201).json(insertResult.rows[0]);
    } catch (error) {
      console.error('Erro ao atribuir colaborador:', error);
      res.status(500).json({ error: 'Erro ao atribuir colaborador' });
    }
});

app.get('/assign_colaborador',authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM assign_colaborador');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro ao obter eventos de colaboradores');
    }
  });


 // Rota para obter estatísticas
app.get('/estatisticas',authenticateToken, async (req, res) => {
    const query = `
        WITH reservas_confirmadas AS (
    SELECT 
        EXTRACT(MONTH FROM data_reserva) AS mes_reserva,
        tipo_atividade
    FROM 
        reservas
    WHERE 
        status = 'Confirmado'
),

reservas_por_mes AS (
    SELECT 
        mes_reserva,
        COUNT(*) AS total_reservas
    FROM 
        reservas_confirmadas
    GROUP BY 
        mes_reserva
),

reservas_por_atividade AS (
    SELECT 
        tipo_atividade,
        COUNT(*) AS total_por_atividade
    FROM 
        reservas_confirmadas
    GROUP BY 
        tipo_atividade
)

SELECT 
    (SELECT COUNT(*) FROM reservas_confirmadas) AS total_reservas,
    (SELECT mes_reserva FROM reservas_por_mes ORDER BY total_reservas DESC LIMIT 1) AS mes_mais_reservas,
    (SELECT ROUND(AVG(total_reservas)) FROM reservas_por_mes) AS media_reservas_mensal,
    (
        SELECT ARRAY_AGG(COALESCE(total_reservas, 0) ORDER BY mes)
        FROM (
            SELECT 
                gs.mes, 
                COALESCE(rpm.total_reservas, 0) AS total_reservas
            FROM 
                generate_series(1, 12) AS gs(mes)  -- Gera os meses de 1 a 12
            LEFT JOIN 
                reservas_por_mes rpm ON rpm.mes_reserva = gs.mes  -- Junção à esquerda para incluir meses sem reservas
        ) AS meses
    ) AS reservas_por_mes,
    (SELECT json_agg(row_to_json(reservas_por_atividade)) FROM reservas_por_atividade) AS reservas_por_atividade
FROM 
    reservas_confirmadas
LIMIT 1;
    `;

    try {
        const result = await pool.query(query);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]); // Retorna os dados da consulta
        } else {
            res.status(404).send('Nenhum dado encontrado');
        }
    } catch (error) {
        console.error('Erro ao executar a query', error);
        res.status(500).send('Erro ao obter dados');
    }
});



// Rota para buscar colaborador atribuído por ID de reserva
app.get('/assign_colaborador/:id',authenticateToken, async (req, res) => {
    const reservaId = parseInt(req.params.id);
    
    try {
      const result = await pool.query('SELECT * FROM assign_colaborador WHERE reserva_id = $1', [reservaId]);
      
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
        
      } else {
        
        res.status(404).json({ message: 'Atribuição não encontrada' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar atribuição', error });
    }
  });
  
  // Rota para atualizar colaborador atribuído
  app.put('/assign_colaborador/:id',authenticateToken, async (req, res) => {
    const reservaId = parseInt(req.params.id);
    const { colaborador_id } = req.body;

    
  
   

    try {
      const result = await pool.query(
        'UPDATE assign_colaborador SET colaborador_id = $1 WHERE id = $2 RETURNING *',
        [colaborador_id, reservaId]
      );
  
      if (result.rows.length > 0) {
        
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ message: 'Atribuição não encontrada' });
      }
    } catch (error) {
      
      res.status(500).json({ message: 'Erro ao atualizar atribuição', error });
    }
  });

  

// Inicializar o servidor
app.listen(port, () => {
  console.log(`Servidor a correr em http://localhost:${port}`);
});
