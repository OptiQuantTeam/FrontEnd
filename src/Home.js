import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { Box, Grid, Paper } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';

const homeUrl = process.env.REACT_APP_homeUrl;

const Home = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    const requestConfig = {
      headers: {  
        'x-api-key': process.env.REACT_APP_x_api_key
      },
      signal: abortController.signal
    };

    axios.get(homeUrl, requestConfig).then((response) => {
      setData(response.data);
    }).catch((error) => {
      if (!axios.isCancel(error)) {
        console.log(error);
      }
    });

    return () => {
      abortController.abort();
    };
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Box display="flex" alignItems="center" mb={1}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>{title}</Typography>
      </Box>
      <Typography variant="h4" color={color}>{value}</Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
          OptiQuant
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
          "당신의 꿈은 무엇인가요?"
        </Typography>
        <Typography variant="h5" color="text.disabled" sx={{ mb: 3 }}>
          {data?.model_name || 'Loading...'}
        </Typography>
      </Box>

      {data && (
        <>
          {/* 주요 통계 */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={3}>
              <StatCard 
                title="최고 수익률" 
                value={`${data?.profit_rate_stats?.best_profit_rate?.toFixed(2) || '0.00'}%`}
                icon={<TrendingUpIcon color="success" />}
                color="success.main"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard 
                title="평균 수익률" 
                value={`${data?.profit_rate_stats?.mean_profit_rate?.toFixed(2) || '0.00'}%`}
                icon={<TimelineIcon color={(data?.profit_rate_stats?.mean_profit_rate || 0) >= 0 ? "success" : "error"} />}
                color={(data?.profit_rate_stats?.mean_profit_rate || 0) >= 0 ? "success.main" : "error.main"}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard 
                title="최고 거래 성공률" 
                value={`${((data?.training_results?.max_episode_win_rate || 0) * 100).toFixed(2)}%`}
                icon={<AssessmentIcon color="warning" />}
                color="warning.main"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard 
                title="평균 거래 성공률" 
                value={`${((data?.training_results?.mean_episode_win_rate || 0) * 100).toFixed(2)}%`}
                icon={<AssessmentIcon color={(data?.training_results?.mean_episode_win_rate || 0) >= 0.5 ? "success" : "info"} />}
                color={(data?.training_results?.mean_episode_win_rate || 0) >= 0.5 ? "success.main" : "info.main"}
              />
            </Grid>
          </Grid>

          {/* 상세 정보 */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>학습 파라미터</Typography>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={0}>
                    <Grid item xs={6}>
                      <Typography sx={{ mb: 1 }}>State Dimension: {data.learning_params.state_dim}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ mb: 1 }}>Action Dimension: {data.learning_params.action_dim}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ mb: 1 }}>Gamma: {data.learning_params.gamma}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ mb: 1 }}>Epsilon: {data.learning_params.epsilon}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ mb: 1 }}>Epochs: {data.learning_params.epochs}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ mb: 1 }}>Batch Size: {data.learning_params.batch_size}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ mb: 1 }}>Actor LR: {data.learning_params.lr_actor}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ mb: 1 }}>Critic LR: {data.learning_params.lr_critic}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>세션 정보</Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography>Start Time: {data.session_info.start_time}</Typography>
                  <Typography>End Time: {data.session_info.session_time}</Typography>
                  <Typography>Training Sessions: {data.session_info.training_sessions}</Typography>
                  <Typography>Total Episodes: {data.session_info.total_episodes_all_sessions}</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* 개발자 정보 */}
          <Box sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 2,
            borderRadius: 1,
            boxShadow: 1
          }}>
            <Typography variant="subtitle1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              201901184 신승우 | 202001645 양재혁 | 202001505 문현준
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Home;
