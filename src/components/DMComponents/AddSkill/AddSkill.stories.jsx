import AddSkill from "./AddSkill";
import { SnackbarProvider } from 'notistack';

const Template = ({ ...args }) => <AddSkill {...args} />

const AddSkillConfig = {
  render: Template.bind({}),
  title: 'AddSkill',
  component: AddSkill,
  tags: ['!autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    )
  ]
};

export const AddSkillDefault = {};

export const EditSkill = {
  args: {
    skillData: {
      id: '91b7f195-6bd0-4f45-b0a8-d5aeaff40486',
      name: 'test skill',
      spell_level: 3,
      level_1_description: '<p>testing</p><p></p><p></p><p></p><p>adsf<strong>asdfaf</strong></p>',
      level_5_description: '',
      level_10_description: 'test level 10 desc',
      level_15_description: '',
      level_20_description: 'test level 20 desc',
    }
  }
};

export default AddSkillConfig;