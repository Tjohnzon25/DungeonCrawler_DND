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
} from '@mui/material';
import { debounce } from 'lodash';
import { getTableRowByColumn, getTableRowByFilters, postRowToTable, updateRowInTable } from '../../../lib/db_functions';
import { SupabaseOperators } from '../../../lib/supabaseOperators';
import { useSnackbar } from 'notistack';
import AddPlayerDialog from '../AddPlayerDialog/AddPlayerDialog';

const PlayerTable = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [players, setPlayers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { enqueueSnackbar } = useSnackbar();

  const fetchPlayers = async (searchTerm) => {
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
      const { data } = await getTableRowByFilters('players', filters, sortby);
      setPlayers(data);
    } catch (error) {
      enqueueSnackbar('Error getting players', { variant: 'error' });
      setPlayers([]);
    }
  };

  const fetchClasses = useCallback(async () => {
    try {
      const { data } = await getTableRowByColumn('classes', '*');
      setClasses(data || []);
    } catch (error) {
      enqueueSnackbar('Error fetching classes', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const getClassName = (classId) => {
    const classItem = classes.find((c) => c.id === classId);
    return classItem ? classItem.name : 'N/A';
  };

  const debouncedFetch = useMemo(() => debounce((val) => fetchPlayers(val), 300), []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

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

  const visibleRows = players.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleOpenDialog = (player) => {
    setSelectedPlayer(player);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlayer(null);
  };

  const handleSubmitDialog = async (values) => {
    try {
      if (values.id) {
        await updateRowInTable('players', values, 'id', values.id);
      } else {
        await postRowToTable('players', [values]);
      }
    } catch (error) {
      enqueueSnackbar('Error creating/updating player', { variant: 'error' });
    } finally {
      handleCloseDialog();
      debouncedFetch(search);
    }
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
            Add Player
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>XP</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((player) => (
                <TableRow
                  key={player.id}
                  hover
                  onClick={() => handleOpenDialog(player)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{getClassName(player.class_id)}</TableCell>
                  <TableCell>{player.level}</TableCell>
                  <TableCell>{player.xp}</TableCell>
                  <TableCell>
                    {new Date(player.created_at).toLocaleDateString("en-US")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={players.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <AddPlayerDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onConfirm={handleSubmitDialog}
          playerData={selectedPlayer}
        />
      </Box>
    </Box>
  );

};

export default PlayerTable;