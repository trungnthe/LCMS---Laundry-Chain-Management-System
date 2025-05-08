import Header from "../reuse/Header";
import Footer from "../reuse/Footer";
import MiniService from "../reuse/user/MiniService";
import MiniNews from "../reuse/user/MiniNews";
import "../../assets/css/user/services.css";
import React, { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { fetchServiceTypes } from "../../admin/manage_service_type";

const Services = () => {
  return (
    <div>
      <Header />
      <div className="content-header">
        <div className="content-header-content">
          <div className="content-header-image">
            <img src="/services.svg" alt="Service" />
          </div>
          <h2>Dịch Vụ</h2>
        </div>
      </div>
      <div id="content"></div>
      <div className="services-container">
        <Outlet></Outlet>
        <div className="services-left">
          <MiniService />
          <div className="monthly-pass">
            <img src="/VeThang.png"></img>
          </div>
          <MiniNews></MiniNews>
        </div>
      </div>
    </div>
  );
};

export default Services;