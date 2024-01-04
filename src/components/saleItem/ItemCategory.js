'use client'
import AsyncSelect from 'react-select/async';
import React, { useState, useEffect } from 'react';

const ItemCategory = () => {
    const [allCategories, setAllCategories] = useState([]);

    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const response = await fetch('/api/items/itemCategory');
                const data = await response.json();

                const options = data.map((itemCategory) => ({
                    value: itemCategory.category,
                    label: itemCategory.category,
                }));

                setAllCategories(options);
            } catch (error) {
                console.error(error);
            }
        };

        fetchAllCategories();
    }, []);

    const getCategories = async (inputValue) => {
        try {
            // Fetch all categories initially without a search term
            const response = await fetch('/api/items/itemCategory');
            const data = await response.json();

            // Map the response data to match the required format for react-select
            const options = data.map((itemCategory) => ({
                value: itemCategory.category,
                label: itemCategory.category,
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
    return (
        <AsyncSelect
            instanceId="category"
            id="itemCategory"
            name="itemCategory"
            loadOptions={getCategories}
            defaultOptions={allCategories}
        />
    )
};

export default ItemCategory;