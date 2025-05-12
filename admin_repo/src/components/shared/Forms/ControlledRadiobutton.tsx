import React, { useCallback, useRef } from "react";
import TextField from "@mui/material/TextField";

type ControlledRadiobuttonProps = {
  textboxid: string;
  radiobuttonListValues: any;
  setRadiobuttonListValues: any;
  setRadiobuttonCount: any;
  sectionID: any;
};

const ControlledRadiobutton: React.FC<ControlledRadiobuttonProps> = ({
  textboxid,
  radiobuttonListValues,
  setRadiobuttonListValues,
  setRadiobuttonCount,
  sectionID,
}) => {
  const radiobuttonitem = useRef<string | null>(null);
  const handleChange = useCallback(
    (_e: any) => {
      setRadiobuttonListValues((_prevState: any) => ({
        ..._prevState,
        [textboxid]: {
          ..._prevState[textboxid],
          [_e.target.name]:
            _e.target.name === "radiobuttonvalue"
              ? _prevState[textboxid]?.radiobuttonvalue
                ? [
                    ..._prevState[textboxid]?.radiobuttonvalue,
                    radiobuttonitem.current,
                  ]
                : [radiobuttonitem.current]
              : _e.target.value,
          sectionID: sectionID,
        },
      }));

      radiobuttonitem.current = null;
    },
    [sectionID, setRadiobuttonListValues, textboxid]
  );

  const handleRemove = useCallback(
    (textboxid: any) => {
      const newTextboxListValues = Object.keys(radiobuttonListValues)
        .map((key) => (key !== textboxid ? radiobuttonListValues[key] : null))
        .filter((item) => item);

      setRadiobuttonCount(Object.keys(newTextboxListValues).length);
      setRadiobuttonListValues(newTextboxListValues);
    },
    [setRadiobuttonCount, setRadiobuttonListValues, radiobuttonListValues]
  );

  const handleRemoveCheckbox = (id: number) => {
    const newCheckboxListValues = radiobuttonListValues[
      textboxid
    ]?.radiobuttonvalue
      .map((item: any, index: number) => (index !== id ? item : null))
      .filter((item: any) => item);
    setRadiobuttonListValues((_prevState: any) => ({
      ..._prevState,
      [textboxid]: {
        ..._prevState[textboxid],
        radiobuttonvalue: newCheckboxListValues,
      },
    }));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-color-dark">
        {radiobuttonListValues[textboxid]?.level ?? "Radio"}
      </label>
      &nbsp;&nbsp;&nbsp;
      {radiobuttonListValues[textboxid]?.radiobuttonvalue &&
        radiobuttonListValues[textboxid]?.radiobuttonvalue.map(
          (item: any, index: number) => (
            <div key={index}>
              <input type="radio" key={index} checked disabled />
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
        <h4>Settings for Radio button</h4>
        Change Label
        <TextField name={"level"} onChange={handleChange} />
        Add value
        <TextField
          name={"radiobuttonvalue"}
          onChange={(_e) => (radiobuttonitem.current = _e.target.value)}
          value={radiobuttonitem.current}
        />
        <button
          type="button"
          className="btn btn-info"
          name={"radiobuttonvalue"}
          onClick={handleChange}
        >
          Add{" "}
        </button>
      </div>
    </div>
  );
};

export default ControlledRadiobutton;
