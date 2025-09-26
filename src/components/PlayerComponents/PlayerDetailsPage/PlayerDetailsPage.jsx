import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { SupabaseOperators } from '../../../lib/supabaseOperators';
import { getTableRowByFilters } from '../../../lib/db_functions';
import { useSnackbar } from 'notistack';
import { Box, Typography, Tabs, Tab, Grid, Card, CardContent } from '@mui/material';
import { useFormik } from 'formik';
import FormTextField from '../../Formik/FormTextField';

const PlayerDetailsPage = () => {
  const [playerData, setPlayerData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [tabValue, setTabValue] = useState('achievements');
  const { playerName } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: classData || {
      name: '',
      level: '',
      xp: null,
      ability_scores: {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0
      }
    },
    validate: values => {
      const errors = {}

      if (!values.ability_scores.strength) {
        errors.name = 'Enter a number for strength'
      }
      if (!values.ability_scores.dexterity) {
        errors.name = 'Enter a number for dexterity'
      }
      if (!values.ability_scores.constitution) {
        errors.name = 'Enter a number for constitution'
      }
      if (!values.ability_scores.intelligence) {
        errors.name = 'Enter a number for intelligence'
      }
      if (!values.ability_scores.wisdom) {
        errors.name = 'Enter a number for wisdom'
      }
      if (!values.ability_scores.charisma) {
        errors.name = 'Enter a number for charisma'
      }

      return errors
    },
    onSubmit: async values => {
      // update player ability scores
    },
  });

  const fetchPlayerData = useCallback(async () => {
    const filters = [
      {
        column: 'name',
        operator: SupabaseOperators.EQ,
        value: `${playerName}`,
      },
    ];

    const sortby = { column: 'name', ascending: true };

    try {
      const { data } = await getTableRowByFilters('players', filters, sortby);
      setPlayerData(data[0]);
    } catch (error) {
      enqueueSnackbar('Error getting player data', { variant: 'error' });
      setPlayerData({});
    }
  }, [playerName, enqueueSnackbar]);

  const handleTabChange = (e, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    fetchPlayerData();
  }, [fetchPlayerData]);

  console.log(playerData)

  const TotalAbilityScoreCard = ({type, value}) => (
    <Card variant='outlined'>
      <CardContent>
        <Typography variant='caption'>{type}</Typography>
        <Typography variant='h6'>{value}</Typography>
      </CardContent>
    </Card>
  )

  return (
    <Box>
      <Box>
        <Typography>{playerData?.name}</Typography>
        <Typography>{playerData?.level}</Typography>
        <Box pb={4}>
          <Typography variant='h6' textAlign='center'>Player base ability scores</Typography>
          <Grid container spacing={2} justifyContent='center'>
            <Grid item size={0.5}>
              <FormTextField
                formik={formik}
                name='ability_scores.strength'
                label='STR'
                type='number'
              />
            </Grid>
            <Grid item size={0.5}>
              <FormTextField
                formik={formik}
                name='ability_scores.dexterity'
                label='DEX'
                type='number'
              />
            </Grid>
            <Grid item size={0.5}>
              <FormTextField
                formik={formik}
                name='ability_scores.constitution'
                label='CON'
                type='number'
              />
            </Grid>
            <Grid item size={0.5}>
              <FormTextField
                formik={formik}
                name='ability_scores.intelligence'
                label='INT'
                type='number'
              />
            </Grid>
            <Grid item size={0.5}>
              <FormTextField
                formik={formik}
                name='ability_scores.wisdom'
                label='WIS'
                type='number'
              />
            </Grid>
            <Grid item size={0.5}>
              <FormTextField
                formik={formik}
                name='ability_scores.charisma'
                label='CHA'
                type='number'
              />
            </Grid>
          </Grid>
        </Box>
        <Box>
          <Box pb={1}>
            <Typography variant='h6' textAlign='center'>Player total ability scores (base + class)</Typography>
          </Box>
          <Grid container spacing={2} justifyContent='center'>
            <Grid item size={0.5} textAlign='center'>
              <TotalAbilityScoreCard type='STR' value={12} />
            </Grid>
            <Grid item size={0.5} textAlign='center'>
              <TotalAbilityScoreCard type='DEX' value={12} />
            </Grid>
            <Grid item size={0.5} textAlign='center'>
              <TotalAbilityScoreCard type='CON' value={12} />
            </Grid>
            <Grid item size={0.5} textAlign='center'>
              <TotalAbilityScoreCard type='INT' value={12} />
            </Grid>
            <Grid item size={0.5} textAlign='center'>
              <TotalAbilityScoreCard type='WIS' value={12} />
            </Grid>
            <Grid item size={0.5} textAlign='center'>
              <TotalAbilityScoreCard type='CHA' value={12} />
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
      >
        <Tab value='achievements' label='Achievements' />
        <Tab value='class' label='Class Details' disabled={!classData} />
        <Tab value='perks' label='Perks' />
        <Tab value='skills' label='Skills' />
      </Tabs>
    </Box>
  )
};

export default PlayerDetailsPage;
