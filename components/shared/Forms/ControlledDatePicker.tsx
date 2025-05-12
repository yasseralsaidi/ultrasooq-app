import React from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";

interface ControlledDatePickerProps {
  label?: string;
  name: string;
  isFuture?: boolean;
  minDate?: Date;
  placeholder?: string
}

const ControlledDatePicker: React.FC<ControlledDatePickerProps> = ({
  label,
  name,
  isFuture,
  minDate,
  placeholder
}) => {
  const t = useTranslations();
  const formContext = useFormContext();
  const { langDir } = useAuth();

  return (
    <FormField
      control={formContext.control}
      name={name}
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
                    format(field.value, "PPP")
                  ) : (
                    <span>{placeholder || t("enter") + " " + (label || t("date"))}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={langDir == 'rtl' ? 'end' : 'start'}>
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  if (isFuture) {
                    // return date < today; // Disable dates before today
                    return date < today || (minDate ? date < minDate : false);
                  } else {
                    // const minDate = new Date("1900-01-01");
                    const minSelectableDate = new Date("1900-01-01");
                    // return date < minDate || date > today; // Disable dates outside the range of Jan 1, 1900, to today
                    return (
                      date < minSelectableDate ||
                      date > today ||
                      (minDate ? date < minDate : false)
                    );
                  }
                }}
                initialFocus
                fromYear={
                  isFuture
                    ? new Date().getFullYear()
                    : new Date().getFullYear() - 100
                }
                toYear={
                  isFuture
                    ? new Date().getFullYear() + 100
                    : new Date().getFullYear() - 18
                }
                captionLayout="dropdown-buttons"
                classNames={{
                  vhidden: "vhidden hidden",
                  day_selected: "bg-dark-orange text-white",
                }}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ControlledDatePicker;
