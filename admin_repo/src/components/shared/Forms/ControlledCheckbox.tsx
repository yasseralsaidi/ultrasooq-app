import { useCallback, useRef } from "react";
import TextField from "@mui/material/TextField";

type ControlledCheckboxProps = {
  textboxid: any;
  checkboxListValues: any;
  setCheckboxListValues: any;
  setCheckboxCount: any;
  sectionID: any;
};

const ControlledCheckbox: React.FC<ControlledCheckboxProps> = ({
  textboxid,
  checkboxListValues,
  setCheckboxListValues,
  setCheckboxCount,
  sectionID,
}) => {
  const checkboxitem = useRef<string | null>(null);
  const handleChange = useCallback(
    (_e: any) => {
      setCheckboxListValues((_prevState: any) => ({
        ..._prevState,
        [textboxid]: {
          ..._prevState[textboxid],
          [_e.target.name]:
            _e.target.name === "checkboxvalue"
              ? _prevState[textboxid]?.checkboxvalue
                ? [
                    ..._prevState[textboxid]?.checkboxvalue,
                    checkboxitem.current,
                  ]
                : [checkboxitem.current]
              : _e.target.value,
          sectionID: sectionID,
        },
      }));

      checkboxitem.current = null;
    },
    [sectionID, setCheckboxListValues, textboxid]
  );

  const handleRemove = useCallback(
    (textboxid: any) => {
      const newTextboxListValues = Object.keys(checkboxListValues)
        .map((key) => (key !== textboxid ? checkboxListValues[key] : null))
        .filter((item) => item);

      setCheckboxCount(Object.keys(newTextboxListValues).length);
      setCheckboxListValues(newTextboxListValues);
    },
    [setCheckboxCount, setCheckboxListValues, checkboxListValues]
  );

  const handleRemoveCheckbox = (id: number) => {
    const newCheckboxListValues = checkboxListValues[textboxid]?.checkboxvalue
      .map((item: string, index: number) => (index !== id ? item : null))
      .filter((item: string) => item);
    setCheckboxListValues((_prevState: any) => ({
      ..._prevState,
      [textboxid]: {
        ..._prevState[textboxid],
        checkboxvalue: newCheckboxListValues,
      },
    }));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-color-dark">
        {checkboxListValues[textboxid]?.level ?? "Checkbox"}
      </label>
      &nbsp;&nbsp;&nbsp;
      {checkboxListValues[textboxid]?.checkboxvalue &&
        checkboxListValues[textboxid]?.checkboxvalue.map(
          (item: string, index: number) => (
            <div key={index}>
              <input type="checkbox" key={index} checked disabled />
              <label>{item}</label>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleRemoveCheckbox(index)}
              >
                X{" "}
              </button>
            </div>
          )
        )}
      &nbsp;&nbsp;&nbsp;
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => handleRemove(textboxid)}
      >
        Remove{" "}
      </button>
      &nbsp;&nbsp;&nbsp;
      <div>
        <h4>Settings for Check box</h4>
        Change Label
        <TextField name={"level"} onChange={handleChange} />
        Add value
        <TextField
          name={"checkboxvalue"}
          onChange={(_e) => (checkboxitem.current = _e.target.value)}
          value={checkboxitem.current}
        />
        <button
          type="button"
          className="btn btn-info"
          name={"checkboxvalue"}
          onClick={handleChange}
        >
          Add{" "}
        </button>
      </div>
    </div>
  );
};

export default ControlledCheckbox;
