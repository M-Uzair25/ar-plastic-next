'use client'
import { Navbar, Row, Col, Table, Card, CardBody, Button, NavbarBrand, NavLink } from 'reactstrap';
const Bookings = () => {
  return (
    <>
      <Navbar className="mb-4" color="secondary" dark>
        <NavbarBrand>Bookings</NavbarBrand>
        <NavLink href="/pages/newBooking" >
          <Button color="primary">Create New Booking</Button>
        </NavLink>
      </Navbar>

      <Row>
        <Col lg="12">
          <Card>
            <CardBody>
              <Table bordered>
                <thead>
                  <tr>
                    <th>Item Category</th>
                    <th>Item Sub-Category</th>
                    <th>Color</th>
                    <th>Rate</th>
                    <th>Stock</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td scope="row">PP</td>
                    <td>Advance 1100</td>
                    <td>Natural</td>
                    <td>9900</td>
                    <td>10 Bags 1 Kg</td>
                    <td>
                      <Button color="success" size="sm">Received</Button>
                      <Button color="primary" size="sm">Edit</Button>
                      <Button color="danger" size="sm">Delete</Button>
                    </td>
                  </tr>
                  <tr>
                    <td scope="row">Blow</td>
                    <td>Tasnee 1258</td>
                    <td>Natural</td>
                    <td>11000</td>
                    <td>0 Bags 15 KG</td>
                    <td>
                      <Button color="success" size="sm">Received</Button>
                      <Button color="primary" size="sm">Edit</Button>
                      <Button color="danger" size="sm">Delete</Button>
                    </td>
                  </tr>
                  <tr>
                    <td scope="row">Marlex</td>
                    <td>Sabic 200056</td>
                    <td>Natural</td>
                    <td>12000</td>
                    <td>20 Bags 20 KG</td>
                    <td>
                      <Button color="success" size="sm">Received</Button>
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
    </>
  );
};

export default Bookings;
