import React, { useCallback } from "react";
import TextField from "@mui/material/TextField";

type ControlledSectionProps = {
  textboxid: any;
  sectionListValues: any;
  setSectionListValues: any;
  setSectionCount: any;
  sectionID: any;
  removeSectionAttributes: any;
};

const ControlledSection: React.FC<ControlledSectionProps> = ({
  textboxid,
  sectionListValues,
  setSectionListValues,
  setSectionCount,
  sectionID,
  removeSectionAttributes,
}) => {
  console.log({ sectionID });
  const handleChange = useCallback(
    (_e: any) => {
      setSectionListValues((_prevState: any) => ({
        ..._prevState,
        [textboxid]: {
          ..._prevState[textboxid],
          [_e.target.name]: _e.target.value,
          sectionID: sectionID,
        },
      }));
    },
    [sectionID, setSectionListValues, textboxid]
  );

  const handleRemove = useCallback(
    (textboxid: any) => {
      removeSectionAttributes();
      const newTextboxListValues = Object.keys(sectionListValues)
        .map((key) => (key !== textboxid ? sectionListValues[key] : null))
        .filter((item) => item);

      setSectionCount(Object.keys(newTextboxListValues).length);
      setSectionListValues(newTextboxListValues);
    },
    [
      removeSectionAttributes,
      sectionListValues,
      setSectionCount,
      setSectionListValues,
    ]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-color-dark">
        {sectionListValues[textboxid]?.level ?? "Section name"}
      </label>
      &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => handleRemove(textboxid)}
      >
        Remove{" "}
      </button>
      &nbsp;&nbsp;&nbsp;
      <div>
        <h4>Settings for Section</h4>
        Change Label
        <TextField name={"level"} onChange={handleChange} />
      </div>
    </div>
  );
};

export default ControlledSection;
