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
  Typography
} from '@mui/material';
import { debounce } from 'lodash';
import { deleteRowInTable, getTableRowByColumn, getTableRowByFilters, postRowToTable, updateRowInTable } from '../../../lib/db_functions';
import { SupabaseOperators } from '../../../lib/supabaseOperators';
import { useSnackbar } from 'notistack';
import AddAchievementDialog from '../AddAchievementDialog/AddAchievementDialog.jsx';

const AchievementTable = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [players, setPlayers] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { enqueueSnackbar } = useSnackbar();

  const fetchAchievements = async (searchTerm) => {
    const filters = searchTerm
      ? [
          {
            column: 'name',
            operator: SupabaseOperators.ILIKE,
            value: `%${searchTerm}%`,
          },
        ]
      : [];

    const sortby = { column: 'name', ascending: true };

    try {
      const { data: achievementData } = await getTableRowByFilters('achievements', filters, sortby);
      const { data: playerAchievementLinks } = await getTableRowByColumn('player_achievements', '*');

      const mappedAchievements = achievementData.map((cls) => {
        const allowedPlayers = playerAchievementLinks
          .filter((link) => link.achievement_id === cls.id)
          .map((link) => link.player_id);

        return { ...cls, allowedPlayers };
      });

      setAchievements(mappedAchievements);
    } catch (error) {
      enqueueSnackbar('Error getting achievements', { variant: 'error' });
      setAchievements([]);
    }
    };


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


  const debouncedFetch = useMemo(() => debounce((val) => fetchAchievements(val), 300), []);

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

  const visibleRows = achievements.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleOpenDialog = async (selectedAchievement) => {
    if (!selectedAchievement) {
      setSelectedAchievement(null);
      setOpenDialog(true);
      return;
    }

    const allowedPlayers = await fetchAllowedPlayersForAchievement(selectedAchievement.id);

    setSelectedAchievement({
      ...selectedAchievement,
      allowedPlayers,
    });

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

      // delete removed player-achievement links
      if (achievementId && removedPlayers.length > 0) {
        for (const player_id of removedPlayers) {
          await getTableRowByFilters('player_achievements', [
            { column: 'achievement_id', operator: SupabaseOperators.EQ, value: achievementId },
            { column: 'player_id', operator: SupabaseOperators.EQ, value: player_id },
          ]).then(async ({ data }) => {
            if (data?.length) {
              // Delete each row by ID
              for (const row of data) {
                await deleteRowInTable('player_achievements', 'id', row.id);
              }
            }
          });
        }
      }

      // update or insert the achievement
      if (achievementId) {
        await updateRowInTable('achievements', values, 'id', achievementId);
      } else {
        const { data } = await postRowToTable('achievements', [values]);
        // insert player_achievements if it's a new achievements
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
      debouncedFetch(search);
    }
  };

  const getPlayerNameById = (id) => {
    const player = players.find((p) => p.id === id);
    return player?.name || 'Unknown';
  };
  
  return (
    <Box mt={10} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Box width="80%">
        <Box mb={2} display="flex" justifyContent="space-between">
          <TextField
            label="Search by Name"
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
            slotProps={{ inputLabel: { shrink: true } }}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog(null)}
          >
            Add Class
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Achievement Name</TableCell>
                <TableCell>Allowed Players</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((achievement) => (
                <TableRow
                  key={achievement.id}
                  hover
                  onClick={() => handleOpenDialog(achievement)}
                  style={{ cursor: "pointer" }}
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
                      <Typography></Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
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