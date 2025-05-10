import React, { useState, useEffect, useCallback } from 'react';
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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';
import { getToken } from '../service/AuthService';
import { getUser } from '../service/AuthService';
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

const contentUrl = process.env.REACT_APP_contentUrl;

const INCOME_TYPES = [
  'ALL',
  'TRANSFER',
  'REALIZED_PNL',
  'FUNDING_FEE',
  'COMMISSION'
];

const Income = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState('ALL');
  const [incomeList, setIncomeList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const fetchIncomeData = useCallback(() => {
    const token = getToken();
    const user = getUser();
    if (!token || !user) {
      return;
    }

    setLoading(true);
    const requestConfig = {
      headers: {
        'x-api-key': process.env.REACT_APP_x_api_key
      }
    };

    // 선택한 월의 다음 달 1일을 기준으로 이전 달의 데이터를 가져옴
    const selectedDate = new Date(selectedYear, selectedMonth + 1, 1);
    const requestBody = {
      user_id: user.user_id,
      token: token,
      type: 'income',
      timestamp: selectedDate.getTime()
    };

    axios.post(contentUrl, requestBody, requestConfig)
      .then(response => {
        setIncomeList(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchIncomeData();
  }, [fetchIncomeData]);

  if (!incomeList) return null;

  const incomeData = incomeList.data || [];
  
  // 테이블용 필터링된 데이터
  const filteredData = selectedType === 'ALL' 
    ? incomeData 
    : incomeData.filter(item => item.incomeType === selectedType);

  // 선택된 월의 시작일과 마지막 날 계산
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0);
  
  // 일정한 간격의 날짜 배열 생성 (10개 구간)
  const dateLabels = [];
  const interval = Math.ceil((endDate - startDate) / 9); // 9개 구간으로 나누기 위해 10개의 점 생성
  for (let i = 0; i < 10; i++) {
    const date = new Date(startDate.getTime() + interval * i);
    dateLabels.push(date.toLocaleDateString());
  }

  // 그래프용 데이터 처리
  const chartSortedData = [...incomeData]
    .sort((a, b) => a.time - b.time);

  // 각 구간별 수익 데이터 계산
  const intervalData = dateLabels.map((_, index) => {
    const intervalStart = index === 0 ? startDate.getTime() : startDate.getTime() + interval * index;
    const intervalEnd = index === 9 ? endDate.getTime() : startDate.getTime() + interval * (index + 1);
    
    const intervalIncome = chartSortedData
      .filter(item => item.time >= intervalStart && item.time < intervalEnd)
      .reduce((sum, item) => sum + parseFloat(item.income), 0);
    
    return intervalIncome;
  });

  let accumulator = 0;
  const chartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Individual Income',
        data: intervalData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Accumulated Income',
        data: intervalData.map(income => {
          accumulator += income;
          return accumulator;
        }),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      }
    ]
  };

  const handleFilterOpen = () => {
    setOpenFilter(true);
  };

  const handleFilterClose = () => {
    setOpenFilter(false);
  };

  const handleFilterChange = (type, value) => {
    switch(type) {
      case 'year':
        setSelectedYear(value);
        break;
      case 'month':
        setSelectedMonth(value);
        break;
      case 'type':
        setSelectedType(value);
        break;
      default:
        break;
    }
    handleFilterClose();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // 테이블용 최신순 정렬 (필터링된 데이터 사용)
  const tableSortedData = [...filteredData]
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
        text: `${selectedYear}년 ${selectedMonth + 1}월 수익 내역`
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
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          데이터를 불러오는 중...
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* 차트 */}
          <Paper sx={{ p: 2, mb: 3, height: '400px', flexShrink: 0, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
              <Button
                onClick={handleFilterOpen}
                sx={{
                  minWidth: 'auto',
                  p: 1,
                  color: '#000',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <FilterListIcon />
              </Button>
            </Box>
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
              flex: 1,
              overflow: 'auto',
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
      )}

      {/* 필터 모달 */}
      <Dialog open={openFilter} onClose={handleFilterClose}>
        <DialogTitle>필터 설정</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>연도</InputLabel>
              <Select
                value={selectedYear}
                label="연도"
                onChange={(e) => handleFilterChange('year', e.target.value)}
                disabled={loading}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224, // 5개 항목이 보이는 높이 (56px * 4)
                    },
                  },
                }}
              >
                {[...Array(5)].map((_, index) => {
                  const year = new Date().getFullYear() - index;
                  return (
                    <MenuItem key={year} value={year}>
                      {year}년
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>월</InputLabel>
              <Select
                value={selectedMonth}
                label="월"
                onChange={(e) => handleFilterChange('month', e.target.value)}
                disabled={loading}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224, // 5개 항목이 보이는 높이 (56px * 4)
                    },
                  },
                }}
              >
                {[...Array(12)].map((_, index) => (
                  <MenuItem key={index} value={index}>
                    {index + 1}월
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>타입</InputLabel>
              <Select
                value={selectedType}
                label="타입"
                onChange={(e) => handleFilterChange('type', e.target.value)}
                disabled={loading}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224, // 5개 항목이 보이는 높이 (56px * 4)
                    },
                  },
                }}
              >
                {INCOME_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type === 'ALL' ? '전체' : type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Income; 