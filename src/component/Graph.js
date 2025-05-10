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
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
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

const Graph = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [incomeList, setIncomeList] = useState(null);
  const [balanceList, setBalanceList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const fetchData = useCallback(() => {
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

    // 현재 선택된 월의 데이터 요청
    const currentMonthDate = new Date(selectedYear, selectedMonth + 1, 1);
    const incomeRequestBody = {
      user_id: user.user_id,
      token: token,
      type: 'income',
      timestamp: currentMonthDate.getTime()
    };

    // Balance 데이터 요청
    const balanceRequestBody = {
      user_id: user.user_id,
      token: token,
      type: 'futureBalance'
    };
    console.log(contentUrl);
    Promise.all([
      axios.post(contentUrl, incomeRequestBody, requestConfig),
      axios.post(contentUrl, balanceRequestBody, requestConfig)
    ])
      .then(([incomeResponse, balanceResponse]) => {
        setIncomeList(incomeResponse.data);
        setBalanceList(balanceResponse.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


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
      default:
        break;
    }
    handleFilterClose();
  };

  if (!incomeList || !balanceList) return null;

  // 선택된 월의 시작일과 마지막 날 계산
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0);
  
  // 일정한 간격의 날짜 배열 생성 (10개 구간)
  const dateLabels = [];
  const interval = Math.ceil((endDate - startDate) / 9);
  for (let i = 0; i < 10; i++) {
    const date = new Date(startDate.getTime() + interval * i);
    dateLabels.push(date.toLocaleDateString());
  }

  // 현재 보유 자산 계산 (USDT 기준)
  const currentBalance = balanceList.data.reduce((total, asset) => {
    if (asset.asset === 'USDT') {
      return total + parseFloat(asset.balance);
    }
    return total;
  }, 0);

  // 수익 데이터 정렬 및 처리
  const incomeData = incomeList.data || [];

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
        text: `${selectedYear}년 ${selectedMonth + 1}월 자산 증감 추이`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw} USDT`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '날짜'
        }
      },
      y: {
        title: {
          display: true,
          text: '자산 (USDT)'
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString() + ' USDT';
          }
        },
        min: -1000,
        max: 1000,
        beginAtZero: true
      }
    }
  };

  if (incomeData.length === 0) {
    return (
      <Box>
        <Paper sx={{ p: 2, height: '600px', position: 'relative' }}>
          {/* 필터 버튼 오른쪽 상단 */}
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
            <Button
              onClick={handleFilterOpen}
              sx={{
                minWidth: 'auto',
                p: 1,
                color: '#000',
                boxShadow: 'none',
                border: 'none',
                background: 'transparent',
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
            data={{
              labels: dateLabels,
              datasets: [{
                label: '보유 자산 (USDT)',
                data: Array(10).fill(0),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.4
              }]
            }}
          />

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
              </Box>
            </DialogContent>
          </Dialog>
        </Paper>
      </Box>
    );
  }

  const sortedIncomeData = [...incomeData].sort((a, b) => b.time - a.time); // 시간 역순 정렬

  // 각 구간별 자산 계산
  const intervalData = dateLabels.map((_, index) => {
    const intervalEnd = index === 9 ? endDate.getTime() : startDate.getTime() + interval * (index + 1);
    
    // 해당 구간 이후의 수익 합계 계산
    const futureIncome = sortedIncomeData
      .filter(item => item.time > intervalEnd)
      .reduce((sum, item) => sum + parseFloat(item.income), 0);
    
    // 현재 자산에서 미래 수익을 뺀 값이 해당 시점의 자산
    return (currentBalance - futureIncome).toFixed(2);
  });

  // 데이터의 최소값과 최대값 계산
  const minValue = Math.min(...intervalData.map(Number));
  const maxValue = Math.max(...intervalData.map(Number));
  const range = maxValue - minValue;
  const padding = range * 0.1; // 10% 패딩

  const dynamicChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        min: minValue - padding,
        max: maxValue + padding,
        beginAtZero: false
      }
    }
  };

  const chartData = {
    labels: dateLabels,
    datasets: [
      {
        label: '보유 자산 (USDT)',
        data: intervalData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
      }
    ]
  };

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          데이터를 불러오는 중...
        </Box>
      ) : (
        <Paper sx={{ p: 2, mb: 3, height: '600px', position: 'relative' }}>
          {/* 필터 버튼 오른쪽 상단 */}
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
            <Button
              onClick={handleFilterOpen}
              sx={{
                minWidth: 'auto',
                p: 1,
                color: '#000',
                boxShadow: 'none',
                border: 'none',
                background: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <FilterListIcon />
            </Button>
          </Box>
          <Line 
            options={dynamicChartOptions} 
            data={chartData} 
          />

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
              </Box>
            </DialogContent>
          </Dialog>
        </Paper>
      )}
    </Box>
  );
};

export default Graph;