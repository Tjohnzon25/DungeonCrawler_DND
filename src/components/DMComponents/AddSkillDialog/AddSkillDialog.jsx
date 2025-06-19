import { useFormik } from 'formik';
import React from 'react';
import FormTextField from '../../Formik/FormTextField';
import FormRichTextField from '../../Formik/FormRichTextField';
import { Button, Dialog, DialogContent, DialogActions } from '@mui/material';

const AddSkill = ({ skillData, open, onClose, onConfirm }) => {

  const formik = useFormik({
    initialValues: skillData || {
      name: '',
      spell_level: 1,
      level_1_description: '',
      level_5_description: '',
      level_10_description: '',
      level_15_description: '',
      level_20_description: ''
    },
    validate: values => {
      const errors = {}

      if (!values.name) {
        errors.name = 'Player name is required'
      }
      if (!values.level_1_description) {
        errors.description = 'Level 1 Description is required'
      }
      if (values.spell_level === '') {
        errors.spell_level = 'Spell Level is required'
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogContent>
        <FormTextField
          formik={formik}
          name='name'
          label='Skill Name'
        />
        <FormTextField
          formik={formik}
          name='spell_level'
          label='Spell Level'
          type='number'
        />
        <FormRichTextField
          formik={formik}
          name='level_1_description'
          label='Level 1 Description'
        />
        <FormRichTextField
          formik={formik}
          name='level_5_description'
          label='Level 5 Description'
        />
        <FormRichTextField
          formik={formik}
          name='level_10_description'
          label='Level 10 Description'
        />
        <FormRichTextField
          formik={formik}
          name='level_15_description'
          label='Level 15 Description'
        />
        <FormRichTextField
          formik={formik}
          name='level_20_description'
          label='Level 20 Description'
        />
        <DialogActions>
          <Button
            color='primary'
            variant='contained'
            onClick={handleSubmit}
          >
            {skillData ? 'Update Skill' : 'Add Skill'}
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

export default AddSkill;