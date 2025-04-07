import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

const ContractList = ({ contractList }) => {
  if (!contractList) return null;

  const contractData = contractList.data || [];

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // 시간 역순으로 정렬
  const sortedData = [...contractData].sort((a, b) => b.time - a.time);

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
      <Table stickyHeader sx={{ minWidth: 650 }} aria-label="contract table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Time</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Symbol</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Side</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Price</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Quantity</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Total</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>PnL</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Commission</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow 
              key={row.id}
              sx={{ 
                '&:hover': { 
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer'
                }
              }}
            >
              <TableCell>{formatDate(row.time)}</TableCell>
              <TableCell>{row.symbol}</TableCell>
              <TableCell>
                <Chip 
                  label={row.side}
                  size="small"
                  sx={{
                    backgroundColor: row.side === 'BUY' ? '#e8f5e9' : '#ffebee',
                    color: row.side === 'BUY' ? '#2e7d32' : '#d32f2f',
                    fontWeight: 'bold'
                  }}
                />
              </TableCell>
              <TableCell align="right">{parseFloat(row.price).toFixed(2)}</TableCell>
              <TableCell align="right">{parseFloat(row.qty).toFixed(3)}</TableCell>
              <TableCell align="right">{parseFloat(row.quoteQty).toFixed(2)}</TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  color: parseFloat(row.realizedPnl) > 0 ? '#2e7d32' : 
                         parseFloat(row.realizedPnl) < 0 ? '#d32f2f' : '#666',
                  fontWeight: 'bold'
                }}
              >
                {parseFloat(row.realizedPnl).toFixed(8)}
              </TableCell>
              <TableCell align="right">
                {parseFloat(row.commission).toFixed(8)} {row.commissionAsset}
              </TableCell>
              <TableCell>
                <Chip 
                  label={row.maker ? 'MAKER' : 'TAKER'}
                  size="small"
                  sx={{
                    backgroundColor: row.maker ? '#e3f2fd' : '#f3e5f5',
                    color: row.maker ? '#1976d2' : '#7b1fa2',
                    fontWeight: 'bold'
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContractList;