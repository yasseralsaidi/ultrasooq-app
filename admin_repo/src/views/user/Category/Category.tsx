/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import AddCategory from "./AddCategory";
import {
  deleteCategoryAction,
  getAllCategoryAction,
} from "../../../redux/actions/CategoryActions";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../../utils/Loader";
import { toast } from "react-toastify";
import DeleteModal from "../../../utils/DeleteModal";
import classNames from "classnames";
import CategoryForm from "../../../components/modules/category/CategoryForm";
import { useCategories, useChildrenCategories } from "../../../apis/queries/category.queries";
import { useQueryClient } from "@tanstack/react-query";
import { 
  BUSINESS_TYPE_CATEGORY_ID, 
  PRODUCT_CATEGORY_ID, 
  SERVICE_CATEGORY_ID 
} from "../../../utils/constants";


export default function Category() {
  const [categoryData, setCategoryData] = useState<any>();
  const [activeAccordionIds, setActiveAccordionIds] = useState<any>([]);
  const [activeCategoryId, setActiveCategoryId] = useState();
  const [activeCategoryType, setActiveCategoryType] = useState<string>('');
  const [show, setShow] = useState(false);
  const [sideBarShow, setSideBarShow] = useState(false);
  const [deleteCategories, setDeleteCategories] = useState({
    id: null,
    show: false,
  });

  const [text] = useState("");
  const [pageLimit] = useState(10);
  const [currentPage] = useState(1);
  const categoriesQuery = useCategories();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>();
  const childrenCategoriesQuery = useChildrenCategories(selectedCategoryId || 0, !!selectedCategoryId);

  const dispatch = useDispatch();

  const { loading } = useSelector((state: any) => state.getAllCategory);
  const { deleteCategoryLoading, deleteCategory, deleteCategoryError } =
    useSelector((state: any) => state.deleteCategory);

  useMemo(
    () =>
      dispatch(
        getAllCategoryAction({ limit: pageLimit, page: currentPage }) as any
      ),
    [dispatch, pageLimit, currentPage, deleteCategory]
  );

  useEffect(() => {
    if (deleteCategoryError) {
      toast.error(deleteCategoryError);
    }
  }, [deleteCategory, deleteCategoryError]);

  useEffect(() => {
    setCategoryData(categoriesQuery?.data?.data)
  }, [categoriesQuery?.data?.data]);

  const setChildrenCategories = (categories: any[], categoryId: number, children: any[]) => {
    let i = 0;
    for (let category of categories) {
      if (category.id == categoryId) {
        categories[i].children = children;
        break;
      }
      else if (category.hasOwnProperty('children')) {
        categories[i].children = setChildrenCategories(category.children, categoryId, children);
      }
      i++
    }
    return categories
  }

  useEffect(() => {
    if (childrenCategoriesQuery?.data?.data) {
      let selectedCategory = childrenCategoriesQuery?.data?.data;
      let data = categoryData;
      data.children = setChildrenCategories(data.children, selectedCategory.id, selectedCategory.children);
      setCategoryData({...data});
      if (selectedCategory.children.length > 0) {
        setActiveAccordionIds((prevActiveAccordionIds: number[]) => {
          return [...prevActiveAccordionIds, ...[selectedCategory.id]];
        });
      }
    }
  }, [childrenCategoriesQuery?.data?.data]);

  const queryClient = useQueryClient(); // Initialize queryClient

  const deleteCategoryHandler = async () => {
    setDeleteCategories({ id: null, show: false });
    // dispatch(deleteCategoryAction(deleteCategories.id) as any);
    try {
      await dispatch(deleteCategoryAction(deleteCategories.id) as any);
      toast.success("Sub category deleted successfully");
      
      // After successful deletion, refetch categories to update UI
      queryClient.invalidateQueries({ queryKey: ["categories"] }); 
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category");
    }
  };

  const recursiveRenderList = (list: any, type: string = '') => {
    return list.map((item: any) => {
      let categoryType = '';
      if (item.id == PRODUCT_CATEGORY_ID) {
        categoryType = 'product';
      } else if (item.id == SERVICE_CATEGORY_ID) {
        categoryType = 'service';
      } else if (item.id == BUSINESS_TYPE_CATEGORY_ID) {
        categoryType = 'business_type';
      }
      return (
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
                  {!item.hasOwnProperty('children') ? (
                    <button className="func-btn" onClick={() => setSelectedCategoryId(item.id)}></button>
                  ) : null}
                  <h5>{item.name}</h5>
                  {/* Delete Button (only when no children exist) */}
                  {(!item.children?.length) && (
                    <button 
                      className="delete-btn" 
                      onClick={() => setDeleteCategories({ id: item.id, show: true })}
                    >
                      <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="rgdiv">
              <button type="button" className="actionbtn" onClick={(e) => {
                e.stopPropagation();
                setSideBarShow(true);
                setActiveCategoryId(item?.id);
                setActiveCategoryType(categoryType || type);
              }}>
                <i className="fa fa-plus" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div className="category-accordion-content">
            <div className="div-ul">
              {item.children?.length ? recursiveRenderList(item.children, categoryType || type) : null}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      {(loading || deleteCategoryLoading) && <Loader loaderWidth={"30px"} loaderHeight={"30px"} position={"absolute"} />}
      <AddCategory handleClose={() => setShow(false)} show={show} limit={pageLimit} page={currentPage} />
      <DeleteModal variant={"danger"} show={deleteCategories.show} handleClose={() => setDeleteCategories({ id: null, show: false })} text={text} buttonHandler={deleteCategoryHandler} buttonText={"Delete Category"} />
      <HelmetProvider>
        <Helmet>
          <title>Category</title>
        </Helmet>
      </HelmetProvider>
      <div className="listingPages allAccountsPage">
        <div className="listingPagesHead">
          <div className="left">
            <h3>Category</h3>
          </div>
          <div className="right">
            <div className="rightInner">
              <button className="themeBtn" onClick={() => setShow(true)}>
                Add New Category
              </button>
            </div>
          </div>
        </div>

        <div className="listingMain">
          <div className="category-nested-accordions">
            {categoryData?.children && categoryData?.children?.length ? recursiveRenderList(categoryData?.children) : null}
          </div>
        </div>
      </div>

      {/* start: nested-category-right-panel */}
      <CategoryForm 
        isVisible={sideBarShow} 
        onClose={() => { setSideBarShow(false); setActiveCategoryId(undefined); }} 
        categoryId={activeCategoryId} 
        categoryType={activeCategoryType} 
        fullCategoryList={categoriesQuery.data?.data} 
      />
      <div className="nested-category-right-panel-overlay"></div>
      {/* end: nested-category-right-panel */}
    </>
  );
}
