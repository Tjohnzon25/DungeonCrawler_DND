import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  TablePagination,
  Button,
  Chip,
  Typography,
  MenuItem,
} from '@mui/material';
import { debounce } from 'lodash';
import {
  deleteRowInTable,
  getTableRowByColumn,
  getTableRowByFilters,
  postRowToTable,
  updateRowInTable,
} from '../../../lib/db_functions';
import { SupabaseOperators } from '../../../lib/supabaseOperators';
import { useSnackbar } from 'notistack';
import AddAchievementDialog from '../AddAchievementDialog/AddAchievementDialog.jsx';

const AchievementTable = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [players, setPlayers] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch all achievements (unfiltered)
  const fetchAchievements = useCallback(async (searchTerm) => {
    const filters = searchTerm
      ? [{
          column: 'name',
          operator: SupabaseOperators.ILIKE,
          value: `%${searchTerm}%`,
        }]
      : [];

    const sortby = { column: 'name', ascending: true };

    try {
      const { data: achievementData } = await getTableRowByFilters('achievements', filters, sortby);
      const { data: playerAchievementLinks } = await getTableRowByColumn('player_achievements', '*');

      const mappedAchievements = achievementData.map((ach) => {
        const allowedPlayers = playerAchievementLinks
          .filter((link) => link.achievement_id === ach.id)
          .map((link) => link.player_id);

        return { ...ach, allowedPlayers };
      });

      setAchievements(mappedAchievements);
    } catch (error) {
      enqueueSnackbar('Error getting achievements', { variant: 'error' });
      setAchievements([]);
    }
  }, [enqueueSnackbar]);

  const debouncedFetch = useMemo(() => debounce(fetchAchievements, 300), [fetchAchievements]);

  const fetchPlayers = useCallback(async () => {
    try {
      const { data } = await getTableRowByColumn('players', '*');
      setPlayers(data || []);
    } catch (error) {
      enqueueSnackbar('Error fetching players', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const fetchAllowedPlayersForAchievement = async (achievementId) => {
    try {
      const filters = [{
        column: 'achievement_id',
        operator: SupabaseOperators.EQ,
        value: achievementId,
      }];

      const { data } = await getTableRowByFilters('player_achievements', filters);

      return data.map((entry) => entry.player_id);
    } catch (error) {
      enqueueSnackbar('Error fetching allowed players', { variant: 'error' });
      return [];
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  useEffect(() => {
    debouncedFetch(search);
  }, [search, debouncedFetch]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = async (achievement) => {
    if (!achievement) {
      setSelectedAchievement(null);
      setOpenDialog(true);
      return;
    }

    const allowedPlayers = await fetchAllowedPlayersForAchievement(achievement.id);

    setSelectedAchievement({ ...achievement, allowedPlayers });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAchievement(null);
  };

  const handleSubmitDialog = async (values) => {
    const allowedPlayers = values.allowedPlayers || [];
    const compareAllowedPlayers = selectedAchievement?.allowedPlayers || [];
    const achievementId = values.id;
    const addedPlayers = allowedPlayers.filter(id => !compareAllowedPlayers.includes(id));
    const removedPlayers = compareAllowedPlayers.filter(id => !allowedPlayers.includes(id));
    delete values.allowedPlayers;

    try {
      if (achievementId && addedPlayers.length > 0) {
        const newLinks = addedPlayers.map((player_id) => ({
          player_id,
          achievement_id: achievementId,
        }));
        await postRowToTable('player_achievements', newLinks);
      }

      if (achievementId && removedPlayers.length > 0) {
        for (const player_id of removedPlayers) {
          const { data } = await getTableRowByFilters('player_achievements', [
            { column: 'achievement_id', operator: SupabaseOperators.EQ, value: achievementId },
            { column: 'player_id', operator: SupabaseOperators.EQ, value: player_id },
          ]);

          for (const row of data || []) {
            await deleteRowInTable('player_achievements', 'id', row.id);
          }
        }
      }

      if (achievementId) {
        await updateRowInTable('achievements', values, 'id', achievementId);
      } else {
        const { data } = await postRowToTable('achievements', [values]);
        if (allowedPlayers.length > 0) {
          const newLinks = allowedPlayers.map((player_id) => ({
            player_id,
            achievement_id: data[0].id,
          }));
          await postRowToTable('player_achievements', newLinks);
        }
      }

    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error updating achievement and allowed players', { variant: 'error' });
    } finally {
      handleCloseDialog();
      fetchAchievements(search);
    }
  };

  const getPlayerNameById = (id) => players.find((p) => p.id === id)?.name || 'Unknown';

  const filteredAchievements = useMemo(() => {
    if (!selectedPlayerId) return achievements;
    return achievements.filter((ach) => ach.allowedPlayers.includes(selectedPlayerId));
  }, [achievements, selectedPlayerId]);

  const visibleRows = filteredAchievements.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box mt={10} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Box width="80%">
        <Box mb={2} display="flex" justifyContent="space-between">
          <Box display="flex">
            <TextField
              label="Search by Name"
              variant="outlined"
              value={search}
              onChange={handleSearchChange}
              size="small"
              sx={{ width: 200 }}
              slotProps={{ inputLabel: { shrink: true }}}
            />
            <TextField
              select
              label="Filter by Player"
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              size="small"
              sx={{ marginLeft: 2, width: 200 }}
              slotProps={{ inputLabel: { shrink: true }}}
            >
              <MenuItem value="">All Players</MenuItem>
              {players.map((player) => (
                <MenuItem key={player.id} value={player.id}>
                  {player.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog(null)}
          >
            Add Achievement
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Achievement Name</TableCell>
                <TableCell>Players Achieved This</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((achievement) => (
                <TableRow
                  key={achievement.id}
                  hover
                  onClick={() => handleOpenDialog(achievement)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{achievement.name}</TableCell>
                  <TableCell>
                    {achievement.allowedPlayers?.length > 0 ? (
                      achievement.allowedPlayers.map((playerId) => (
                        <Chip
                          key={playerId}
                          label={getPlayerNameById(playerId)}
                          size="small"
                          sx={{ marginRight: 0.5, marginBottom: 0.5 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">No Players</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component='div'
          count={achievements.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <AddAchievementDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onConfirm={handleSubmitDialog}
          achievementData={selectedAchievement}
        />
      </Box>
    </Box>
  );

};

export default AchievementTable;