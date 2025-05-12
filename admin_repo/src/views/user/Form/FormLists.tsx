import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  useAllDynamicForms,
  useRemoveDynamicForm,
} from "../../../apis/queries/dynamicForm.queries";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Assignformlistmodal from "../../../components/modules/category/assignformlistmodal";
import classNames from "classnames";

const FormLists = () => {
  const history = useHistory();
  const getAllForms = useAllDynamicForms();
  const removeDynamicForm = useRemoveDynamicForm();
  const [getRows, setRows] = useState([]);

  const getForm = useCallback(async () => {
    const payload = {
      page: 1,
      limit: 10,
    };
    const response = await getAllForms.mutateAsync(payload);
    if (response?.status) {
      // toast.success(response.message);
      setRows(response.data);
    }
  }, [getAllForms]);

  const [modalopen, setmodalopen] = useState(false);
  const [formid, setformid] = useState("");
  const [getassignformdata, setgetassignformdata] = useState([]);
  const handleButtonClick = (e: any, id: any, item: any) => {
    setmodalopen(true);
    setformid(id);
    setgetassignformdata(item);
  };
  const getTableData = useMemo(() => {
    const rows: any = [];
    getRows.forEach(
      (
        item: {
          id: string;
          formName: string;
          createdAt: string;
          status: string;
          formFields: string;
        },
        key
      ) => {
        rows.push(
          <tr key={key}>
            <th scope="row">{key + 1}</th>
            <td>
              <Link to={`/user/edit-form/${item.id}`}>{item.formName}</Link>
            </td>
            <td>{item.createdAt}</td>
            <td>Test</td>
            <td>04/18/2024</td>
            <td>
              <p
                className={classNames(
                  item?.status === "ACTIVE"
                    ? "bg-green-100 text-green-600"
                    : item?.status === "INACTIVE"
                    ? "bg-red-100 text-red-600"
                    : "",
                  "text-xs font-semibold text-center w-fit px-2 py-1 rounded-sm"
                )}
              >
                {item?.status}
              </p>
            </td>
            <td>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => history.push(`/user/edit-form/${item.id}`)}
              >
                Edit
              </button>
              &nbsp;&nbsp;
              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  Swal.fire({
                    title: "Warning! You're about to delete this template!",
                    showDenyButton: true,
                    confirmButtonText: "Yes, Delete",
                    denyButtonText: "Keep",
                  }).then(async (result) => {
                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                      const response = await removeDynamicForm.mutateAsync({
                        id: item.id,
                      });
                      if (response?.status) {
                        toast.success(response.message);
                        getForm();
                      }
                    }
                  });
                }}
              >
                Delete
              </button>
              &nbsp;&nbsp;
              <button
                type="button"
                className="btn btn-success"
                onClick={(e) => handleButtonClick(e, item.id, item)}
                // onClick={() => history.push(`/user/edit-form/${item.id}`)}
              >
                Assign
              </button>
              {modalopen ? (
                <Assignformlistmodal
                  modalopen={modalopen}
                  setmodalopen={setmodalopen}
                  formId={formid}
                  assignformdata={getassignformdata}
                />
              ) : null}
            </td>
          </tr>
        );
      }
    );
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getForm, getRows, history, removeDynamicForm]);

  useEffect(() => {
    getForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="listingPages allAccountsPage">
      <div className="listingPagesHead space-x-5">
        <div className="left">
          <h3>Forms</h3>
        </div>
        <div className="right">
          <div className="rightInner">
            <button
              className="themeBtn"
              onClick={() => history.push("/user/create-form")}
            >
              Add New Form
            </button>
          </div>
        </div>
        <input
          placeholder="Search..."
          className="px-2 py-1"
          // onChange={handleSearchInput}
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Templates</th>
            <th scope="col">Created on</th>
            <th scope="col">Assigned To</th>
            <th scope="col">Expiration Date</th>
            <th scope="col">Status</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>{getTableData}</tbody>
      </table>
    </div>
  );
};

export default FormLists;
