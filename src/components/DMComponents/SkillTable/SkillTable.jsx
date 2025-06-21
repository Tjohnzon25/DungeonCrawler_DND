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
import {
  deleteRowInTable,
  getTableRowByColumn,
  getTableRowByFilters,
  postRowToTable,
  updateRowInTable,
} from '../../../lib/db_functions';
import { SupabaseOperators } from '../../../lib/supabaseOperators';
import { useSnackbar } from 'notistack';
import AddSkillDialog from '../AddSkillDialog/AddSkillDialog.jsx';

const SkillTable = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [players, setPlayers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { enqueueSnackbar } = useSnackbar();

  const fetchSkills = async (searchTerm) => {
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
      const { data: skillData } = await getTableRowByFilters('skills', filters, sortby);
      const { data: playerSkills } = await getTableRowByColumn('player_skills', '*');

      const skillMap = skillData.map((skill) => {
        const playerIds = playerSkills
          .filter((link) => link.skill_id === skill.id)
          .map((link) => link.player_id);
        return { ...skill, allowedPlayers: playerIds };
      });

      setSkills(skillMap);
    } catch (error) {
      enqueueSnackbar('Error getting skills', { variant: 'error' });
      setSkills([]);
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

  const fetchAllowedPlayersForSkill = async (skillId) => {
    try {
      const filters = [
        {
          column: 'skill_id',
          operator: SupabaseOperators.EQ,
          value: skillId,
        },
      ];

      const { data } = await getTableRowByFilters('player_skills', filters);
      return data.map((entry) => entry.player_id);
    } catch (error) {
      enqueueSnackbar('Error fetching allowed players for skill', { variant: 'error' });
      return [];
    }
  };

  const debouncedFetch = useMemo(() => debounce((val) => fetchSkills(val), 300), []);

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

  const handleOpenDialog = async (selectedSkill) => {
    if (!selectedSkill) {
      setSelectedSkill(null);
      setOpenDialog(true);
      return;
    }

    const allowedPlayers = await fetchAllowedPlayersForSkill(selectedSkill.id);

    setSelectedSkill({
      ...selectedSkill,
      allowedPlayers,
    });

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSkill(null);
  };

  const getPlayerNameById = (id) => {
  const player = players.find((p) => p.id === id);
  return player?.name || 'Unknown';
};


  const handleSubmitDialog = async (values) => {
    const allowedPlayers = values.allowedPlayers || [];
    const compareAllowedPlayers = selectedSkill?.allowedPlayers || [];
    const skillId = values.id;
    const addedPlayers = allowedPlayers.filter((id) => !compareAllowedPlayers.includes(id));
    const removedPlayers = compareAllowedPlayers.filter((id) => !allowedPlayers.includes(id));

    delete values.allowedPlayers;

    try {
      // Insert new player_skills links
      if (skillId && addedPlayers.length > 0) {
        const newLinks = addedPlayers.map((player_id) => ({
          player_id,
          skill_id: skillId,
        }));
        await postRowToTable('player_skills', newLinks);
      }

      // Delete removed player_skills links
      if (skillId && removedPlayers.length > 0) {
        for (const player_id of removedPlayers) {
          const { data } = await getTableRowByFilters('player_skills', [
            { column: 'skill_id', operator: SupabaseOperators.EQ, value: skillId },
            { column: 'player_id', operator: SupabaseOperators.EQ, value: player_id },
          ]);

          if (data?.length) {
            for (const row of data) {
              await deleteRowInTable('player_skills', 'id', row.id);
            }
          }
        }
      }

      // Update or insert the skill
      if (skillId) {
        await updateRowInTable('skills', values, 'id', skillId);
      } else {
        const { data, error } = await postRowToTable('skills', [values]);
        if (error || !data?.length) {
          throw new Error('Failed to create new skill');
        }
        const newSkillId = data[0].id;

        if (allowedPlayers.length > 0) {
          const newLinks = allowedPlayers.map((player_id) => ({
            player_id,
            skill_id: newSkillId,
          }));
          await postRowToTable('player_skills', newLinks);
        }
      }
    } catch (error) {
      enqueueSnackbar('Error saving skill and player access', { variant: 'error' });
    } finally {
      handleCloseDialog();
      debouncedFetch(search);
    }
  };

  const visibleRows = skills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box mt={10} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
      <Box width='80%'>
        <Box mb={2} display='flex' justifyContent='space-between'>
          <TextField
            label='Search Skills'
            variant='outlined'
            value={search}
            onChange={handleSearchChange}
            slotProps={{ inputLabel: { shrink: true } }}
            size='small'
          />
          <Button variant='contained' color='primary' onClick={() => handleOpenDialog(null)}>
            Add Skill
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Skill Name</TableCell>
                <TableCell>Short Description</TableCell>
                <TableCell>Allowed Players</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((skill) => (
                <TableRow
                  key={skill.id}
                  hover
                  onClick={() => handleOpenDialog(skill)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{skill.name}</TableCell>
                  <TableCell>{skill.short_description}</TableCell>
                  <TableCell>
                    {skill.allowedPlayers?.length > 0 ? (
                      skill.allowedPlayers.map((playerId) => (
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
          component='div'
          count={skills.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <AddSkillDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onConfirm={handleSubmitDialog}
          skillData={selectedSkill}
        />
      </Box>
    </Box>
  );
};

export default SkillTable;
