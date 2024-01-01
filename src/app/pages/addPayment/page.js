'use client'
import React from 'react';
import { Card, CardTitle, CardBody, Form, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import SelectDropdown from '@/app/components/SelectDropdown';

const defaultAccount = { value: 'Cash', label: 'Cash' };

const AddPayment = () => {
    const getAccounts = async (inputValue) => {
        try {
            const response = await fetch('/api/accounts');
            const data = await response.json();

            const options = data.map((account) => ({
                value: account.accountName,
                label: account.accountName,
            }));

            if (inputValue) {
                return options.filter((option) =>
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
            <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
                <i className="me-2"> </i>
                Add Payment
            </CardTitle>
            <CardBody>
                <Form>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="account">Account</Label>
                                <SelectDropdown
                                    id="customerName"
                                    name="account"
                                    loadOptions={getAccounts}
                                    defaultOptions={[]}
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
                                <Input id="description" name="description" placeholder="Description" type="text" />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={2}>
                            <FormGroup>
                                <Label for="total">Amount</Label>
                                <Input id="total" name="total" type="number" min="0" defaultValue="0" />
                            </FormGroup>
                        </Col>
                        <Col md={2}>
                            <FormGroup>
                                <Label for="payment">Banam / Gama</Label>
                                <Input id="payment" name="payment" type="select">
                                    <option>Banam</option>
                                    <option>Gama</option>
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Button>Submit</Button>
                </Form>
            </CardBody>
        </Card>
    );
};

export default AddPayment;
