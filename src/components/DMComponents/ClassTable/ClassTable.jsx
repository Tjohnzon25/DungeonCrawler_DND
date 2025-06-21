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
import AddClassDialog from '../AddClassDialog/AddClassDialog.jsx';

const ClassTable = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [players, setPlayers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { enqueueSnackbar } = useSnackbar();

  const fetchClasses = async (searchTerm) => {
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
      const { data: classData } = await getTableRowByFilters('classes', filters, sortby);
      const { data: playerClassLinks } = await getTableRowByColumn('player_class', '*');

      const mappedClasses = classData.map((cls) => {
        const allowedPlayers = playerClassLinks
          .filter((link) => link.class_id === cls.id)
          .map((link) => link.player_id);

        return { ...cls, allowedPlayers };
      });

      setClasses(mappedClasses);
    } catch (error) {
      enqueueSnackbar('Error getting classes', { variant: 'error' });
      setClasses([]);
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

  const fetchAllowedPlayersForClass = async (classId) => {
    try {
      const filters = [{
        column: 'class_id',
        operator: SupabaseOperators.EQ,
        value: classId,
      }];

      const { data } = await getTableRowByFilters('player_class', filters);

      return data.map((entry) => entry.player_id);
    } catch (error) {
      enqueueSnackbar('Error fetching allowed players', { variant: 'error' });
      return [];
    }
  };


  const debouncedFetch = useMemo(() => debounce((val) => fetchClasses(val), 300), []);

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

  const visibleRows = classes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleOpenDialog = async (selectedClass) => {
    if (!selectedClass) {
      setSelectedClass(null);
      setOpenDialog(true);
      return;
    }

    const allowedPlayers = await fetchAllowedPlayersForClass(selectedClass.id);

    setSelectedClass({
      ...selectedClass,
      allowedPlayers,
    });

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
  };

  const handleSubmitDialog = async (values) => {
    const allowedPlayers = values.allowedPlayers || [];
    const compareAllowedPlayers = selectedClass?.allowedPlayers || [];
    const classId = values.id;
    const addedPlayers = allowedPlayers.filter(id => !compareAllowedPlayers.includes(id));
    const removedPlayers = compareAllowedPlayers.filter(id => !allowedPlayers.includes(id));

    delete values.allowedPlayers;

    try {
      if (classId && addedPlayers.length > 0) {
        const newLinks = addedPlayers.map((player_id) => ({
          player_id,
          class_id: classId,
        }));
        await postRowToTable('player_class', newLinks);
      }

      // delete removed player-class links
      if (classId && removedPlayers.length > 0) {
        for (const player_id of removedPlayers) {
          await getTableRowByFilters('player_class', [
            { column: 'class_id', operator: SupabaseOperators.EQ, value: classId },
            { column: 'player_id', operator: SupabaseOperators.EQ, value: player_id },
          ]).then(async ({ data }) => {
            if (data?.length) {
              // Delete each row by ID
              for (const row of data) {
                await deleteRowInTable('player_class', 'id', row.id);
              }
            }
          });
        }
      }

      // update or insert the class
      if (classId) {
        await updateRowInTable('classes', values, 'id', classId);
      } else {
        const { data } = await postRowToTable('classes', [values]);
        // insert player_classes if it's a new class
        if (allowedPlayers.length > 0) {
          const newLinks = allowedPlayers.map((player_id) => ({
            player_id,
            class_id: data[0].id,
          }));
          await postRowToTable('player_class', newLinks);
        }
      }

    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error updating class and allowed players', { variant: 'error' });
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
                <TableCell>Class Name</TableCell>
                <TableCell>Stat Bonus</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>Allowed Players</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((classes) => (
                <TableRow
                  key={classes.id}
                  hover
                  onClick={() => handleOpenDialog(classes)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>{classes.name}</TableCell>
                  <TableCell>STR: {classes.stat_bonus?.strength}</TableCell>
                  <TableCell>DEX: {classes.stat_bonus?.dexterity}</TableCell>
                  <TableCell>CON: {classes.stat_bonus?.constitution}</TableCell>
                  <TableCell>INT: {classes.stat_bonus?.intelligence}</TableCell>
                  <TableCell>WIS: {classes.stat_bonus?.wisdom}</TableCell>
                  <TableCell>CHA: {classes.stat_bonus?.charisma}</TableCell>
                  <TableCell>
                    {classes.allowedPlayers?.length > 0 ? (
                      classes.allowedPlayers.map((playerId) => (
                        <Chip
                          key={playerId}
                          label={getPlayerNameById(playerId)}
                          size="small"
                          sx={{ marginRight: 0.5, marginBottom: 0.5 }}
                        />
                      ))
                    ) : (
                      <Typography>No Players</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={classes.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <AddClassDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onConfirm={handleSubmitDialog}
          classData={selectedClass}
        />
      </Box>
    </Box>
  );

};

export default ClassTable;