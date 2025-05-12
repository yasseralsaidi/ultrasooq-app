import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import PlateEditor from "../../shared/Plate/PlateEditor";

interface ControlledRichTextEditorProps {
  label: string;
  name: string;
}

const ControlledRichTextEditor: React.FC<ControlledRichTextEditorProps> = ({ label, name, }) => {
  const formContext = useFormContext();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-color-dark">
        {label}
      </label>
      <Controller control={formContext.control} name={name} defaultValue={[{ type: 'paragraph', children: [{ text: '' }] }]} render={({ field }) => (
        <PlateEditor onChange={field.onChange} description={field.value || [{ type: 'paragraph', children: [{ text: '' }] }]} />
      )} />
    </div>
  );
};

export default ControlledRichTextEditor;
