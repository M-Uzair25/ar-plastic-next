'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardTitle, CardBody, Row, Col, FormGroup, Button, Table, Label, Badge, Spinner, Input } from 'reactstrap';
import Accounts from '@/components/Accounts';
import { format } from 'date-fns';
import { generateLedgerPDF } from '@/components/pdfReports/generateLedgerPDF';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Ledger = () => {
    const [tableData, setTableData] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedAccountType, setSelectedAccountType] = useState(''); // State for selected account type
    const [accountType, setAccountType] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [ledgerData, setLedgerData] = useState([]); // Store fetched ledger entries
    const [closingBalance, setClosingBalance] = useState(0);
    const [loading, setLoading] = useState(false); // Loading state

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...(selectedAccountType && { accountType: selectedAccountType })
            });

            const response = await fetch(`/api/accounts?${queryParams.toString()}`);
            const data = await response.json();
            if (response.ok) {
                setTableData(data);
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [selectedAccountType]);

    const handleAccountChange = async (selectedOption) => {
        setSelectedAccount(selectedOption);

        if (!selectedOption) {
            clearAllData()
        } else {
            setStartDate(null);
            setEndDate(null);
            fetchLedger(selectedOption, null, null); // Automatically fetch ledger data when ledger name changes
        }
    };

    const handleRowClick = (account) => {
        setSelectedAccount({ value: account.accountName, label: account.accountName });
        toast.info(`Selected Account: ${account.accountName}`);
    };

    // Fetch ledger data from backend
    const fetchLedger = async (name = selectedAccount, fromDate = startDate, toDate = endDate) => {
        if (!name?.value) {
            toast.error('Please select a ledger name.');
            return;
        }

        try {
            setLoading(true); // Start loading
            const queryParams = new URLSearchParams({
                name: name.value,
                ...(fromDate && { startDate: format(fromDate, 'yyyy-MM-dd') }),
                ...(toDate && { endDate: format(toDate, 'yyyy-MM-dd') })
            });

            const response = await fetch(`/api/ledger?${queryParams.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setLedgerData(data.ledgerEntries);
                setClosingBalance(data.closingBalance);
                setAccountType(data.accountType);
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

    // Handle print ledger report
    const handleDownloadPDF = () => {
        generateLedgerPDF(ledgerData, startDate, endDate, closingBalance, accountType);
    };

    // Clear all data
    const clearAllData = () => {
        setSelectedAccount(null);
        setSelectedAccountType('');
        setAccountType('');
        setStartDate(null);
        setEndDate(null);
        setLedgerData([]);
        setClosingBalance(0);
    };

    // Re-fetch ledger data when dates or ledger name change
    useEffect(() => {
        if (selectedAccount) {
            fetchLedger();
        }
    }, [selectedAccount, startDate, endDate]);

    // Calculate total balance
    const totalBalance = tableData.reduce((total, tdata) => total + tdata.balance, 0);

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
                            <td>{entry.debit === 0 ? '-' : entry.debit.toLocaleString()}</td>
                            <td>{entry.credit === 0 ? '-' : entry.credit.toLocaleString()}</td>
                            <td>{entry.balance.toLocaleString()}</td>
                            <td>
                                {(accountType === 'customer' || accountType === 'other') ? (
                                    entry.balance > 0 ? 'DR' : 'CR'
                                ) : accountType === 'supplier' ? (
                                    entry.balance > 0 ? 'CR' : 'DR'
                                ) : ''}
                            </td>
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
        <>
            <ToastContainer />
            <Card>
                <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
                    <i className="bi bi-journal-bookmark-fill"></i> Ledger Accounts
                </CardTitle>
                <CardBody>
                    <Row>
                        <Col md={8}>
                            <Label for="account">Search Account</Label>
                            <Accounts onNameChange={handleAccountChange} selectedName={selectedAccount} />
                        </Col>
                        <Col md={2}>
                            <FormGroup>
                                <Label for="accountType">Sort by Account Type</Label>
                                <Input
                                    type="select"
                                    name="accountType"
                                    id="accountType"
                                    value={selectedAccountType}
                                    onChange={(e) => setSelectedAccountType(e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="cash">Cash</option>
                                    <option value="customer">Customer</option>
                                    <option value="supplier">Supplier</option>
                                    <option value="other">Other</option>
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>

                    {selectedAccount ? (
                        <div className="mt-3">
                            <Row>
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
                                <Col style={{ marginTop: '32px' }}>
                                    <Button color="info" onClick={handleDownloadPDF}>
                                        Download PDF
                                    </Button>
                                    <Button color="danger" className='mx-2' onClick={clearAllData}>
                                        <i className="bi bi-trash"></i> Clear All
                                    </Button>
                                </Col>
                            </Row>

                            <CardTitle tag="h5" className="border-bottom p-2 mb-0" style={{ backgroundColor: '#1d7aa9', color: 'white' }}>
                                {selectedAccount?.label ? selectedAccount.label : 'No Account Selected'}
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
                                    <Badge color="danger">
                                        <h6 className="mt-1">
                                            Closing Balance = {closingBalance.toLocaleString()} Rs | {(accountType === 'customer' || accountType === 'other') ? (
                                                closingBalance > 0 ? 'Receivable' : 'Payable'
                                            ) : accountType === 'supplier' ? (
                                                closingBalance > 0 ? 'Payable' : 'Receivable'
                                            ) : ''}
                                        </h6>
                                    </Badge>
                                </div>
                            </CardTitle>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table className="text-nowrap mt-4 align-middle" bordered hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Amount Due</th>
                                        <th>Account Type</th>
                                        <th>Last Entry</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="text-center">
                                                <Spinner size="sm" /> Loading...
                                            </td>
                                        </tr>
                                    ) : tableData.length > 0 ? (
                                        tableData.map((tdata, index) => {
                                            const isOld = new Date() - new Date(tdata.updatedAt) > 30 * 24 * 60 * 60 * 1000; // Check if updatedAt is more than 1 month old
                                            return (
                                                <tr key={index} className={isOld ? 'table-danger' : 'border-top'} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(tdata)}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {tdata.accountName}
                                                        <span className="text-muted" style={{ marginLeft: '15px' }}>
                                                            <i className="bi bi-telephone"></i> {tdata.accountNo}
                                                        </span>
                                                    </td>
                                                    <td>{tdata.balance.toLocaleString()}</td>
                                                    <td>{tdata.accountType}</td>
                                                    <td>{format(new Date(tdata.updatedAt), 'dd-MMM-yyyy')}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center">No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            <div className="text-right mt-4">
                                <h6>
                                    <strong>
                                        Total Balance: {totalBalance.toLocaleString()} Rs | {(selectedAccountType === 'customer' || selectedAccountType === 'other') ? (
                                            totalBalance > 0 ? 'Receivable' : 'Payable'
                                        ) : selectedAccountType === 'supplier' ? (
                                            totalBalance > 0 ? 'Payable' : 'Receivable'
                                        ) : ''}
                                    </strong>
                                </h6>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </>
    );
};

export default Ledger;
