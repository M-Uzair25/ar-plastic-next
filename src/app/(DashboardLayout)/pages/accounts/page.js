'use client'
import { Card, CardBody, CardTitle, CardSubtitle, Table, Input, Button, Row, Col, FormGroup } from "reactstrap";
const accounts = () => {
    return (
        <>

            <Card>
                <CardBody>
                    <CardTitle tag="h5">Search All Accounts</CardTitle>
                    <CardSubtitle className="mb-3 text-muted" tag="h6">
                        Dated: 8/12/2023
                    </CardSubtitle>
                    <Input className="mb-4"
                        id="exampleSearch"
                        name="search"
                        placeholder="Search"
                        type="search"
                    />
                    <Row className="mb-1">
                        <Col>
                            <CardTitle tag="h6">Name:</CardTitle>
                        </Col>
                        <Col>
                            <CardTitle tag="h6">Phone No:</CardTitle>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col>
                            <CardTitle tag="h6">Address:</CardTitle>
                        </Col>
                        <Col>
                            <CardTitle tag="h6">Type:</CardTitle>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={3}>
                            <FormGroup>
                                <Input
                                    id="exampleSearch"
                                    name="search"
                                    placeholder="Search"
                                    type="search"
                                />
                            </FormGroup>
                        </Col>
                        <Col>
                            <CardTitle>Filter by:</CardTitle>
                        </Col>
                        <Col>
                            <CardTitle>Save as pdf</CardTitle>
                        </Col>
                    </Row>
                    <div className="table-responsive">
                        <Table bordered hover >
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Quantity</th>
                                    <th>Item Category</th>
                                    <th>Item Sub-Category</th>
                                    <th>Color</th>
                                    <th>Number</th>
                                    <th>Amount</th>
                                    <th>Debit</th>
                                    <th>Credit</th>
                                    <th>Balance</th>
                                    <th>Comments</th>
                                    <th>Modify</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td scope="row">11 Nov 2023</td>
                                    <td>1 Bag</td>
                                    <td>PP</td>
                                    <td>Advance 1100</td>
                                    <td>Natural</td>
                                    <td>1</td>
                                    <td>10000</td>
                                    <td>Cash</td>
                                    <td>Paid</td>
                                    <td>10000</td>
                                    <td></td>
                                    <td>
                                        <Button color="primary" size="sm">Edit</Button>
                                        <Button color="danger" size="sm">Delete</Button>
                                    </td>

                                </tr>
                                <tr>
                                    <td scope="row">11 Nov 2023</td>
                                    <td>2 Bag</td>
                                    <td>Blow</td>
                                    <td>Tasnee 1258</td>
                                    <td>Natural</td>
                                    <td>1</td>
                                    <td>10500</td>
                                    <td>Meezan</td>
                                    <td>Paid</td>
                                    <td>10000</td>
                                    <td>Self</td>
                                    <td>
                                        <Button color="primary" size="sm">Edit</Button>
                                        <Button color="danger" size="sm">Delete</Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td scope="row">11 Nov 2023</td>
                                    <td>8 Kg</td>
                                    <td>Marlex</td>
                                    <td>Sabic 200056</td>
                                    <td>Natural</td>
                                    <td>1</td>
                                    <td>11000</td>
                                    <td>Meezan</td>
                                    <td>Paid</td>
                                    <td>10000</td>
                                    <td>Adil & co</td>
                                    <td>
                                        <Button color="primary" size="sm">Edit</Button>
                                        <Button color="danger" size="sm">Delete</Button>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Card>
        </>
    );
};

export default accounts;
