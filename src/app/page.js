'use client'
import Head from "next/head";
import Dashboard from "./(pages)/dashboard/page";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Abdul Razzaq Plastic Dashboard</title>
        <meta name="description" content="Made by Muhammad Uzair" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Dashboard/>
    </div>
  );
}
