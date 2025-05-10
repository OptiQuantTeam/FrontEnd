import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
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

const contentUrl = process.env.REACT_APP_contentUrl;

const ContractList = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [contractList, setContractList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const fetchContractData = () => {
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
      type: 'contractList',
      timestamp: selectedDate.getTime()
    };

    axios.post(contentUrl, requestBody, requestConfig)
      .then(response => {
        setContractList(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContractData();
  }, [selectedMonth, selectedYear]);

  if (!contractList) return null;

  const contractData = contractList.data || [];

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // 시간 역순으로 정렬
  const sortedData = [...contractData].sort((a, b) => b.time - a.time);

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
    fetchContractData();
    handleFilterClose();
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          데이터를 불러오는 중...
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {selectedYear}년 {selectedMonth + 1}월 거래 내역
            </Box>
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
        </>
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
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ContractList;