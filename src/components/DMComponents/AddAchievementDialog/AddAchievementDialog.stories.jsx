import { Button } from "@mui/material";
import AddAchievementDialog from "./AddAchievementDialog";
import { SnackbarProvider } from 'notistack';
import { useState } from "react";

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
      <AddAchievementDialog open={open} onClose={handleClose} onConfirm={handleSubmit} {...args} />
    </>
  );
}

const AddAchievementDialogConfig = {
  render: Template.bind({}),
  title: 'DM Components/AddAchievementDialog',
  component: AddAchievementDialog,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const AddAchievementDialogDefault = {};

export const EditClass = {
  args: {
    achievementData: {
      id: '91b7f195-6bd0-4f45-b0a8-d5aeaff40486',
      name: 'test achievement',
      description: '<p>testing</p><p></p><p></p><p></p><p>adsf<strong>asdfaf</strong></p>',
      reward: 'THIS IS YOUR REWARD'
    }
  }
};

export default AddAchievementDialogConfig;