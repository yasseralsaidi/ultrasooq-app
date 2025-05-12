/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Loader from "../../../utils/Loader";
import DeleteModal from "../../../utils/DeleteModal";
import classNames from "classnames";
import AddPolicies from "./AddPolicies";
import { usePolicies } from "../../../apis/queries/policies.queries"
import api from "../../../services/Axios";

export default function Category() {
  const [activeAccordionIds, setActiveAccordionIds] = useState<any>([]);
  const [show, setShow] = useState({ item: null, show: false, edit: false });
  const [deleteCategories, setDeleteCategories] = useState({ id: null, show: false, });
  const [text] = useState("");

  const page: number = 1, limit: number = 50
  const { isLoading, refetch, data } = usePolicies({ page, limit, searchTerm: "", });


  const deleteCategoryHandler = () => {
    api.delete(`policy/deletePolicy/${deleteCategories.id}`).then((response) => {
      if (response.data.status) {
        setDeleteCategories({ id: null, show: false });
        refetch();
      } else {
        console.log(response)
      }
    }).catch((error) => {
      console.log(error)
    })
  };

  const recursiveRenderList = (list: any, prevIndex: number) => {
    return list.map((item: any) => (
      <div key={item.id} className="category-nested-accordion-item cursor-pointer">
        <div className={classNames("category-accordion-header", activeAccordionIds.includes(item.id) ? " active" : "")} onClick={() => {
          if (!item.children?.length) return;
          if (activeAccordionIds.includes(item.id)) {
            setActiveAccordionIds(activeAccordionIds.filter((id: number) => id !== item.id));
            return;
          }
          setActiveAccordionIds((prevState: any) => [...prevState, item.id,]);
        }}>
          <div className="lediv">
            <div className={classNames("div-li", !item.children?.length ? " no-child" : "")}>
              <div className="lediv">
                {!item.children?.length ? null : (<button className="func-btn"></button>)}
                <h5>{item?.categoryName}</h5>
              </div>
            </div>
          </div>
          <div className="rgdiv gap-2 flex justify-center items-center">
            {
              prevIndex === 0 ? (
                <button type="button" className="actionbtn" onClick={(e) => setShow({ item: item, show: true, edit: false })}>
                  <i className="fa fa-plus" aria-hidden="true"></i>
                </button>
              ) : (
                <button type="button" className="actionbtn" onClick={(e) => setShow({ item: item, show: true, edit: true })}>
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
              )
            }
            <button type="button" className="actionbtn" onClick={(e) => setDeleteCategories({ id: item.id, show: true })}>
              <i className="fa fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="category-accordion-content">
          <div className="div-ul">
            {item?.children?.length ? recursiveRenderList(item?.children, prevIndex + 1) : null}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      {isLoading && <Loader loaderWidth={"30px"} loaderHeight={"30px"} position={"absolute"} />}
      {show.show && <AddPolicies handleClose={() => { setShow({ item: null, show: false, edit: false }); refetch(); }} show={show} />}
      <DeleteModal variant={"danger"} show={deleteCategories.show} handleClose={() => setDeleteCategories({ id: null, show: false })} text={text} buttonHandler={deleteCategoryHandler} buttonText={"Delete Policy"} />
      <HelmetProvider>
        <Helmet>
          <title>Policies</title>
        </Helmet>
      </HelmetProvider>
      <div className="listingPages allAccountsPage">
        <div className="listingPagesHead">
          <div className="left">
            <h3>Policies</h3>
          </div>
          <div className="right">
            <div className="rightInner">
              <button className="themeBtn" onClick={() => setShow({ item: null, show: true, edit: false })}>
                Add New Policies
              </button>
            </div>
          </div>
        </div>

        <div className="listingMain">
          <div className="category-nested-accordions">
            {data?.data && data?.data?.length ? recursiveRenderList(data?.data, 0) : null}
          </div>
        </div>
      </div>

      {/* start: nested-category-right-panel */}
      {/* <PoliciesEditForm isVisible={sideBarShow} onClose={() => { setSideBarShow(false); setActivePolicyId(undefined); }} policyId={activePolicyId} fullCategoryList={categoriesQuery.data?.data} /> */}
      {/* <div className="nested-category-right-panel-overlay"></div> */}
      {/* end: nested-category-right-panel */}
    </>
  );
}
