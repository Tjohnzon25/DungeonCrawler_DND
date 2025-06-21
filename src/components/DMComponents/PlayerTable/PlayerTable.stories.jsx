import React from 'react';
import PlayerTable from "./PlayerTable";
import { SnackbarProvider } from 'notistack';

const Template = ({ ...args }) => {
  return (
    <>
      <PlayerTable {...args} />
    </>
  );
}

const PlayerTableConfig = {
  render: Template.bind({}),
  title: 'DM Components/PlayerTable',
  component: PlayerTable,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const PlayerTableDefault = {};

export default PlayerTableConfig;