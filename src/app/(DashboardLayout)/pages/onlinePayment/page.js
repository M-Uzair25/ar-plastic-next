'use client'
import { Row, Col, Button, Form, FormGroup, Label, Input, InputGroup } from 'reactstrap';
import Select from 'react-select'

const customerName = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Meezan Abdul Razzaq', label: 'Meezan Abdul Razzaq' },
    { value: 'Dasti', label: 'Dasti' },
    { value: 'Adil & Co', label: 'Adil & Co' }
]

const onlinePayment = () => {
    return (
        <Form>
            <Row>
                <Col md={6}>
                    <FormGroup>
                        <Label for="customerName">
                            Sender
                        </Label>
                        <Select id="customerName" name="customerName" defaultValue={customerName[0]} options={customerName} />
                    </FormGroup>
                </Col>
                <Col md={6}>
                    <FormGroup>
                        <Label for="customerName">
                            Receiver
                        </Label>
                        <Select id="customerName" name="customerName" defaultValue={customerName[0]} options={customerName} />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <FormGroup>
                    <Col md={1}>
                        <Label for="description">
                            Description
                        </Label>
                    </Col>
                    <Col md={2}>
                        Payment Type
                        <Input id="description" name="payment" type="select" >
                            <option>
                                Cash
                            </option>
                            <option>
                                Cash Deposit
                            </option>
                            <option>
                                Cheque Deposit
                            </option>
                            <option>
                                Mobile Transfer
                            </option>
                        </Input>
                    </Col>
                    <Col md={2}>
                        Bank
                        <Input id="description" name="payment" type="select" >
                            <option>
                                None
                            </option>
                            <option>
                                Meezan
                            </option>
                            <option>
                                Alfalah
                            </option>
                            <option>
                                UBL
                            </option>
                            <option>
                                HBL
                            </option>
                            <option>
                                Faysal
                            </option>
                            <option>
                                Habib Metro
                            </option>
                        </Input>
                    </Col>
                    <Col md={5}>
                        Comments
                        <Input id="description" name="comments" />
                    </Col>
                </FormGroup>
                <Col md={2}>
                    <FormGroup>
                        <Label for="total">
                            Amount
                        </Label>
                        <Input id="total" name="total" type="number" min="0" defaultValue="0" />
                    </FormGroup>
                </Col>
            </Row>
            <Button color="primary">
                Submit
            </Button>
        </Form>
    );
};

export default onlinePayment;
