'use client'
import AsyncSelect from 'react-select/async';
import React, { useState, useEffect } from 'react';

const CustomerName = ({ onNameChange }) => {
    const [allAccounts, setAllAccounts] = useState([]);
    const defaultAccount = { value: 'Cash', label: 'Cash' };

    useEffect(() => {
        const fetchAllAccounts = async () => {
            try {
                const response = await fetch('/api/accounts');
                const data = await response.json();

                const options = data.map((account) => ({
                    value: account.accountName,
                    label: account.accountName,
                }));

                setAllAccounts(options);
            } catch (error) {
                console.error(error);
            }
        };

        fetchAllAccounts();
    }, []);

    const getAccounts = async (inputValue) => {
        try {
            // If there is an inputValue (search term), filter options
            const filteredOptions = allAccounts.filter(option =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
            );
            return filteredOptions;

        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const handleNameChange = (selectedOption) => {
        // Pass the selected value to the parent component
        onNameChange(selectedOption);
    };

    return (
        <AsyncSelect
            instanceId="customerName"
            id="account"
            name="account"
            loadOptions={getAccounts}
            defaultOptions={allAccounts}
            placeholder="Search or select an account"
            defaultValue={defaultAccount}
            onChange={handleNameChange}
        />
    )
};

export default CustomerName;