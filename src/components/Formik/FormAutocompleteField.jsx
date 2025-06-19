import React, { useMemo, useState } from 'react';
import { get } from 'lodash';
import {
  Autocomplete,
  Box,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';

const FormAutocompleteField = ({
  options,
  name,
  label,
  formik,
  disableGutters = false,
  getOptionLabel,
  isOptionEqualToValue,
  storeProperty = null,
  showAddBtn = false,
  styleProps = {},
  className = '',
  multiple = false,
  ...otherProps
}) => {
  const formikValue = get(formik.values, name);
  const errors = get(formik.errors, name);
  const touched = get(formik.touched, name);
  const [inputValue, setInputValue] = useState('');

  // Convert formik stored values (IDs or whatever) back to option objects
  const selectedValue = useMemo(() => {
    if (!storeProperty) return formikValue;

    if (multiple) {
      return options.filter((opt) => formikValue?.includes(opt[storeProperty]));
    }
    return options.find((opt) => opt[storeProperty] === formikValue) || null;
  }, [formikValue, options, storeProperty, multiple]);

  const handleChange = (e, value) => {
    if (storeProperty) {
      if (multiple) {
        formik.setFieldValue(
          name,
          value.map((v) => v?.[storeProperty])
        );
      } else {
        formik.setFieldValue(name, value?.[storeProperty] ?? null);
      }
    } else {
      formik.setFieldValue(name, value);
    }
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      if (multiple) {
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
        multiple={multiple}
        inputValue={inputValue}
        onInputChange={(e, newInputValue) => {
          setInputValue(newInputValue);
        }}
        size='small'
        value={selectedValue}
        onChange={handleChange}
        options={options}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={
          isOptionEqualToValue ||
          ((option, value) => {
            if (!option || !value) return false;
            if (storeProperty) {
              return option[storeProperty] === value[storeProperty];
            }
            return option === value;
          })
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
                ...styleProps?.slotProps?.inputLabel,
              },
              inputProps: {
                ...params.inputProps,
                autoComplete: name,
                ...styleProps?.slotProps?.inputProps,
              },
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
              ),
            }}
          />
        )}
        {...otherProps}
      />
    </Box>
  );
};

export default FormAutocompleteField;
