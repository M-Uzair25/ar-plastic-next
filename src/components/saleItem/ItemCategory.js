'use client'
import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import PropTypes from 'prop-types';

const ItemCategory = ({ onCategoryChange, selectedDescription }) => {
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllCategories = async () => {
        try {
            setLoading(true);
            
            // Conditionally build the API request URL based on whether a description is selected
            const apiUrl = selectedDescription
                ? `/api/items/itemCategory?description=${selectedDescription.label}`
                : `/api/items/itemCategory`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            const uniqueCategories = [...new Set(data.map(itemCategory => itemCategory.category))];
            const options = uniqueCategories.map((category) => ({ value: category, label: category }));
            setAllCategories(options);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Call fetchAllCategories initially and whenever selectedDescription changes
    useEffect(() => {
        fetchAllCategories();
    }, [selectedDescription]);

    const getCategories = async (inputValue) => {
        try {
            // If there is an inputValue (search term), filter options
            const filteredOptions = allCategories.filter(option =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
            );

            return filteredOptions;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const handleCategoryChange = (selectedOption) => {
        // Pass the selected value to the parent component
        onCategoryChange(selectedOption);
    };

    return (
        <AsyncSelect
            instanceId="category"
            id="itemCategory"
            name="itemCategory"
            loadOptions={getCategories}
            defaultOptions={allCategories}
            onChange={handleCategoryChange}
            isLoading={loading}
        />
    );
};

ItemCategory.propTypes = {
    onCategoryChange: PropTypes.func.isRequired,
};

export default ItemCategory;