import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useFetchProductById } from "../../../apis/queries/products.queries";
import Slider from "react-slick";
import { apply } from "slate";
import { border, margin } from "@mui/system";
import { MdRemoveRedEye } from "react-icons/md";
import ProductPricesView from "../../../components/modules/products/ProductPricesView";
import NoImagePlaceholder from "../../../assets/images/no-image.jpg";
import { useFetchServiceById } from "../../../apis/queries/services.queries";
import ServicePriceView from "../../../components/modules/services/ServicePriceView";
import moment from "moment";

type RouteParams = {
    id: string;
};

const ServiceDetail = () => {
    const { id } = useParams<RouteParams>(); // Get product ID from URL

    const [isPricesVisible, setIsPricesVisible] = useState({
        data: [],
        show: false,
    });

    const mainSlider = useRef<Slider | null>(null);
    const thumbSlider = useRef<Slider | null>(null);

    // Convert id to a number safely
    const serviceId = id ? parseInt(id, 10) : 0;

    // Fetch product details using custom hook
    const serviceQueryById = useFetchServiceById(serviceId, !!serviceId);

    if (serviceQueryById.isLoading) {
        return <p className="text-gray-500">Loading service details...</p>;
    }

    if (serviceQueryById.error) {
        return <p className="text-red-500">Error loading service details</p>;
    }

    const service = serviceQueryById.data?.data;

    // For editor
    const parseRichText = (json: any) => {
        if (!json) return "";
        let parsedData = typeof json === "string" ? JSON.parse(json) : json;
        if (!Array.isArray(parsedData)) return "";

        return parsedData
            .map((block) => {
                if (block.type === "p" && block.children) {
                    return `<p>${block.children
                        .map((child: any) => {
                            let styles = `font-size:${child.fontSize}; color:${child.color}; background-color:${child.backgroundColor};`;
                            if (child.bold) styles += " font-weight:bold;";
                            if (child.italic) styles += " font-style:italic;";
                            if (child.underline) styles += " text-decoration:underline;";
                            return `<span style="${styles}">${child.text}</span>`;
                        })
                        .join("")}</p>`;
                }
                return "";
            })
            .join("");
    };

    const images = [
        "https://via.placeholder.com/600x400?text=Image+1",
        "https://via.placeholder.com/600x400?text=Image+2",
        "https://via.placeholder.com/600x400?text=Image+3",
        "https://via.placeholder.com/600x400?text=Image+4",
    ];

    const mainSettings = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        asNavFor: thumbSlider.current || undefined,
    };

    const thumbSettings = {
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: false,
        focusOnSelect: true,
        centerMode: false,
        centerPadding: "10px",
        asNavFor: mainSlider.current || undefined,
    };

    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
            {service ? (
                <div className="flex items-start flex-wrap gap-[5%]">
                    <div className="w-[40%]">
                        {/* <h2 className="text-xl font-semibold mt-4">Product Images</h2> */}
                        <div className="flex gap-4 flex-wrap">
                            <div className="product_image w-[100%] h-[400px]">
                                {service.images?.length > 0 ? (
                                    <div className="slider-container">
                                        <Slider
                                            {...mainSettings}
                                            ref={mainSlider}
                                            className="main_slider"
                                        >
                                            <div key={0} className="slider">
                                                <img
                                                    src={service?.images?.[0]?.url || NoImagePlaceholder}
                                                    alt={`Slide ${0 + 1}`}
                                                    style={{ width: "100%" }}
                                                />
                                            </div>
                                        </Slider>
                                        {/* Thumbnail Slider */}
                                        <Slider
                                            {...thumbSettings}
                                            ref={thumbSlider}
                                            className="thumbnail-slider"
                                        >
                                            {service.images.map((img: any, index: number) => (
                                                <div key={index}>
                                                    <img
                                                        key={index}
                                                        src={img.url || NoImagePlaceholder}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        style={{ width: "100%", cursor: "pointer" }}
                                                    />
                                                </div>
                                            ))}
                                        </Slider>

                                        {/* {product.productImages.map((img: any, index: number) => (
                      <img
                        key={index}
                        src={img.image}
                        alt={`Product ${index}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ))} */}
                                    </div>
                                ) : (
                                    <p>No images available.</p>
                                )}
                                {/* <div className="slider-container"> */}
                                {/* Main Slider */}
                                {/* <Slider {...mainSettings} ref={mainSlider}>
                    {images.map((img, index) => (
                      <div key={index}>
                        <img
                          src={img}
                          alt={`Slide ${index + 1}`}
                          style={{ width: "100%" }}
                        />
                      </div>
                    ))}
                  </Slider> */}

                                {/* Thumbnail Slider */}
                                {/* <Slider
                    {...thumbSettings}
                    ref={thumbSlider}
                    className="thumbnail-slider"
                  >
                    {images.map((img, index) => (
                      <div key={index}>
                        <img
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          style={{ width: "100%", cursor: "pointer" }}
                        />
                      </div>
                    ))}
                  </Slider> */}
                                {/* </div> */}
                            </div>
                        </div>
                    </div>
                    <div className="w-[55%]">
                        <h1 className="text-2xl font-bold mb-4">Service Details</h1>
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Service ID :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {serviceId}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Service Name :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service.serviceName || "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Service Type :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service.serviceType || "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Service For :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service.serviceFor || "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Working Days :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service.workingDays || "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Off Days :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service.offDays || ""}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Confirm Order Type :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service.serviceConfirmType || ""}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Renew :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service?.renewEveryWeek === true ? "Every Week" : service?.renewEveryWeek === false ? "One By General Tool" : ""}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Shipping :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service?.shippingType || ""}
                                </span>
                            </div>
                            {/* {service?.shippingType === "DIRECTION" ? (
                                <div className="flex flex-wrap items-start gap-4">
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            Country:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service?.shippingCountry || "--"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            State:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service?.shippingState || "--"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            From City:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service?.shippingFromCity || "--"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            To City:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service?.shippingToCity || "--"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-start gap-4">
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            Country:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service?.shippingCountry || "--"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            State:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service?.shippingState || "--"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            City:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service?.shippingCity || "--"}
                                        </span>
                                    </div>
                                </div>
                            )} */}
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Each Customer :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service?.eachCustomerTime + " Min" || ""}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Customer Period :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service?.customerPerPeiod || ""}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Open Time :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service?.openTime ? moment.utc(service.openTime).local().format('hh:mm A') : ""}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Close Time :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service?.closeTime ? moment.utc(service.closeTime).local().format('hh:mm A') : ""}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Break Time From :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service?.closeTime ? moment.utc(service.breakTimeFrom).local().format('hh:mm A') : ""}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Break Time To :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service?.closeTime ? moment.utc(service.breakTimeTo).local().format('hh:mm A') : ""}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Price :
                                </label>
                                {/* <span className="text-[#71717A] text-[16px] font-medium">
                  ${service.productPrice || "N/A"}
                </span>{" "} */}
                                &nbsp;
                                <button
                                    type="button"
                                    className="circle-btn"
                                    onClick={() => {
                                        setIsPricesVisible({
                                            data: service?.serviceFeatures || [],
                                            show: true,
                                        });
                                    }}
                                >
                                    <MdRemoveRedEye size={20} />
                                </button>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Status :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service.status || "N/A"}
                                </span>
                            </div>
                            {/* <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Category :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service.category?.name || "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Brand :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service.brand?.brandName || "N/A"}
                                </span>
                            </div> */}
                            {/* <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Origin :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {service.placeOfOrigin?.countryName || "N/A"}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Short Description :
                                </label>
                                <ul className="list-disc ml-5 w-full m-0 pl-5">
                                    {service.service_serviceShortDescription?.length > 0 ? (
                                        service.service_serviceShortDescription.map(
                                            (spec: any, index: number) => (
                                                <li
                                                    key={index}
                                                    className="w-full text-[#71717A] text-[16px] font-medium list-disc"
                                                >
                                                    <label className="text-[16px] font-medium text-[#000] pr-2">
                                                        {spec.shortDescription}
                                                    </label>
                                                </li>
                                            )
                                        )
                                    ) : (
                                        <p>No Short Description available.</p>
                                    )}
                                </ul>
                            </div> */}
                            <div className="flex flex-wrap items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Description :
                                </label>
                                <span
                                    className="text-[#71717A] text-[16px] font-medium"
                                    dangerouslySetInnerHTML={{
                                        __html: service.description
                                            ? parseRichText(service.description)
                                            : "No description available.",
                                    }}
                                ></span>
                            </div>
                            {/* <div className="flex flex-wrap items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Specifications :
                                </label>
                                <ul className="list-disc ml-5 w-full m-0 pl-5">
                                    {service.service_serviceSpecification?.length > 0 ? (
                                        service.service_serviceSpecification.map(
                                            (spec: any, index: number) => (
                                                <li
                                                    key={index}
                                                    className="w-full text-[#71717A] text-[16px] font-medium list-disc"
                                                >
                                                    <label className="text-[16px] font-medium text-[#000] pr-2">
                                                        {spec.label}:
                                                    </label>
                                                    <span className="text-[#71717A] text-[16px] font-medium">
                                                        {spec.specification}
                                                    </span>
                                                </li>
                                            )
                                        )
                                    ) : (
                                        <p>No specifications available.</p>
                                    )}
                                </ul>
                            </div> */}
                            {/* <div className="flex flex-wrap items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Seller Info :
                                </label>
                                <ul className="list-disc ml-5 w-full m-0 pl-5">
                                    <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                                        <label className="text-[16px] font-medium text-[#000] pr-2">
                                            Seller Id:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service.service_servicePrice?.[0]?.adminDetail?.id}
                                        </span>
                                    </li>
                                    <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                                        <label className="text-[16px] font-medium text-[#000] pr-2">
                                            Full Name:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service.service_servicePrice?.[0]?.adminDetail?.firstName}{" "}
                                            {service.service_servicePrice?.[0]?.adminDetail?.lastName}
                                        </span>
                                    </li>
                                    <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                                        <label className="text-[16px] font-medium text-[#000] pr-2">
                                            Trade Roll:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service.service_servicePrice?.[0]?.adminDetail?.tradeRole}
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-wrap items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    service Location :
                                </label>
                                <ul className="list-disc ml-5 w-full m-0 pl-5">
                                    <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                                        <label className="text-[16px] font-medium text-[#000] pr-2">
                                            Country:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service.service_servicePrice?.[0]?.serviceCountryDetail
                                                ?.name || "--"}
                                        </span>
                                    </li>
                                    <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                                        <label className="text-[16px] font-medium text-[#000] pr-2">
                                            State:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service.service_servicePrice?.[0]?.serviceStateDetail
                                                ?.name || "--"}
                                        </span>
                                    </li>
                                    <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                                        <label className="text-[16px] font-medium text-[#000] pr-2">
                                            City:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service.service_servicePrice?.[0]?.serviceCityDetail
                                                ?.name || "--"}
                                        </span>
                                    </li>
                                    <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                                        <label className="text-[16px] font-medium text-[#000] pr-2">
                                            Town:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service.service_servicePrice?.[0]?.serviceTown || "--"}
                                        </span>
                                    </li>
                                    <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                                        <label className="text-[16px] font-medium text-[#000] pr-2">
                                            Latitude and Longitude:
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {service.service_servicePrice?.[0]?.serviceLatLng || "--"}
                                        </span>
                                    </li>
                                </ul>
                            </div> */}

                            {/* Where to sell section */}

                            {/* <div className="flex flex-wrap items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Consumer Location :
                                </label>
                                <ul className="list-disc ml-5 w-full m-0 pl-5">
                                    <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                                        <label className="text-[16px] font-medium text-[#000] pr-2">
                                            Country:
                                        </label>
                                        {service?.service_sellCountry?.length > 0
                                            ? service.service_sellCountry.map(
                                                (item: any, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="text-[#71717A] text-[16px] font-medium"
                                                    >
                                                        {item?.countryName || "--"}
                                                        {index !== service.service_sellCountry.length - 1
                                                            ? ", "
                                                            : ""}
                                                    </span>
                                                )
                                            )
                                            : "--"}
                                    </li>
                                    <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                                        <label className="text-[16px] font-medium text-[#000] pr-2">
                                            State:
                                        </label>
                                        {service?.service_sellState?.length > 0
                                            ? service.service_sellState.map(
                                                (item: any, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="text-[#71717A] text-[16px] font-medium"
                                                    >
                                                        {item?.stateName || "--"}
                                                        {index !== service.service_sellState.length - 1
                                                            ? ", "
                                                            : ""}
                                                    </span>
                                                )
                                            )
                                            : "--"}
                                    </li>
                                    <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                                        <label className="text-[16px] font-medium text-[#000] pr-2">
                                            City:
                                        </label>
                                        {service?.service_sellCity?.length > 0
                                            ? service.service_sellCity.map(
                                                (item: any, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="text-[#71717A] text-[16px] font-medium"
                                                    >
                                                        {item?.cityName || "--"}
                                                        {index !== service.service_sellCity.length - 1
                                                            ? ", "
                                                            : ""}
                                                    </span>
                                                )
                                            )
                                            : "--"}
                                    </li>
                                </ul>
                            </div> */}
                        </div>
                    </div>
                    {/* <div className="w-full mt-5 product_details_table">
            <div className="w-full mb-4 product_details_table_heading">
              <h2 className="text-2xl font-bold text-black">Buyer Details</h2>
              <h6>
                *(This is static. After the order part is complete, dynamic data
                will be shown.)
              </h6>
            </div>
            <table className="table" border={1} cellPadding={0} cellSpacing={0}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile No</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td align="left" valign="top">
                    Surojit Das
                  </td>
                  <td align="left" valign="top">
                    surojitdas@technoexponent.com
                  </td>
                  <td align="left" valign="top">
                    9804309724
                  </td>
                  <td align="left" valign="top">
                    Konnagar
                  </td>
                </tr>
                <tr>
                  <td align="left" valign="top">
                    Surojit Das
                  </td>
                  <td align="left" valign="top">
                    surojitdas@technoexponent.com
                  </td>
                  <td align="left" valign="top">
                    9804309724
                  </td>
                  <td align="left" valign="top">
                    Konnagar
                  </td>
                </tr>
                <tr>
                  <td align="left" valign="top">
                    Surojit Das
                  </td>
                  <td align="left" valign="top">
                    surojitdas@technoexponent.com
                  </td>
                  <td align="left" valign="top">
                    9804309724
                  </td>
                  <td align="left" valign="top">
                    Konnagar
                  </td>
                </tr>
                <tr>
                  <td align="left" valign="top">
                    Surojit Das
                  </td>
                  <td align="left" valign="top">
                    surojitdas@technoexponent.com
                  </td>
                  <td align="left" valign="top">
                    9804309724
                  </td>
                  <td align="left" valign="top">
                    Konnagar
                  </td>
                </tr>
                <tr>
                  <td align="left" valign="top">
                    Surojit Das
                  </td>
                  <td align="left" valign="top">
                    surojitdas@technoexponent.com
                  </td>
                  <td align="left" valign="top">
                    9804309724
                  </td>
                  <td align="left" valign="top">
                    Konnagar
                  </td>
                </tr>
                <tr>
                  <td align="left" valign="top">
                    Surojit Das
                  </td>
                  <td align="left" valign="top">
                    surojitdas@technoexponent.com
                  </td>
                  <td align="left" valign="top">
                    9804309724
                  </td>
                  <td align="left" valign="top">
                    Konnagar
                  </td>
                </tr>
                <tr>
                  <td align="left" valign="top">
                    Surojit Das
                  </td>
                  <td align="left" valign="top">
                    surojitdas@technoexponent.com
                  </td>
                  <td align="left" valign="top">
                    9804309724
                  </td>
                  <td align="left" valign="top">
                    Konnagar
                  </td>
                </tr>
              </tbody>
            </table>
          </div> */}
                </div>
            ) : (
                <p className="text-gray-500">No product details available.</p>
            )}

            <ServicePriceView
                data={isPricesVisible.data}
                show={isPricesVisible}
                handleClose={() => setIsPricesVisible({ data: [], show: false })}
            />
        </div>
    );
};

export default ServiceDetail;
