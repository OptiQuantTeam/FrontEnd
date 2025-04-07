import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
// npm install chart.js react-chartjs-2
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Income = ({ incomeList }) => {
  if (!incomeList) return null;

  const incomeData = incomeList.data || [];

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // 그래프용 시간순 정렬 및 누적 수익 계산
  const chartSortedData = [...incomeData]
    .sort((a, b) => a.time - b.time);
  
  let accumulator = 0;
  const chartData = {
    labels: chartSortedData.map(item => formatDate(item.time)),
    datasets: [
      {
        label: 'Individual Income',
        data: chartSortedData.map(item => parseFloat(item.income)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Accumulated Income',
        data: chartSortedData.map(item => {
          accumulator += parseFloat(item.income);
          return accumulator;
        }),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      }
    ]
  };

  // 테이블용 최신순 정렬
  const tableSortedData = [...incomeData]
    .sort((a, b) => b.time - a.time);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Income History'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw.toFixed(8)} USDT`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Individual Income (USDT)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Accumulated Income (USDT)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    }
  };

  return (
    <Box>
      {/* 차트 */}
      <Paper sx={{ p: 2, mb: 3, height: '400px' }}>
        <Line 
          options={chartOptions} 
          data={chartData} 
        />
      </Paper>

      {/* 테이블 */}
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
        <Table stickyHeader sx={{ minWidth: 650 }} aria-label="income table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Symbol</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Type</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Income</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Asset</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Info</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'white' }}>Trade ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableSortedData.map((row, index) => (
              <TableRow 
                key={`${row.tranId}-${index}`}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                  }
                }}
              >
                <TableCell>{formatDate(row.time)}</TableCell>
                <TableCell>{row.symbol || '-'}</TableCell>
                <TableCell>{row.incomeType}</TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    color: parseFloat(row.income) >= 0 ? '#2e7d32' : '#d32f2f',
                    fontWeight: 'bold'
                  }}
                >
                  {row.income}
                </TableCell>
                <TableCell>{row.asset}</TableCell>
                <TableCell>{row.info}</TableCell>
                <TableCell>{row.tradeId || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Income; 