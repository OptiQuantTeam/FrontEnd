import React, { useState } from 'react';
import axios from 'axios';
import { setUserSession } from './service/AuthService';
import './Login.css'; // 스타일 파일 임포트

const loginUrl = process.env.REACT_APP_loginUrl;

const Login = (props) => {
  const [ID, setID] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const submitHandler = (event) => {
    event.preventDefault();
    if (ID.trim() === '' || password.trim() === '') {
      setErrorMessage('Both ID and password are required');
      return;
    }
    setErrorMessage(null);

    const requestConfig = {
      headers: {
        'x-api-key': process.env.REACT_APP_x_api_key
      }
    };
    const requestBody = {
      user_id: ID,
      password: password
    };

    axios.post(loginUrl, requestBody, requestConfig)
      .then((response) => {
        setUserSession(response.data.user, response.data.token);
        props.history.push('/content');
      })
      .catch((error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage('Sorry... the backend server is down. Please try again later.');
        }
      });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={submitHandler}>
        <h2>Login</h2>
        <div className="input-group">
          <label>ID:</label>
          <input type="text" value={ID} onChange={event => setID(event.target.value)} />
        </div>
        <div className="input-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} />
        </div>
        <button type="submit" className="login-btn">Login</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Login;
