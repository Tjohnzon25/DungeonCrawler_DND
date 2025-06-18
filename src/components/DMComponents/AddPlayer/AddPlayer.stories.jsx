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

export default AddPlayerConfig;