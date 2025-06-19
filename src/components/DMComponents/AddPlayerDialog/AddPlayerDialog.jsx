import { useFormik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import FormTextField from '../../Formik/FormTextField';
import FormAutocompleteField from '../../Formik/FormAutocompleteField';
import { Button, Dialog, DialogContent, DialogActions } from '@mui/material';
import { getTableRowByColumn } from '../../../lib/db_functions';
import { useSnackbar } from 'notistack';

const getOptionLabel = (value, list) => {
  if (value) {
    return (`${list?.find(x => value === x.value)?.name || value?.name}`)
  } else {
    return '';
  }
};

const AddPlayerDialog = ({ playerData, open, onClose, onConfirm }) => {
  const [classes, setClasses] = useState([]);
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
    enableReinitialize: true,
    onSubmit: async values => {
      await onConfirm(values);
    },
  });

  const fetchClasses = useCallback(async () => {
    try {
      const { data } = await getTableRowByColumn('classes', '*');
      setClasses(data);
    } catch (error) {
      enqueueSnackbar('Error getting classes', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const { handleSubmit } = formik;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogContent>
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
        <FormAutocompleteField
          formik={formik}
          name='class_id'
          label='Class'
          getOptionLabel={value => getOptionLabel(value, classes)}
          storeProperty='id'
          options={classes}
        />
        <DialogActions>
          <Button
            color='primary'
            variant='contained'
            onClick={handleSubmit}
          >
            {playerData ? 'Update Player' : 'Add Player'}
          </Button>
          <Button
            color='secondary'
            variant='outlined'
            onClick={onClose}
          >
            Close
          </Button>
        </DialogActions>

      </DialogContent>
    </Dialog>
  );
};

export default AddPlayerDialog;