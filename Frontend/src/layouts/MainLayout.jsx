import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/common/Navbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#FFEEEE] to-[#DDEFBB]">
      <Navbar />
      <div className="flex-1 pt-16">
        {" "}
        {/* Add pt-16 to push content below the fixed Navbar */}
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
