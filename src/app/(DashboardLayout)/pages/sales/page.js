'use client'
import { Row, Col, Table, Card, CardTitle, CardBody, Button, FormGroup, Input } from "reactstrap";

const Sales = () => {
  return (
    <Row>
      <Col lg="12">
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            <i className="bi bi-card-text me-2"> </i>
            Total Sales 11 Nov 2023
          </CardTitle>
          <CardBody>
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
            <Table bordered hover >
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Item Category</th>
                  <th>Item Sub-Category</th>
                  <th>Color</th>
                  <th>Number</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Comments</th>
                  <th>Modify</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td scope="row">11 Nov 2023</td>
                  <td>Cash</td>
                  <td>1 Bag</td>
                  <td>PP</td>
                  <td>Advance 1100</td>
                  <td>Natural</td>
                  <td>1</td>
                  <td>10000</td>
                  <td>Cash</td>
                  <td>Paid</td>
                  <td></td>
                  <td>
                    <Button color="primary" size="sm">Edit</Button>
                    <Button color="danger" size="sm">Delete</Button>
                  </td>

                </tr>
                <tr>
                  <td scope="row">11 Nov 2023</td>
                  <td>Cash</td>
                  <td>2 Bag</td>
                  <td>Blow</td>
                  <td>Tasnee 1258</td>
                  <td>Natural</td>
                  <td>1</td>
                  <td>10500</td>
                  <td>Meezan</td>
                  <td>Paid</td>
                  <td>Self</td>
                  <td>
                    <Button color="primary" size="sm">Edit</Button>
                    <Button color="danger" size="sm">Delete</Button>
                  </td>
                </tr>
                <tr>
                  <td scope="row">11 Nov 2023</td>
                  <td>Cash</td>
                  <td>8 Kg</td>
                  <td>Marlex</td>
                  <td>Sabic 200056</td>
                  <td>Natural</td>
                  <td>1</td>
                  <td>11000</td>
                  <td>Meezan</td>
                  <td>Paid</td>
                  <td>Adil & co</td>
                  <td>
                    <Button color="primary" size="sm">Edit</Button>
                    <Button color="danger" size="sm">Delete</Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Sales;
