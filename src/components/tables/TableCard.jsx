import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateTable } from "../../redux/slices/customerSlice";

const TableCard = ({ id, name, status, seats, isAdmin }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSelectTable = () => {
    // وجه للمنيو دائمًا (متاحة أو مشغولة)
    console.log("تم الضغط على طاولة:", name, "ID:", id, "Status:", status);
    dispatch(
      updateTable({
        table: {
          _id: id,
          tableNo: name,
          seats,
        },
      })
    );
    navigate("/menu");
  };

  return (
    <div
      onClick={handleSelectTable}
      className={`bg-[#262626] p-4 rounded-lg cursor-pointer hover:scale-105 transition-transform ${
        status === "Occupied" ? "border-2 border-red-500" : "border-2 border-green-500"
      }`}
    >
      <h1 className="text-white">Table {name}</h1>
      <p className="text-gray-400">Seats: {seats}</p>
      <span className={`text-sm font-bold ${status === "Available" ? "text-green-400" : "text-red-400"}`}>
        {status}
      </span>
    </div>
  );
};

export default TableCard;