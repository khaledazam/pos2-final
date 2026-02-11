import React, { createContext, useContext, useState, useEffect } from "react";
import { getInventory, getTables } from "../https/index";

const POSContext = createContext();

export const POSProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch Inventory
  const refreshInventory = async () => {
    try {
      console.log("🔄 Fetching inventory...");
      const response = await getInventory(); // ✅ Uses /api/inventory NOT /api/products
      
      console.log("📦 Inventory response:", response);
      
      // Extract data safely
      const data = response.data?.data || response.data || [];
      
      setInventory(Array.isArray(data) ? data : []);
      console.log("✅ Inventory loaded:", data.length, "items");
    } catch (error) {
      console.error("❌ Error fetching inventory:", error);
      console.error("Error details:", error.response?.data);
      setInventory([]);
    }
  };

  // ✅ Fetch Tables
  const refreshTables = async () => {
    try {
      console.log("🔄 Fetching tables...");
      const response = await getTables(); // ✅ Uses /api/table
      
      console.log("🪑 Tables response:", response);
      
      // Extract data safely
      const data = response.data?.data || response.data || [];
      
      setTables(Array.isArray(data) ? data : []);
      console.log("✅ Tables loaded:", data.length, "tables");
    } catch (error) {
      console.error("❌ Error fetching tables:", error);
      console.error("Error details:", error.response?.data);
      setTables([]);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        refreshInventory(),
        refreshTables()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const value = {
    inventory,
    tables,
    isLoading,
    refreshInventory,
    refreshTables
  };

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOS must be used within POSProvider");
  }
  return context;
};

export default POSContext;