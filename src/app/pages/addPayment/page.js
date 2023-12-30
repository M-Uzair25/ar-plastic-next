'use client'
import { Row, Col, Button, Form, FormGroup, Label, Input, Card, CardTitle, CardBody } from 'reactstrap';
import AsyncSelect from 'react-select/async';
import React, { useState, useEffect } from 'react';



const AddPayment = () => {
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
        const apiUrl = '/api/accounts';

        try {
            // Fetch all accounts initially without a search term
            const response = await fetch(apiUrl);
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
    return (
        <Card>
            <CardTitle tag="h5" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
                <i className="me-2"> </i>
                Add Payment
            </CardTitle>
            <CardBody>
                <Form>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="account">Account</Label>
                                <AsyncSelect
                                    instanceId="customerName"
                                    id="account"
                                    name="account"
                                    loadOptions={getAccounts}
                                    defaultOptions={allAccounts}
                                    placeholder="Search or select an account"
                                    defaultValue={defaultAccount}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={5}>
                            <FormGroup>
                                <Label for="description">Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder="Description"
                                    type="text"
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={2}>
                            <FormGroup>
                                <Label for="total">
                                    Amount
                                </Label>
                                <Input id="total" name="total" type="number" min="0" defaultValue="0" />
                            </FormGroup>
                        </Col>
                        <Col md={2}>
                            <FormGroup>
                                <Label for="payment">
                                    Banam / Gama
                                </Label>
                                <Input id="payment" name="payment" type="select" >
                                    <option>
                                        Banam
                                    </option>
                                    <option>
                                        Gama
                                    </option>
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Button>
                        Submit
                    </Button>
                </Form>
            </CardBody>
        </Card>
    );
};

export default AddPayment;
