import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";

interface ControlledTimePickerProps {
  label?: string;
  name: string;
}

const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      times.push(time);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

const ControlledTimePicker: React.FC<ControlledTimePickerProps> = ({
  label,
  name,
}) => {
  const t = useTranslations();
  const { control, setValue, watch } = useFormContext();
  const { langDir } = useAuth();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className="mb-4 flex w-full flex-col">
          <FormLabel dir={langDir}>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl dir={langDir}>
                <Button
                  variant={"outline"}
                  className={cn(
                    "!h-12 rounded border-gray-300 pl-3 text-left font-normal focus-visible:!ring-0",
                    !field.value && "text-muted-foreground",
                  )}
                  translate="no"
                >
                  {field.value ? (
                    field.value
                  ) : (
                    <span className="w-full whitespace-pre-wrap break-words">
                      {t("select")} {label || t("time")}
                    </span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              className="max-h-64 w-auto overflow-y-auto p-2"
              align={langDir == "rtl" ? "end" : "start"}
            >
              <select
                className="w-full cursor-pointer rounded-lg border border-gray-300 p-2 text-lg"
                value={field.value || ""}
                onChange={(e) => {
                  const selectedTime = e.target.value;
                  setValue(name, selectedTime); // ✅ Update form state
                  field.onChange(selectedTime); // ✅ Call field.onChange
                  // console.log(`Updated ${name}:`, selectedTime); // ✅ Debugging log
                }}
                dir={langDir}
              >
                <option value="" translate="no" disabled>
                  {t("select_time")}
                </option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ControlledTimePicker;
