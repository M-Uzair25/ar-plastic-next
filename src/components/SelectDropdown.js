// SelectDropdown.js
import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';

const SelectDropdown = ({ defaultOptions, loadOptions, defaultValue, id, name, placeholder }) => {
  const [options, setOptions] = useState(defaultOptions);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await loadOptions();
        setOptions(data);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, [loadOptions]);

  return (
    <AsyncSelect
      instanceId={id}
      id={name}
      name={name}
      loadOptions={loadOptions}
      defaultOptions={options}  // Use the state variable for default options
      placeholder={placeholder}
      defaultValue={defaultValue}
    />
  );
};

export default SelectDropdown;
