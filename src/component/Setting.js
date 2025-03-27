import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { getToken, getUser } from '../service/AuthService';
import axios from 'axios';
import { useState} from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const contentUrl = process.env.REACT_APP_contentUrl;

const Setting = (props) => {
  

  const [USER, setUSER] = useState({
    'id': props.setting.user.user_id || '',
    'name': props.setting.user.name || '',
    'email': props.setting.user.email || ''
  });

  const [BINANCE, setBINANCE] = useState({
    'api_key': props.setting.user.api_key || '',
    'secret_key': props.setting.user.secret_key || '',
    'type': props.setting.user.type || '',
    'leverage': props.setting.user.leverage || '',
    'sl': props.setting.user.sl || '',
    'tp': props.setting.user.tp || '',
    'ratio': props.setting.user.ratio || ''
  });
            
  const [SLACK, setSLACK] = useState({
    'channel': props.setting.user.slack_channel || '',
    'token': props.setting.user.slack_token || '',
    'user': props.setting.user.slack_user || ''
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showSlackToken, setShowSlackToken] = useState(false);

  
  const storeHandler = () => {
    const requestConfig = {
      headers: {
        'x-api-key': process.env.REACT_APP_x_api_key
      }
    }
    const requestBody = {
      user_id: getUser().user_id,
      token: getToken() ,
      type: 'updateSetting',
      data: {
        "name": USER.name,
        "email": USER.email,
        "api_key": BINANCE.api_key,
        "secret_key": BINANCE.secret_key,
        "type": BINANCE.type,
        "leverage": BINANCE.leverage,
        "sl": BINANCE.sl,
        "tp": BINANCE.tp,
        "ratio": BINANCE.ratio,
        "slack_channel": SLACK.channel,
        "slack_token": SLACK.token,
        "slack_user": SLACK.user
      }
    }
    
    axios.post(contentUrl, requestBody, requestConfig).then(response => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Setting</h2>
      
      {/* BINANCE 필드들 */}
      {props.type === 'BINANCE' && (
        <>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <TextField 
              fullWidth
              id="standard-basic" 
              label="api_key" 
              variant="standard" 
              type={showApiKey ? 'text' : 'password'}
              value={BINANCE.api_key} 
              onChange={(e) => setBINANCE({...BINANCE, api_key: e.target.value})}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle api key visibility"
                      onClick={() => setShowApiKey(!showApiKey)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showApiKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField 
              fullWidth
              id="standard-basic" 
              label="secret_key" 
              variant="standard" 
              type={showSecretKey ? 'text' : 'password'}
              value={BINANCE.secret_key} 
              onChange={(e) => setBINANCE({...BINANCE, secret_key: e.target.value})}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle secret key visibility"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showSecretKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <FormControl variant="standard" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={BINANCE.type}
                onChange={(e) => setBINANCE({...BINANCE, type: e.target.value})}
              >
                <MenuItem value="MARKET">MARKET</MenuItem>
                <MenuItem value="LIMIT">LIMIT</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl variant="standard" fullWidth>
              <InputLabel>Leverage</InputLabel>
              <Select
                value={BINANCE.leverage}
                onChange={(e) => setBINANCE({...BINANCE, leverage: e.target.value})}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflow: 'auto'
                    }
                  }
                }}
              >
                {[...Array(10)].map((_, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <InputLabel>SL (%)</InputLabel>
              <Select
                value={BINANCE.sl}
                onChange={(e) => setBINANCE({...BINANCE, sl: e.target.value})}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflow: 'auto'
                    }
                  }
                }}
              >
                {[...Array(100)].map((_, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <InputLabel>TP (%)</InputLabel>
              <Select
                value={BINANCE.tp}
                onChange={(e) => setBINANCE({...BINANCE, tp: e.target.value})}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflow: 'auto'
                    }
                  }
                }}
              >
                {[...Array(100)].map((_, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <InputLabel>Ratio (%)</InputLabel>
              <Select
                value={BINANCE.ratio}
                onChange={(e) => setBINANCE({...BINANCE, ratio: e.target.value})}
              >
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={75}>75</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </div>
        </>
      )}

      {/* USER 필드들*/}
      {props.type === 'USER' && (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <TextField id="standard-basic" label="user_id" variant="standard" 
            value={USER.id} onChange={(e) => setUSER({...USER, id: e.target.value})} />
          <TextField id="standard-basic" label="name" variant="standard" 
            value={USER.name} onChange={(e) => setUSER({...USER, name: e.target.value})} />
          <TextField id="standard-basic" label="email" variant="standard" 
            value={USER.email} onChange={(e) => setUSER({...USER, email: e.target.value})} />
        </div>
      )}

      {/* SLACK 필드들*/}
      {props.type === 'SLACK' && (
        <>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <TextField 
              id="standard-basic" 
              label="slack_channel" 
              variant="standard" 
              value={SLACK.channel} 
              onChange={(e) => setSLACK({...SLACK, channel: e.target.value})} 
            />
            <TextField 
              id="standard-basic" 
              label="slack_user" 
              variant="standard" 
              value={SLACK.user} 
              onChange={(e) => setSLACK({...SLACK, user: e.target.value})} 
            />
          </div>

          <div style={{ 
            marginBottom: '20px'
          }}>
            <TextField 
              fullWidth
              id="standard-basic" 
              label="slack_token" 
              variant="standard" 
              type={showSlackToken ? 'text' : 'password'}
              value={SLACK.token} 
              onChange={(e) => setSLACK({...SLACK, token: e.target.value})}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle slack token visibility"
                      onClick={() => setShowSlackToken(!showSlackToken)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showSlackToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </>
      )}

      <Button variant="contained" onClick={storeHandler}>Store</Button>
    </div>
  );
};

export default Setting;