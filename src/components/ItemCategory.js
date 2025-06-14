'use client'
import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import PropTypes from 'prop-types';

const ItemCategory = ({ onCategoryChange, selectedDescription }) => {
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchAllCategories = async () => {
        try {
            setLoading(true);

            let apiUrl;

            if (selectedDescription && !selectedCategory) {
                apiUrl = `/api/items/itemCategory?description=${selectedDescription.value}`;
            }
            else if (selectedCategory && selectedDescription) {
                return;
            }
            else {
                apiUrl = `/api/items/itemCategory`;
            }

            const response = await fetch(apiUrl);
            const data = await response.json();

            const uniqueCategories = [...new Set(data.map(itemCategory => itemCategory.category))];
            const options = uniqueCategories.map((category) => ({ value: category, label: category }));
            setAllCategories(options);

            // Set selectedCategory if there's only one category
            if (options.length === 1) {
                setSelectedCategory(options[0]);
                onCategoryChange(options[0]); // Update parent component when setting default value
            } else {
                setSelectedCategory(null);
                onCategoryChange(null);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllCategories();
    }, [selectedDescription]);

    const getCategories = async (inputValue) => {
        try {
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
        setSelectedCategory(selectedOption);
        onCategoryChange(selectedOption);
    };

    return (
        <AsyncSelect
            styles={{
                control: (styles, state) => ({
                    ...styles,
                    color: state.isDisabled ? '#aaa' : 'white',
                    borderColor: state.isDisabled ? 'red' : '#cccccc',
                }),
                singleValue: (provided) => ({
                    ...provided,
                    color: 'blue',
                }),
            }}
            instanceId="category"
            id="itemCategory"
            name="itemCategory"
            loadOptions={getCategories}
            defaultOptions={allCategories}
            value={selectedCategory}
            onChange={handleCategoryChange}
            isLoading={loading}
            isClearable
            isDisabled={selectedDescription}
        />
    );
};

ItemCategory.propTypes = {
    onCategoryChange: PropTypes.func.isRequired,
};

export default ItemCategory;
