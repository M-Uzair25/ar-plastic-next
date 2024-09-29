import React from "react";
import { Button, Nav, NavItem } from "reactstrap";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    title: "Dashboard",
    href: "/",
    icon: "bi bi-speedometer2",
  },
  {
    title: "Sales",
    href: "/sales",
    icon: "bi bi-card-text",
  },
  {
    title: "Purchase",
    href: "/purchase",
    icon: "bi bi-card-text",
  },
  {
    title: "Stock",
    href: "/stock",
    icon: "bi bi-card-text",
  },
  {
    title: "Ledger",
    href: "/ledger",
    icon: "i bi-journal-bookmark",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: "bi bi-layout-split",
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: "bi bi-layout-split",
  },
  {
    title: "My Accounts",
    href: "/myAccounts",
    icon: "bi bi-layout-split",
  },
  {
    title: "About",
    href: "/about",
    icon: "bi bi-people",
  },
];

const Sidebar = ({ showMobilemenu }) => {
  const location = usePathname();
  const currentURL = location.slice(0, location.lastIndexOf('/'));

  return (
    <div className="p-3">
      <div className="d-flex align-items-center">
        Abdul Razzaq Plastic
        <span className="ms-auto d-lg-none">
          <Button
            close
            size="sm"
            onClick={showMobilemenu}
          ></Button>
        </span>
      </div>
      <div className="pt-4 mt-2">
        <Nav vertical className="sidebarNav">
          {navigation.map((navi, index) => (
            <NavItem key={index} className="sidenav-bg">
              <Link
                href={navi.href}
                className={
                  location === navi.href
                    ? "text-primary nav-link py-3"
                    : "nav-link text-secondary py-3"
                }
              >
                <i className={navi.icon}></i>
                <span className="ms-3 d-inline-block">{navi.title}</span>
              </Link>
            </NavItem>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
