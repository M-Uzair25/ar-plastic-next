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
            // Fetch all accounts initially without a search term
            const response = await fetch('/api/accounts');
            const data = await response.json();

            // Map the response data to match the required format for react-select
            const options = data.map((account) => ({
                value: account.accountName,
                label: account.accountName,
            }));

            // If there is an inputValue (search term), filter options
            if (inputValue) {
                return options.filter(option =>
                    option.label.toLowerCase().includes(inputValue.toLowerCase())
                );
            }

            return options;
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