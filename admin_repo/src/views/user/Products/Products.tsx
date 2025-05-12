import { useMemo, useState } from "react";
import { Table } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  useAllProducts,
  useUpdateProduct,
  useCategoryProd
} from "../../../apis/queries/products.queries";
import Loader from "../../../utils/Loader";
import ProductDeleteModal from "./ProductDeleteModal";
import { useProductCategories } from "../../../apis/queries/category.queries";
import validator from "validator";
import ProductForm from "../../../components/modules/products/ProductForm";
import Select from "react-select";
import { toast } from "react-toastify";
import BarcodeView from "../../../components/modules/products/BarcodeView";
import { MdRemoveRedEye } from "react-icons/md";
import Pagination from "../../../components/shared/Pagination";
import { debounce } from "lodash";
import ProductPricesView from "../../../components/modules/products/ProductPricesView";
import { FaSortUp } from "react-icons/fa";
import { FaSortDown } from "react-icons/fa6";
import {
  PRODUCT_STATUS_LIST,
  PRODUCT_TYPE_LIST,
} from "../../../utils/constants";
import { Item } from "../../../utils/types/common.types";
import NoImagePlaceholder from "../../../assets/images/no-image.jpg";
import { Link } from "react-router-dom";
import { MdOutlineImageNotSupported } from "react-icons/md";
// import Image from "next/image";
import clsx from 'clsx';
import { useCategoryStore } from "../../../../src/lib/categoryStore";


type CategoryProps = {
  id: number;
  parentId: number;
  name: string;
  icon: string;
  children: any;
};

const ProductsPage = () => {
  const [deleteProduct, setDeleteProduct] = useState({ id: null, show: false });
  const [isBarcodeVisible, setIsBarcodeVisible] = useState({
    id: null,
    show: false,
  });
  const [isPricesVisible, setIsPricesVisible] = useState({
    id: null,
    show: false,
  });
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [editModalShow, setEditModalShow] = useState(false);
  const [productId, setProductId] = useState();
  const [searchInput, setSearchInput] = useState("");
  const [sortType, setSortType] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentProductType, setCurrentProductType] = useState("ALL");
  const [currentCategory, setCurrentCategory] = useState("");

  const updateProductStatus = useUpdateProduct();
  const categoriesQuery = useProductCategories();

  // Handle change
  const handleChange = (selectedOption: any) => {
    if (selectedOption) {
      setCurrentCategory(selectedOption.value);
    }
  };

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const productsQuery = useAllProducts({
    page,
    limit,
    term: searchInput,
    sortType,
    sortOrder,
    productType: currentProductType, // ["ALL", "R", "P"]
    // status: "ALL",
    categoryId: selectedCategoryId !== null ? selectedCategoryId : "", // Correctly send categoryId
  });

  // Function to render product tags as badges
  //   const renderProductTags = (productTags) => {
  //     console.log("productTags",productTags);
  //     return productTags.map((tag, index) => (
  //         // console.log(tag.productTagsTag.tagName)
  //       <Badge key={index} className="bg-red-500 text-white">
  //         {tag.productTagsTag.tagName}
  //       </Badge>
  //     ));
  //   };

  const handleSearchInput = debounce(
    (e) => setSearchInput(e.target.value),
    1000
  );

  const handleProductStatus = async (status: string, productId: string) => {
    const response = await updateProductStatus.mutateAsync({
      status,
      productId,
    });
    if (response && response?.status) {
      toast.success("Status updated successfully");
    } else {
      console.log(response?.message);
      toast.error(response?.message);
    }
  };

  const findPathById = useMemo(
    () =>
      (item: Item, id: string, path: string[] = []) => {
        const newPath: string[] = [...path, item?.name];
        if (item?.id === id) {
          return newPath.join("/");
        }

        if (item?.children && item?.children.length > 0) {
          for (const child of item.children) {
            const result: any = findPathById(child, id, newPath);
            if (result) {
              return result;
            }
          }
        }

        return null;
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoriesQuery.data?.data]
  );

    //  For Category Filter

    const [categoryId, setCategoryId] = useState();

    const [subCategoryIndex, setSubCategoryIndex] = useState(0);
    const [subSubCategoryIndex, setSubSubCategoryIndex] = useState(0);
    const [subSubSubCategoryIndex, setSubSubSubCategoryIndex] = useState(0);
    const category = useCategoryStore();

    const memoizedSubCategory = useMemo(() => {
      let tempArr: any = [];
      if (categoriesQuery.data?.data) {
        tempArr = categoriesQuery.data.data?.children;
      }
      return tempArr || [];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoriesQuery.data?.data, categoryId]);
    
    const handleCategoryClick = (id:any) => {
      setSelectedCategoryId(id);
      // console.log("Selected Category ID:", id);
    };

  return (
    <>
      {productsQuery.isLoading && (
        <Loader loaderWidth="30px" loaderHeight="30px" position="absolute" />
      )}
      <HelmetProvider>
        <Helmet>
          <title>Products</title>
        </Helmet>
      </HelmetProvider>
      <ProductDeleteModal
        variant="danger"
        show={deleteProduct}
        handleClose={() => setDeleteProduct({ id: null, show: false })}
        text={text}
        buttonText="Delete Product"
      />
      <div className="listingPages allAccountsPage">
        <div className="listingPagesHead">
          <div className="left">
            <h3>Products</h3>
          </div>
          <div className="dropdown">
            <button className="dropbtn flex items-center">
              <div>
                <img
                  alt="hamburger-icon"
                  loading="lazy"
                  width="16"
                  height="14"
                  decoding="async"
                  data-nimg="1"
                  src="/images/categori.svg"
                />
              </div>
              <p className="mx-3 text-sm font-normal capitalize text-dark sm:text-base md:text-lg">
                All Categories
              </p>
              <div>
                <img
                  alt="hamburger-down-icon"
                  loading="lazy"
                  width="13"
                  height="8"
                  decoding="async"
                  data-nimg="1"
                  src="/images/down-arrow-black.svg"
                />
              </div>
            </button>
            {memoizedSubCategory?.length ? (
            <div className="dropdown-content">
              {memoizedSubCategory?.map((item: CategoryProps, index: number) => (
              <div
              key={item?.id}
              className={clsx(
                "dropdown-content-child flex cursor-pointer items-center justify-start gap-x-2 p-3",
                {
                  "dropdown-active-child": memoizedSubCategory?.length && index === subCategoryIndex,
                }
              )}
              onMouseEnter={() => setSubCategoryIndex(index)}
              onClick={() => {
                setSubCategoryIndex(index);
                category.setSubCategories(
                  memoizedSubCategory?.[subCategoryIndex]?.children,
                );
                // category.setSubSubCategories([]);
                category.setCategoryId(item?.id.toString());
                // save index to check for child categories part of parent or not
                category.setSubCategoryIndex(index);
                category.setSubCategoryParentName(item?.name);
                category.setSubSubCategoryParentName(
                  memoizedSubCategory?.[subCategoryIndex]
                    ?.children?.[0]?.name,
                );
                category.setSubSubCategories(
                  memoizedSubCategory?.[subCategoryIndex]
                    ?.children?.[0]?.children,
                );

                //reset for second level category active index
                category.setSecondLevelCategoryIndex(0);
                handleCategoryClick(item?.id)
              }}
            >
              {item?.icon ? (
                <img
                  src={item.icon}
                  alt={item?.name}
                  height={24}
                  width={24}
                />
              ) : (
                <MdOutlineImageNotSupported size={24} />
              )}
              <p
                title={item?.name}
                className="text-beat text-start text-sm"
              >
                {item?.name}
              </p>
            </div>
               ),
              )}
            </div>
            ) : null}

          {memoizedSubCategory?.[subCategoryIndex]?.children?.length ? (
            <div className="dropdown-content-second">
              {memoizedSubCategory?.[subCategoryIndex]?.children?.map(
                      (item: CategoryProps, index: number) => (
              <div
                  key={item?.id}
                  className={clsx(
                    "dropdown-content-child flex cursor-pointer items-center justify-start gap-x-2 p-3",
                    memoizedSubCategory?.[subCategoryIndex]?.children
                      ?.length
                      ? index === subSubCategoryIndex
                        ? "dropdown-active-child"
                        : null
                      : null,
                  )}
                  onMouseEnter={() => setSubSubCategoryIndex(index)}
                  onClick={() => {
                    setSubSubCategoryIndex(index);
                    category.setSubSubCategories(
                      memoizedSubCategory?.[subCategoryIndex]
                        ?.children?.[subSubCategoryIndex]?.children,
                    );
                    category.setCategoryId(item?.id.toString());
                    category.setSecondLevelCategoryIndex(index);
                    category.setSubSubCategoryParentName(item?.name);
                    //FIXME: need condition
                    if (
                      category.subCategoryIndex !== subCategoryIndex
                    ) {
                      category.setSubCategories([]);
                      category.setSubCategoryParentName("");
                    }
                    handleCategoryClick(item?.id)
                  }}
                  >
                <img
                  alt={item?.name}
                  loading="lazy"
                  width="24"
                  height="24"
                  decoding="async"
                  data-nimg="1"
                  src={item.icon}
                />
                <p
                  title={item?.name}
                  className="text-beat text-start text-sm"
                >
                  {item?.name}
                </p>
              </div>
               ),
              )}
            </div>
             ) : null}


              {memoizedSubCategory?.[subCategoryIndex]?.children?.[
                  subSubCategoryIndex
                ]?.children?.length ? (
            <div className="dropdown-content-third p-3">
              <h4 className="mb-2 text-sm">
              {memoizedSubCategory?.[subCategoryIndex]?.children?.[
                        subSubCategoryIndex
                      ]?.name || ""}
              </h4>
              <div className="grid grid-cols-5">
              {memoizedSubCategory?.[subCategoryIndex]?.children?.[
                        subSubCategoryIndex
                      ]?.children?.map((item: CategoryProps, index: number) => (
                <div 
                    key={item?.id}
                    className={clsx(
                      "dropdown-content-child flex cursor-pointer flex-col items-center justify-start gap-y-2 p-3",
                      memoizedSubCategory?.[subCategoryIndex]?.children?.[
                        subSubCategoryIndex
                      ]?.children?.length
                        ? index === subSubSubCategoryIndex
                          ? "dropdown-active-child"
                          : null
                        : null,
                    )}
                    onMouseEnter={() => setSubSubSubCategoryIndex(index)}
                    onClick={() => {
                      setSubSubSubCategoryIndex(index);
                      category.setCategoryId(item?.id.toString());
                      handleCategoryClick(item?.id);
                    }}
                    >
                  <div className="relative h-8 w-8">
                    <img
                      alt={item?.name}
                      loading="lazy"
                      decoding="async"
                      data-nimg="fill"
                      className="object-contain"
                      sizes="100vw"
                      src={item.icon}
                    />
                  </div>
                  <p
                    title={item?.name}
                    className="text-beat text-center text-sm"
                  >
                    {item?.name}
                  </p>
                </div>
                ))}
              </div>
            </div>
             ) : null}
          </div>
          <div className="flex gap-x-3 items-center">
            <p>Product Type: </p>
            <Select
              value={PRODUCT_TYPE_LIST.filter(
                (item) => item.value === currentProductType
              )}
              onChange={(e) => {
                if (!e) return;
                setCurrentProductType(e.value);
              }}
              placeholder="Product Type"
              options={PRODUCT_TYPE_LIST}
              isSearchable={false}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  width: "170px",
                }),
              }}
            />

            <input
              placeholder="Search..."
              className="px-2 py-1"
              onChange={handleSearchInput}
            />
          </div>
        </div>

        <div className="listingMain">
          <div className="customTable">
            <Table responsive>
              <thead>
                <tr className="whitespace-nowrap">
                  <th>Product Image</th>
                  <th>
                    <button
                      onClick={() => {
                        setSortType("skuNo");
                        if (sortOrder === "asc") {
                          setSortOrder("desc");
                        } else {
                          setSortOrder("asc");
                        }
                      }}
                      className="flex items-center gap-x-2"
                    >
                      SKU No{" "}
                      {sortOrder === "asc" && sortType === "skuNo" ? (
                        <FaSortUp />
                      ) : null}
                      {sortOrder === "desc" && sortType === "skuNo" ? (
                        <FaSortDown className="mb-1" />
                      ) : null}
                    </button>
                  </th>
                  <th>Bar Code</th>
                  <th>
                    <button
                      onClick={() => {
                        setSortType("productName");
                        if (sortOrder === "asc") {
                          setSortOrder("desc");
                        } else {
                          setSortOrder("asc");
                        }
                      }}
                      className="flex items-center gap-x-2"
                    >
                      Product Name{" "}
                      {sortOrder === "asc" && sortType === "productName" ? (
                        <FaSortUp />
                      ) : null}
                      {sortOrder === "desc" && sortType === "productName" ? (
                        <FaSortDown className="mb-1" />
                      ) : null}
                    </button>
                  </th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Brand Name</th>
                  <th>Prices</th>
                  <th>Origin</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {productsQuery.data && productsQuery.data.data?.length > 0 ? (
                  productsQuery.data?.data?.map((item: any) => (
                    <tr key={item.id}>
                      {/* TODO:need thumbnail from backend */}
                      <td>
                        <Link
                          to={`/user/products/${item.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          <img
                            src={
                              item?.productImages?.[0]?.image &&
                              validator.isURL(item?.productImages?.[0]?.image)
                                ? item.productImages[0].image
                                : NoImagePlaceholder
                            }
                            className="w-[40px] h-[40px]"
                            alt="thumbnail-preview"
                          />
                        </Link>
                      </td>

                      <td className="max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis">
                        {item?.skuNo}
                      </td>
                      <td className="max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis">
                        <button
                          type="button"
                          className="circle-btn"
                          onClick={() => {
                            setIsBarcodeVisible({
                              id: item.barcode,
                              show: true,
                            });
                          }}
                        >
                          <MdRemoveRedEye size={20} />
                        </button>
                      </td>
                      <td className="max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis">
                        {item?.productName}
                      </td>
                      <td className="max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis">
                        {item?.productType}
                      </td>
                      <td className="max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis">
                        <p
                          title={findPathById(
                            categoriesQuery.data?.data || [],
                            item?.categoryId
                          )
                            ?.split("/")
                            .slice(1)
                            .join("/")}
                        >
                          {findPathById(
                            categoriesQuery.data?.data || [],
                            item?.categoryId
                          )
                            ?.split("/")
                            .slice(1)
                            .join("/")}
                        </p>
                      </td>
                      <td>{item?.brand?.brandName || "-"}</td>
                      <td className="max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis">
                        <button
                          type="button"
                          className="circle-btn"
                          onClick={() => {
                            setIsPricesVisible({
                              id: item.id,
                              show: true,
                            });
                          }}
                        >
                          <MdRemoveRedEye size={20} />
                        </button>
                      </td>
                      <td>{item?.placeOfOrigin?.countryName}</td>
                      <td className="w-[150px]">
                        <Select
                          value={{
                            label: item?.status,
                            value: item?.status,
                          }}
                          onChange={(e) => {
                            if (!e) return;
                            handleProductStatus(e.value, item.id);
                          }}
                          placeholder="Select"
                          options={PRODUCT_STATUS_LIST}
                          isDisabled={item?.status === "DELETE"}
                          styles={{
                            control: (baseStyles) => ({
                              ...baseStyles,
                              width: "140px",
                            }),
                          }}
                        />
                      </td>

                      <td className="td-w-120px">
                        <div className="td-action-icon-btns">
                          <button
                            type="button"
                            onClick={() => {
                              setProductId(item.id);
                              setEditModalShow(true);
                            }}
                            className="circle-btn"
                            title="Edit"
                            disabled={item?.status === "DELETE"}
                          >
                            <img src="/images/edit.svg" alt="edit-icon" />
                          </button>

                          <button
                            type="button"
                            className="circle-btn"
                            onClick={() => {
                              setDeleteProduct({ id: item.id, show: true });
                              setText(
                                `Are you sure you want to delete ${item?.productName}?`
                              );
                            }}
                            disabled={item?.status === "DELETE"}
                          >
                            <img src="/images/delete.svg" alt="delete-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={12}
                      className="text-center font-semibold py-10"
                    >
                      No Data Found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {productsQuery.data?.totalCount > limit ? (
            <Pagination
              page={page}
              setPage={setPage}
              totalCount={productsQuery.data?.totalCount}
              limit={limit}
            />
          ) : null}
        </div>

        <ProductForm
          show={editModalShow}
          productCategories={categoriesQuery?.data?.data?.children?.map((item: any) => {
            return {
              label: item.name,
              value: item.id
            }
          }) || []}
          onHide={() => {
            setProductId(undefined);
            setEditModalShow(false);
          }}
          productId={productId}
        />

        <BarcodeView
          show={isBarcodeVisible}
          handleClose={() => setIsBarcodeVisible({ id: null, show: false })}
          barcodeValue={isBarcodeVisible.id}
        />

        <ProductPricesView
          show={isPricesVisible}
          handleClose={() => setIsPricesVisible({ id: null, show: false })}
        />
      </div>
    </>
  );
};

export default ProductsPage;
