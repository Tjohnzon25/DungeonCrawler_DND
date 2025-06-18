import { useFormik } from 'formik';
import React from 'react';
import { useSnackbar } from 'notistack';
import FormTextField from '../../Formik/FormTextField';
import { postRowToTable, updateRowInTable } from '../../../lib/db_functions';
import { Box, Button } from '@mui/material';

const AddPlayer = ({ playerData }) => {

  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: playerData || {
      name: '',
      level: 1,
      xp: 0,
      class_id: null
    },
    validate: values => {
      const errors = {}

      if (!values.name) {
        errors.name = 'Player name is required'
      }
      if (!values.level) {
        errors.level = 'Starting level is required'
      }
      if (values.xp === '') {
        errors.xp = 'Starting XP is required'
      }

      return errors
    },
    onSubmit: async values => {
      try {
        if (playerData) {
          updateRowInTable('players', values, 'id', values.id);
        } else {
          await postRowToTable('players', [values]);
          enqueueSnackbar('Successfully added player', { variant: 'success' });
        }
      } catch (error) {
        enqueueSnackbar(`Error when creating player...${error}`, { variant: 'error' });
      }
    },
  });

  const { handleSubmit } = formik;

  return (
    <Box>
      <FormTextField
        formik={formik}
        name='name'
        label='Player Name'
      />
      <FormTextField
        formik={formik}
        name='level'
        label='Level'
        type='number'
      />
      <FormTextField
        formik={formik}
        name='xp'
        label='XP'
        type='number'
      />
      <Button
        color='primary'
        variant='contained'
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSubmit}
      >
        {playerData ? 'Update Player' : 'Add Player'}
      </Button>
    </Box>
  );
};

export default AddPlayer;