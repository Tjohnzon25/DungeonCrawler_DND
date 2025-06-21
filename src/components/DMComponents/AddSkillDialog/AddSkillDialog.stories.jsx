import React, { useState } from 'react';
import AddSkillDialog from "./AddSkillDialog";
import { SnackbarProvider } from 'notistack';
import { Button } from '@mui/material';

const Template = ({ ...args }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  }
  const handleSubmit = (values) => {
    console.log(values);
  }

  return (
    <>
      <Button onClick={handleOpen}>Open</Button>
      <AddSkillDialog open={open} onClose={handleClose} onConfirm={handleSubmit} {...args} />
    </>
  );
}

const AddSkillDialogConfig = {
  render: Template.bind({}),
  title: 'DM Components/AddSkillDialog',
  component: AddSkillDialog,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const AddSkillDialogDefault = {};

export const EditSkill = {
  args: {
    skillData: {
      id: '91b7f195-6bd0-4f45-b0a8-d5aeaff40486',
      name: 'test skill',
      spell_level: 3,
      level_1_description: '<p>testing</p><p></p><p></p><p></p><p>adsf<strong>asdfaf</strong></p>',
      level_5_description: '',
      level_10_description: 'test level 10 desc',
      level_15_description: '',
      level_20_description: 'test level 20 desc',
    }
  }
};

export default AddSkillDialogConfig;