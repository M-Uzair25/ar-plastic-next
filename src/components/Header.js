import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Navbar, Collapse, Nav, NavItem, NavbarBrand, DropdownToggle, DropdownMenu, DropdownItem, Dropdown, Button, UncontrolledDropdown
} from "reactstrap";
import LogoWhite from "public/images/logos/xtremelogowhite.svg";
import user1 from "public/images/users/user1.jpg";
import { usePathname } from "next/navigation";

const Header = ({ showMobmenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathName = usePathname();

  const toggle = () => setDropdownOpen(!dropdownOpen);
  const handleToggle = () => setIsOpen(!isOpen);

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
        <Button color="primary" size="sm" className="d-sm-block d-md-none" onClick={handleToggle}>
          {isOpen ? <i className="bi bi-x"></i> : <i className="bi bi-three-dots-vertical"></i>}
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

          {/* Dropdown for Receivings and Payments */}
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret className={`px-2 ${(pathName === "/cashReceiving" || pathName === "/transferReceiving") && "active"}`}>
              Receivings and Payments
            </DropdownToggle>
            <DropdownMenu className="rounded shadow border-0">
              {/* Submenu for Receivings */}
              <UncontrolledDropdown inNavbar direction="end">
                <DropdownToggle nav caret className={`dropdown-item ${(pathName === "/cashReceiving" || pathName === "/transferReceiving") && "active"}`}>
                  <span style={{ color: 'black' }}>Receivings</span>
                </DropdownToggle>
                <DropdownMenu className="rounded shadow border-4">
                  <Link href="/cashReceiving" className={`dropdown-item ${pathName === "/cashReceiving" && "active"}`}>
                    Cash Receiving
                  </Link>
                  <Link href="/transferReceiving" className={`dropdown-item ${pathName === "/transferReceiving" && "active"}`}>
                    Account Transfer
                  </Link>
                </DropdownMenu>
              </UncontrolledDropdown>
              {/* Submenu for Payments */}
              <UncontrolledDropdown inNavbar direction="end">
                <DropdownToggle nav caret className={`dropdown-item ${(pathName === "/cashPayment" || pathName === "/transferPayment") && "active"}`}>
                  <span style={{ color: 'black' }}>Payments</span>
                </DropdownToggle>
                <DropdownMenu className="rounded shadow border-4">
                  <Link href="/cashPayment" className={`dropdown-item ${pathName === "/cashPayment" && "active"}`}>
                    Cash Payment
                  </Link>
                  <Link href="/transferPayment" className={`dropdown-item ${pathName === "/transferPayment" && "active"}`}>
                    Account Transfer
                  </Link>
                </DropdownMenu>
              </UncontrolledDropdown>
              <Link href="/singleReceivingandPayment" className={`dropdown-item ${pathName === "/singleReceivingandPayment" && "active"}`}>
                Ledger Entry RP
              </Link>
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

          {/* Dropdown for Create options */}
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret className={`px-2 ${(pathName === "/createItem" || pathName === "/createAccount") && "active"}`}>
              Create
            </DropdownToggle>
            <DropdownMenu className="border border-dark rounded shadow border-3">
              <Link href="/createAccount" className={`dropdown-item ${pathName === "/createAccount" && "active"}`}>
                Create Account
              </Link>
              <Link href="/createItem" className={`dropdown-item ${pathName === "/createItem" && "active"}`}>
                Create Item
              </Link>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>

        {/* Profile Dropdown */}
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle nav caret className="rounded-circle">
            <Image src={user1} alt="profile" className="rounded-circle" width="30" height="30" />
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
