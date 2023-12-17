'use client'
import "@/styles/style.scss";
import Head from "next/head";
import React from "react";
import { Container } from "reactstrap";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}) {
  const [open, setOpen] = React.useState(false);
  const showMobilemenu = () => {
    setOpen(!open);
  };
  return (
    <html lang="en">
      <Head>
        <title>Abdul Razzaq Plastic Dashboard</title>
        <meta name="description" content="Made by Muhammad Uzair" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <main>
          <div className="pageWrapper d-md-block d-lg-flex">
            {/******** Sidebar **********/}
            <aside
              className={`sidebarArea shadow bg-white ${!open ? "" : "showSidebar"
                }`}
            >
              <Sidebar showMobilemenu={() => showMobilemenu()} />
            </aside>
            {/********Content Area**********/}

            <div className="contentArea">
              {/********header**********/}
              <Header showMobmenu={() => showMobilemenu()} />

              {/********Middle Content**********/}
              <Container className="p-4 wrapper" fluid>
                <div>{children}</div>
              </Container>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
