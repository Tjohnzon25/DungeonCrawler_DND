import { Button } from "@mui/material";
import AddPlayerDialog from "./AddPlayerDialog";
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
      <AddPlayerDialog open={open} onClose={handleClose} onConfirm={handleSubmit} {...args} />
    </>
  );
}

const AddPlayerDialogConfig = {
  render: Template.bind({}),
  title: 'DM Components/AddPlayerDialog',
  component: AddPlayerDialog,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const AddPlayerDialogDefault = {};

export const EditPlayer = {
  args: {
    playerData: {
      id: '91b7f195-6bd0-4f45-b0a8-d5aeaff40486',
      name: 'test',
      xp: 0,
      level: 1
    }
  }
};

export default AddPlayerDialogConfig;