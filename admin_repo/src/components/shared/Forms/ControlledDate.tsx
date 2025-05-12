import { useCallback } from "react";
import TextField from "@mui/material/TextField";

type ControlledDateProps = {
  textboxid: string;
  dateListValues: any;
  setDateListValues: any;
  setDateCount: any;
  sectionID: any;
};

const ControlledDate: React.FC<ControlledDateProps> = ({
  textboxid,
  dateListValues,
  setDateListValues,
  setDateCount,
  sectionID,
}) => {
  console.log({ sectionID });
  const handleChange = useCallback(
    (_e: any) => {
      setDateListValues((_prevState: any) => ({
        ..._prevState,
        [textboxid]: {
          ..._prevState[textboxid],
          [_e.target.name]: _e.target.value,
          sectionID: sectionID,
        },
      }));
    },
    [sectionID, setDateListValues, textboxid]
  );

  const handleRemove = useCallback(
    (textboxid: string) => {
      const newTextboxListValues = Object.keys(dateListValues)
        .map((key) => (key !== textboxid ? dateListValues[key] : null))
        .filter((item) => item);

      setDateCount(Object.keys(newTextboxListValues).length);
      setDateListValues(newTextboxListValues);
    },
    [setDateCount, setDateListValues, dateListValues]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-color-dark">
        {dateListValues[textboxid]?.level ?? "Section name"}
      </label>
      &nbsp;&nbsp;&nbsp;
      <input type="date" />
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
        <h4>Settings for Date</h4>
        Change Label
        <TextField name={"level"} onChange={handleChange} />
      </div>
    </div>
  );
};

export default ControlledDate;
