'use client'
import { Navbar, Row, Col, NavbarBrand, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import Select from 'react-select'

const Suppliers = [
    { value: 'Adil & Co', label: 'Adil & Co' },
    { value: 'Meezan Abdul Razzaq', label: 'Meezan Abdul Razzaq' },
    { value: 'Dasti', label: 'Dasti' },
    { value: 'Adil & Co', label: 'Adil & Co' }
]

const addPayment = () => {
    return (
        <>
            <Navbar className="mb-4" color="secondary" dark>
                <NavbarBrand>Add Any Entry</NavbarBrand>
            </Navbar>

            <Form>
                <Row>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="account">
                                Account
                            </Label>
                            <Select id="account" name="account" options={Suppliers} />
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
        </>
    );
};

export default addPayment;
