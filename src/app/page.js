import SaleItem from "./(pages)/saleItem/page";

export const metadata = {
  title: {
    default: "AR Plastic Dashboard",
    template: "%s | AR Plastic Traders"
  },
  description: "Abdul Razzaq Plastic Traders. A Next.js 14 app | Made by Muhammad Uzair",
};

export default function Home() {
  return (
    <div>
      <SaleItem />
    </div>
  );
}
