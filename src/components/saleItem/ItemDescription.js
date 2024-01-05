'use client'
import AsyncSelect from 'react-select/async';
import React, { useState, useEffect } from 'react';

const ItemDescription = ({ onDescriptionChange }) => {
    const [allDescriptions, setAllDescriptions] = useState([]);

    useEffect(() => {
        const fetchAllDescriptions = async () => {
            try {
                const response = await fetch('/api/items/itemDescription');
                const data = await response.json();

                const options = data.map((itemDescription) => ({
                    value: itemDescription.description,
                    label: itemDescription.description,
                }));

                setAllDescriptions(options);
            } catch (error) {
                console.error(error);
            }
        };

        fetchAllDescriptions();
    }, []);

    const getDescriptions = async (inputValue) => {
        try {
            // Fetch all Descriptions initially without a search term
            const response = await fetch('/api/items/itemDescription');
            const data = await response.json();

            // Map the response data to match the required format for react-select
            const options = data.map((itemDescription) => ({
                value: itemDescription.description,
                label: itemDescription.description,
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
    
    const handleDescriptionChange = (selectedOption) => {
        // Pass the selected value to the parent component
        onDescriptionChange(selectedOption);
    };

    return (
        <AsyncSelect
            instanceId="description"
            id="itemDescription"
            name="itemDescription"
            loadOptions={getDescriptions}
            defaultOptions={allDescriptions}
            onChange={handleDescriptionChange}
        />
    )
};

export default ItemDescription;