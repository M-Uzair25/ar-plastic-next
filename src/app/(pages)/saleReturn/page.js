'use client'
import React, { useState, useCallback, useMemo } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input, Spinner } from 'reactstrap';
import Accounts from '@/components/Accounts';
import ItemCategory from '@/components/ItemCategory';
import ItemDescription from '@/components/ItemDescription';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SaleReturn = () => {
    const defaultCAccountName = { value: 'Cash', label: 'Cash' };
    const [selectedName, setSelectedName] = useState(defaultCAccountName);
    const [remarks, setRemarks] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDescription, setSelectedDescription] = useState(null);
    const [bagQuantity, setBagQuantity] = useState('');
    const [kgQuantity, setKgQuantity] = useState(0);
    const [bagRate, setBagRate] = useState('');
    const [perKgRate, setPerKgRate] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    const handleNameChange = async (selectedOption) => {
        setSelectedName(selectedOption);
    };

    const handleCategoryChange = (selectedOption) => {
        setSelectedCategory(selectedOption);
    };

    const handleDescriptionChange = (selectedOption) => {
        setSelectedDescription(selectedOption);
    };

    const calculateRates = useCallback((rateType, value) => {
        let newBagRate = bagRate;
        let newPerKgRate = perKgRate;

        if (rateType === 'bag') {
            newBagRate = value;
            newPerKgRate = value / 25;
        } else if (rateType === 'kg') {
            newPerKgRate = value;
            newBagRate = value * 25;
        }

        setBagRate(newBagRate);
        setPerKgRate(newPerKgRate);
    }, []);

    const handleBagRateChange = (e) => calculateRates('bag', parseFloat(e.target.value));
    const handlePerKgRateChange = (e) => calculateRates('kg', parseFloat(e.target.value));

    const calculateTotal = useMemo(() => {
        const bagTotal = bagQuantity * bagRate;
        const kgTotal = kgQuantity * perKgRate;
        return parseInt(bagTotal + kgTotal);
    }, [bagQuantity, kgQuantity, bagRate, perKgRate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedName || !selectedCategory || !selectedDescription || (!bagQuantity && !kgQuantity)) {
            toast.error('Please fill in all required fields');
            return;
        }

        const purchaseData = {
            accountName: selectedName.value,
            remarks,
            category: selectedCategory.value,
            description: selectedDescription.value,
            bagQuantity: parseInt(bagQuantity) || 0,
            kgQuantity: parseFloat(kgQuantity).toFixed(3) || 0,
            bagRate: parseInt(bagRate) || 0,
            perKgRate: parseFloat(perKgRate).toFixed(2) || 0,
            total: calculateTotal,
        };

        setIsLoading(true); // Set loading to true when submitting

        try {
            const response = await fetch('/api/saleReturn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(purchaseData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Sale returned successfully');
                // Reset the form
                setSelectedName(defaultCAccountName);
                setRemarks('');
                setSelectedCategory(null);
                setSelectedDescription(null);
                setBagQuantity('');
                setKgQuantity('');
                setBagRate('');
                setPerKgRate('');
            } else {
                toast.error(`Error submitting return: ${result.message}`);
            }
        } catch (error) {
            toast.error(`Error submitting return: ${error.message}`);
        } finally {
            setIsLoading(false); // Set loading to false when request finishes
        }
    };

    return (
        <>
            <ToastContainer />
            <Card>
                <CardTitle tag="h6" className="border-bottom p-3 mb-2" style={{ backgroundColor: '#343a40', color: 'white' }}>
                    Sale Return
                </CardTitle>
                <CardBody>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="Accounts">Account Name</Label>
                                    <Accounts onNameChange={handleNameChange} selectedName={selectedName} />
                                </FormGroup>
                            </Col>
                            <Col md={5}>
                                <FormGroup>
                                    <Label for="remarks">Remarks</Label>
                                    <Input id="remarks" name="remarks" type='textarea' bsSize="sm" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="bagQuantity">Bags</Label>
                                    <Input id="bagQuantity" name="bagQuantity" type="number" min="0" value={bagQuantity} onChange={(e) => setBagQuantity(e.target.value)} />
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="kgQuantity">Kg</Label>
                                    <Input id="kgQuantity" name="kgQuantity" type="number" step="0.001" min="0" value={kgQuantity === 0 ? '' : kgQuantity} onChange={(e) => setKgQuantity(e.target.value)} />
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="category">Item Category</Label>
                                    <ItemCategory onCategoryChange={handleCategoryChange} selectedDescription={selectedDescription} />
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="description">Item Description</Label>
                                    <ItemDescription onDescriptionChange={handleDescriptionChange} selectedCategory={selectedCategory} />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="bagRate">Bag Rate</Label>
                                    <Input id="bagRate" name="bagRate" type="number" step="any" min="0" value={bagRate} onChange={handleBagRateChange} />
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="perKgRate">Kg Rate</Label>
                                    <Input id="perKgRate" name="perKgRate" type="number" step="any" min="0" value={perKgRate} onChange={handlePerKgRateChange} />
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="total"><strong>Total Amount</strong></Label>
                                    <Input className="bg-success text-white" id="total" name="total" type="text" value={calculateTotal} readOnly />
                                </FormGroup>
                            </Col>
                            <Col>
                                <Button type="submit" color="primary" disabled={isLoading} style={{ marginTop: '32px' }}>
                                    {isLoading ? <Spinner size="sm" /> : 'Submit'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </>
    );
};

export default SaleReturn;
