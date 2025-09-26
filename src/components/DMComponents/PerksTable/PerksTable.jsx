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
} from '../../../lib/db_functions.js';
import { SupabaseOperators } from '../../../lib/supabaseOperators.js';
import { useSnackbar } from 'notistack';
import AddPerkDialog from '../AddPerkDialog/AddPerkDialog.jsx';

const PerksTable = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [players, setPlayers] = useState([]);
  const [perks, setPerks] = useState([]);
  const [selectedPerk, setSelectedPerk] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { enqueueSnackbar } = useSnackbar();

  const fetchPerks = useCallback(async (searchTerm) => {
    const filters = searchTerm
      ? [{
          column: 'name',
          operator: SupabaseOperators.ILIKE,
          value: `%${searchTerm}%`,
        }]
      : [];

    const sortby = { column: 'name', ascending: true };

    try {
          const { data: perkData } = await getTableRowByFilters('perks', filters, sortby);
          const { data: playerPerksLinks } = await getTableRowByColumn('player_perks', '*');
    
          const mappedPerks = perkData.map((ach) => {
            const allowedPlayers = playerPerksLinks
              .filter((link) => link.perk_id === ach.id)
              .map((link) => link.player_id);
    
            return { ...ach, allowedPlayers };
          });
    
          setPerks(mappedPerks);
        } catch (error) {
          enqueueSnackbar('Error getting perks', { variant: 'error' });
          setPerks([]);
        }
  }, [enqueueSnackbar]);

  const debouncedFetch = useMemo(() => debounce(fetchPerks, 300), [fetchPerks]);

  const fetchPlayers = useCallback(async () => {
    try {
      const { data } = await getTableRowByColumn('players', '*');
      setPlayers(data || []);
    } catch (error) {
      enqueueSnackbar('Error fetching players', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const fetchAllowedPlayersForPerk = async (perkId) => {
    try {
      const filters = [{
        column: 'perk_id',
        operator: SupabaseOperators.EQ,
        value: perkId,
      }];

      const { data } = await getTableRowByFilters('player_perks', filters);

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

  const handleOpenDialog = async (perk) => {
    if (!perk) {
      setSelectedPerk(null);
      setOpenDialog(true);
      return;
    }

    const allowedPlayers = await fetchAllowedPlayersForPerk(perk.id);

    setSelectedPerk({ ...perk, allowedPlayers });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPerk(null);
  };

  const handleSubmitDialog = async (values) => {
    const allowedPlayers = values.allowedPlayers || [];
    const compareAllowedPlayers = selectedPerk?.allowedPlayers || [];
    const perkId = values.id;
    const addedPlayers = allowedPlayers.filter(id => !compareAllowedPlayers.includes(id));
    const removedPlayers = compareAllowedPlayers.filter(id => !allowedPlayers.includes(id));
    delete values.allowedPlayers;

    try {
      if (perkId && addedPlayers.length > 0) {
        const newLinks = addedPlayers.map((player_id) => ({
          player_id,
          perk_id: perkId,
        }));
        await postRowToTable('player_perks', newLinks);
      }

      if (perkId && removedPlayers.length > 0) {
        for (const player_id of removedPlayers) {
          const { data } = await getTableRowByFilters('player_perks', [
            { column: 'achievement_id', operator: SupabaseOperators.EQ, value: perkId },
            { column: 'player_id', operator: SupabaseOperators.EQ, value: player_id },
          ]);

          for (const row of data || []) {
            await deleteRowInTable('player_perks', 'id', row.id);
          }
        }
      }

      if (perkId) {
        await updateRowInTable('perks', values, 'id', perkId);
      } else {
        const { data } = await postRowToTable('perks', [values]);
        if (allowedPlayers.length > 0) {
          const newLinks = allowedPlayers.map((player_id) => ({
            player_id,
            perk_id: data[0].id,
          }));
          await postRowToTable('player_perks', newLinks);
        }
      }

    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error updating perk and allowed players', { variant: 'error' });
    } finally {
      handleCloseDialog();
      fetchPerks(search);
    }
  };

  const getPlayerNameById = (id) => players.find((p) => p.id === id)?.name || 'Unknown';

  const filteredPerks = useMemo(() => {
    if (!selectedPlayerId) return perks;
    return perks.filter((perk) => perk.allowedPlayers.includes(selectedPlayerId));
  }, [perks, selectedPlayerId]);

  const visibleRows = filteredPerks.slice(
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
            Add Perk
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Perk Name</TableCell>
                <TableCell>Players Achieved This</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((perk) => (
                <TableRow
                  key={perk.id}
                  hover
                  onClick={() => handleOpenDialog(perk)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{perk.name}</TableCell>
                  <TableCell>
                    {perk.allowedPlayers?.length > 0 ? (
                      perk.allowedPlayers.map((playerId) => (
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
          count={perks.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <AddPerkDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onConfirm={handleSubmitDialog}
          perkData={selectedPerk}
        />
      </Box>
    </Box>
  );

};

export default PerksTable;