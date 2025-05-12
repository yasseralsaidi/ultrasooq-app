import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import PlateEditor from "../Plate/PlateEditor";
import { useAuth } from "@/context/AuthContext";

interface ControlledRichTextEditorProps {
  label: string;
  name: string;
  value?: any[];
  onChange?: (e: any) => void;
  readOnly?: boolean; // Add readOnly prop
}

const ControlledRichTextEditor: React.FC<ControlledRichTextEditorProps> = ({
  label,
  name,
  value,
  onChange,
  readOnly = false, // Default to false
}) => {
  const formContext = useFormContext();
  const { langDir } = useAuth();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-color-dark" dir={langDir}>
        {label}
      </label>
      <Controller
        control={formContext.control}
        name={name}
        defaultValue=""
        render={({ field }) => (
          <PlateEditor
            onChange={(e) => {
              if (onChange) {
                onChange(e);
              } else {
                field.onChange(e);
              }
            }}
            description={value || field.value}
            readOnly={readOnly} // Pass readOnly prop to PlateEditor
            fixedToolbar={readOnly ? false : true}
          />
        )}
      />
    </div>
  );
};

export default ControlledRichTextEditor;