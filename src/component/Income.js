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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
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

const INCOME_TYPES = {
  PNL: 'REALIZED_PNL',
  TRANSFER: 'TRANSFER',
  FUNDING: 'FUNDING_FEE',
  COMMISSION: 'COMMISSION',
  ALL: 'ALL'
};

const INTERVAL_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

const Income = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedType, setSelectedType] = useState(INCOME_TYPES.PNL);
  const [selectedInterval, setSelectedInterval] = useState(INTERVAL_TYPES.DAILY);
  const [incomeList, setIncomeList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [tempFilter, setTempFilter] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: new Date().getDate(),
    week: 1,
    type: INCOME_TYPES.PNL,
    interval: INTERVAL_TYPES.DAILY
  });

  const handlePrevPeriod = () => {
    switch(selectedInterval) {
      case INTERVAL_TYPES.DAILY:
        const prevDay = new Date(selectedYear, selectedMonth, selectedDay - 1);
        setSelectedYear(prevDay.getFullYear());
        setSelectedMonth(prevDay.getMonth());
        setSelectedDay(prevDay.getDate());
        break;
      case INTERVAL_TYPES.WEEKLY:
        const currentDate = new Date(selectedYear, selectedMonth, selectedDay);
        const currentDay = currentDate.getDay();
        const currentDiff = currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
        const prevWeekStart = new Date(currentDate);
        prevWeekStart.setDate(currentDiff - 7);
        
        setSelectedYear(prevWeekStart.getFullYear());
        setSelectedMonth(prevWeekStart.getMonth());
        setSelectedDay(prevWeekStart.getDate());
        break;
      case INTERVAL_TYPES.MONTHLY:
        if (selectedMonth === 0) {
          setSelectedYear(selectedYear - 1);
          setSelectedMonth(11);
        } else {
          setSelectedMonth(selectedMonth - 1);
        }
        break;
    }
    fetchIncomeData();
  };

  const handleNextPeriod = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    switch(selectedInterval) {
      case INTERVAL_TYPES.DAILY:
        const nextDay = new Date(selectedYear, selectedMonth, selectedDay + 1);
        if (nextDay <= now) {
          setSelectedYear(nextDay.getFullYear());
          setSelectedMonth(nextDay.getMonth());
          setSelectedDay(nextDay.getDate());
        }
        break;
      case INTERVAL_TYPES.WEEKLY:
        const currentDate = new Date(selectedYear, selectedMonth, selectedDay);
        const currentDay = currentDate.getDay();
        const currentDiff = currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
        const nextWeekStart = new Date(currentDate);
        nextWeekStart.setDate(currentDiff + 7);
        
        if (nextWeekStart <= now) {
          setSelectedYear(nextWeekStart.getFullYear());
          setSelectedMonth(nextWeekStart.getMonth());
          setSelectedDay(nextWeekStart.getDate());
        }
        break;
      case INTERVAL_TYPES.MONTHLY:
        if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
          if (selectedMonth === 11) {
            setSelectedYear(selectedYear + 1);
            setSelectedMonth(0);
          } else {
            setSelectedMonth(selectedMonth + 1);
          }
        }
        break;
    }
    fetchIncomeData();
  };

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

    // 선택한 간격에 따라 시작일과 종료일 계산
    const getDateRange = () => {
      let startDate, endDate;

      switch(selectedInterval) {
        case INTERVAL_TYPES.DAILY:
          // 선택한 날의 데이터
          startDate = new Date(selectedYear, selectedMonth, selectedDay);
          endDate = new Date(startDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case INTERVAL_TYPES.WEEKLY:
          // 선택한 주의 데이터
          const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
          const day = selectedDate.getDay();
          const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1); // 월요일
          startDate = new Date(selectedDate);
          startDate.setDate(diff);
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case INTERVAL_TYPES.MONTHLY:
          // 선택한 달의 데이터
          startDate = new Date(selectedYear, selectedMonth, 1);
          endDate = new Date(selectedYear, selectedMonth + 1, 0);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
      }
      return { startDate, endDate };
    };

    const { startDate, endDate } = getDateRange();

    const requestBody = {
      user_id: user.user_id,
      token: token,
      type: 'income',
      startTime: startDate.getTime(),
      endTime: endDate.getTime()
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
  }, [selectedYear, selectedMonth, selectedInterval, selectedDay]);

  useEffect(() => {
    fetchIncomeData();
  }, [fetchIncomeData]);

  if (!incomeList) return null;

  const incomeData = incomeList.data || [];
  
  // 테이블용 필터링된 데이터
  const filteredData = selectedType === INCOME_TYPES.ALL 
    ? incomeData 
    : incomeData.filter(item => item.incomeType === selectedType);

  // 일정한 간격의 날짜 배열 생성
  const getDateLabels = () => {
    const dateLabels = [];
    
    switch(selectedInterval) {
      case INTERVAL_TYPES.DAILY:
        // 선택된 날짜의 24시간 데이터
        const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
        for (let i = 0; i < 24; i++) {
          const date = new Date(selectedDate);
          date.setHours(i);
          dateLabels.push(date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
        }
        break;

      case INTERVAL_TYPES.WEEKLY:
        // 선택된 날짜가 속한 주의 월요일부터 일요일까지
        const weekStart = new Date(selectedYear, selectedMonth, selectedDay);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          dateLabels.push(date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }));
        }
        break;

      case INTERVAL_TYPES.MONTHLY:
        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0);
        const daysInMonth = endDate.getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
          dateLabels.push(i.toString());
        }
        break;
    }
    return dateLabels;
  };

  const dateLabels = getDateLabels();

  // 그래프용 데이터 처리
  const chartSortedData = [...filteredData]
    .sort((a, b) => a.time - b.time);

  // 각 구간별 수익 데이터 계산
  const getIntervalData = () => {
    const dateLabels = getDateLabels();
    
    switch(selectedInterval) {
      case INTERVAL_TYPES.DAILY:
        return dateLabels.map((_, index) => {
          const hourStart = new Date(selectedYear, selectedMonth, selectedDay, index);
          const hourEnd = new Date(hourStart);
          hourEnd.setHours(hourEnd.getHours() + 1);
          
          return chartSortedData
            .filter(item => {
              const itemDate = new Date(item.time);
              return itemDate >= hourStart && itemDate < hourEnd;
            })
            .reduce((sum, item) => sum + parseFloat(item.income), 0);
        });
      
      case INTERVAL_TYPES.WEEKLY:
        const weekStart = new Date(selectedYear, selectedMonth, selectedDay);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        
        return dateLabels.map((_, index) => {
          const dayStart = new Date(weekStart);
          dayStart.setDate(dayStart.getDate() + index);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);
          
          return chartSortedData
            .filter(item => {
              const itemDate = new Date(item.time);
              return itemDate >= dayStart && itemDate < dayEnd;
            })
            .reduce((sum, item) => sum + parseFloat(item.income), 0);
        });
      
      case INTERVAL_TYPES.MONTHLY:
        return dateLabels.map((day) => {
          const dayStart = new Date(selectedYear, selectedMonth, parseInt(day));
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);
          
          return chartSortedData
            .filter(item => {
              const itemDate = new Date(item.time);
              return itemDate >= dayStart && itemDate < dayEnd;
            })
            .reduce((sum, item) => sum + parseFloat(item.income), 0);
        });
    }
  };

  const intervalData = getIntervalData();

  let accumulator = 0;
  const chartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Individual Income',
        data: intervalData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
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
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const handleFilterOpen = () => {
    setTempFilter({
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay,
      week: selectedWeek,
      type: selectedType,
      interval: selectedInterval
    });
    setOpenFilter(true);
  };

  const handleFilterClose = () => {
    setOpenFilter(false);
  };

  const handleFilterChange = (type, value) => {
    setTempFilter(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleFilterApply = () => {
    setSelectedYear(tempFilter.year);
    setSelectedMonth(tempFilter.month);
    setSelectedDay(tempFilter.day);
    setSelectedWeek(tempFilter.week);
    setSelectedType(tempFilter.type);
    setSelectedInterval(tempFilter.interval);
    handleFilterClose();
    fetchIncomeData();
  };

  // 주차 계산 함수
  const getWeekNumber = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayWeek = firstDay.getDay();
    const firstWeekDays = 7 - firstDayWeek;
    const dayOfMonth = date.getDate();
    
    if (dayOfMonth <= firstWeekDays) return 1;
    return Math.ceil((dayOfMonth - firstWeekDays) / 7) + 1;
  };

  // 선택된 월의 주차 수 계산
  const getWeeksInMonth = (year, month) => {
    const lastDay = new Date(year, month + 1, 0);
    return getWeekNumber(lastDay);
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
        text: `${selectedYear}년 ${selectedMonth + 1}월 ${selectedInterval === INTERVAL_TYPES.DAILY ? selectedDay + '일' : selectedInterval === INTERVAL_TYPES.WEEKLY ? selectedWeek + '째주' : '월별'} 수익 내역`
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
          text: selectedInterval === INTERVAL_TYPES.DAILY ? '시간' : '날짜'
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
            {/* 필터 버튼 */}
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
            {/* 이전/다음 버튼 */}
            <Box sx={{ 
              position: 'absolute', 
              top: 12, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 20
            }}>
              <Button
                onClick={handlePrevPeriod}
                sx={{
                  minWidth: 'auto',
                  p: 1,
                  color: 'rgba(0, 0, 0, 0.4)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    color: 'rgba(0, 0, 0, 0.6)'
                  }
                }}
              >
                <ArrowBackIosNewIcon />
              </Button>
              <Button
                onClick={handleNextPeriod}
                sx={{
                  minWidth: 'auto',
                  p: 1,
                  color: 'rgba(0, 0, 0, 0.4)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    color: 'rgba(0, 0, 0, 0.6)'
                  }
                }}
              >
                <ArrowForwardIosIcon />
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
              <InputLabel>간격</InputLabel>
              <Select
                value={tempFilter.interval}
                label="간격"
                onChange={(e) => handleFilterChange('interval', e.target.value)}
                disabled={loading}
              >
                <MenuItem value={INTERVAL_TYPES.DAILY}>일별</MenuItem>
                <MenuItem value={INTERVAL_TYPES.WEEKLY}>주별</MenuItem>
                <MenuItem value={INTERVAL_TYPES.MONTHLY}>월별</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>연도</InputLabel>
              <Select
                value={tempFilter.year}
                label="연도"
                onChange={(e) => handleFilterChange('year', e.target.value)}
                disabled={loading}
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
                value={tempFilter.month}
                label="월"
                onChange={(e) => handleFilterChange('month', e.target.value)}
                disabled={loading}
              >
                {[...Array(12)].map((_, index) => (
                  <MenuItem key={index} value={index}>
                    {index + 1}월
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {tempFilter.interval === INTERVAL_TYPES.DAILY && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>일</InputLabel>
                <Select
                  value={tempFilter.day}
                  label="일"
                  onChange={(e) => handleFilterChange('day', e.target.value)}
                  disabled={loading}
                >
                  {[...Array(new Date(tempFilter.year, tempFilter.month + 1, 0).getDate())].map((_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {index + 1}일
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {tempFilter.interval === INTERVAL_TYPES.WEEKLY && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>주차</InputLabel>
                <Select
                  value={tempFilter.week}
                  label="주차"
                  onChange={(e) => handleFilterChange('week', e.target.value)}
                  disabled={loading}
                >
                  {[...Array(getWeeksInMonth(tempFilter.year, tempFilter.month))].map((_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {index + 1}째주
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>타입</InputLabel>
              <Select
                value={tempFilter.type}
                label="타입"
                onChange={(e) => handleFilterChange('type', e.target.value)}
                disabled={loading}
              >
                <MenuItem value={INCOME_TYPES.ALL}>모두</MenuItem>
                <MenuItem value={INCOME_TYPES.PNL}>PnL</MenuItem>
                <MenuItem value={INCOME_TYPES.TRANSFER}>이체</MenuItem>
                <MenuItem value={INCOME_TYPES.FUNDING}>Funding Fee</MenuItem>
                <MenuItem value={INCOME_TYPES.COMMISSION}>수수료</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={handleFilterClose} variant="outlined">
                취소
              </Button>
              <Button onClick={handleFilterApply} variant="contained" color="primary">
                적용
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Income; 