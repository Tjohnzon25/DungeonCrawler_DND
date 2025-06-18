import { Box, TextField } from '@mui/material';
import { get } from 'lodash';
import React, { useCallback, useState, useRef, memo } from 'react';

const FormTextField = ({ formik, name, label, disableGutters = false, debounce = true, styleProps, ...otherProps }) => {
	const value = get(formik.values, name);
	const errors = get(formik.errors, name);
	const touched = get(formik.touched, name);
	const timeout = useRef();
	const [oldValue, setOldValue] = useState(value);
	const [localFieldValue, setLocalFieldValue] = useState(value);
	const { handleBlur, handleChange: handleFormikChange } = formik;
	if (oldValue !== value && debounce) {
		setOldValue(value);
		setLocalFieldValue(value);
	}

	const handleChange = useCallback((event) => {
		const { target: { value: targetValue } } = event;
		if (debounce) {
			setLocalFieldValue(targetValue);
			if (timeout.current) clearTimeout(timeout.current);
			timeout.current = setTimeout(() => {
				handleFormikChange(event);
			}, 300);
		} else {
			handleFormikChange(event);
		}
	}, [debounce, handleFormikChange]);

	return (
		<Box py={disableGutters ? 0 : 2}>
			<FormTextFieldMemo
				name={name}
				value={(debounce ? localFieldValue : value) ?? ''}
				label={label}
				handleChange={handleChange}
				handleBlur={handleBlur}
				errors={errors}
				touched={touched}
				styleProps={styleProps}
				{...otherProps}
			/>
		</Box>
	);
};

const FormTextFieldMemo = memo(function FormTextFieldMemo({ name, value, label, handleChange, handleBlur, touched, errors, styleProps, ...otherProps }) {
	return (
		<TextField
			fullWidth
			variant='outlined'
			size='small'
			name={name}
			value={value}
			label={label}
			onChange={handleChange}
			onBlur={handleBlur}
			error={touched && Boolean(errors)}
			helperText={touched && errors ? errors : ''}
			slotProps={styleProps?.slotProps ? styleProps.slotProps : { inputLabel: { shrink: true } }}
			InputProps={{ ...styleProps?.InputProps }}
			{...otherProps}
		/>
	);
});

export default FormTextField;