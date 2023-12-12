'use client'
import { Row, Col, Table, Card, CardTitle, CardBody, Button, FormGroup, Input } from "reactstrap";

const Stock = () => {
  return (
    <Row>
      <Col lg="12">
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            <i className="bi bi-card-text me-2"> </i>
            Stock 11 Nov 2023
          </CardTitle>
          <CardBody>
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
            <Table bordered>
              <thead>
                <tr>
                  <th>Item Category</th>
                  <th>Item Sub-Category</th>
                  <th>Color</th>
                  <th>Stock</th>
                  <th>Edit</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td scope="row">PP</td>
                  <td>Advance 1100</td>
                  <td>Natural</td>
                  <td>10 Bags 1 Kg</td>
                  <td>
                    <Button color="primary" size="sm">Edit </Button>
                  </td>
                  <td>30/11/23 2:14 PM</td>
                </tr>
                <tr>
                  <td scope="row">Blow</td>
                  <td>Tasnee 1258</td>
                  <td>Natural</td>
                  <td>0 Bags 15 KG</td>
                  <td>
                    <Button color="primary" size="sm">Edit </Button>
                  </td>
                  <td>30/11/23 2:14 PM</td>
                </tr>
                <tr>
                  <td scope="row">Marlex</td>
                  <td>Sabic 200056</td>
                  <td>Natural</td>
                  <td>20 Bags 20 KG</td>
                  <td>
                    <Button color="primary" size="sm">Edit </Button>
                  </td>
                  <td>30/11/23 2:14 PM</td>
                </tr>
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Stock;
