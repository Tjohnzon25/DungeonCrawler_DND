import React from 'react';
import SkillTable from "./SkillTable";
import { SnackbarProvider } from 'notistack';

const Template = ({ ...args }) => {
  return (
    <>
      <SkillTable {...args} />
    </>
  );
}

const SkillTableConfig = {
  render: Template.bind({}),
  title: 'SkillTable',
  component: SkillTable,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const SkillTableDefault = {};

export default SkillTableConfig;