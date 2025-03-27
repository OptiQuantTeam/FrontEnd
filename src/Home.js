import React from 'react';
import Typography from '@mui/material/Typography';

const Home = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '80vh',
      position: 'relative'  // 개발자 이름 위치 추가
    }}>
      {/* 헤더와 팀 이름 */}
      <div style={{
        textAlign: 'center',
        padding: '40px 0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h2" style={{
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          OptiQuant
        </Typography>
        <Typography variant="h4" style={{
          color: '#666',
          marginBottom: '20px'
        }}>
          OptiquantTeam
        </Typography>
      </div>

      {/* 개발자 이름 */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="subtitle1" style={{
          fontStyle: 'italic',
          color: '#666'
        }}>
          201901184 신승우
          202001645 양재혁
          202001505 문현준
        </Typography>
      </div>
    </div>
  );
};

export default Home;
