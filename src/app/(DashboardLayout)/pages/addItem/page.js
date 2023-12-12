'use client'
import { Navbar, Row, Col, NavbarBrand, Button, Form, FormGroup, Label, Input } from 'reactstrap';

const addItem = () => {
  return (
    <>
      <Navbar className="mb-4" color="secondary" dark>
        <NavbarBrand>Add New Item</NavbarBrand>
      </Navbar>

      <Form>
        <Row>
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
          <Col md={2}>
            <FormGroup>
              <Label for="color">
                Color
              </Label>
              <Input
                id="color"
                name="color"
                defaultValue="Natural"
              />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label for="Number">
                Number
              </Label>
              <Input id="number" name="number" type="number" min="0" defaultValue='1' />
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
        </Row>

        <Button>
          Add Item
        </Button>
      </Form>
    </>
  );
};

export default addItem;
