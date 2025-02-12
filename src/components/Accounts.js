'use client'
import AsyncSelect from 'react-select/async';
import React, { useState, useEffect } from 'react';

const Accounts = ({ onNameChange, disable, selectedName, apiEndpoint }) => {
    const [allAccounts, setAllAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllAccounts = async () => {
            try {
                setLoading(true);
                const response = apiEndpoint ? await fetch(`/api/accounts?${apiEndpoint}`) : await fetch('/api/accounts');
                const data = await response.json();

                const options = data.map((account) => ({
                    value: account.accountName,
                    label: account.accountName,
                }));

                setAllAccounts(options);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
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
            instanceId="Accounts"
            id="account"
            name="account"
            loadOptions={getAccounts}
            defaultOptions={allAccounts}
            value={selectedName}
            onChange={handleNameChange}
            isLoading={loading}
            isClearable
            isDisabled={disable}
        />
    )
};

export default Accounts;