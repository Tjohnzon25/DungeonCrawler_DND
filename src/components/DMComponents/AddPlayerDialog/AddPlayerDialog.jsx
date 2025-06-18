import { useFormik } from 'formik';
import React from 'react';
import FormTextField from '../../Formik/FormTextField';
import { Button, Dialog, DialogContent } from '@mui/material';

const AddPlayerDialog = ({ playerData, open, onClose, onConfirm }) => {

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
      onConfirm(values);
    },
  });

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
        <Button
          color='primary'
          variant='contained'
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSubmit}
        >
          {playerData ? 'Update Player' : 'Add Player'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlayerDialog;