import { useCallback, useRef } from "react";
import TextField from "@mui/material/TextField";

type ControlledDropdownProps = {
  textboxid: string;
  dropdownListValues: any;
  setDropdownListValues: any;
  setDropdownCount: any;
  sectionID: any;
};

const ControlledDropdown: React.FC<ControlledDropdownProps> = ({
  textboxid,
  dropdownListValues,
  setDropdownListValues,
  setDropdownCount,
  sectionID,
}) => {
  const dropdownitem = useRef<string | null>(null);
  const handleChange = useCallback(
    (_e: any) => {
      setDropdownListValues((_prevState: any) => ({
        ..._prevState,
        [textboxid]: {
          ..._prevState[textboxid],
          [_e.target.name]:
            _e.target.name === "dropdownvalue"
              ? _prevState[textboxid]?.dropdownvalue
                ? [
                    ..._prevState[textboxid]?.dropdownvalue,
                    dropdownitem.current,
                  ]
                : [dropdownitem.current]
              : _e.target.value,
          sectionID: sectionID,
        },
      }));

      dropdownitem.current = null;
    },
    [sectionID, setDropdownListValues, textboxid]
  );

  const handleRemove = useCallback(
    (textboxid: any) => {
      const newTextboxListValues = Object.keys(dropdownListValues)
        .map((key) => (key !== textboxid ? dropdownListValues[key] : null))
        .filter((item) => item);

      setDropdownCount(Object.keys(newTextboxListValues).length);
      setDropdownListValues(newTextboxListValues);
    },
    [setDropdownCount, setDropdownListValues, dropdownListValues]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-color-dark">
        {dropdownListValues[textboxid]?.level ?? "Dropdown"}
      </label>
      &nbsp;&nbsp;&nbsp;
      <select>
        <option disabled selected>
          Please select
        </option>
        {dropdownListValues[textboxid]?.dropdownvalue &&
          dropdownListValues[textboxid]?.dropdownvalue.map(
            (item: any, index: number) => <option key={index}>{item}</option>
          )}
      </select>
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
        <h4>Settings for Dropdown box</h4>
        Change Label
        <TextField name={"level"} onChange={handleChange} />
        Add value
        <TextField
          name={"dropdownvalue"}
          onChange={(_e) => (dropdownitem.current = _e.target.value)}
          value={dropdownitem.current}
        />
        <button
          type="button"
          className="btn btn-info"
          name={"dropdownvalue"}
          onClick={handleChange}
        >
          Add{" "}
        </button>
      </div>
    </div>
  );
};

export default ControlledDropdown;
