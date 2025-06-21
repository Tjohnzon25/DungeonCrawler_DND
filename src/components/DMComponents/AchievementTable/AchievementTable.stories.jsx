import React from 'react';
import AchievementTable from "./AchievementTable";
import { SnackbarProvider } from 'notistack';

const Template = ({ ...args }) => {
  return (
    <>
      <AchievementTable {...args} />
    </>
  );
}

const AchievementTableConfig = {
  render: Template.bind({}),
  title: 'AchievementTable',
  component: AchievementTable,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const AchievementTableDefault = {};

export default AchievementTableConfig;