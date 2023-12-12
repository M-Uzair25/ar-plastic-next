'use client'
import React from "react";
import { Row, Col, CardTitle, CardBody, Card, CardSubtitle } from "reactstrap";

const About = () => {
  const features = [
    {
      title: "Create Nextjs App Based",
      desc: "Create React App is a tool that gives you a massive head start when building React apps.",
      icon: "bi-vinyl",
    },
    {
      title: "React Hooks",
      desc: "Hooks are functions that let you “hook into” React state and lifecycle features from function components.",
      icon: "bi-umbrella",
    },
    {
      title: "CASL",
      desc: "It is isomorphic authorization JavaScript library which restricts what resources a given client is allowed to access.",
      icon: "bi-lock",
    },
    {
      title: "Dark & Light Layouts",
      desc: "This theme comes with built-in light & dark layouts, select as per your preference.",
      icon: "bi-brightness-high",
    },
    {
      title: "Built-in Customizer",
      desc: "Built-in customizer enables users to change their admin panel look & feel based on their preferences.",
      icon: "bi-gear",
    },
    {
      title: "Well Crafted Apps",
      desc: "Creative & smart well crafted apps like email, chat, todo & calender allows you to create your apps faster.",
      icon: "bi-star",
    },
  ];
  return (
    <Row>
      <Col>
        <Card>
          <CardBody>
            <Row>
              {features.map((feature) => (
                <Col lg="4" className="mb-5 pb-3" key={feature.title}>
                  <div>
                    <i className={`bi ${feature.icon} text-primary fs-2`} />

                    <CardTitle tag="h5" className="my-3">
                      {feature.title}
                    </CardTitle>
                    <CardSubtitle className="text-muted col-10">
                      {feature.desc}
                    </CardSubtitle>
                  </div>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default About;
