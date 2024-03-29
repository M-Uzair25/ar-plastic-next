'use client'
import { Col, Row, Card, CardBody, CardTitle, CardSubtitle } from "reactstrap";
import SalesChart from "@/components/SalesChart";
import TopCards from "@/components/TopCards";

const Dashboard = () => {
    return (
        <div>
            <Card>
                <CardBody>
                    <CardTitle tag="h5">Select Date</CardTitle>
                    <CardSubtitle className=" text-muted" tag="h6">
                        From: 8/12/2023 To: 11/12/2023
                    </CardSubtitle>
                </CardBody>
            </Card>
            <div>
                {/***Top Cards***/}
                <Row>
                    <Col sm="6" lg="3">
                        <TopCards
                            bg="bg-light-success text-success"
                            title="Cash Sale"
                            subtitle="Cash Sale"
                            earning="15000 Rs"
                            icon="bi bi-wallet"
                        />
                    </Col>
                    <Col sm="6" lg="3">
                        <TopCards
                            bg="bg-light-danger text-danger"
                            title="Expenses"
                            subtitle="Expenses"
                            earning="2000 Rs"
                            icon="bi bi-coin"
                        />
                    </Col>
                    <Col sm="6" lg="3">
                        <TopCards
                            bg="bg-light-warning text-warning"
                            title="Dept"
                            subtitle="Dept"
                            earning="456 Rs"
                            icon="bi bi-basket3"
                        />
                    </Col>
                    <Col sm="6" lg="3">
                        <TopCards
                            bg="bg-light-info text-into"
                            title="Credit"
                            subtitle="Credit Sale"
                            earning="210 Rs"
                            icon="bi bi-bag"
                        />
                    </Col>
                </Row>
                {/***Sales & Feed***/}
                <Row>
                    <Col sm="10" lg="11" xl="11" xxl="11">
                        <SalesChart />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Dashboard;
