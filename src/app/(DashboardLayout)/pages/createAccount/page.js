'use client'
import { Card, Row, Col, CardTitle, CardBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';

const createAccount = () => {
    return (
        <Row>
            <Col>
                {/* --------------------------------------------------------------------------------*/}
                {/* Card-1*/}
                {/* --------------------------------------------------------------------------------*/}
                <Card>
                    <CardTitle tag="h6" className="border-bottom p-3 mb-0">
                        <i className="bi bi-bell me-2"> </i>
                        Create New Account
                    </CardTitle>
                    <CardBody>
                        <Form>
                            <FormGroup>
                                <Label for="accountName">Name</Label>
                                <Input
                                    id="accountName"
                                    name="accountName"
                                    type="text"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="accountNo">Number</Label>
                                <Input
                                    id="accountNo"
                                    name="accountNo"
                                    placeholder="Enter Phone No. or Account No."
                                    type="number"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="address">Adress</Label>
                                <Input id="address" name="address" />
                            </FormGroup>
                            <Row>
                                <Col md={2}>
                                    <FormGroup>
                                        <Label for="balance">
                                            Balance
                                        </Label>
                                        <Input id="balance" name="balance" type="number" min="0" defaultValue="0" />
                                    </FormGroup>
                                </Col>
                                <Col>
                                    <FormGroup tag="fieldset">
                                        <legend>Account Type</legend>
                                        <FormGroup check >
                                            <Input name="acctype" id="customer" type="radio" />{' '}
                                            <Label check className="form-label">Customer</Label>
                                        </FormGroup>
                                        <FormGroup check>
                                            <Input name="acctype" id="supplier" type="radio" />{' '}
                                            <Label check className="form-label">Supplier</Label>
                                        </FormGroup>
                                        <FormGroup check>
                                            <Input name="acctype" id="myAccount" type="radio" />{' '}
                                            <Label check className="form-label">My Account</Label>
                                        </FormGroup>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Button className="mt-2">Submit</Button>
                        </Form>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
};

export default createAccount;
