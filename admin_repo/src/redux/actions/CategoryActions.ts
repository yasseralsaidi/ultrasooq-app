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
import api from "../../services/Axios";

export const getAllMenuAction = () => async (dispatch: any) => {
  dispatch({ type: GET_ALL_MENU_REQUEST });
  api
    .get("/category/getMenu", { params: { categoryId: 1 } })
    .then((response) => {
      if (response.data.status) {
        dispatch({ type: GET_ALL_MENU_SUCCESS, payload: response.data.data });
      } else {
        dispatch({
          type: GET_ALL_MENU_FAILURE,
          payload: response.data.message,
        });
      }
    })
    .catch((error) => {
      dispatch({
        type: GET_ALL_MENU_FAILURE,
        payload: error.response
          ? error.response.data.message
          : error.toString(),
      });
    });
};

export const getCategoryAction =
  (categoryId: number) => async (dispatch: any) => {
    dispatch({ type: GET_ALL_CHILDREN_REQUEST });
    api
      .get("/category/findOne", { params: { categoryId } })
      .then((response) => {
        if (response.data.status) {
          dispatch({
            type: GET_ALL_CHILDREN_SUCCESS,
            payload: response.data.data,
          });
        } else {
          dispatch({
            type: GET_ALL_CHILDREN_FAILURE,
            payload: response.data.message,
          });
        }
      })
      .catch((error) => {
        dispatch({
          type: GET_ALL_CHILDREN_FAILURE,
          payload: error.response
            ? error.response.data.message
            : error.toString(),
        });
      });
  };

export const getAllCategoryAction = (data: any) => async (dispatch: any) => {
  dispatch({ type: GET_ALL_CATEGORY_DATA_REQUEST });
  api
    .get("/category/findAll", { params: data })
    .then((response) => {
      if (response.data.status) {
        dispatch({
          type: GET_ALL_CATEGORY_DATA_SUCCESS,
          payload: response.data.data,
          ...response.data,
        });
      } else {
        dispatch({
          type: GET_ALL_CATEGORY_DATA_FAILURE,
          payload: response.data.message,
        });
      }
    })
    .catch((error) => {
      dispatch({
        type: GET_ALL_CATEGORY_DATA_FAILURE,
        payload: error.response
          ? error.response.data.message
          : error.toString(),
      });
    });
};

export const deleteCategoryAction = (data: any) => async (dispatch: any) => {
  dispatch({ type: DELETE_CATEGORY_REQUEST });
  api
    .delete(`/category/delete/${data}`)
    .then((response) => {
      if (response.data.status) {
        dispatch({ type: DELETE_CATEGORY_SUCCESS, payload: response.data });
      } else {
        dispatch({
          type: DELETE_CATEGORY_FAILURE,
          payload: response.data.message,
        });
      }
    })
    .catch((error) => {
      dispatch({
        type: DELETE_CATEGORY_FAILURE,
        payload: error.response
          ? error.response.data.message
          : error.toString(),
      });
    });
};
