import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // 스타일 파일 임포트

const registerUrl = process.env.REACT_APP_registerUrl;

const Register = () => {
  const [ID, setID] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitHandler = (event) => {
    event.preventDefault();
    if (ID.trim() === '' || email.trim() === '' || name.trim() === '' || password.trim() === '') {
      setMessage('All fields are required');
      setIsSuccess(false);
      return;
    }
    setMessage(null);

    const requestConfig = {
      headers: {
        'x-api-key': process.env.REACT_APP_x_api_key
      }
    };
    const requestBody = {
      user_id: ID,
      email: email,
      name: name,
      password: password
    };

    axios.post(registerUrl, requestBody, requestConfig)
      .then(response => {
        setMessage('Registration Successful 🎉');
        setIsSuccess(true);
      })
      .catch(error => {
        if (error.response?.status === 401) {
          setMessage(error.response.data.message);
        } else {
          setMessage('Sorry... the backend server is down! Please try again later.');
        }
        setIsSuccess(false);
      });
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={submitHandler}>
        <h2>Register</h2>
        <div className="input-group">
          <label>ID:</label>
          <input type="text" value={ID} onChange={event => setID(event.target.value)} />
        </div>
        <div className="input-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={event => setEmail(event.target.value)} />
        </div>
        <div className="input-group">
          <label>Name:</label>
          <input type="text" value={name} onChange={event => setName(event.target.value)} />
        </div>
        <div className="input-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} />
        </div>
        <button type="submit" className="register-btn">Register</button>
      </form>
      {message && (
        <p className={`message ${isSuccess ? 'success' : 'error'}`}>{message}</p>
      )}
    </div>
  );
};

export default Register;
