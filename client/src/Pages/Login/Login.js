import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom'; // Importa o useNavigate

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;
  
  

const navigate = useNavigate(); // Inicializa o useNavigate

const sanitizeInput = (input) => {
    return input.replace(/[<>/'";]/g, ''); // Remove caracteres perigosos que podem ser usados para XSS ou SQL Injection
  };
  
  const handleLogin = (e) => {
    e.preventDefault();
  
    // Simple Frontend Validation
    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos');
      return;
    }
  
    // Basic email format check (if email is used instead of username)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.includes('@') && !emailRegex.test(email)) {
      setErrorMessage('Por favor, insira um email válido');
      return;
    }
  
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
  
    // Limite de tamanho para evitar abuso
    if (sanitizedEmail.length > 100 || sanitizedPassword.length > 100) {
      setErrorMessage('Os campos excedem o tamanho máximo permitido.');
      return;
    }
  
    // Clear error message
    setErrorMessage('');
  
    // Data to send to the backend
    const loginData = { email: sanitizedEmail, password: sanitizedPassword };
  
    // Fetch request to the backend
    fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
            // Login bem-sucedido, armazena o token e a hora de expiração no localStorage
            const token = data.token;
            
            // Extrai a data de expiração a partir do token JWT
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = tokenPayload.exp * 1000; // Multiplicado por 1000 para converter em milissegundos
        
            localStorage.setItem('token', token);
            localStorage.setItem('tokenExpiration', expirationTime);
            
            // Redireciona o usuário
            navigate('/dash');
          } else {
            setErrorMessage(data.message || 'Credenciais inválidas');
          }
      })
      .catch((error) => {
        setErrorMessage('Erro ao tentar fazer login. Tente novamente.');
        console.error('Erro:', error);
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Logo</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email/Username"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
