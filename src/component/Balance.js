import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const Balance = ({ balanceList }) => {
  if (!balanceList) return null;

  const balanceData = balanceList.data || [];

  const formatDate = (timestamp) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-';
  };

  // 시간 역순으로 정렬
  const sortedData = [...balanceData].sort((a, b) => b.updateTime - a.updateTime);

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        boxShadow: 'none',
        maxHeight: '70vh',
        '& .MuiTable-root': {
          borderCollapse: 'separate',
          borderSpacing: '0 8px'
        },
        '&::-webkit-scrollbar': {
          width: '10px'
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '5px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '5px',
          '&:hover': {
            background: '#555'
          }
        }
      }}
    >
      <Table stickyHeader sx={{ minWidth: 650 }} aria-label="balance table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Asset</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Balance</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Available</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Max Withdraw</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Cross UnPnl</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Last Update</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow 
              key={`${row.asset}-${index}`}
              sx={{ 
                '&:hover': { 
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer'
                },
                // 잔액이 0이 아닌 행은 강조
                backgroundColor: parseFloat(row.balance) > 0 ? '#f8f9fa' : 'inherit'
              }}
            >
              <TableCell sx={{ fontWeight: 'bold' }}>{row.asset}</TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  color: parseFloat(row.balance) > 0 ? '#2e7d32' : '#666',
                  fontWeight: 'bold'
                }}
              >
                {parseFloat(row.balance).toFixed(8)}
              </TableCell>
              <TableCell align="right">{parseFloat(row.availableBalance).toFixed(8)}</TableCell>
              <TableCell align="right">{parseFloat(row.maxWithdrawAmount).toFixed(8)}</TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  color: parseFloat(row.crossUnPnl) > 0 ? '#2e7d32' : 
                         parseFloat(row.crossUnPnl) < 0 ? '#d32f2f' : '#666'
                }}
              >
                {parseFloat(row.crossUnPnl).toFixed(8)}
              </TableCell>
              <TableCell>{formatDate(row.updateTime)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Balance; 