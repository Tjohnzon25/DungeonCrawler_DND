import React, { useState, useEffect, useCallback} from 'react';
import {
	Box,
	Button,
	Typography,
	Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { getTableRowByColumn } from '../../../lib/db_functions';
import { useNavigate } from 'react-router';

const PlayerLogin = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();


  const fetchPlayers = useCallback(async () => {
    try {
      const { data } = await getTableRowByColumn('players', '*');
      setPlayers(data || []);
    } catch (error) {
      enqueueSnackbar('Error fetching players', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const handleOnChangePlayerSelected = (e) => {
    setSelectedPlayer(e.target.value);
  }

  const handleConfirm = () => {
    navigate(`/player-details/${selectedPlayer}`);
  };

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return (
    <Box
			display='flex'
			justifyContent='center'
			alignItems='center'
			height='100vh'
		>
			<Paper elevation={3} sx={{ p: 4, width: 500, borderRadius: 5 }}>
				<Typography variant='h5' mb={2} textAlign='center' fontWeight={600}>
					Player Login
				</Typography>
        <RadioGroup 
          value={selectedPlayer}
          onChange={handleOnChangePlayerSelected}
        >
          <Grid container>
            { players.map(player => {
              return (
                <Grid item size={3}>
                  <FormControlLabel
                    value={player.name}
                    control={<Radio />}
                    label={player.name}
                  />
                </Grid>
              )
            })}
          </Grid>
        </RadioGroup>
				<Button
					color='primary'
					variant='contained'
					fullWidth
					sx={{ mt: 2 }}
					onClick={handleConfirm}
				>
					Confirm
				</Button>
        <Typography variant='caption' textAlign='center'>
          Please only select your character. I don't want to make actual authentication
        </Typography>
			</Paper>
		</Box>
  );
};

export default PlayerLogin;