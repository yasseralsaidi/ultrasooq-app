import React, { useCallback } from "react";
// import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
// import { TextareaAutosize as BaseTextareaAutosize } from "@mui/base/TextareaAutosize";
import TextareaAutosize from "@mui/material/TextareaAutosize";

import { styled } from "@mui/system";

const blue = {
  100: "#DAECFF",
  200: "#b6daff",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const Textarea = styled(TextareaAutosize)(
  ({ theme }) => `
    box-sizing: border-box;
    width: 320px;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 12px;
    border-radius: 12px 12px 0 12px;
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
    background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    box-shadow: 0px 2px 2px ${
      theme.palette.mode === "dark" ? grey[900] : grey[50]
    };

    &:hover {
      border-color: ${blue[400]};
    }

    &:focus {
      outline: 0;
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${
        theme.palette.mode === "dark" ? blue[600] : blue[200]
      };
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `
);

type ControlledTextAreaProps = {
  textboxid: string;
  textareaListValues: any;
  setTextareaListValues: any;
  setTextareaCount: any;
  sectionID: string;
};

const ControlledTextArea: React.FC<ControlledTextAreaProps> = ({
  textboxid,
  textareaListValues,
  setTextareaListValues,
  setTextareaCount,
  sectionID,
}) => {
  //const { handleSubmit, control } = useForm();

  const handleChange = useCallback(
    (_e: any) => {
      setTextareaListValues((_prevState: any) => ({
        ..._prevState,
        [textboxid]: {
          ..._prevState[textboxid],
          [_e.target.name]: _e.target.value,
          sectionID: sectionID,
        },
      }));
    },
    [sectionID, setTextareaListValues, textboxid]
  );

  const handleRemove = useCallback(
    (textboxid: any) => {
      const newTextboxListValues = Object.keys(textareaListValues)
        .map((key) => (key !== textboxid ? textareaListValues[key] : null))
        .filter((item) => item);

      setTextareaCount(Object.keys(newTextboxListValues).length);
      setTextareaListValues(newTextboxListValues);
    },
    [setTextareaCount, setTextareaListValues, textareaListValues]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-color-dark">
        {textareaListValues[textboxid]?.level ?? "Textarea"}
      </label>
      &nbsp;&nbsp;&nbsp;
      <Textarea
        placeholder={
          textareaListValues[textboxid]?.placeholder ?? "Default Placeholder"
        }
        readOnly
        minRows={3}
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
        <h4>Settings for Textarea box</h4>
        Change Label
        <TextField name={"level"} onChange={handleChange} />
        Change Placeholder
        <TextField name={"placeholder"} onChange={handleChange} />
      </div>
    </div>
  );
};

export default ControlledTextArea;
