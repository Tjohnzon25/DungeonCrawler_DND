import React, { useState } from 'react';
import { get, isEqual } from 'lodash';
import { Autocomplete, Box, TextField, Button, InputAdornment } from '@mui/material';

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
  ...otherProps
}) => {
  const formikValue = get(formik.values, name);
  const errors = get(formik.errors, name);
  const touched = get(formik.touched, name);
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e, value) => {
    const newOption = value.value && value.label ? value.label : value;
    formik.setFieldValue(name, newOption);
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
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        size='small'
        value={formikValue}
        onChange={handleChange}
        options={options}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option, value) => {
          if (!option || !value) return false;
          if (typeof option === 'string' && typeof value === 'string') return option === value;
          return isEqual(option, value);
        }}
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