import React from 'react';
import { Container, Row, Col, Card, CardBody, CardImg, CardTitle, CardText } from 'reactstrap';

const About = () => {
  return (
    <Card style={{
      backgroundImage: "url('images/background.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: "white", // Ensure text is readable on the background
      textShadow: "1px 1px 2px black", // Add a shadow to the text for better readability
    }}>
      <Container className="my-3">
        <h1 className="text-center mb-3">About Us</h1>

        <p className="text-center">
          Welcome to <strong>Abdul Razzaq Plastic Traders</strong>, a trusted name in the retail and wholesale business of
          plastic raw materials, chemicals, and colors.
          We aim to provide top-quality plastic raw materials to businesses of all sizes, ensuring consistent quality, competitive pricing,
          and exceptional service. We pride ourselves on building strong relationships with our clients and being a cornerstone of the plastic industry in the region.
        </p>

        <h3 className="text-center mb-3">Our Team</h3>
        <Row>
          {/* CEO Section */}
          <Col md={6}>
            <Card className="text-center shadow" color="dark" inverse>
              <CardImg
                top
                width="100%"
                src="images/AbdulRazzaq.jpg"
                alt="CEO Photo"
                className="rounded-circle mx-auto mt-3"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
              <CardBody>
                <CardTitle tag="h4">Abdul Razzaq</CardTitle>
                <CardText>
                  Founder and CEO of Abdul Razzaq Plastic Traders, Mr. Abdul Razzaq has over 25 years of experience
                  in the plastic raw materials industry. His leadership and commitment have been the cornerstone
                  of our success, shaping the business into a trusted name in the region.
                </CardText>
              </CardBody>
            </Card>
          </Col>
          {/* Developer Section */}
          <Col md={6}>
            <Card className="text-center shadow" color="dark" inverse>
              <CardImg
                top
                width="100%"
                src="images/Uzair.jpg"
                alt="Developer Photo"
                className="rounded-circle mx-auto mt-3"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
              <CardBody>
                <CardTitle tag="h4">Muhammad Uzair</CardTitle>
                <CardText>
                  The COO, Muhammad Uzair is the visionary behind our cutting-edge POS application. As a
                  skilled developer and future leader of Abdul Razzaq Plastic Traders, his innovation ensures the
                  business remains at the forefront of technology and customer satisfaction.
                </CardText>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <h3 className="text-center">Contact Us</h3>
        <p className="text-center">
          We are located at:<br />
          <strong>Near Lakar Mandi Chowk, Railway Road, Multan</strong><br />
          Phone: <strong>0300 6355827</strong><br />
        </p>
      </Container>
    </Card>
  );
};

export default About;
