import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import DropdownIcon from "@/public/images/custom-hover-dropdown-btn.svg";
import PhoneIcon from "@/public/images/phoneicon.svg";
import LocationIcon from "@/public/images/locationicon.svg";

type AddressCardProps = {
  id: number;
  firstName: string;
  lastName: string;
  cc: string;
  phoneNumber: string;
  address: string;
  town: string;
  city?: { id: number; name: string; };
  state?: { id: number; name: string; };
  country?: { id: number; name: string; };
  postCode: string;
  onEdit: () => void;
  onDelete: () => void;
  onSelectAddress: () => void;
};

const AddressCard: React.FC<AddressCardProps> = ({
  id,
  firstName,
  lastName,
  cc,
  phoneNumber,
  address,
  town,
  city,
  state,
  country,
  postCode,
  onEdit,
  onDelete,
  onSelectAddress,
}) => {
  return (
    <div className="selected-address-item flex gap-x-3">
      <RadioGroupItem
        value={id?.toString()}
        id="r3"
        className="mt-1"
        onClick={onSelectAddress}
      />
      <Label htmlFor={id?.toString()} className="infocardbox">
        <div className="left-address-with-right-btn">
          <div>
            <h4 className="!mt-0">
              {firstName} {lastName}
            </h4>
            <ul>
              <li>
                <p>
                  <span className="icon-container">
                    <Image src={PhoneIcon} alt="phone-icon" />
                  </span>
                  <span className="text-container">{phoneNumber}</span>
                </p>
              </li>
              <li>
                <p>
                  <span className="icon-container">
                    <Image src={LocationIcon} alt="location-icon" />
                  </span>
                  <span className="text-container">
                    {[address, town, city?.name, state?.name, postCode, country?.name].filter(el => el).join(', ')}
                  </span>
                </p>
              </li>
            </ul>
          </div>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Image
                  alt="image-icon"
                  src={DropdownIcon}
                  height={25}
                  width={25}
                  className="rounded-full"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Label>
    </div>
  );
};

export default AddressCard;
