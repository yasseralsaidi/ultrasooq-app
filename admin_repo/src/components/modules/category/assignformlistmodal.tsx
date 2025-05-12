import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import {
  Userassigncategoryformlist,
  useAssignMultipleCategory,
  useMultipleCategoryById,
} from "../../../apis/queries/category.queries";
import { toast } from "react-toastify";

type AssignformlistmodalProps = {
  modalopen: boolean;
  setmodalopen: any;
  formId: any;
  assignformdata: any;
};

const Assignformlistmodal: React.FC<AssignformlistmodalProps> = ({
  modalopen,
  setmodalopen,
  formId,
  assignformdata,
}) => {
  const [showError, setShowError] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState({
    menuId: null,
    categoryId: null,
    subCategoryIds: [],
  });

  const [menuData, setMenuData] = useState<{ children: [] }[] | any>();
  const [subCategoryData, setSubCategoryData] = useState<any[]>([]);
  const assignedData = useMultipleCategoryById();
  const createAssignedData = useAssignMultipleCategory();
  const categoryById = Userassigncategoryformlist({ categoryId: 1 }); // assuming 1 as initial page

  useEffect(() => {
    if (!modalopen) {
      setSelectedCategoryIds({
        menuId: null,
        categoryId: null,
        subCategoryIds: [],
      });
      setMenuData([]);
      setSubCategoryData([]);
      setShowError(false);
    }
  }, [modalopen]);

  const handleMenuChange = async (e: any) => {
    const selectedMenuId = e.target.value;
    setSelectedCategoryIds({
      menuId: selectedMenuId,
      categoryId: null,
      subCategoryIds: [],
    });
    const payload = { categoryId: selectedMenuId };
    const res = payload ? await assignedData.mutateAsync(payload) : null;
    setMenuData(res?.data || []);
    if (selectedMenuId) {
      setSubCategoryData([]);
    }
  };

  const handleCategoryChange = async (e: any) => {
    const selectedCategoryId = e.target.value;
    setSelectedCategoryIds((prev) => ({
      ...prev,
      categoryId: selectedCategoryId,
      subCategoryIds: [],
    }));
    const payload = { categoryId: selectedCategoryId };
    const res = await assignedData.mutateAsync(payload);
    if (res?.data) {
      setSubCategoryData([res.data || []]);
    }
  };

  const handleSubCategoryChange = async (e: any, level: number) => {
    const selectedSubCategoryId = e.target.value;
    const newSubCategoryIds: any[] = [...selectedCategoryIds.subCategoryIds];
    newSubCategoryIds[level] = selectedSubCategoryId;

    const payload = { categoryId: selectedSubCategoryId };
    const res = await assignedData.mutateAsync(payload);

    const updatedSubCategoryData: any[] = [...subCategoryData];
    updatedSubCategoryData[level + 1] = res.data || [];

    setSelectedCategoryIds((prev: any) => ({
      ...prev,
      subCategoryIds: newSubCategoryIds.slice(0, level + 1),
    }));
    setSubCategoryData(updatedSubCategoryData.slice(0, level + 2));
  };

  const createAssignedForm = async () => {
    const { menuId, categoryId, subCategoryIds } = selectedCategoryIds;
    const lastSelectedCategoryId = [menuId, categoryId, ...subCategoryIds]
      .filter(Boolean)
      .pop();

    if (!lastSelectedCategoryId) {
      setShowError(true);
      return;
    }
    setShowError(false);

    const categoryLocation = [menuId, categoryId, ...subCategoryIds]
      .filter((id) => id !== null && id !== undefined && id !== "")
      .join(",");

    const assignedPayload = {
      formId: formId,
      categoryId: Number(lastSelectedCategoryId),
      categoryLocation: categoryLocation,
    };

    const response = await createAssignedData.mutateAsync({
      categoryIdList: [assignedPayload],
    });

    if (response?.status === true) {
      toast.success(response.message);
      setmodalopen(false);
    } else {
      toast.error("At least one categoryId is required");
      setmodalopen(true);
    }
  };

  return (
    <Modal
      show={modalopen}
      onHide={() => setmodalopen(false)}
      keyboard={false}
      backdrop="static"
    >
      <Modal.Header>
        <Modal.Title>Assign Category Form</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={12} className="mb-4">
            <Form.Label htmlFor="brandName">Form template Name</Form.Label>
            <Form.Control
              type="text"
              id="brandName"
              value={assignformdata.formName}
              readOnly
            />
            <Form.Group className="mb-0">
              <Form.Label htmlFor="menu">Choose a Menu</Form.Label>
              <select
                name="menu"
                className="form-control"
                onChange={handleMenuChange}
                value={selectedCategoryIds.menuId || ""}
              >
                <option value={""}>Open this select menu</option>
                {categoryById.data?.data?.children?.map(
                  (it: any, ind: number) => (
                    <option value={it?.id} key={ind}>
                      {it?.name}
                    </option>
                  )
                )}
              </select>
              {!menuData?.length && showError && (
                <p className="text-danger">
                  Please select at least one category menu
                </p>
              )}
              {selectedCategoryIds.menuId && (
                <div>
                  <Form.Label htmlFor="category">Choose a Category</Form.Label>
                  <select
                    name="category"
                    className="form-control"
                    onChange={handleCategoryChange}
                    value={selectedCategoryIds.categoryId || ""}
                  >
                    <option value={""}>Choose a category</option>
                    {menuData?.children?.map((it: any, ind: number) => (
                      <option value={it?.id} key={ind}>
                        {it?.name}
                      </option>
                    ))}
                  </select>
                  {subCategoryData.map(
                    (
                      subData: {
                        id: number;
                        name: string;
                        children: { id: number; name: string }[];
                      },
                      level
                    ) =>
                      subData?.children?.length > 0 && (
                        <div key={level}>
                          <Form.Label htmlFor={`subcategory-${level}`}>
                            Choose a {`sub_${"sub_".repeat(level)}`}category
                          </Form.Label>
                          <select
                            name={`subcategory-${level}`}
                            className="form-control"
                            onChange={(e) => handleSubCategoryChange(e, level)}
                            value={
                              selectedCategoryIds.subCategoryIds[level] || ""
                            }
                          >
                            <option value={""}>
                              Choose a {`sub_${"sub_".repeat(level)}`}category
                            </option>

                            {subData?.children?.map((it: any, ind: number) => (
                              <option value={it?.id} key={ind}>
                                {it?.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                  )}
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" size="sm" onClick={() => setmodalopen(false)}>
          Close
        </Button>
        <Button variant="success" size="sm" onClick={createAssignedForm}>
          Assign
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default Assignformlistmodal;
