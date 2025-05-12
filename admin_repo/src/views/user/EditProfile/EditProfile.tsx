import { useEffect, useReducer } from "react";
import useAuth from "../../../hooks/useAuth";
import "react-datepicker/dist/react-datepicker.css";
import Reducer from "../../../services/Reducer";

const initStateEditProfileErr = {
  email: "",
  phoneNo: "",
  firstName: "",
  lastName: "",
  loading: false,
  validate: false,
};

export default function EditProfile() {
  const [, dispatch] = useReducer(Reducer, initStateEditProfileErr);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getAllUserInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getAllUserInfo = () => {
    dispatch({
      type: "SETDATA",
      payload: { name: "firstName", value: user?.firstname },
    });
    dispatch({
      type: "SETDATA",
      payload: { name: "lastName", value: user?.lastname },
    });
    dispatch({
      type: "SETDATA",
      payload: { name: "email", value: user?.email },
    });
    dispatch({
      type: "SETDATA",
      payload: { name: "phoneNo", value: user?.phoneNumber },
    });
  };

  return (
    <div className="createNewAccountPage">
      <div className="createNewAccountInner">
        <h1> Edit Profile</h1>
      </div>
    </div>
  );
}
