'use client'
import { Row, Col, Button, Form, FormGroup, Label, Input, Card, CardTitle, CardBody } from 'reactstrap';
import Select from 'react-select'

const customerName = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Meezan Abdul Razzaq', label: 'Meezan Abdul Razzaq' },
  { value: 'Dasti', label: 'Dasti' },
  { value: 'Adil & Co', label: 'Adil & Co' }
]
const itemCategory = [
  { value: 'PP', label: 'PP' },
  { value: 'Blow', label: 'Blow' },
  { value: 'Marlex', label: 'Marlex' }
]
const itemSubcategory = [
  { value: 'Advance 1100', label: 'Advance 1100' },
  { value: 'Tasnee 1258', label: 'Tasnee 1258' },
  { value: 'Sabic 200056', label: 'Sabic 200056' }
]
const itemColor = [
  { value: 'Natural', label: 'Natural' },
  { value: 'Green', label: 'Green' },
  { value: 'Red', label: 'Red' }
]
const number = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '1000', label: '1000' }
]

const SaleItem = () => {
  return (
    <>
      <CardTitle tag="h5" className="border-bottom p-3 mb-2"
        style={{ backgroundColor: '#343a40', color: 'white' }}>
        <i className="me-2"> </i>
        Sale Item
      </CardTitle>
      <Card>
        <CardBody>
          <Form>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="customerName">
                    Customer Name
                  </Label>
                  <Select id="customerName" name="customerName" defaultValue={customerName[0]} options={customerName} />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup>
                  <Label for="Comments">
                    Comments
                  </Label>
                  <Input
                    id="Comments"
                    name="Comments"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={1}>
                <FormGroup>
                  <Label for="bagQuantity">
                    Bags
                  </Label>
                  <Input id="bagQuantity" name="bagQuantity" type="number" min="0" defaultValue="0" />
                </FormGroup>
              </Col>
              <Col md={1}>
                <FormGroup>
                  <Label for="kgQuantity">
                    Kg
                  </Label>
                  <Input id="kgQuantity" name="kgQuantity" type="number" min="0" defaultValue="0" />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="itemCategory">
                    Item Category
                  </Label>
                  <Select id="itemCategory" name="itemCategory" options={itemCategory} />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label for="itemSubcategory">
                    Item Sub-Category
                  </Label>
                  <Select id="itemSubcategory" name="itemSubcategory" options={itemSubcategory} />
                </FormGroup>
              </Col>
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
                  <Label for="Number">
                    Number
                  </Label>
                  <Select id="number" name="number" defaultValue={number[0]} options={number} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="Rate">
                    Rate
                  </Label>
                  <Input id="Rate" name="Rate" type="number" min="0" defaultValue="0" />
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
                    Add to Cart
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
              <Col md={2}>
                <FormGroup>
                  <Label for="cashReceived">
                    Cash Received
                  </Label>
                  <Input id="cashReceived" name="cashReceived" type="number" min="0" />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="cashReturned">
                    Cash Returned
                  </Label>
                  <Input id="cashReturned" name="cashReturned" type="number" min="0" defaultValue="0" />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="payment">
                    Payment Method
                  </Label>
                  <Input id="payment" name="payment" type="select" >
                    <option>
                      Cash
                    </option>
                    <option>
                      Bank Account
                    </option>
                    <option>
                      Khata
                    </option>
                    <option>
                      Dasti
                    </option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="status">
                    Status
                  </Label>
                  <Input id="status" name="status" type="select" >
                    <option>
                      Paid
                    </option>
                    <option>
                      Unpaid
                    </option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <Button color="primary">
              Submit
            </Button>
          </Form>
        </CardBody>
      </Card>
    </>
  );
};

export default SaleItem;