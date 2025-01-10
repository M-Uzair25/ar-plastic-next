import React from "react";
import { Button, Nav, NavItem } from "reactstrap";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
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
      <div className="d-flex align-items-center bg-dark p-3 text-white">
        <Link href="/" className="text-white text-decoration-none">AR. Plastic Store</Link>
        <span className="ms-auto d-lg-none mx-1">
          <Button
            variant="white"
            close
            size="sm"
            onClick={showMobilemenu}
          ></Button>
        </span>
      </div>
      <div className="pt-4">
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
