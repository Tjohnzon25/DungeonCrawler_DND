import React, { useState } from 'react';
import { get } from 'lodash';
import {
  Autocomplete,
  Box,
  TextField
} from '@mui/material';

const FormAutocompleteField = ({
  options,
  name,
  label,
  formik,
  disableGutters = false,
  getOptionLabel,
  showAddBtn = false,
  styleProps = {},
  className = '',
  multiple = false,
  ...otherProps
}) => {
  const formikValue = get(formik.values, name) || (multiple ? [] : null);
  const errors = get(formik.errors, name);
  const touched = get(formik.touched, name);
  const [inputValue, setInputValue] = useState('');

  const handleChange = (event, value) => {
    formik.setFieldValue(name, value);
  };

  return (
    <Box py={disableGutters ? 0 : 2}>
      <Autocomplete
        multiple={multiple}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        size='small'
        value={formikValue}
        onChange={handleChange}
        options={options}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option, value) =>
          option?.id === value?.id
        }
        onBlur={(event) => formik.getFieldProps(name).onBlur(event)}
        className={className}
        ListboxProps={styleProps?.ListboxProps}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            label={label}
            variant='outlined'
            error={touched && Boolean(errors)}
            helperText={touched && errors ? errors : ''}
            slotProps={{
              inputLabel: {
                shrink: true,
                ...styleProps?.slotProps?.inputLabel
              },
              inputProps: {
                ...params.inputProps,
                autoComplete: name,
                ...styleProps?.slotProps?.inputProps
              }
            }}
          />
        )}
        {...otherProps}
      />
    </Box>
  );
};


export default FormAutocompleteField;
