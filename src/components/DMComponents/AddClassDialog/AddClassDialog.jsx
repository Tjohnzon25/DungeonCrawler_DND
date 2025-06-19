import { useFormik } from 'formik';
import React from 'react';
import FormTextField from '../../Formik/FormTextField';
import FormRichTextField from '../../Formik/FormRichTextField';
import { Button, Dialog, DialogActions, DialogContent, Grid } from '@mui/material';

const AddClassDialog = ({ classData, open, onClose, onConfirm }) => {

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
      </DialogContent>
    </Dialog>
  );
};

export default AddClassDialog;