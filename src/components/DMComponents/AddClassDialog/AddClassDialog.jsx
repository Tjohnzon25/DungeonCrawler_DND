import { useFormik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import FormTextField from '../../Formik/FormTextField';
import FormRichTextField from '../../Formik/FormRichTextField';
import { Button, Dialog, DialogActions, DialogContent, Grid } from '@mui/material';
import FormAutocompleteField from '../../Formik/FormAutocompleteField';
import { useSnackbar } from 'notistack';
import { getTableRowByColumn } from '../../../lib/db_functions';

const getOptionLabel = (value, list) => {
  if (value) {
    return (`${value?.name || list?.find(x => value === x.value)?.name}`)
  } else {
    return '';
  }
};

const AddClassDialog = ({ classData, open, onClose, onConfirm }) => {
  const [players, setPlayers] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: classData || {
      name: '',
      description: '',
      stat_bonus: {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0
      },
      allowedPlayers: []
    },
    validate: values => {
      const errors = {}

      if (!values.name) {
        errors.name = 'Class name is required'
      }
      if (!values.description) {
        errors.level = 'Description is required'
      }
      if (values.xp === '') {
        errors.xp = 'Starting XP is required'
      }

      return errors
    },
    enableReinitialize: true,
    onSubmit: async values => {
      await onConfirm(values);
    },
  });

  const fetchPlayers = useCallback(async () => {
    try {
      const { data } = await getTableRowByColumn('players', '*');
      setPlayers(data);
    } catch (error) {
      enqueueSnackbar('Error getting players', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const { handleSubmit } = formik;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogContent>
        <FormTextField
          formik={formik}
          name='name'
          label='Class Name'
        />
        <FormRichTextField
          formik={formik}
          name='description'
          label='Description'
        />
        <Grid container spacing={2} justifyContent='center'>
          <Grid item size={2}>
            <FormTextField
              formik={formik}
              name='stat_bonus.strength'
              label='STR'
              type='number'
            />
          </Grid>
          <Grid item size={2}>
            <FormTextField
              formik={formik}
              name='stat_bonus.dexterity'
              label='DEX'
              type='number'
            />
          </Grid>
          <Grid item size={2}>
            <FormTextField
              formik={formik}
              name='stat_bonus.constitution'
              label='CON'
              type='number'
            />
          </Grid>
          <Grid item size={2}>
            <FormTextField
              formik={formik}
              name='stat_bonus.intelligence'
              label='INT'
              type='number'
            />
          </Grid>
          <Grid item size={2}>
            <FormTextField
              formik={formik}
              name='stat_bonus.wisdom'
              label='WIS'
              type='number'
            />
          </Grid>
          <Grid item size={2}>
            <FormTextField
              formik={formik}
              name='stat_bonus.charisma'
              label='CHA'
              type='number'
            />
          </Grid>
        </Grid>
        <FormAutocompleteField
          formik={formik}
          name='allowedPlayers'
          label='Player(s) allowed to use'
          getOptionLabel={value => getOptionLabel(value, players)}
          storeProperty='id'
          options={players}
          multiple
        />
      </DialogContent>
      <DialogActions>
        <Button
          color='primary'
          variant='contained'
          onClick={handleSubmit}
        >
          {classData ? 'Update Class' : 'Add Class'}
        </Button>
        <Button
          color='primary'
          variant='outlined'
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddClassDialog;