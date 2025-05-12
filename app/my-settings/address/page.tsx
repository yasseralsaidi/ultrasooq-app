"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import AddressCard from "@/components/modules/mySettings/address/AddressCard";
import { AddressItem } from "@/utils/types/address.types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AddressForm from "@/components/modules/checkout/AddressForm";
import { useClickOutside } from "use-events";
import {
  useAllUserAddress,
  useDeleteAddress,
} from "@/apis/queries/address.queries";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { v4 as uuidv4 } from "uuid";
import { IoMdAdd } from "react-icons/io";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type AddressPageProps = {};

const AddressPage: React.FC<AddressPageProps> = ({}) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const { toast } = useToast();
  const wrapperRef = useRef(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<
    number | undefined
  >();

  const handleToggleAddModal = () => setIsAddModalOpen(!isAddModalOpen);

  const [isClickedOutside] = useClickOutside([wrapperRef], (event) => {});

  const allUserAddressQuery = useAllUserAddress({
    page: 1,
    limit: 10,
  });
  const delteAddress = useDeleteAddress();

  const memoziedAddressList = useMemo(() => {
    return allUserAddressQuery.data?.data || [];
  }, [allUserAddressQuery.data?.data]);

  const handleDeleteAddress = async (userAddressId: number) => {
    const response = await delteAddress.mutateAsync({ userAddressId });
    if (response.status) {
      toast({
        title: t("address_removed"),
        description: t("check_your_address_for_more_details"),
        variant: "success",
      });
    }
  };

  useEffect(() => {
    if (isClickedOutside) {
      setSelectedAddressId(undefined);
    }
  }, [isClickedOutside]);

  return (
    <div className="my-settings-content">
      <h2 dir={langDir} translate="no">{t("manage_address")}</h2>
      <div className="my-address-sec">
        <div className="card-item cart-items for-add">
          <div className="top-heading" dir={langDir}>
            <button
              className="add-new-address-btn inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-none border-input bg-background p-0 text-sm font-medium !normal-case shadow-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              type="button"
              onClick={() => handleToggleAddModal()}
              translate="no"
            >
              <IoMdAdd size={24} /> {t("add_new_address")}{" "}
            </button>
          </div>
        </div>

        {allUserAddressQuery.isLoading
          ? Array.from({ length: 2 }, (_, i) => i).map((item) => (
              <div key={uuidv4()} className="space-y-3 px-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          : null}

        <div className="card-item selected-address">
          <div className="selected-address-lists">
            {!allUserAddressQuery.isLoading && !memoziedAddressList?.length ? (
              <p className="py-10 text-center" dir={langDir} translate="no">{t("no_address_found")}</p>
            ) : null}

            {memoziedAddressList?.map((item: AddressItem) => (
              <AddressCard
                key={item.id}
                id={item.id}
                firstName={item.firstName}
                lastName={item.lastName}
                cc={item.cc}
                phoneNumber={item.phoneNumber}
                address={item.address}
                town={item.town}
                city={item.cityDetail}
                country={item.countryDetail}
                state={item.stateDetail}
                postCode={item.postCode}
                onEdit={() => {
                  setSelectedAddressId(item.id);
                  handleToggleAddModal();
                }}
                onDelete={() => handleDeleteAddress(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
      <Dialog open={isAddModalOpen} onOpenChange={handleToggleAddModal}>
        <DialogContent
          className="add-new-address-modal gap-0 p-0"
          ref={wrapperRef}
        >
          <AddressForm
            onClose={() => {
              setIsAddModalOpen(false);
              setSelectedAddressId(undefined);
            }}
            addressId={selectedAddressId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressPage;
