'use client'
import { Navbar, Row, Col, NavbarBrand, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import Select from 'react-select'

const Suppliers = [
  { value: 'Adil & Co', label: 'Adil & Co' },
  { value: 'Meezan Abdul Razzaq', label: 'Meezan Abdul Razzaq' },
  { value: 'Dasti', label: 'Dasti' },
  { value: 'Adil & Co', label: 'Adil & Co' }
]
const itemColor = [
  { value: 'Natural', label: 'Natural' },
  { value: 'Green', label: 'Green' },
  { value: 'Red', label: 'Red' }
]
const number = [
  { value: '1', label: '1' },
  { value: '2', label: '2' }
]

const newBooking = () => {
  return (
    <>
      <Navbar className="mb-4" color="secondary" dark>
        <NavbarBrand>Create New Booking</NavbarBrand>
      </Navbar>

      <Form>
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label for="supplier">
                Supplier
              </Label>
              <Select id="supplier" name="supplier" options={Suppliers} />
            </FormGroup>
          </Col>
          <Col md={3}>
            <FormGroup>
              <Label for="itemCategory">
                Item Category
              </Label>
              <Input
                id="itemCategory"
                name="itemCategory"
              />
            </FormGroup>
          </Col>
          <Col md={3}>
            <FormGroup>
              <Label for="itemSubcategory">
                Item Sub-Category
              </Label>
              <Input
                id="itemSubcategory"
                name="itemSubcategory"
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={2}>
            <FormGroup>
              <Label for="color">
                Color
              </Label>
              <Select id="color" name="color" defaultValue={itemColor[0]} options={itemColor} />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label for="number">
                Number
              </Label>
              <Select id="number" name="number" defaultValue={number[0]} options={number} />
            </FormGroup>
          </Col>
          <Col md={1}>
            <FormGroup>
              <Label for="bagQuantity">
                Bags
              </Label>
              <Input
                id="bagQuantity"
                name="bagQuantity"
                type="number"
                min="0"
                defaultValue="0"
              />
            </FormGroup>
          </Col>
          <Col md={1}>
            <FormGroup>
              <Label for="kgQuantity">
                Kg
              </Label>
              <Input
                id="kgQuantity"
                name="kgQuantity"
                type="number"
                min="0"
                defaultValue="0"
              />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label for="rate">
                Rate
              </Label>
              <Input id="rate" name="rate" type="number" min="0" />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label for="subtotal">
                Sub Total
              </Label>
              <Input id="subtotal" name="subtotal" type="number" min="0" defaultValue="0" />
            </FormGroup>
          </Col>

          <Col md={2}>
            <FormGroup>
              <Button className="mt-4" color="primary">
                Add more item
              </Button>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={2}>
            <FormGroup>
              <Label for="total">
                Total
              </Label>
              <Input id="total" name="total" type="number" min="0" defaultValue="0" />
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

export default newBooking;
