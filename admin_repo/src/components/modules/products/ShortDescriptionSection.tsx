import { Form } from "react-bootstrap";
import { FieldErrors, useFieldArray, useFormContext } from "react-hook-form";
import { IoIosAddCircle, IoIosTrash } from "react-icons/io";

interface ProductShortDescription {
  shortDescription: string;
}

interface FormValues {
  productShortDescriptionList: ProductShortDescription[];
}

const ShortDescriptionSection = () => {
  const formContext = useFormContext();

  const fieldArrayForShortDescription = useFieldArray({
    control: formContext.control,
    name: "productShortDescriptionList",
  });

  const appendShortDescription = () =>
    fieldArrayForShortDescription.append({
      shortDescription: "",
    });

  const removeShortDescription = (index: number) =>
    fieldArrayForShortDescription.remove(index);

  const errors = formContext.formState.errors as FieldErrors<FormValues>;

  return (
    <div>
      <h3>Description</h3>
      <div className="grid w-full grid-cols-1">
        <div>
          <div className="flex w-full items-center justify-between mb-1 mt-2">
            <label className="leading-none text-color-dark text-base">
              Short Description
            </label>

            <button
              type="button"
              onClick={appendShortDescription}
              className="flex cursor-pointer items-center bg-transparent p-0 text-sm font-semibold capitalize text-dark-orange shadow-none hover:bg-transparent"
            >
              <IoIosAddCircle color="red" size={20} className="mr-1" />
              <span className="text-red-500">Add Short Description</span>
            </button>
          </div>

          {fieldArrayForShortDescription.fields.map((field, index) => (
            <div key={field.id} className="relative w-full">
              <Form.Group>
                <Form.Control
                  type="text"
                  id={`productShortDescriptionList.${index}.shortDescription`}
                  {...formContext.register(
                    `productShortDescriptionList.${index}.shortDescription`
                  )}
                  placeholder="Enter Short Description"
                />
                <p className="text-red-500 text-sm">
                  {
                    errors?.productShortDescriptionList?.[index]
                      ?.shortDescription?.message
                  }
                </p>
              </Form.Group>

              {index !== 0 ? (
                <button
                  type="button"
                  onClick={() => removeShortDescription(index)}
                  className="absolute right-2 top-6 flex -translate-y-2/4 cursor-pointer items-center bg-transparent p-0 text-sm font-semibold capitalize text-dark-orange shadow-none hover:bg-transparent"
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

export default ShortDescriptionSection;
