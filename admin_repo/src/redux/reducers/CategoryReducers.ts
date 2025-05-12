import {
  DELETE_CATEGORY_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  GET_ALL_CATEGORY_DATA_FAILURE,
  GET_ALL_CATEGORY_DATA_REQUEST,
  GET_ALL_CATEGORY_DATA_SUCCESS,
  GET_ALL_CHILDREN_FAILURE,
  GET_ALL_CHILDREN_REQUEST,
  GET_ALL_CHILDREN_SUCCESS,
  GET_ALL_MENU_FAILURE,
  GET_ALL_MENU_REQUEST,
  GET_ALL_MENU_SUCCESS,
} from "../constants/CategoryConstants";

export const getAllMenuReducer = (state = { menus: [] }, action: any) => {
  switch (action.type) {
    case GET_ALL_MENU_REQUEST:
      return { ...state, loading: true };
    case GET_ALL_MENU_SUCCESS:
      return { menus: action.payload, loading: false };
    case GET_ALL_MENU_FAILURE:
      return { loading: false, menusError: action.payload };
    default:
      return state;
  }
};

export const getAllChildrenReducer = (
  state = { subCategory: [] },
  action: any
) => {
  switch (action.type) {
    case GET_ALL_CHILDREN_REQUEST:
      return { ...state, loading: true };
    case GET_ALL_CHILDREN_SUCCESS:
      return { subCategory: action.payload, loading: false };
    case GET_ALL_CHILDREN_FAILURE:
      return { loading: false, subCategoryError: action.payload };
    default:
      return state;
  }
};

export const getAllCategoryReducer = (
  state = { category: [], limit: 10, page: 1, totalCount: 1 },
  action: any
) => {
  switch (action.type) {
    case GET_ALL_CATEGORY_DATA_REQUEST:
      return { ...state, loading: true };
    case GET_ALL_CATEGORY_DATA_SUCCESS:
      return {
        category: action.payload,
        limit: action.limit,
        page: action.page,
        totalCount: action.totalCount,
        loading: false,
      };
    case GET_ALL_CATEGORY_DATA_FAILURE:
      return { loading: false, categoryError: action.payload };
    default:
      return state;
  }
};

export const deleteCategoryReducer = (state = {}, action: any) => {
  switch (action.type) {
    case DELETE_CATEGORY_REQUEST:
      return { deleteCategoryLoading: true };
    case DELETE_CATEGORY_SUCCESS:
      return { deleteCategory: action.payload, loading: false };
    case DELETE_CATEGORY_FAILURE:
      return { loading: false, deleteCategoryError: action.payload };
    default:
      return state;
  }
};
