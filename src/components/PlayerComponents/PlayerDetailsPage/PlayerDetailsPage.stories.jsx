import React from 'react';
import PlayerDetailsPage from "./PlayerDetailsPage";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

const Template = ({ ...args }) => {
  return (
    <>
      <PlayerDetailsPage {...args} />
    </>
  );
}

const PlayerLoginConfig = {
  render: Template.bind({}),
  title: 'Player Components/PlayerDetailsPage',
  component: PlayerDetailsPage,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <MemoryRouter initialEntries={['/player-details/test']}>
          <Routes>
            <Route path='/player-details/:playerName' element={<Story />} />
          </Routes>
        </MemoryRouter>
      </SnackbarProvider>
    )
  ]
};

export const PlayerLoginDefault = {};

export default PlayerLoginConfig;