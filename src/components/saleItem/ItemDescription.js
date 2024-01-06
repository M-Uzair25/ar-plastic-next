'use client'
import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import PropTypes from 'prop-types';

const ItemDescription = ({ onDescriptionChange, selectedCategory }) => {
    const [allDescriptions, setAllDescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllDescriptions = async () => {
        try {
            setLoading(true);

            // Conditionally build the API request URL based on whether a category is selected
            const apiUrl = selectedCategory
                ? `/api/items/itemDescription?category=${selectedCategory}`
                : `/api/items/itemDescription`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            const options = data.map((itemDescription) => ({
                value: itemDescription.description,
                label: itemDescription.description,
            }));

            setAllDescriptions(options);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Call fetchAllDescriptions initially and whenever selectedCategory changes
    useEffect(() => {
        fetchAllDescriptions();
    }, [selectedCategory]);


    const getDescriptions = async (inputValue) => {
        try {
            // If there is an inputValue (search term), filter options
            const filteredOptions = allDescriptions.filter(option =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
            );
            return filteredOptions;

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
            isLoading={loading}
        />
    );
};

ItemDescription.propTypes = {
    onDescriptionChange: PropTypes.func.isRequired,
};

export default ItemDescription;