import React, { useCallback } from "react";
import TextField from "@mui/material/TextField";
import Input from "@mui/material/Input";

type ControlledTextBoxProps = {
  textboxid: any;
  textboxListValues: any;
  setTextboxListValues: any;
  setTexboxCount: any;
  sectionID: any;
};

const ControlledTextBox: React.FC<ControlledTextBoxProps> = ({
  textboxid,
  textboxListValues,
  setTextboxListValues,
  setTexboxCount,
  sectionID,
}) => {
  const handleChange = useCallback(
    (_e: any) => {
      setTextboxListValues((_prevState: any) => ({
        ..._prevState,
        [textboxid]: {
          ..._prevState[textboxid],
          [_e.target.name]: _e.target.value,
          sectionID: sectionID,
        },
      }));
    },
    [sectionID, setTextboxListValues, textboxid]
  );

  const handleRemove = useCallback(
    (textboxid: any) => {
      const newTextboxListValues = Object.keys(textboxListValues)
        .map((key) => (key !== textboxid ? textboxListValues[key] : null))
        .filter((item) => item);

      setTexboxCount(Object.keys(newTextboxListValues).length);
      setTextboxListValues(newTextboxListValues);
    },
    [setTexboxCount, setTextboxListValues, textboxListValues]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-color-dark">
        {textboxListValues[textboxid]?.level ?? "Text"}
      </label>
      &nbsp;&nbsp;&nbsp;
      <Input
        type="text"
        placeholder={
          textboxListValues[textboxid]?.placeholder ?? "Default Placeholder"
        }
        disabled
      />
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
        <h4>Settings for Input box</h4>
        Change Label
        <TextField name={"level"} onChange={handleChange} />
        Change Placeholder
        <TextField name={"placeholder"} onChange={handleChange} />
      </div>
    </div>
  );
};

export default ControlledTextBox;
