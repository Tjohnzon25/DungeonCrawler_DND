import React, { useState } from 'react';
import { get } from 'lodash';
import {
  Autocomplete,
  Box,
  TextField,
  Button,
  InputAdornment
} from '@mui/material';

const FormAutocompleteField = ({
  options,
  name,
  label,
  formik,
  disableGutters = false,
  getOptionLabel = (opt) => opt?.label || '',
  getOptionValue = (opt) => opt?.id,
  showAddBtn = false,
  styleProps = {},
  className = '',
  ...otherProps
}) => {
  const formikValue = get(formik.values, name);
  const errors = get(formik.errors, name);
  const touched = get(formik.touched, name);
  const [inputValue, setInputValue] = useState('');

  const currentOption = options.find((opt) => getOptionValue(opt) === formikValue) || null;

  const handleChange = (event, newValue) => {
    formik.setFieldValue(name, newValue ? getOptionValue(newValue) : null);
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      if (otherProps.multiple) {
        const currentValues = Array.isArray(formikValue) ? [...formikValue] : [];
        formik.setFieldValue(name, [...currentValues, inputValue]);
      } else {
        formik.setFieldValue(name, inputValue);
      }
      setInputValue('');
    }
  };

  return (
    <Box py={disableGutters ? 0 : 2}>
      <Autocomplete
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        size='small'
        value={currentOption}
        onChange={handleChange}
        options={options}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option, value) => getOptionValue(option) === getOptionValue(value)}
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
            InputProps={{
              ...params.InputProps,
              ...styleProps?.InputProps,
              endAdornment: (
                <>
                  {showAddBtn && inputValue.trim() && (
                    <InputAdornment position='end'>
                      <Button
                        variant='contained'
                        size='small'
                        onClick={handleAddClick}
                        sx={{ minWidth: 'auto', ml: 1 }}
                      >
                        Add
                      </Button>
                    </InputAdornment>
                  )}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
        {...otherProps}
      />
    </Box>
  );
};

export default FormAutocompleteField;
