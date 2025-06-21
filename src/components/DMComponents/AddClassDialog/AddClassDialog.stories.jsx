import { Button } from "@mui/material";
import AddClassDialog from "./AddClassDialog";
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
      <AddClassDialog open={open} onClose={handleClose} onConfirm={handleSubmit} {...args} />
    </>
  );
}

const AddClassDialogConfig = {
  render: Template.bind({}),
  title: 'DM Components/AddClassDialog',
  component: AddClassDialog,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const AddClassDialogDefault = {};

export const EditClass = {
  args: {
    classData: {
      id: '91b7f195-6bd0-4f45-b0a8-d5aeaff40486',
      name: 'test class',
      description: '<p>testing</p><p></p><p></p><p></p><p>adsf<strong>asdfaf</strong></p>',
      stat_bonus: {
        strength: 5,
        dexterity: 0,
        constitution: -3,
        intelligence: 3,
        wisdom: 0,
        charisma: 3
      },
    }
  }
};

export default AddClassDialogConfig;