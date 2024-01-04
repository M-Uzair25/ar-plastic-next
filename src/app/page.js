import Dashboard from "./(pages)/dashboard/page";

export const metadata = {
  title: {
    default: "AR Plastic Dashboard",
    template: "%s | AR Plastic"
  },
  description: "Abdul Razzaq Plastic. A Next.js 14 app | Made by Muhammad Uzair",
};

export default function Home() {
  return (
    <div>
      <Dashboard />
    </div>
  );
}
