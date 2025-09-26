import { useFormik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import FormTextField from '../../Formik/FormTextField';
import FormRichTextField from '../../Formik/FormRichTextField';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
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

const AddPerkDialog = ({ perkData, open, onClose, onConfirm }) => {
  const [players, setPlayers] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: perkData || {
      name: '',
      description: '',
      allowedPlayers: []
    },
    validate: values => {
      const errors = {}

      if (!values.name) {
        errors.name = 'Perk name is required'
      }
      if (!values.description) {
        errors.description = 'Description is required'
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
          label='Perk Name'
        />
        <FormRichTextField
          formik={formik}
          name='description'
          label='Description'
        />
        <FormAutocompleteField
          formik={formik}
          name='allowedPlayers'
          label='Player(s) that have perk'
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
          {perkData ? 'Update Perk' : 'Add Perk'}
        </Button>
        <Button
          color='secondary'
          variant='outlined'
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPerkDialog;