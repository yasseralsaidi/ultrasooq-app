import React, { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Table } from "react-bootstrap";
import { useBrands } from "../../../apis/queries/brand.queries";
import Loader from "../../../utils/Loader";
import AddBrand from "./AddBrand";
import BrandDeleteModal from "./BrandDeleteModal";
import Pagination from "../../../components/shared/Pagination";
import { debounce } from "lodash";

export default function Brand() {
  const [show, setShow] = useState({ item: null, show: false });
  const [deleteBrand, setDeleteBrand] = useState({ id: null, show: false });
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");

  const brandsQuery = useBrands({
    page,
    limit,
    term: searchInput,
  });

  const handleSearchInput = debounce(
    (e) => setSearchInput(e.target.value),
    1000
  );

  return (
    <>
      {brandsQuery.isLoading && (
        <Loader loaderWidth="30px" loaderHeight="30px" position="absolute" />
      )}
      <AddBrand
        handleClose={() => setShow({ item: null, show: false })}
        show={show}
      />
      <BrandDeleteModal
        variant="danger"
        show={deleteBrand}
        handleClose={() => setDeleteBrand({ id: null, show: false })}
        text={text}
        buttonText="Delete Brand"
      />
      <HelmetProvider>
        <Helmet>
          <title>Brand</title>
        </Helmet>
      </HelmetProvider>
      <div className="listingPages allAccountsPage">
        <div className="listingPagesHead space-x-5">
          <div className="left">
            <h3>Brand</h3>
          </div>
          <div className="right">
            <div className="rightInner">
              <button
                className="themeBtn"
                onClick={() => setShow({ item: null, show: true })}
              >
                Add New Brand
              </button>
            </div>
          </div>
          <input
            placeholder="Search..."
            className="px-2 py-1"
            onChange={handleSearchInput}
          />
        </div>

        <div className="listingMain">
          <div className="customTable">
            <Table>
              <thead>
                <tr className="whitespace-nowrap">
                  <th>ID</th>
                  <th>BrandName</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {brandsQuery.data && brandsQuery.data.data?.length > 0 ? (
                  brandsQuery.data?.data?.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item?.id}</td>
                      <td>{item?.brandName}</td>
                      <td>
                        <div className="td-status">
                          <div className="td-status-value success">
                            {item?.status}
                          </div>
                        </div>
                      </td>
                      <td className="td-w-120px">
                        <div className="td-action-icon-btns">
                          <button
                            onClick={() => setShow({ item: item, show: true })}
                            className="circle-btn"
                            title="Edit"
                          >
                            <img src="/images/edit.svg" alt="" />
                          </button>
                          <button
                            className="circle-btn"
                            onClick={() => {
                              setDeleteBrand({ id: item.id, show: true });
                              setText(
                                `Are you sure you want to delete ${item?.brandName}?`
                              );
                            }}
                            title="Delete"
                          >
                            <img src="/images/delete.svg" alt="" />
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

          {brandsQuery.data?.totalCount > limit ? (
            <Pagination
              page={page}
              setPage={setPage}
              totalCount={brandsQuery.data?.totalCount}
              limit={limit}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
