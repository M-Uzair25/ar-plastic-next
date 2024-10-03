'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, CardTitle, CardBody, Table, FormGroup, Label, Spinner, Badge, Button } from 'reactstrap';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Accounts from '@/components/Accounts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Ledger = () => {
    const [selectedName, setSelectedName] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [ledgerData, setLedgerData] = useState([]); // Store fetched ledger entries
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [closingBalance, setClosingBalance] = useState(0);
    const [loading, setLoading] = useState(false); // Loading state

    // Handle name change for party and clear dates on party change
    const handleNameChange = async (selectedOption) => {
        setSelectedName(selectedOption);

        if (!selectedOption) {
            // Clear data if party is cleared
            setLedgerData([]);
            setStartDate(null);
            setEndDate(null);
            setTotalDebit(0);
            setTotalCredit(0);
            setClosingBalance(0);
        } else {
            setStartDate(null);
            setEndDate(null);
            fetchLedger(selectedOption, null, null); // Automatically fetch ledger data when party changes
        }
    };

    // Fetch ledger data from backend
    const fetchLedger = async (party = selectedName, fromDate = startDate, toDate = endDate) => {
        if (!party?.value) {
            toast.error('Please select a party name.');
            return;
        }

        try {
            setLoading(true); // Start loading
            const queryParams = new URLSearchParams({
                party: party.value,
                ...(fromDate && { startDate: format(fromDate, 'yyyy-MM-dd') }),
                ...(toDate && { endDate: format(toDate, 'yyyy-MM-dd') })
            });

            const response = await fetch(`/api/ledger?${queryParams.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setLedgerData(data.ledgerEntries);
                setTotalDebit(data.totalDebit);
                setTotalCredit(data.totalCredit);
                setClosingBalance(data.closingBalance);
            } else {
                toast.error(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error fetching ledger data:', error);
            toast.error('Error fetching ledger data.');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    // Clear all data
    const clearAllData = () => {
        setSelectedName(null);
        setStartDate(null);
        setEndDate(null);
        setLedgerData([]);
        setTotalDebit(0);
        setTotalCredit(0);
        setClosingBalance(0);
    };

    // Re-fetch ledger data when dates or party name change
    useEffect(() => {
        if (selectedName) {
            fetchLedger();
        }
    }, [selectedName, startDate, endDate]);

    // Memoize ledger table to avoid unnecessary re-renders
    const ledgerTable = useMemo(() => (
        <Table bordered hover>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Balance</th>
                </tr>
            </thead>
            <tbody>
                {ledgerData.length > 0 ? (
                    ledgerData.map((entry, index) => (
                        <tr key={index}>
                            <td>{format(new Date(entry.createdAt), 'dd/MM/yyyy')}</td>
                            <td>{entry.description}</td>
                            <td>{entry.debit}</td>
                            <td>{entry.credit}</td>
                            <td>{entry.balance}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="text-center">No ledger entries found</td>
                    </tr>
                )}
            </tbody>
        </Table>
    ), [ledgerData]);

    return (
        <Row>
            <Col lg="12">
                <ToastContainer />
                <Card>
                    <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
                        <i className="bi bi-journal-bookmark-fill"></i> Ledger
                        <Badge color="danger" className="float-end" onClick={clearAllData} style={{ cursor: 'pointer' }}>
                            <i className="bi bi-trash"></i> Clear Data
                        </Badge>
                    </CardTitle>
                    <CardBody>
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="party">Party Name</Label>
                                    <Accounts onNameChange={handleNameChange} selectedName={selectedName} />
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="startDate">Start Date</Label>
                                    <DatePicker
                                        showIcon
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        placeholderText="Click to select a date"
                                        dateFormat="dd/MM/yyyy"
                                        className="form-control"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="endDate">End Date</Label>
                                    <DatePicker
                                        showIcon
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        placeholderText="Click to select a date"
                                        dateFormat="dd/MM/yyyy"
                                        className="form-control"
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#1d7aa9', color: 'white' }}>
                            {selectedName?.label ? selectedName.label : 'No Account Selected'}
                        </CardTitle>

                        {loading ? (
                            <div className="text-center my-4">
                                <Spinner color="primary" />
                            </div>
                        ) : ledgerTable}

                        {/* Summary */}
                        <CardTitle tag="h6" className="border-bottom p-2" style={{ backgroundColor: '#1d7aa9', color: 'white' }}>
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <div>
                                    From: {startDate ? format(startDate, 'dd MMM yyyy') : 'N/A'} - To: {endDate ? format(endDate, 'dd MMM yyyy') : 'N/A'}
                                </div>
                                <div>
                                    Total Amount Debited = {totalDebit} Rs | Total Amount Credited = {totalCredit} Rs
                                </div>
                                <Badge color="danger">
                                    <h6 className="mt-1">Closing Balance = {closingBalance} Rs</h6>
                                </Badge>
                            </div>
                        </CardTitle>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
};

export default Ledger;
