import AddPlayer from "./AddPlayer";
import { SnackbarProvider } from 'notistack';

const Template = ({ ...args }) => <AddPlayer {...args} />

const AddPlayerConfig = {
  render: Template.bind({}),
  title: 'AddPlayer',
  component: AddPlayer,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const AddPlayerDefault = {};

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

export default AddPlayerConfig;