import React from 'react';
import PlayerLogin from "./PlayerLogin";
import { MemoryRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

const Template = ({ ...args }) => {
  return (
    <>
      <PlayerLogin {...args} />
    </>
  );
}

const PlayerLoginConfig = {
  render: Template.bind({}),
  title: 'Player Components/PlayerLogin',
  component: PlayerLogin,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/player-login']}>
        <SnackbarProvider>
          <Story />
        </SnackbarProvider>
      </MemoryRouter>
    )
  ]
};

export const PlayerLoginDefault = {};

export default PlayerLoginConfig;