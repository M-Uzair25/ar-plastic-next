import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar, Collapse, Nav, NavItem, NavbarBrand, DropdownToggle, DropdownMenu, DropdownItem, Dropdown, Button, UncontrolledDropdown } from "reactstrap";
import LogoWhite from "public/images/logos/xtremelogowhite.svg";
import user1 from "public/images/users/user1.jpg";
import { usePathname } from "next/navigation";

const Header = ({ showMobmenu }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const pathName = usePathname();

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
            <Link href="/todayRates" className={`nav-link ${pathName === "/todayRates" && "active"}`}>
              Today Rates
            </Link>
          </NavItem>
          <NavItem>
            <Link href="/saleItem" className={`nav-link ${pathName === "/saleItem" && "active"}`}>
              Sale Item
            </Link>
          </NavItem>
          <UncontrolledDropdown>
            <DropdownToggle nav caret className={`${(pathName === "/doubleReceivingandPayment" || pathName === "/singleReceivingandPayment") && "active"}`}>
              Receivings and Payments
            </DropdownToggle>
            <DropdownMenu className="btn btn-outline-light border border-dark border-4">
              <NavItem>
                <Link href="/doubleReceivingandPayment" className={`dropdown-item ${pathName === "/doubleReceivingandPayment" && "active"}`}>
                  Double Entry RP
                </Link>
              </NavItem>
              <NavItem>
                <Link href="/singleReceivingandPayment" className={`dropdown-item ${pathName === "/singleReceivingandPayment" && "active"}`}>
                  Single Entry RP
                </Link>
              </NavItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <NavItem>
            <Link href="/todos" className={`nav-link ${pathName === "/todos" && "active"}`}>
              Todos
            </Link>
          </NavItem>
          <NavItem>
            <Link href="/bookings" className={`nav-link ${pathName === "/bookings" && "active"}`}>
              Bookings
            </Link>
          </NavItem>
          <UncontrolledDropdown>
            <DropdownToggle nav caret className={`${(pathName === "/createItem" || pathName === "/createAccount") && "active"}`}>
              Create
            </DropdownToggle>
            <DropdownMenu className="btn btn-outline-light border border-dark border-4">
              <NavItem>
                <Link href="/createAccount" className={`dropdown-item ${pathName === "/createAccount" && "active"}`}>
                  Create Account
                </Link>
              </NavItem>
              <NavItem>
                <Link href="/createItem" className={`dropdown-item ${pathName === "/createItem" && "active"}`}>
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
