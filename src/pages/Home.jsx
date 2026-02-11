import PopularDishes from "../components/home/PopularDishes";
import { useQuery } from "@tanstack/react-query";
import { getSummary, getOrders } from "../https";
import { useEffect } from "react";
import Greetings from "../components/home/Greetings";
import RecentOrders from "../components/home/RecentOrders";
import BottomNav from "../components/shared/BottomNav";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard";

const Home = () => {
  useEffect(() => {
    document.title = "POS | Home";
  }, []);

  // Fetch summary and orders from backend
  const { data: summaryRes } = useQuery({ queryKey: ["summary"], queryFn: getSummary });
  const { data: ordersRes } = useQuery({ queryKey: ["orders"], queryFn: getOrders });

  const summary = summaryRes?.data?.data || {};
  const orders = ordersRes?.data?.data || [];
  const inProgressCount =
    orders.filter((order) => order.orderStatus === "In Progress").length;

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-3">
      {/* Left Div */}
      <div className="flex-[3]">
        <Greetings />
        <div className="flex items-center w-full gap-3 px-8 mt-8">
          <MiniCard
            title="Today's Earnings"
            icon={<BsCashCoin />}
            number={summary.todaySales || 0}
            footerNum={0}
          />
          <MiniCard
            title="In Progress"
            icon={<GrInProgress />}
            number={inProgressCount}
            footerNum={0}
          />
        </div>
        <RecentOrders />
      </div>
      {/* Right Div */}
      <div className="flex-[2]">
        <PopularDishes />
      </div>
      <BottomNav />
    </section>
  );
};

export default Home;

