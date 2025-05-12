import { Form } from "react-bootstrap";
import { FieldErrors, useFieldArray, useFormContext } from "react-hook-form";
import { IoIosAddCircle, IoIosTrash } from "react-icons/io";

interface ProductShortDescription {
  label: string;
  specification: string;
}

interface FormValues {
  productSpecificationList: ProductShortDescription[];
}

const SpecificationSection = () => {
  const formContext = useFormContext();

  const fieldArrayForSpecification = useFieldArray({
    control: formContext.control,
    name: "productSpecificationList",
  });

  const appendSpecification = () =>
    fieldArrayForSpecification.append({
      label: "",
      specification: "",
    });

  const removeSpecification = (index: number) =>
    fieldArrayForSpecification.remove(index);

  const errors = formContext.formState.errors as FieldErrors<FormValues>;

  return (
    <div className="relative mb-4 w-full">
      <div className="grid w-full grid-cols-1">
        <div>
          <div className="flex w-full items-center justify-between mb-2">
            <label className="text-base leading-none text-color-dark">
              Specification
            </label>

            <button
              type="button"
              onClick={appendSpecification}
              className="flex cursor-pointer items-center bg-transparent p-0 text-sm font-semibold capitalize text-dark-orange shadow-none hover:bg-transparent"
            >
              <IoIosAddCircle color="red" size={20} className="mr-1" />
              <span className="text-red-500">Add Specification</span>
            </button>
          </div>

          {fieldArrayForSpecification.fields.map((field, index) => (
            <div
              key={field.id}
              className="relative grid w-full grid-cols-2 gap-x-3"
            >
              <Form.Group>
                <Form.Label htmlFor={`productSpecificationList.${index}.label`}>
                  Label
                </Form.Label>
                <Form.Control
                  type="text"
                  id={`productSpecificationList.${index}.label`}
                  {...formContext.register(
                    `productSpecificationList.${index}.label`
                  )}
                  placeholder="Enter Label"
                />
                <p className="text-red-500 text-sm">
                  {errors?.productSpecificationList?.[index]?.label?.message}
                </p>
              </Form.Group>

              <Form.Group>
                <Form.Label
                  htmlFor={`productSpecificationList.${index}.specification`}
                >
                  Value
                </Form.Label>
                <Form.Control
                  type="text"
                  id={`productSpecificationList.${index}.specification`}
                  {...formContext.register(
                    `productSpecificationList.${index}.specification`
                  )}
                  placeholder="Enter Value"
                />
                <p className="text-red-500 text-sm">
                  {
                    errors?.productSpecificationList?.[index]?.specification
                      ?.message
                  }
                </p>
              </Form.Group>

              {index !== 0 ? (
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="absolute right-2 top-3 flex -translate-y-2/4 cursor-pointer items-center bg-transparent p-0 text-sm font-semibold capitalize text-dark-orange shadow-none hover:bg-transparent"
                >
                  <IoIosTrash color="red" size={20} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecificationSection;
