import { createStore, combineReducers, applyMiddleware } from "redux";
import { composeWithDevTools } from "@redux-devtools/extension";
import { thunk } from "redux-thunk";
import {
  deleteCategoryReducer,
  getAllCategoryReducer,
  getAllChildrenReducer,
  getAllMenuReducer,
} from "./redux/reducers/CategoryReducers";

const reducers = combineReducers({
  getMenus: getAllMenuReducer,
  getCategory: getAllChildrenReducer,
  getAllCategory: getAllCategoryReducer,
  deleteCategory: deleteCategoryReducer,
});

const initialState = {};

const middleware = [thunk];

const store = createStore(
  reducers,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
