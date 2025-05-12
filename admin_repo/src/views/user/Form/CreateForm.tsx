import { Fragment, useCallback, useRef, useState } from "react";
import { useCreateDynamicForm } from "../../../apis/queries/dynamicForm.queries";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

const CreateForm = () => {
  const activeSectionID = useRef<number | null>(null);
  const [isSectionSelected, setSectionSelected] = useState(false);
  const [sectionListValues, setSectionListValues] = useState<any>({});
  const [getNodeDetailsForEdit, setNodeDetailsForEdit] = useState<any>(null);
  const optionsIDRef = useRef(null);
  const [currentOptionValue, setCurrentOptionValue] = useState("");
  const createDynamicForm = useCreateDynamicForm();
  const [templateTitle, setTemplateTitle] = useState("New Custom Fields");
  const templateTitleRef = useRef<any>();
  const history = useHistory();

  /**********************************************************************************************************************************
   ******************************************** LEFT side navbar panel events START *************************************************
   **********************************************************************************************************************************/
  /** INITIALIZE Sections with default values */
  const initializeDefaultSections = useCallback(() => {
    const newSectionCount = Object.keys(sectionListValues).length;
    //setSectionCount(newSectionCount);
    setSectionSelected(true);
    setSectionListValues((_prevState: any) => ({
      ..._prevState,
      [newSectionCount]: {
        sectionTitle: "Section Name",
        isCollapsed: false,
        fields: [],
      },
    }));
    activeSectionID.current = newSectionCount;
  }, [sectionListValues]);

  /** INITIALIZE Textboxes with default values */
  const initializeDefaultFields = useCallback(
    (fieldLabel: string, fieldType: string) => {
      setNodeDetailsForEdit(null);
      if (activeSectionID.current === null) return;
      let fieldOptions = null;
      if (
        fieldType === "checkbox" ||
        fieldType === "select" ||
        fieldType === "radio"
      ) {
        fieldOptions = [];
      }
      setSectionListValues((_prevState: any) => ({
        ..._prevState,
        [activeSectionID.current as number]: {
          ..._prevState[activeSectionID.current as number],
          fields: [
            ..._prevState[activeSectionID.current as number]["fields"],
            {
              label: fieldLabel,
              textType: fieldType === "text" ? "text" : null,
              placeholder: "Placeholder",
              size: "full",
              type: fieldType,
              required: false,
              value: "",
              options: fieldOptions,
            },
          ],
        },
      }));
    },
    []
  );

  /**********************************************************************************************************************************
   *********************************************** LEFT side navbar panel events END ************************************************
   **********************************************************************************************************************************/

  /**********************************************************************************************************************************
   ******************************************** CENTER side template events START ***************************************************
   **********************************************************************************************************************************/
  /** Handling Sections REMOVE events */
  const handleRemoveSection = useCallback(
    (currentSectionID: number) => {
      Swal.fire({
        title: "Warning! You're about to delete this field!",
        showDenyButton: true,
        confirmButtonText: "Yes, Delete",
        denyButtonText: "Keep",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          const filteredSectionsList = Object.keys(sectionListValues)
            .map((key) =>
              +key !== currentSectionID ? sectionListValues[key] : null
            )
            .filter((item) => item);
          setSectionListValues({ ...filteredSectionsList });
          //Update the last section as current active sectionID
          const sectionCount = Object.keys(filteredSectionsList).length;
          if (sectionCount === 0) {
            activeSectionID.current = null;
          } else {
            activeSectionID.current = sectionCount - 1;
          }
          setNodeDetailsForEdit(null);
        }
      });
    },
    [sectionListValues]
  );

  /** Handling Textboxes REMOVE events */
  const handleRemoveFields = useCallback(
    (currentSectionID: number, currentNodeID: number) => {
      Swal.fire({
        title: "Warning! You're about to delete this field!",
        showDenyButton: true,
        confirmButtonText: "Yes, Delete",
        denyButtonText: "Keep",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          const newSectionListValues = Object.assign({}, sectionListValues);
          const fieldsCount =
            newSectionListValues[currentSectionID]["fields"].length;

          if (fieldsCount === 1) {
            newSectionListValues[currentSectionID]["fields"] = [];
          } else {
            delete newSectionListValues[currentSectionID]["fields"][
              currentNodeID
            ];
            const filteredFields = newSectionListValues[currentSectionID][
              "fields"
            ].filter((item: any) => item);
            newSectionListValues[currentSectionID]["fields"] = filteredFields;
          }
          setSectionListValues((_prevState: any) => {
            return {
              ..._prevState,
              ...newSectionListValues,
            };
          });
          setTimeout(() => {
            setNodeDetailsForEdit(null);
          }, 0);
        }
      });
    },
    [sectionListValues]
  );

  /************* Fields DRAG events START *****************/
  /****************************************************************/
  const handleDragStartFields = (e: any, index: any, sectionID: any) => {
    if (index === null) return;
    e.dataTransfer.setData("index", index);
    e.dataTransfer.setData("sectionID", sectionID);
  };

  const handleDragOverFields = (e: any) => {
    e.preventDefault();
  };

  const rearrangeFieldsElements = useCallback(
    (
      sectionArray: any,
      draggedIndex: any,
      targetIndex: any,
      isNewItemReceived: any
    ) => {
      //CAN"T apply as we cam move items from one SECTION to another SECTION
      /*
      if (
        draggedIndex < 0 ||
        draggedIndex >= sectionArray.length ||
        targetIndex < 0 ||
        targetIndex >= sectionArray.length
      ) {
        throw new Error("Index out of bounds");
      }
      */
      if (!isNewItemReceived) {
        const draggedItem = sectionArray[draggedIndex];
        sectionArray.splice(draggedIndex, 1);
        sectionArray.splice(targetIndex, 0, draggedItem);
      } else {
        sectionArray.splice(targetIndex || 0, 0, isNewItemReceived);
      }
      return sectionArray;
    },
    []
  );

  const handleDropFields = useCallback(
    async (e: any, targetIndex: any, targetSectionID: any) => {
      const draggedIndex = e.dataTransfer.getData("index");
      if (!draggedIndex) return;
      const draggedSectionID = e.dataTransfer.getData("sectionID");

      let newSectionArray = [];
      if (+draggedSectionID === +targetSectionID) {
        newSectionArray = await rearrangeFieldsElements(
          sectionListValues[targetSectionID]["fields"],
          +draggedIndex,
          +targetIndex,
          null
        );
      } else {
        const removedItem = sectionListValues[draggedSectionID][
          "fields"
        ].splice(+draggedIndex, 1);

        newSectionArray = await rearrangeFieldsElements(
          sectionListValues[targetSectionID]["fields"],
          +draggedIndex,
          +targetIndex,
          removedItem[0]
        );
      }

      setSectionListValues((_prevState: any) => ({
        ..._prevState,
        [targetSectionID]: {
          ..._prevState[targetSectionID],
          fields: newSectionArray,
        },
      }));
    },
    [rearrangeFieldsElements, sectionListValues]
  );
  /************* Fields DRAG events END *******************/
  /****************************************************************/

  /** TEXTBOX Content */
  const getTextboxContent = useCallback(
    (fieldIndex: number, currentSectionID: number) => {
      return (
        <div
          className="drag-drop-content-list-item"
          onClick={() =>
            setNodeDetailsForEdit({
              currentSectionID,
              currentNodeID: fieldIndex,
              type: "text",
            })
          }
          key={fieldIndex}
          draggable
          onDragStart={(e) =>
            handleDragStartFields(e, fieldIndex, currentSectionID)
          }
          onDragOver={handleDragOverFields}
          onDrop={(e) => handleDropFields(e, fieldIndex, currentSectionID)}
        >
          <div
            data-react-beautiful-dnd-draggable={2}
            className="drag-drop-content-list-box"
          >
            <div className="bg-color-inputGroup">
              <div className="label-w-rg-del-btn">
                <label>
                  {" "}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.label || "Text"}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.required
                    ? "*"
                    : ""}
                </label>
                <div className="rg-actions">
                  <button
                    title="close"
                    className="del_btn"
                    onClick={() => {
                      handleRemoveFields(currentSectionID, fieldIndex);
                    }}
                  >
                    <img src="/images/delbtn.svg" alt="" />
                    Delete{" "}
                  </button>
                </div>
              </div>
              <div className="row fix-row">
                <div
                  className={
                    sectionListValues[currentSectionID]["fields"][fieldIndex]
                      ?.size === "full"
                      ? "col-12 fix-col"
                      : "col-sm-5 col-12 fix-col"
                  }
                >
                  <input
                    disabled
                    type="text"
                    className="custom-form-s1"
                    placeholder={
                      sectionListValues[currentSectionID]["fields"][fieldIndex]
                        ?.placeholder || "Placeholder"
                    }
                    minLength={
                      sectionListValues[currentSectionID]["fields"][fieldIndex]
                        ?.minLength
                    }
                    maxLength={
                      sectionListValues[currentSectionID]["fields"][fieldIndex]
                        ?.maxLength
                    }
                  />
                </div>
              </div>
            </div>
            <div
              className="drag-drop-overlay"
              tabIndex={0}
              aria-grabbed="false"
              data-react-beautiful-dnd-drag-handle={2}
              draggable
            >
              Drag
            </div>
          </div>
        </div>
      );
    },
    [handleDropFields, handleRemoveFields, sectionListValues]
  );

  /** TEXTAREA Content */
  const getTextareaContent = useCallback(
    (fieldIndex: number, currentSectionID: number) => {
      return (
        <div className="drag-drop-content-list-item">
          <div
            data-react-beautiful-dnd-draggable={2}
            className="drag-drop-content-list-box"
            onClick={() =>
              setNodeDetailsForEdit({
                currentSectionID,
                currentNodeID: fieldIndex,
                type: "textarea",
              })
            }
            key={fieldIndex}
            draggable
            onDragStart={(e) =>
              handleDragStartFields(e, fieldIndex, currentSectionID)
            }
            onDragOver={handleDragOverFields}
            onDrop={(e) => handleDropFields(e, fieldIndex, currentSectionID)}
          >
            <div className="bg-color-inputGroup">
              <div className="label-w-rg-del-btn">
                <label>
                  {" "}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.label || "Textarea"}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.required
                    ? "*"
                    : ""}
                </label>
                <div className="rg-actions">
                  <button
                    title="close"
                    className="del_btn"
                    onClick={() => {
                      handleRemoveFields(currentSectionID, fieldIndex);
                    }}
                  >
                    <img src="/images/delbtn.svg" alt="" />
                    Delete{" "}
                  </button>
                </div>
              </div>
              <div className="row fix-row">
                <div
                  className={
                    sectionListValues[currentSectionID]["fields"][fieldIndex]
                      ?.size === "full"
                      ? "col-12 fix-col"
                      : "col-sm-5 col-12 fix-col"
                  }
                >
                  <div className="ckeditior-ss w485px-pc res_1199px">
                    {sectionListValues[currentSectionID]["fields"][fieldIndex]
                      ?.size === "full" ? (
                      <img
                        src="/images/ckeditior-ss-w485px.png"
                        className="ss-pc"
                        alt=""
                      />
                    ) : (
                      <img
                        src="/images/ckeditior-ss-w485px.png"
                        className="ss-pc"
                        alt=""
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              className="drag-drop-overlay"
              tabIndex={0}
              aria-grabbed="false"
              data-react-beautiful-dnd-drag-handle={2}
              draggable
            >
              Drag
            </div>
          </div>
        </div>
      );
    },
    [handleDropFields, handleRemoveFields, sectionListValues]
  );

  /** DROPDOWN Content */
  const getDropdownContent = useCallback(
    (fieldIndex: number, currentSectionID: number) => {
      return (
        <div className="drag-drop-content-list-item">
          <div
            data-react-beautiful-dnd-draggable={2}
            className="drag-drop-content-list-box"
            onClick={() => {
              optionsIDRef.current = null;
              setCurrentOptionValue("");

              setNodeDetailsForEdit({
                currentSectionID,
                currentNodeID: fieldIndex,
                type: "select",
              });
            }}
            key={fieldIndex}
            draggable
            onDragStart={(e) =>
              handleDragStartFields(e, fieldIndex, currentSectionID)
            }
            onDragOver={handleDragOverFields}
            onDrop={(e) => handleDropFields(e, fieldIndex, currentSectionID)}
          >
            <div className="bg-color-inputGroup">
              <div className="label-w-rg-del-btn">
                <label>
                  {" "}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.label || "Dropdown"}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.required
                    ? "*"
                    : ""}
                </label>
                <div className="rg-actions">
                  <button
                    title="close"
                    className="del_btn"
                    onClick={() => {
                      handleRemoveFields(currentSectionID, fieldIndex);
                    }}
                  >
                    <img src="/images/delbtn.svg" alt="" />
                    Delete{" "}
                  </button>
                </div>
              </div>
              <div className="row fix-row">
                <div
                  className={
                    sectionListValues[currentSectionID]["fields"][fieldIndex]
                      ?.size === "full"
                      ? "col-12 fix-col"
                      : "col-sm-5 col-12 fix-col"
                  }
                >
                  <select className="custom-form-s1 select4" disabled>
                    <option value="">Select...</option>
                    <option value="Dropdown 1">Dropdown 1</option>
                    <option value="Dropdown 2">Dropdown 2</option>
                  </select>
                </div>
              </div>
            </div>
            <div
              className="drag-drop-overlay"
              tabIndex={0}
              aria-grabbed="false"
              data-react-beautiful-dnd-drag-handle={2}
              draggable
            >
              Drag
            </div>
          </div>
        </div>
      );
    },
    [handleDropFields, handleRemoveFields, sectionListValues]
  );

  /** CHECKBOX Content */
  const getCheckboxContent = useCallback(
    (fieldIndex: number, currentSectionID: number) => {
      return (
        <div className="drag-drop-content-list-item">
          <div
            data-react-beautiful-dnd-draggable={2}
            className="drag-drop-content-list-box"
            onClick={() => {
              optionsIDRef.current = null;
              setCurrentOptionValue("");

              setNodeDetailsForEdit({
                currentSectionID,
                currentNodeID: fieldIndex,
                type: "checkbox",
              });
            }}
            key={fieldIndex}
            draggable
            onDragStart={(e) =>
              handleDragStartFields(e, fieldIndex, currentSectionID)
            }
            onDragOver={handleDragOverFields}
            onDrop={(e) => handleDropFields(e, fieldIndex, currentSectionID)}
          >
            <div className="bg-color-inputGroup">
              <div className="label-w-rg-del-btn">
                <label>
                  {" "}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.label || "Checkbox"}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.required
                    ? "*"
                    : ""}
                </label>
                <div className="rg-actions">
                  <button
                    title="close"
                    className="del_btn"
                    onClick={() => {
                      handleRemoveFields(currentSectionID, fieldIndex);
                    }}
                  >
                    <img src="/images/delbtn.svg" alt="" />
                    Delete{" "}
                  </button>
                </div>
              </div>
              <div className="row fix-row">
                <div className="col-12 fix-col">
                  <div className="after_add_qest_preview">
                    <ul>
                      {sectionListValues[currentSectionID]["fields"][
                        fieldIndex
                      ]?.options.map((item: any, index: number) => (
                        <li key={index}>
                          <>
                            <div className="liststyle-container">
                              <img src="/images/checkbox-filled.png" alt="" />
                            </div>
                            <div className="text-container">
                              <p>{item} </p>
                            </div>
                          </>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="drag-drop-overlay"
              tabIndex={0}
              aria-grabbed="false"
              data-react-beautiful-dnd-drag-handle={2}
              draggable
            >
              Drag
            </div>
          </div>
        </div>
      );
    },

    [handleDropFields, handleRemoveFields, sectionListValues]
  );

  /** RADIO BUTTON Content */
  const getRadiobuttonContent = useCallback(
    (fieldIndex: number, currentSectionID: number) => {
      return (
        <div className="drag-drop-content-list-item">
          <div
            data-react-beautiful-dnd-draggable={2}
            className="drag-drop-content-list-box"
            onClick={() => {
              optionsIDRef.current = null;
              setCurrentOptionValue("");

              setNodeDetailsForEdit({
                currentSectionID,
                currentNodeID: fieldIndex,
                type: "radio",
              });
            }}
            key={fieldIndex}
            draggable
            onDragStart={(e) =>
              handleDragStartFields(e, fieldIndex, currentSectionID)
            }
            onDragOver={handleDragOverFields}
            onDrop={(e) => handleDropFields(e, fieldIndex, currentSectionID)}
          >
            <div className="bg-color-inputGroup">
              <div className="label-w-rg-del-btn">
                <label>
                  {" "}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.label || "Radio"}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.required
                    ? "*"
                    : ""}
                </label>
                <div className="rg-actions">
                  <button
                    title="close"
                    className="del_btn"
                    onClick={() => {
                      handleRemoveFields(currentSectionID, fieldIndex);
                    }}
                  >
                    <img src="/images/delbtn.svg" alt="" />
                    Delete{" "}
                  </button>
                </div>
              </div>
              <div className="row fix-row">
                <div className="col-12 fix-col">
                  <div className="after_add_qest_preview">
                    <ul>
                      {sectionListValues[currentSectionID]["fields"][
                        fieldIndex
                      ]?.options.map((item: any, index: number) => (
                        <li key={index}>
                          <div className="liststyle-container">
                            <img src="/images/radio-filled.png" alt="" />
                          </div>
                          <div className="text-container">
                            <p>{item} </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="drag-drop-overlay"
              tabIndex={0}
              aria-grabbed="false"
              data-react-beautiful-dnd-drag-handle={2}
              draggable
            >
              Drag
            </div>
          </div>
        </div>
      );
    },
    [handleDropFields, handleRemoveFields, sectionListValues]
  );

  /** DATE Content */
  const getDateContent = useCallback(
    (fieldIndex: number, currentSectionID: number) => {
      return (
        <div className="drag-drop-content-list-item">
          <div
            data-react-beautiful-dnd-draggable={2}
            className="drag-drop-content-list-box"
            onClick={() => {
              optionsIDRef.current = null;
              setCurrentOptionValue("");

              setNodeDetailsForEdit({
                currentSectionID,
                currentNodeID: fieldIndex,
                type: "date",
              });
            }}
            key={fieldIndex}
            draggable
            onDragStart={(e) =>
              handleDragStartFields(e, fieldIndex, currentSectionID)
            }
            onDragOver={handleDragOverFields}
            onDrop={(e) => handleDropFields(e, fieldIndex, currentSectionID)}
          >
            <div className="bg-color-inputGroup">
              <div className="label-w-rg-del-btn">
                <label>
                  {" "}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.label || "Date"}
                  {sectionListValues[currentSectionID]["fields"][fieldIndex]
                    ?.required
                    ? "*"
                    : ""}
                </label>
                <div className="rg-actions">
                  <button
                    title="close"
                    className="del_btn"
                    onClick={() => {
                      handleRemoveFields(currentSectionID, fieldIndex);
                    }}
                  >
                    <img src="/images/delbtn.svg" alt="" />
                    Delete{" "}
                  </button>
                </div>
              </div>
              <div className="row fix-row">
                <div
                  className={
                    sectionListValues[currentSectionID]["fields"][fieldIndex]
                      ?.size === "full"
                      ? "col-12 fix-col"
                      : "col-sm-5 col-12 fix-col"
                  }
                >
                  <input disabled className="custom-form-s1 calendar" />
                </div>
              </div>
            </div>
            <div
              className="drag-drop-overlay"
              tabIndex={0}
              aria-grabbed="false"
              data-react-beautiful-dnd-drag-handle={2}
              draggable
            >
              Drag
            </div>
          </div>
        </div>
      );
    },
    [handleDropFields, handleRemoveFields, sectionListValues]
  );

  const renderFields = useCallback(
    (fieldValues: any, fieldIndex: number, currentSectionID: number) => {
      if (fieldValues.type === "text")
        return getTextboxContent(fieldIndex, currentSectionID);
      if (fieldValues.type === "textarea")
        return getTextareaContent(fieldIndex, currentSectionID);
      if (fieldValues.type === "select")
        return getDropdownContent(fieldIndex, currentSectionID);
      if (fieldValues.type === "checkbox")
        return getCheckboxContent(fieldIndex, currentSectionID);
      if (fieldValues.type === "radio")
        return getRadiobuttonContent(fieldIndex, currentSectionID);
      if (fieldValues.type === "date")
        return getDateContent(fieldIndex, currentSectionID);
    },
    [
      getCheckboxContent,
      getDateContent,
      getDropdownContent,
      getRadiobuttonContent,
      getTextareaContent,
      getTextboxContent,
    ]
  );

  /************* Section DRAG events START ************************/
  /****************************************************************/

  const handleDragStartSection = (e: any, index: number) => {
    e.dataTransfer.setData("index", index);
  };

  const handleDragOverSection = (e: any) => {
    e.preventDefault();
  };

  const rearrangeElements = useCallback(
    (sectionArray: any, draggedIndex: number, targetIndex: number) => {
      if (
        draggedIndex < 0 ||
        draggedIndex >= sectionArray.length ||
        targetIndex < 0 ||
        targetIndex >= sectionArray.length
      ) {
        throw new Error("Index out of bounds");
      }
      const draggedItem = sectionArray[draggedIndex];
      sectionArray.splice(draggedIndex, 1);
      sectionArray.splice(targetIndex, 0, draggedItem);

      return sectionArray;
    },
    []
  );

  const handleDropSection = useCallback(
    (e: any, targetIndex: number) => {
      const draggedIndex = e.dataTransfer.getData("index");
      let newSectionArray = rearrangeElements(
        Object.values(sectionListValues).map((item) => item),
        +draggedIndex,
        +targetIndex
      );
      const newSectionObj = Object.assign({}, newSectionArray);
      setSectionListValues(newSectionObj);
    },
    [rearrangeElements, sectionListValues]
  );
  /************* Section DRAG events END ************************/
  /****************************************************************/

  /** SECTION Content */
  const getSectionContent = useCallback(() => {
    const sectionCount = Object.keys(sectionListValues).length;
    const sectionList = [];
    for (let i = 0; i < sectionCount; i++) {
      sectionList.push(
        <Fragment key={i}>
          <div data-react-beautiful-dnd-draggable={2}>
            <div className="dragDrop-group-header">
              <input
                type="text"
                //contentEditable="true"
                onChange={(_e) => {
                  setSectionListValues((_prevState: any) => ({
                    ..._prevState,
                    [i]: {
                      ..._prevState[i],
                      sectionTitle: _e.target.value,
                    },
                  }));
                }}
                value={
                  sectionListValues[i]?.sectionTitle === "Section Name"
                    ? null
                    : sectionListValues[i]?.sectionTitle
                }
                placeholder={"Section Name"}
              />
              <div className="rg-actions-buttons">
                <button
                  title="Up"
                  className={
                    sectionListValues[i].isCollapsed
                      ? "circle-btn updown-btn down"
                      : "circle-btn updown-btn"
                  }
                  onClick={() => {
                    activeSectionID.current = i;
                    setSectionListValues((_prevState: any) => ({
                      ..._prevState,
                      [activeSectionID.current as number]: {
                        ..._prevState[activeSectionID.current as number],
                        isCollapsed:
                          _prevState[activeSectionID.current as number]
                            .isCollapsed === false
                            ? true
                            : false,
                      },
                    }));
                  }}
                >
                  <img src="/images/down-arrow.svg" alt="" />
                </button>
                <button
                  title="Select Section"
                  className="circle-btn updown-btn"
                  onClick={() => (activeSectionID.current = i)}
                >
                  <img src="/images/selection-select-icon.svg" alt="" />
                </button>
                <div
                  className="circle-btn drag-btn"
                  tabIndex={0}
                  aria-grabbed="false"
                  data-react-beautiful-dnd-drag-handle={2}
                  draggable
                  onDragStart={(e) => handleDragStartSection(e, i)}
                  onDragOver={handleDragOverSection}
                  onDrop={(e) => handleDropSection(e, i)}
                >
                  <img src="/images/dragDrop-icon.svg" alt="" />
                </div>
                <button
                  id="deleteBtn"
                  title="close"
                  className="circle-btn close-btn"
                  onClick={() => handleRemoveSection(i)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-x-lg"
                    viewBox="0 0 16 16"
                  >
                    <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z" />
                  </svg>
                </button>
              </div>
            </div>

            {sectionListValues[i].fields.length === 0 ? (
              <div
                className="drag-drop-content-lists show"
                draggable
                onDragStart={(e) => handleDragStartFields(e, null, i)}
                onDragOver={handleDragOverFields}
                onDrop={(e) => handleDropFields(e, null, i)}
              >
                <div className="drag-drop-content-list-item">
                  <div
                    data-react-beautiful-dnd-draggable={0}
                    className="drag-drop-content-list-box disabled-drag"
                  >
                    <div className="bg-color-inputGroup">
                      <div className="label-w-rg-del-btn">
                        <label> Please Add any item here</label>
                        <div className="rg-actions" />
                      </div>
                      <div className="row fix-row" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {!sectionListValues[i]?.isCollapsed ? (
              <div className="drag-drop-content-lists show">
                {sectionListValues[i]?.fields.map((item: any, index: number) =>
                  renderFields(item, index, i)
                )}
              </div>
            ) : null}
          </div>
        </Fragment>
      );
    }
    return sectionList;
  }, [
    handleDropFields,
    handleDropSection,
    handleRemoveSection,
    renderFields,
    sectionListValues,
  ]);

  /**********************************************************************************************************************************
   ******************************************** CENTER side template events END *****************************************************
   **********************************************************************************************************************************/

  /**********************************************************************************************************************************
   ******************************************** RIGHT side panel fields events START ************************************************
   **********************************************************************************************************************************/
  /** Updating Textboxes fields on change  */
  const handleChangeFields = useCallback(
    (_e: any) => {
      const { currentSectionID, currentNodeID } = getNodeDetailsForEdit;
      const newSectionListValues = Object.assign({}, sectionListValues);
      if (_e.target.name === "options") {
        if (currentOptionValue.trim() === "" && _e.target.value === "") {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Options can't be empty!",
          });
          return;
        }
        //EDIT oiptions
        if (optionsIDRef.current !== null) {
          newSectionListValues[currentSectionID]["fields"][
            currentNodeID
          ].options[optionsIDRef.current] = currentOptionValue;
        } else {
          newSectionListValues[currentSectionID]["fields"][
            currentNodeID
          ].options.push(currentOptionValue);
        }
      } else {
        newSectionListValues[currentSectionID]["fields"][currentNodeID][
          _e.target.name
        ] = _e.target.value;
      }

      if (_e.target.name === "required") {
        newSectionListValues[currentSectionID]["fields"][
          currentNodeID
        ].required = _e.target.value === "false" ? true : false;
      }

      setSectionListValues((_prevState: any) => {
        return { ..._prevState, ...newSectionListValues };
      });
      optionsIDRef.current = null;
      setCurrentOptionValue("");
    },
    [currentOptionValue, getNodeDetailsForEdit, sectionListValues]
  );

  /******************************************************************/
  /************* OPTIONS panel events START ************************/
  /** Removing options from the Dropdown on remove */
  const handleRemoveOptions = useCallback(
    (id: any) => {
      const { currentSectionID, currentNodeID } = getNodeDetailsForEdit;
      const newSectionListValues = Object.assign({}, sectionListValues);
      const options =
        newSectionListValues[currentSectionID]["fields"][currentNodeID]
          ?.options;
      delete options[id];
      const filteredOptions = options.filter((item: any) => item);
      newSectionListValues[currentSectionID]["fields"][currentNodeID].options =
        filteredOptions;
      setSectionListValues((_prevState: any) => {
        return { ..._prevState, ...newSectionListValues };
      });
    },
    [getNodeDetailsForEdit, sectionListValues]
  );

  /** Updating options to the Dropdown on change */
  const handleChangeOptions = useCallback(
    (id: any) => {
      const { currentSectionID, currentNodeID } = getNodeDetailsForEdit;
      setCurrentOptionValue(
        sectionListValues[currentSectionID]["fields"][currentNodeID]?.options[
          id
        ]
      );
      optionsIDRef.current = id;
    },
    [getNodeDetailsForEdit, sectionListValues]
  );

  /************* OPTIONS panel events END ************************/
  /****************************************************************/

  /** GET Textboxes panel fields */
  const getTextboxPanelFields = useCallback(() => {
    const { currentSectionID, currentNodeID } = getNodeDetailsForEdit;
    // if (!sectionListValues[currentSectionID]?.textboxListValues) return;
    return (
      <div className="from-content-box">
        <div className="row fix-row">
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Label</label>
            <input
              type="text"
              placeholder="Title"
              id="label"
              name="label"
              className="custom-form-s1"
              value={
                sectionListValues[currentSectionID]["fields"][currentNodeID]
                  ?.label || "Text"
              }
              onChange={(_e) => {
                _e.preventDefault();
                handleChangeFields(_e);
              }}
            />
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="chklabeldiv">
              <input
                type="checkbox"
                name="required"
                id="toggle3"
                className="customChk-s1"
                onClick={(_e) => {
                  handleChangeFields(_e);
                }}
                value={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
                checked={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
              />
              <label htmlFor="toggle3">Required</label>
            </div>
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="custom-divider" />
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Size</label>
            <select
              className="custom-form-s1 select4"
              id="size"
              name="size"
              onChange={(_e) => {
                handleChangeFields(_e);
              }}
              value={
                sectionListValues[currentSectionID]["fields"][currentNodeID]
                  ?.size
              }
            >
              <option value="small">Small</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="custom-divider" />
          </div>
          <div className="col-12 fix-col col-sm-12 custom-form-group mb-0">
            <div className="row fix-row">
              <div className="col-12 fix-col col-sm-12 custom-form-group">
                <select
                  id="type"
                  name="textType"
                  className="custom-form-s1 select4"
                  onChange={(_e) => {
                    handleChangeFields(_e);
                  }}
                  value={
                    sectionListValues[currentSectionID]["fields"][currentNodeID]
                      ?.textType
                  }
                >
                  <option value="text">Characters</option>
                  <option value="number">Number</option>
                </select>
              </div>
            </div>
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Placeholder</label>
            <input
              type="text"
              id="prefield"
              name="placeholder"
              className="custom-form-s1"
              placeholder="Placeholder"
              value={
                sectionListValues[currentSectionID]["fields"][currentNodeID]
                  ?.placeholder || "Placeholder"
              }
              onChange={(_e) => {
                handleChangeFields(_e);
              }}
            />
          </div>
        </div>
      </div>
    );
  }, [handleChangeFields, getNodeDetailsForEdit, sectionListValues]);

  /** GET Textareas panel fields */
  const getTextareaPanelFields = useCallback(() => {
    const { currentSectionID, currentNodeID } = getNodeDetailsForEdit;
    return (
      <div className="from-content-box">
        <div className="row fix-row">
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Label</label>
            <input
              type="text"
              placeholder="Title"
              id="label"
              name="label"
              className="custom-form-s1"
              value={
                sectionListValues[currentSectionID]["fields"][currentNodeID]
                  ?.label || "Textarea"
              }
              onChange={(_e) => {
                _e.preventDefault();
                handleChangeFields(_e);
              }}
            />
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="chklabeldiv">
              <input
                type="checkbox"
                name="required"
                id="toggle3"
                className="customChk-s1"
                onClick={(_e) => {
                  handleChangeFields(_e);
                }}
                value={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
                checked={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
              />
              <label htmlFor="toggle3">Required</label>
            </div>
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="custom-divider" />
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Size</label>
            <select
              className="custom-form-s1 select4"
              id="size"
              name="size"
              value={
                sectionListValues[currentSectionID]["fields"][currentNodeID]
                  ?.size
              }
              onChange={(_e) => {
                _e.preventDefault();
                handleChangeFields(_e);
              }}
            >
              <option value="small">Small</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="custom-divider" />
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Placeholder</label>
            <input
              type="text"
              id="prefield"
              name="placeholder"
              className="custom-form-s1"
              placeholder="Placeholder"
              value={
                sectionListValues[currentSectionID]["fields"][currentNodeID]
                  ?.placeholder || "Placeholder"
              }
              onChange={(_e) => {
                handleChangeFields(_e);
              }}
            />
          </div>
        </div>
      </div>
    );
  }, [getNodeDetailsForEdit, handleChangeFields, sectionListValues]);

  /** GET Dropdown panel fields */
  const getDropdownPanelFields = useCallback(() => {
    const { currentSectionID, currentNodeID } = getNodeDetailsForEdit;
    return (
      <div className="from-content-box">
        <div className="row fix-row">
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Label</label>
            <input
              type="text"
              placeholder="Title"
              id="label"
              name="label"
              className="custom-form-s1"
              value={
                sectionListValues[currentSectionID]["fields"][currentNodeID]
                  ?.label || "Dropdown"
              }
              onChange={(_e) => {
                _e.preventDefault();
                handleChangeFields(_e);
              }}
            />
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="chklabeldiv">
              <input
                type="checkbox"
                name="required"
                id="toggle3"
                className="customChk-s1"
                onClick={(_e) => {
                  handleChangeFields(_e);
                }}
                value={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
                checked={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
              />
              <label htmlFor="toggle3">Required</label>
            </div>
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="custom-divider" />
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Size</label>
            <select
              className="custom-form-s1 select4"
              id="size"
              name="size"
              onChange={(_e) => {
                _e.preventDefault();
                handleChangeFields(_e);
              }}
              // checked={
              //   sectionListValues[currentSectionID]["fields"][currentNodeID]
              //     ?.size
              // }
            >
              <option value="small">Small</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="custom-divider" />
          </div>
          <div className="col-12 fix-col col-md-12">
            <div className="add_qest">
              <input
                type="text"
                id="dropText"
                name="options"
                className="custom-form-s1"
                value={currentOptionValue}
                onChange={(_e) => {
                  _e.preventDefault();
                  setCurrentOptionValue(_e.target.value);
                }}
              />
              <button
                id="addBtn"
                name="options"
                className="custom-btn-skyblue"
                onClick={(_e) => {
                  _e.preventDefault();
                  handleChangeFields(_e);
                }}
              >
                {optionsIDRef.current === null ? "Add" : "Update"}
              </button>
            </div>
            <div className="after_add_qest_preview">
              <ul>
                {sectionListValues[currentSectionID]["fields"][
                  currentNodeID
                ]?.options.map((item: string, key: number) => {
                  return (
                    <li key={key}>
                      <div className="liststyle-container">
                        <img src="/images/checkbox-filled.png" alt="" />
                      </div>
                      <div className="text-container">
                        <p>{item} </p>
                      </div>
                      <div className="actbtn-container">
                        <button
                          className="circle-btn editbtn"
                          onClick={(_e) => {
                            _e.preventDefault();
                            handleChangeOptions(key);
                          }}
                        >
                          <img src="/images/pencil1.svg" alt="" />
                        </button>
                        <button
                          className="circle-btn delbtn"
                          onClick={(_e) => {
                            _e.preventDefault();
                            handleRemoveOptions(key);
                          }}
                        >
                          <img src="/images/bin1.svg" alt="" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    currentOptionValue,
    getNodeDetailsForEdit,
    handleChangeOptions,
    handleChangeFields,
    handleRemoveOptions,
    sectionListValues,
  ]);

  /** GET Checkbox panel fields */
  const getCheckboxPanelFields = useCallback(() => {
    const { currentSectionID, currentNodeID } = getNodeDetailsForEdit;

    return (
      <div className="from-content-box">
        <div className="row fix-row">
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Label</label>
            <input
              type="text"
              placeholder="Title"
              id="label"
              name="label"
              className="custom-form-s1"
              value={
                sectionListValues[currentSectionID]["fields"][currentNodeID]
                  ?.label || "Checkbox"
              }
              onChange={(_e) => {
                _e.preventDefault();
                handleChangeFields(_e);
              }}
            />
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="chklabeldiv">
              <input
                type="checkbox"
                name="required"
                id="toggle3"
                className="customChk-s1"
                onClick={(_e) => {
                  handleChangeFields(_e);
                }}
                value={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
                checked={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
              />
              <label htmlFor="toggle3">Required</label>
            </div>
          </div>
          <div className="col-12 fix-col col-md-12">
            <div className="add_qest">
              <input
                type="text"
                id="dropText"
                name="options"
                className="custom-form-s1"
                value={currentOptionValue}
                onChange={(_e) => {
                  _e.preventDefault();
                  setCurrentOptionValue(_e.target.value);
                }}
              />
              <button
                id="addBtn"
                name="options"
                className="custom-btn-skyblue"
                onClick={(_e) => {
                  _e.preventDefault();
                  handleChangeFields(_e);
                }}
              >
                {optionsIDRef.current === null ? "Add" : "Update"}
              </button>
            </div>
            <div className="after_add_qest_preview">
              <ul>
                {sectionListValues[currentSectionID]["fields"][
                  currentNodeID
                ]?.options.map((item: any, key: number) => {
                  return (
                    <li key={key}>
                      <div className="liststyle-container">
                        <img src="/images/checkbox-filled.png" alt="" />
                      </div>
                      <div className="text-container">
                        <p>{item} </p>
                      </div>
                      <div className="actbtn-container">
                        <button
                          className="circle-btn editbtn"
                          onClick={(_e) => {
                            _e.preventDefault();
                            handleChangeOptions(key);
                          }}
                        >
                          <img src="/images/pencil1.svg" alt="" />
                        </button>
                        <button
                          className="circle-btn delbtn"
                          onClick={(_e) => {
                            _e.preventDefault();
                            handleRemoveOptions(key);
                          }}
                        >
                          <img src="/images/bin1.svg" alt="" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    currentOptionValue,
    getNodeDetailsForEdit,
    handleChangeFields,
    handleChangeOptions,
    handleRemoveOptions,
    sectionListValues,
  ]);

  /** GET Radiobutton panel fields */
  const getRadiobuttonPanelFields = useCallback(() => {
    const { currentSectionID, currentNodeID } = getNodeDetailsForEdit;

    return (
      <div className="from-content-box">
        <div className="row fix-row">
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Label</label>
            <input
              type="text"
              placeholder="Title"
              id="label"
              name="label"
              className="custom-form-s1"
              value={
                sectionListValues[currentSectionID]["fields"][currentNodeID]
                  ?.label || "Radio"
              }
              onChange={(_e) => {
                _e.preventDefault();
                handleChangeFields(_e);
              }}
            />
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="chklabeldiv">
              <input
                type="checkbox"
                name="required"
                id="toggle3"
                className="customChk-s1"
                onClick={(_e) => {
                  handleChangeFields(_e);
                }}
                value={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
                checked={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
              />
              <label htmlFor="toggle3">Required</label>
            </div>
          </div>
          <div className="col-12 fix-col col-md-12">
            <div className="add_qest">
              <input
                type="text"
                id="dropText"
                name="options"
                className="custom-form-s1"
                value={currentOptionValue}
                onChange={(_e) => {
                  _e.preventDefault();
                  setCurrentOptionValue(_e.target.value);
                }}
              />
              <button
                id="addBtn"
                name="options"
                className="custom-btn-skyblue"
                onClick={(_e) => {
                  _e.preventDefault();
                  handleChangeFields(_e);
                }}
              >
                {optionsIDRef.current === null ? "Add" : "Update"}
              </button>
            </div>
            <div className="after_add_qest_preview">
              <ul>
                {sectionListValues[currentSectionID]["fields"][
                  currentNodeID
                ]?.options.map((item: any, key: number) => {
                  return (
                    <li key={key}>
                      <div className="liststyle-container">
                        <img src="/images/radio-filled.png" alt="" />
                      </div>
                      <div className="text-container">
                        <p>{item} </p>
                      </div>
                      <div className="actbtn-container">
                        <button
                          className="circle-btn editbtn"
                          onClick={(_e) => {
                            _e.preventDefault();
                            handleChangeOptions(key);
                          }}
                        >
                          <img src="/images/pencil1.svg" alt="" />
                        </button>
                        <button
                          className="circle-btn delbtn"
                          onClick={(_e) => {
                            _e.preventDefault();
                            handleRemoveOptions(key);
                          }}
                        >
                          <img src="/images/bin1.svg" alt="" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    currentOptionValue,
    getNodeDetailsForEdit,
    handleChangeFields,
    handleChangeOptions,
    handleRemoveOptions,
    sectionListValues,
  ]);

  /** GET Date panel fields */
  const getDatePanelFields = useCallback(() => {
    const { currentSectionID, currentNodeID } = getNodeDetailsForEdit;
    return (
      <div className="from-content-box">
        <div className="row fix-row">
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Label</label>
            <input
              type="text"
              placeholder="Title"
              id="label"
              name="label"
              className="custom-form-s1"
              value={
                sectionListValues[currentSectionID]["fields"][currentNodeID]
                  ?.label || "Date"
              }
              onChange={(_e) => {
                _e.preventDefault();
                handleChangeFields(_e);
              }}
            />
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="chklabeldiv">
              <input
                type="checkbox"
                name="required"
                id="toggle3"
                className="customChk-s1"
                onClick={(_e) => {
                  handleChangeFields(_e);
                }}
                value={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
                checked={
                  sectionListValues[currentSectionID]["fields"][currentNodeID]
                    ?.required
                }
              />
              <label htmlFor="toggle3">Required</label>
            </div>
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="custom-divider" />
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <label>Size</label>
            <select
              className="custom-form-s1 select4"
              id="size"
              name="size"
              onChange={(_e) => {
                handleChangeFields(_e);
              }}
              value={
                sectionListValues[currentSectionID]["fields"][currentNodeID]
                  ?.size
              }
            >
              <option value="small">Small</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div className="col-12 fix-col col-md-12 custom-form-group">
            <div className="custom-divider" />
          </div>
        </div>
      </div>
    );
  }, [getNodeDetailsForEdit, handleChangeFields, sectionListValues]);

  const renderFieldPanels = useCallback(() => {
    return getNodeDetailsForEdit ? (
      <div className="addRegistrationform-right ">
        <div className="sticky-section">
          <button type="button" className="close2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={16}
              fill="currentColor"
              className="bi bi-x-lg"
              viewBox="0 0 16 16"
            >
              <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z" />
            </svg>
          </button>
          <div className="headerPart">
            <h2>Settings</h2>
          </div>

          {/* =================== start: right panel for text =================== */}

          {getNodeDetailsForEdit && getNodeDetailsForEdit.type === "text"
            ? getTextboxPanelFields()
            : null}

          {/* =================== end: right panel for text =================== */}

          {/* =================== start: right panel for Textarea =================== */}

          {getNodeDetailsForEdit && getNodeDetailsForEdit.type === "textarea"
            ? getTextareaPanelFields()
            : null}

          {/* =================== end: right panel for Textarea =================== */}

          {/* =================== start: right panel for Dropdown =================== */}
          {getNodeDetailsForEdit && getNodeDetailsForEdit.type === "select"
            ? getDropdownPanelFields()
            : null}
          {/* =================== end: right panel for Dropdown =================== */}

          {/* =================== start: right panel for Checkbox =================== */}
          {getNodeDetailsForEdit && getNodeDetailsForEdit.type === "checkbox"
            ? getCheckboxPanelFields()
            : null}
          {/* =================== end: right panel for Checkbox =================== */}

          {/* =================== start: right panel for Radio Button =================== */}
          {getNodeDetailsForEdit && getNodeDetailsForEdit.type === "radio"
            ? getRadiobuttonPanelFields()
            : null}
          {/* =================== end: right panel for Radio Button =================== */}

          {/* =================== start: right panel for Date =================== */}
          {getNodeDetailsForEdit && getNodeDetailsForEdit.type === "date"
            ? getDatePanelFields()
            : null}
          {/* =================== end: right panel for Date =================== */}

          <div className="div-modal-footer">
            <button type="button" className="themebtn-blue">
              Done
            </button>
          </div>
        </div>
      </div>
    ) : null;
  }, [
    getCheckboxPanelFields,
    getDatePanelFields,
    getDropdownPanelFields,
    getNodeDetailsForEdit,
    getRadiobuttonPanelFields,
    getTextareaPanelFields,
    getTextboxPanelFields,
  ]);
  /**********************************************************************************************************************************
   ******************************************** RIGHT side panel fields events END **************************************************
   **********************************************************************************************************************************/

  /** Handling FORM submission */
  const handleFormSubmit = useCallback(() => {
    if (Object.keys(sectionListValues).length === 0) {
      toast.error("Template can't be empty");
      return;
    }
    const submitForm = async () => {
      const payload = {
        formName: templateTitle,
        form: JSON.stringify(sectionListValues),
        attributeList: [],
      };

      const response = await createDynamicForm.mutateAsync(payload);

      if (response?.status) {
        toast.success(response.message);
        setSectionListValues({});
        activeSectionID.current = null;
        setNodeDetailsForEdit(null);
        history.push("/user/form-lists");
      }
    };

    submitForm();
  }, [sectionListValues, templateTitle, createDynamicForm, history]);

  return (
    <div className="mainDashboard-body">
      <div className="custom-container">
        <section className="addRegistrationform-sec">
          <div className="cases-page">
            <div className="cases-header responsive1199px">
              <h3>Custom Fields</h3>
            </div>
          </div>
          <div className="addRegistrationform-card">
            <div className="addRegistrationform-wrapper">
              <div className="addRegistrationform-left">
                <div className="headerPart">
                  <h2>Available Fields</h2>
                  <a href="#" className="mobile_res_togglebtn cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={16}
                      fill="currentColor"
                      className="bi bi-chevron-down"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                      />
                    </svg>
                  </a>
                </div>
                {/* LEFT NAVBAR PANEL */}
                <div className="navlistPart">
                  <button className="close2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={16}
                      fill="currentColor"
                      className="bi bi-x-lg"
                      viewBox="0 0 16 16"
                    >
                      <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z" />
                    </svg>
                  </button>
                  <ul>
                    <li>
                      <div
                        id="cusSection"
                        className="custom-add-field-box"
                        onClick={initializeDefaultSections}
                      >
                        <div className="icon-container">
                          <img src="/images/section-filled.png" alt="" />
                        </div>
                        <span>Section</span>
                      </div>
                    </li>
                    <li>
                      <div
                        id="cusText"
                        className="custom-add-field-box"
                        onClick={() => {
                          if (activeSectionID.current === null) {
                            initializeDefaultSections();
                          }
                          initializeDefaultFields("Text", "text");
                        }}
                      >
                        <div className="icon-container">
                          <img src="/images/text-filled.svg" alt="" />
                        </div>
                        <span>Text</span>
                      </div>
                    </li>
                    <li>
                      <div
                        id="cusTextarea"
                        className="custom-add-field-box"
                        onClick={() => {
                          if (activeSectionID.current === null) {
                            initializeDefaultSections();
                          }
                          initializeDefaultFields("Textarea", "textarea");
                        }}
                      >
                        <div className="icon-container">
                          <img src="/images/description-filled.svg" alt="" />
                        </div>
                        <span>Textarea</span>
                      </div>
                    </li>
                    <li>
                      <div
                        id="cusDropDown"
                        className="custom-add-field-box"
                        onClick={() => {
                          if (activeSectionID.current === null)
                            initializeDefaultSections();
                          initializeDefaultFields("Dropdown", "select");
                        }}
                      >
                        <div className="icon-container">
                          <img src="/images/dropdown-filled.png" alt="" />
                        </div>
                        <span>Dropdown</span>
                      </div>
                    </li>
                    <li>
                      <div
                        id="cusCheckBox"
                        className="custom-add-field-box"
                        onClick={() => {
                          if (activeSectionID.current === null)
                            initializeDefaultSections();
                          initializeDefaultFields("Checkbox", "checkbox");
                        }}
                      >
                        <div className="icon-container">
                          <img src="/images/checkbox-filled.png" alt="" />
                        </div>
                        <span>Checkbox</span>
                      </div>
                    </li>
                    <li>
                      <div
                        id="cusRadioBtn"
                        className="custom-add-field-box"
                        onClick={() => {
                          if (activeSectionID.current === null)
                            initializeDefaultSections();
                          initializeDefaultFields("Radio", "radio");
                        }}
                      >
                        <div className="icon-container">
                          <img src="/images/radio-filled.png" alt="" />
                        </div>
                        <span>Radio Button</span>
                      </div>
                    </li>
                    <li>
                      <div
                        id="cusDate"
                        className="custom-add-field-box"
                        onClick={() => {
                          if (activeSectionID.current === null)
                            initializeDefaultSections();
                          initializeDefaultFields("Date", "date");
                        }}
                      >
                        <div className="icon-container">
                          <img src="/images/date-filled.png" alt="" />
                        </div>
                        <span>Date</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* MIDDLE SECTION PANEL */}
              <div className="addRegistrationform-middle">
                <div className="headerPart">
                  <h2>
                    <input
                      ref={templateTitleRef}
                      type="text"
                      value={templateTitle}
                      onChange={(_e) => {
                        _e.preventDefault();
                        setTemplateTitle(_e.target.value);
                      }}
                    />
                  </h2>
                  <h4>Custom Field Template Name</h4>
                  <button
                    className="editBtn"
                    onClick={() => templateTitleRef.current.focus()}
                  >
                    <img src="/images/eva_edit-2-outline.svg" alt="edit-icon" />
                  </button>
                </div>
                <div className="bodyPart">
                  <div>{isSectionSelected ? getSectionContent() : null}</div>
                </div>
              </div>

              {/* RIGHT EDIT PANEL  */}
              {renderFieldPanels()}
            </div>

            <div className="addRegistrationform-submit-box">
              <button
                id="saveCustomFields"
                className="custom-btn-skyblue"
                onClick={handleFormSubmit}
              >
                Save Custom Fields Template
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreateForm;
