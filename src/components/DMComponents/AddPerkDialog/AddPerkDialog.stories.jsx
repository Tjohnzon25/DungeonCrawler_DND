import { Button } from "@mui/material";
import AddPerkDialog from "./AddPerkDialog";
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
      <AddPerkDialog open={open} onClose={handleClose} onConfirm={handleSubmit} {...args} />
    </>
  );
}

const AddPerkDialogConfig = {
  render: Template.bind({}),
  title: 'DM Components/AddPerkDialog',
  component: AddPerkDialog,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const AddPerkDialogDefault = {};

export const EditClass = {
  args: {
    perkData: {
      id: '91b7f195-6bd0-4f45-b0a8-d5aeaff40486',
      name: 'test achievement',
      description: '<p>testing</p><p></p><p></p><p></p><p>adsf<strong>asdfaf</strong></p>',
    }
  }
};

export default AddPerkDialogConfig;