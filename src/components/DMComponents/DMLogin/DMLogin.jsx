import React from 'react'
import { useFormik } from 'formik'
import FormTextField from '../../Formik/FormTextField';
import {
	Box,
	Button,
	Typography,
	Paper
} from '@mui/material';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';

const DMLogin = () => {
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();

	const formik = useFormik({
		initialValues: {
			username: '',
			password: '',
		},
		validate: values => {
			const errors = {}

			if (!values.username) {
				errors.username = 'Username is required'
			}

			if (!values.password) {
				errors.password = 'Password is required'
			}

			return errors
		},
		onSubmit: values => {
			if (process.env.REACT_APP_ADMIN_USERNAME === values.username &&
				process.env.REACT_APP_ADMIN_PASSWORD === values.password
			) {
				navigate('/admin/players');
			} else {
				enqueueSnackbar('Username/Password not valid', { variant: 'error' });
			}
		},
	});

	const { handleSubmit } = formik;

	return (
		<Box
			display='flex'
			justifyContent='center'
			alignItems='center'
			height='100vh'
		>
			<Paper elevation={3} sx={{ p: 4, width: 500, borderRadius: 5 }}>
				<Typography variant='h5' mb={2} textAlign='center' fontWeight={600}>
					Dungeon Master Login
				</Typography>
				<FormTextField
					formik={formik}
					name='username'
					label='Username'
				/>
				<FormTextField
					formik={formik}
					name='password'
					label='Password'
				/>
				<Button
					color='primary'
					variant='contained'
					fullWidth
					sx={{ mt: 2 }}
					onClick={handleSubmit}
				>
					Login
				</Button>
			</Paper>
		</Box>
	)
}

export default DMLogin;