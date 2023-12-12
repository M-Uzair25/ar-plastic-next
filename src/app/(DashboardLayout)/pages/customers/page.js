'use client'
import Image from "next/image";
import { Card, CardBody, CardTitle, CardSubtitle, Table, Input } from "reactstrap";
import user1 from "public/images/users/user1.jpg";
import user2 from "public/images/users/user2.jpg";
import user3 from "public/images/users/user3.jpg";
import user4 from "public/images/users/user4.jpg";
import user5 from "public/images/users/user5.jpg";

const tableData = [
  {
    avatar: user1,
    name: "Hanna Gover",
    phone: "12345678",
    project: "Flexy React",
    status: "pending",
    amount: "95K",
  },
  {
    avatar: user2,
    name: "Hanna Gover",
    phone: "12345678",
    project: "Lading pro React",
    status: "done",
    amount: "95K",
  },
  {
    avatar: user3,
    name: "Hanna Gover",
    phone: "12345678",
    project: "Elite React",
    status: "holt",
    amount: "95K",
  },
  {
    avatar: user4,
    name: "Hanna Gover",
    phone: "12345678",
    project: "Flexy React",
    status: "pending",
    amount: "95K",
  },
  {
    avatar: user5,
    name: "Hanna Gover",
    phone: "12345678",
    project: "Ample React",
    status: "done",
    amount: "95K",
  },
];

const Customers = () => {
  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Customers List</CardTitle>
        <CardSubtitle className="mb-3 text-muted" tag="h6">
          Dated: 8/12/2023
        </CardSubtitle>
          <Input
            id="exampleSearch"
            name="search"
            placeholder="Search"
            type="search"
          />
        <div className="table-responsive">
          <Table className="text-nowrap mt-3 align-middle" borderless hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount Due</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((tdata, index) => (
                <tr key={index} className="border-top">
                  <td>
                    <div className="d-flex align-items-center p-1">
                      <Image
                        src={tdata.avatar}
                        className="rounded-circle"
                        alt="avatar"
                        width="45"
                        height="45"
                      />
                      <div className="ms-3">
                        <h6 className="mb-0">{tdata.name}</h6>
                        <span className="text-muted">{tdata.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>{tdata.amount}</td>
                  <td>{tdata.project}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default Customers;
