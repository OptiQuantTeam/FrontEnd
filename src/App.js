import { BrowserRouter, NavLink, Switch, Route} from "react-router-dom";
import Home from "./Home";
import Register from "./Register";
import Login from "./Login";
import Content from "./Content";
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";
import React, { useState, useEffect } from "react";
import { getUser, getToken, setUserSession, resetUserSession } from "./service/AuthService";
import axios from 'axios';

const verifyTokenUrl = process.env.REACT_APP_verifyTokenUrl;

function App() {
  const [isAuthenicating, setAuthenicating] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token === 'undefined' || token === undefined || token === null || !token) {
      return;
    }
    const requestConfig = {
      headers: {
        'x-api-key': process.env.REACT_APP_x_api_key
      }
    }
    const requestBody = {
      user: getUser(),
      token: getToken()
    }

    axios.post(verifyTokenUrl, requestBody, requestConfig).then(response => {
      setUserSession(response.data.user, response.data.token);
      setAuthenicating(false);
    }).catch(()=>{
      resetUserSession();
      setAuthenicating(false);
    })
  }, []);

  const token = getToken();
  if (isAuthenicating && token) {
    return <div className="content">Authenicating...</div>
  }
  return (
    <div className="App">
      <BrowserRouter>
        <div className="header">
          <NavLink exact activeClassName="active" to="/">Home</NavLink>
          <NavLink activeClassName="active" to="/register">Register</NavLink>
          <NavLink activeClassName="active" to="/login">Login</NavLink>
          <NavLink activeClassName="active" to="/content">Content</NavLink>
        </div>
        <div className="content">
          <Switch>
            <Route exact path="/" component={Home}/>
            <PublicRoute exact path="/register" component={Register}/>
            <PublicRoute exact path="/login" component={Login}/>
            <PrivateRoute exact path="/content" component={Content}/>
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
