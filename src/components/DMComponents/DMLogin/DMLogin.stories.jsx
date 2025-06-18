import DMLogin from "./DMLogin";
import { MemoryRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

const Template = ({ ...args }) => <DMLogin {...args} />

const DMLoginConfig = {
	render: Template.bind({}),
	title: 'DMLogin',
	component: DMLogin,
	tags: ['!autodocs'],
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={['/dm-login']}>
				<SnackbarProvider>
					<Story />
				</SnackbarProvider>
			</MemoryRouter>
		)
	]
};

export const DMLoginDefault = {};

export default DMLoginConfig;