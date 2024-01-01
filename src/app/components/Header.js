import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar, Collapse, Nav, NavItem, NavbarBrand, DropdownToggle, DropdownMenu, DropdownItem, Dropdown, Button, UncontrolledDropdown } from "reactstrap";
import LogoWhite from "public/images/logos/xtremelogowhite.svg";
import user1 from "public/images/users/user1.jpg";

const Header = ({ showMobmenu }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const Handletoggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Navbar color="primary" dark expand="md" style={{ marginBottom: '-17px' }}>
      <div className="d-flex align-items-center">
        <NavbarBrand href="/" className="d-lg-none">
          <Image src={LogoWhite} alt="logo" />
        </NavbarBrand>
        <Button color="primary" className="d-lg-none" onClick={showMobmenu}>
          <i className="bi bi-list"></i>
        </Button>
      </div>
      <div className="hstack gap-2">
        <Button
          color="primary"
          size="sm"
          className="d-sm-block d-md-none"
          onClick={Handletoggle}
        >
          {isOpen ? (
            <i className="bi bi-x"></i>
          ) : (
            <i className="bi bi-three-dots-vertical"></i>
          )}
        </Button>
      </div>

      <Collapse navbar isOpen={isOpen}>
        <Nav className="me-auto" navbar>
          <NavItem>
            <Link href="/pages/todayRates" className="nav-link">
              Today Rates
            </Link>
          </NavItem>
          <NavItem>
            <Link href="/pages/saleItem" className="nav-link">
              Sale Item
            </Link>
          </NavItem>
          <NavItem>
            <Link href="/pages/onlinePayment" className="nav-link">
              Online Payment
            </Link>
          </NavItem>

          <NavItem>
            <Link href="/pages/addPayment" className="nav-link">
              Add Payment
            </Link>
          </NavItem>
          <NavItem>
            <Link href="/pages/todos" className="nav-link">
              Todos
            </Link>
          </NavItem>
          <NavItem>
            <Link href="/pages/bookings" className="nav-link">
              Bookings
            </Link>
          </NavItem>
          <UncontrolledDropdown>
            <DropdownToggle nav caret >
              Create
            </DropdownToggle>
            <DropdownMenu style={{ backgroundColor: '#0d6efd' }}>
              <NavItem>
                <Link href="/pages/createAccount" className="nav-link">
                  Create Account
                </Link>
              </NavItem>
              <NavItem>
                <Link href="/pages/createItem" className="nav-link">
                  Create Item
                </Link>
              </NavItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle color="primary">
            <div style={{ lineHeight: "0px" }}>
              <Image
                src={user1}
                alt="profile"
                className="rounded-circle"
                width="30"
                height="30"
              />
            </div>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Info</DropdownItem>
            <DropdownItem>My Account</DropdownItem>
            <DropdownItem>Edit Profile</DropdownItem>
            <DropdownItem divider />
            <DropdownItem>My Balance</DropdownItem>
            <DropdownItem>Inbox</DropdownItem>
            <DropdownItem>Logout</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Collapse>
    </Navbar>
  );
};

export default Header;
