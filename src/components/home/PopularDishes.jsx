import { getInventory } from "../../https";
import { useQuery } from "@tanstack/react-query";

const PopularDishes = () => {
  const { data: inventoryObj, isLoading, error } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const resp = await getInventory();

      // نرجع object بدل array
      return {
        items: resp.data.data,   // array of items
        totalItems: resp.data.data.length
      };
    }
  });

  if (isLoading) return <p className="text-[#ababab] py-10 text-center">Loading...</p>;
  if (error) return <p className="text-red-500 py-10 text-center">Error loading dishes</p>;

  // نتأكد إنه array قبل العرض
  const popularDishes = Array.isArray(inventoryObj?.items) ? inventoryObj.items.slice(0, 10) : [];

  return (
    <div className="mt-6 pr-6">
      <div className="bg-[#1a1a1a] w-full rounded-lg">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            Popular Dishes ({inventoryObj?.totalItems || 0})
          </h1>
          <a href="#" className="text-[#025cca] text-sm font-semibold">
            View all
          </a>
        </div>

        <div className="overflow-y-scroll h-[680px] scrollbar-hide">
          {popularDishes.length > 0 ? popularDishes.map((dish) => (
            <div
              key={dish._id}
              className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-6 py-4 mt-4 mx-6 border border-[#333]"
            >
              <div className="bg-[#333] w-[50px] h-[50px] rounded-full flex items-center justify-center text-[#e2bc15] font-black">
                {dish.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-[#f5f5f5] font-semibold tracking-wide">{dish.name}</h1>
                <p className="text-[#f5f5f5] text-sm font-semibold mt-1">
                  <span className="text-[#ababab]">Price: </span>EGP {dish.price}
                </p>
              </div>
            </div>
          )) : (
            <p className="text-center text-[#ababab] py-10">No popular dishes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;
