import React from 'react';
import PerksTable from "./PerksTable";
import { SnackbarProvider } from 'notistack';

const Template = ({ ...args }) => {
  return (
    <>
      <PerksTable {...args} />
    </>
  );
}

const PerksTableConfig = {
  render: Template.bind({}),
  title: 'DM Components/PerksTable',
  component: PerksTable,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const PerksTableDefault = {};

export default PerksTableConfig;