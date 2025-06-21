import React from 'react';
import ClassTable from "./ClassTable";
import { SnackbarProvider } from 'notistack';

const Template = ({ ...args }) => {
  return (
    <>
      <ClassTable {...args} />
    </>
  );
}

const ClassTableConfig = {
  render: Template.bind({}),
  title: 'DM Components/ClassTable',
  component: ClassTable,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const ClassTableDefault = {};

export default ClassTableConfig;