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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
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

const INTERVAL_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

const Graph = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedInterval, setSelectedInterval] = useState(INTERVAL_TYPES.DAILY);
  const [incomeList, setIncomeList] = useState(null);
  const [balanceList, setBalanceList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [tempFilter, setTempFilter] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: new Date().getDate(),
    week: 1,
    interval: INTERVAL_TYPES.DAILY
  });

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

    // 선택된 기간의 데이터 요청
    const getDateRange = () => {
      let startDate, endDate;

      switch(selectedInterval) {
        case INTERVAL_TYPES.DAILY:
          startDate = new Date(selectedYear, selectedMonth, selectedDay);
          endDate = new Date(startDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case INTERVAL_TYPES.WEEKLY:
          const weekStart = new Date(selectedYear, selectedMonth, selectedDay);
          const day = weekStart.getDay();
          const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
          startDate = new Date(weekStart);
          startDate.setDate(diff);
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case INTERVAL_TYPES.MONTHLY:
          startDate = new Date(selectedYear, selectedMonth, 1);
          endDate = new Date(selectedYear, selectedMonth + 1, 0);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
      }
      return { startDate, endDate };
    };

    const { startDate, endDate } = getDateRange();

    const incomeRequestBody = {
      user_id: user.user_id,
      token: token,
      type: 'income',
      startTime: startDate.getTime(),
      endTime: endDate.getTime()
    };

    // Balance 데이터 요청
    const balanceRequestBody = {
      user_id: user.user_id,
      token: token,
      type: 'futureBalance'
    };
    
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
  }, [selectedYear, selectedMonth, selectedDay, selectedInterval]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  };

  const handleFilterOpen = () => {
    setTempFilter({
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay,
      week: selectedWeek,
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
    setSelectedInterval(tempFilter.interval);
    handleFilterClose();
    fetchData();
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

  if (!incomeList || !balanceList) return null;

  // 현재 보유 자산 계산 (USDT 기준)
  const currentBalance = balanceList.data.reduce((total, asset) => {
    if (asset.asset === 'USDT') {
      return total + parseFloat(asset.balance);
    }
    return total;
  }, 0);

  // 수익 데이터 정렬 및 처리
  const incomeData = incomeList.data || [];
  const sortedIncomeData = [...incomeData].sort((a, b) => a.time - b.time);

  // 날짜 라벨과 데이터 생성
  const getDateLabelsAndData = () => {
    const dateLabels = [];
    const balanceData = [];
    let startDate, endDate;

    switch(selectedInterval) {
      case INTERVAL_TYPES.DAILY:
        startDate = new Date(selectedYear, selectedMonth, selectedDay);
        for (let i = 0; i < 24; i++) {
          const date = new Date(startDate);
          date.setHours(i);
          dateLabels.push(date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
          
          const hourEnd = new Date(date);
          hourEnd.setHours(hourEnd.getHours() + 1);
          
          const hourIncome = sortedIncomeData
            .filter(item => {
              const itemDate = new Date(item.time);
              return itemDate >= date && itemDate < hourEnd;
            })
            .reduce((sum, item) => sum + parseFloat(item.income), 0);
          
          balanceData.push(currentBalance + hourIncome);
        }
        break;

      case INTERVAL_TYPES.WEEKLY:
        const weekStart = new Date(selectedYear, selectedMonth, selectedDay);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(weekStart);
        startDate.setDate(diff);
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          dateLabels.push(date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }));
          
          const dayEnd = new Date(date);
          dayEnd.setDate(dayEnd.getDate() + 1);
          
          const dayIncome = sortedIncomeData
            .filter(item => {
              const itemDate = new Date(item.time);
              return itemDate >= date && itemDate < dayEnd;
            })
            .reduce((sum, item) => sum + parseFloat(item.income), 0);
          
          balanceData.push(currentBalance + dayIncome);
        }
        break;

      case INTERVAL_TYPES.MONTHLY:
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0);
        const daysInMonth = endDate.getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
          dateLabels.push(i.toString());
          
          const dayStart = new Date(selectedYear, selectedMonth, i);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);
          
          const dayIncome = sortedIncomeData
            .filter(item => {
              const itemDate = new Date(item.time);
              return itemDate >= dayStart && itemDate < dayEnd;
            })
            .reduce((sum, item) => sum + parseFloat(item.income), 0);
          
          balanceData.push(currentBalance + dayIncome);
        }
        break;
    }

    return { dateLabels, balanceData };
  };

  const { dateLabels, balanceData } = getDateLabelsAndData();

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
        text: `${selectedYear}년 ${selectedMonth + 1}월 ${selectedInterval === INTERVAL_TYPES.DAILY ? selectedDay + '일' : selectedInterval === INTERVAL_TYPES.WEEKLY ? selectedWeek + '째주' : '월별'} 자산 증감 추이`
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
        title: {
          display: true,
          text: '자산 (USDT)'
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString() + ' USDT';
          }
        }
      }
    }
  };

  const chartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Total Balance',
        data: balanceData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
        yAxisID: 'y',
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
        </Paper>
      )}
    </Box>
  );
};

export default Graph;