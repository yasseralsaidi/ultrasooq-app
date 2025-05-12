import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFetchProductById } from "../../../apis/queries/products.queries";
import Slider from "react-slick";
import { apply } from "slate";
import { border, margin } from "@mui/system";
import { MdRemoveRedEye } from "react-icons/md";
import ProductPricesView from "../../../components/modules/products/ProductPricesView";
import NoImagePlaceholder from "../../../assets/images/no-image.jpg";
import { convertDateTime } from "../../../utils/helper";

type RouteParams = {
  id: string;
};

const ProductsDetail = () => {
  const { id } = useParams<RouteParams>(); // Get product ID from URL

  const [isPricesVisible, setIsPricesVisible] = useState({
    id: null,
    show: false,
  });

  const mainSlider = useRef<Slider | null>(null);
  const thumbSlider = useRef<Slider | null>(null);

  // Convert id to a number safely
  const productId = id ? parseInt(id, 10) : 0;

  // Fetch product details using custom hook
  const productQueryById = useFetchProductById(productId, !!productId);

  if (productQueryById.isLoading) {
    return <p className="text-gray-500">Loading product details...</p>;
  }

  if (productQueryById.error) {
    return <p className="text-red-500">Error loading product details</p>;
  }

  const product = productQueryById.data?.data;

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
      {product ? (
        <div className="flex items-start flex-wrap gap-[5%]">
          <div className="w-[40%]">
            {/* <h2 className="text-xl font-semibold mt-4">Product Images</h2> */}
            <div className="flex gap-4 flex-wrap">
              <div className="product_image w-[100%] h-[400px]">
                {product.productImages?.length > 0 ? (
                  <div className="slider-container">
                    <Slider
                      {...mainSettings}
                      ref={mainSlider}
                      className="main_slider"
                    >
                      <div key={0} className="slider">
                        <img
                          src={product.productImages[0].image || NoImagePlaceholder}
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
                      {product.productImages.map((img: any, index: number) => (
                        <div key={index}>
                          <img
                            key={index}
                            src={img.image || NoImagePlaceholder}
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
            <h1 className="text-2xl font-bold mb-4">Product Details</h1>
            <div className="flex flex-wrap flex-col gap-2">
              <div className="flex items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Product ID :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {productId}
                </span>
              </div>
              <div className="flex items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Product Name :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {product.productName || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  SKU No :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {product.skuNo || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Product Type :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {product.typeOfProduct || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Barcode :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  <img
                    src={product.barcode}
                    alt="bar-code"
                    height={70}
                    width={300}
                  />
                </span>
              </div>
              <div className="flex items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Price :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  ${product.productPrice || "N/A"}
                </span>{" "}
                &nbsp;
                <button
                  type="button"
                  className="circle-btn"
                  onClick={() => {
                    setIsPricesVisible({
                      id: product.id,
                      show: true,
                    });
                  }}
                >
                  <MdRemoveRedEye size={20} />
                </button>
              </div>
              <div className="flex items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Offer Price :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  ${product.offerPrice || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Status :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {product.status || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Category :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {product.category?.name || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Brand :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {product.brand?.brandName || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Origin :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {product.placeOfOrigin?.countryName || "N/A"}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Short Description :
                </label>
                <ul className="list-disc ml-5 w-full m-0 pl-5">
                  {product.product_productShortDescription?.length > 0 ? (
                    product.product_productShortDescription.map(
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
              </div>
              <div className="flex flex-wrap items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Description :
                </label>
                <span
                  className="text-[#71717A] text-[16px] font-medium"
                  dangerouslySetInnerHTML={{
                    __html: product.description
                      ? parseRichText(product.description)
                      : "No description available.",
                  }}
                ></span>
              </div>
              <div className="flex flex-wrap items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Specifications :
                </label>
                <ul className="list-disc ml-5 w-full m-0 pl-5">
                  {product.product_productSpecification?.length > 0 ? (
                    product.product_productSpecification.map(
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
              </div>
              <div className="flex flex-wrap items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Seller Info :
                </label>
                <ul className="list-disc ml-5 w-full m-0 pl-5">
                  <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                    <label className="text-[16px] font-medium text-[#000] pr-2">
                      Seller Id:
                    </label>
                    <span className="text-[#71717A] text-[16px] font-medium">
                      {product.product_productPrice[0]?.adminDetail?.id}
                    </span>
                  </li>
                  <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                    <label className="text-[16px] font-medium text-[#000] pr-2">
                      Full Name:
                    </label>
                    <span className="text-[#71717A] text-[16px] font-medium">
                      {product.product_productPrice[0]?.adminDetail?.firstName}{" "}
                      {product.product_productPrice[0]?.adminDetail?.lastName}
                    </span>
                  </li>
                  <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                    <label className="text-[16px] font-medium text-[#000] pr-2">
                      Trade Roll:
                    </label>
                    <span className="text-[#71717A] text-[16px] font-medium">
                      {product.product_productPrice[0]?.adminDetail?.tradeRole}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Product Location :
                </label>
                <ul className="list-disc ml-5 w-full m-0 pl-5">
                  <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                    <label className="text-[16px] font-medium text-[#000] pr-2">
                      Country:
                    </label>
                    <span className="text-[#71717A] text-[16px] font-medium">
                      {product.product_productPrice[0]?.productCountryDetail
                        ?.name || "--"}
                    </span>
                  </li>
                  <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                    <label className="text-[16px] font-medium text-[#000] pr-2">
                      State:
                    </label>
                    <span className="text-[#71717A] text-[16px] font-medium">
                      {product.product_productPrice[0]?.productStateDetail
                        ?.name || "--"}
                    </span>
                  </li>
                  <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                    <label className="text-[16px] font-medium text-[#000] pr-2">
                      City:
                    </label>
                    <span className="text-[#71717A] text-[16px] font-medium">
                      {product.product_productPrice[0]?.productCityDetail
                        ?.name || "--"}
                    </span>
                  </li>
                  <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                    <label className="text-[16px] font-medium text-[#000] pr-2">
                      Town:
                    </label>
                    <span className="text-[#71717A] text-[16px] font-medium">
                      {product.product_productPrice[0]?.productTown || "--"}
                    </span>
                  </li>
                  <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                    <label className="text-[16px] font-medium text-[#000] pr-2">
                      Latitude and Longitude:
                    </label>
                    <span className="text-[#71717A] text-[16px] font-medium">
                      {product.product_productPrice[0]?.productLatLng || "--"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Where to sell section */}

              <div className="flex flex-wrap items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Consumer Location :
                </label>
                <ul className="list-disc ml-5 w-full m-0 pl-5">
                  <li className="w-full text-[#71717A] text-[16px] font-medium list-disc">
                    <label className="text-[16px] font-medium text-[#000] pr-2">
                      Country:
                    </label>
                    {product?.product_sellCountry?.length > 0
                      ? product.product_sellCountry.map(
                        (item: any, index: number) => (
                          <span
                            key={index}
                            className="text-[#71717A] text-[16px] font-medium"
                          >
                            {item?.countryName || "--"}
                            {index !== product.product_sellCountry.length - 1
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
                    {product?.product_sellState?.length > 0
                      ? product.product_sellState.map(
                        (item: any, index: number) => (
                          <span
                            key={index}
                            className="text-[#71717A] text-[16px] font-medium"
                          >
                            {item?.stateName || "--"}
                            {index !== product.product_sellState.length - 1
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
                    {product?.product_sellCity?.length > 0
                      ? product.product_sellCity.map(
                        (item: any, index: number) => (
                          <span
                            key={index}
                            className="text-[#71717A] text-[16px] font-medium"
                          >
                            {item?.cityName || "--"}
                            {index !== product.product_sellCity.length - 1
                              ? ", "
                              : ""}
                          </span>
                        )
                      )
                      : "--"}
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Stock :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {product?.product_productPrice?.[0]?.stock}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Number of Orders :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {product?.orderProducts?.length || 0}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Consumer Type :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {product?.product_productPrice?.[0]?.consumerType}
                </span>
              </div>

              {(product?.product_productPrice?.[0]?.consumerType == 'EVERYONE' ||
                product?.product_productPrice?.[0]?.consumerType == 'CONSUMER') && (
                  <>
                    <div className="flex flex-wrap items-center justify-start">
                      <label className="text-[16px] font-medium text-[#db2302] pr-2">
                        Consumer Discount :
                      </label>
                      <span className="text-[#71717A] text-[16px] font-medium">
                        {product?.product_productPrice?.[0]?.consumerDiscount}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-start">
                      <label className="text-[16px] font-medium text-[#db2302] pr-2">
                        Consumer Discount Type :
                      </label>
                      <span className="text-[#71717A] text-[16px] font-medium">
                        {product?.product_productPrice?.[0]?.consumerDiscountType}
                      </span>
                    </div>
                  </>
                )}

              {(product?.product_productPrice?.[0]?.consumerType == 'EVERYONE' ||
                product?.product_productPrice?.[0]?.consumerType == 'VENDORS') && (
                  <>
                    <div className="flex flex-wrap items-center justify-start">
                      <label className="text-[16px] font-medium text-[#db2302] pr-2">
                        Vendor Discount :
                      </label>
                      <span className="text-[#71717A] text-[16px] font-medium">
                        {product?.product_productPrice?.[0]?.vendorDiscount}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-start">
                      <label className="text-[16px] font-medium text-[#db2302] pr-2">
                        Vendor Discount Type:
                      </label>
                      <span className="text-[#71717A] text-[16px] font-medium">
                        {product?.product_productPrice?.[0]?.vendorDiscountType}
                      </span>
                    </div>
                  </>
                )}

              <div className="flex flex-wrap items-center justify-start">
                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                  Sell Type :
                </label>
                <span className="text-[#71717A] text-[16px] font-medium">
                  {product?.product_productPrice?.[0]?.sellType}
                </span>
              </div>

              {product?.product_productPrice?.[0]?.deliveryAfter ? (
                <div className="flex flex-wrap items-center justify-start">
                  <label className="text-[16px] font-medium text-[#db2302] pr-2">
                    Delivery Time :
                  </label>
                  <span className="text-[#71717A] text-[16px] font-medium">
                    {product?.product_productPrice?.[0]?.deliveryAfter}{" "}day(s)
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="w-full mt-5 product_details_table">
            <div className="w-full mb-4 product_details_table_heading">
              <h2 className="text-2xl font-bold text-black">Orders</h2>
            </div>
            <table className="table" border={1} cellPadding={0} cellSpacing={0}>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Amount</th>
                  <th>Date & Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {product?.orderProducts?.length > 0 ? (
                  <>
                    {
                      product.orderProducts.map((order: any) => {
                        return (
                          <tr>
                            <td>{order.orderNo}</td>
                            <td>{order.customerPay}</td>
                            <td>{convertDateTime(order.updatedAt)}</td>
                            <td>
                              <div className="td-action-icon-btns">
                                <Link
                                  to={`/user/orders/${order.orderId}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  <button
                                    type="button"
                                    className="circle-btn"
                                  >
                                    <MdRemoveRedEye size={20} />
                                  </button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    }
                  </>
                ) : (
                  <tr>
                    <td colSpan={4}>No order found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No product details available.</p>
      )}

      <ProductPricesView
        show={isPricesVisible}
        handleClose={() => setIsPricesVisible({ id: null, show: false })}
      />
    </div>
  );
};

export default ProductsDetail;
