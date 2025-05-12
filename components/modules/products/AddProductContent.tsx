import React from "react";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import AddProductIcon from "@/public/images/add-product.svg";
import ExistingProductIcon from "@/public/images/existing-product.svg";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type AddProductContentProps = {
  productId?: number
};

const AddProductContent: React.FC<AddProductContentProps> = ({ productId }) => {
  const t = useTranslations();
  const { langDir } = useAuth();

  return (
    <DialogContent className="custom-action-type-chose-picker">
      <div className="modal-headerpart">
        <DialogTitle dir={langDir} translate="no">{t("choose_add_product_type")}</DialogTitle>
      </div>
      <div className="modal-bodypart">
        <div className="import-pickup-type-selector-lists" dir={langDir}>
          <div className="import-pickup-type-selector-item">
            <Link
              href={productId ? `/product?copy=${productId}` : '/product'}
              className="import-pickup-type-selector-box hover:!bg-gray-100"
            >
              <div className="icon-container">
                <Image src={AddProductIcon} alt="add-product-icon" />
              </div>
              <div className="text-container">
                <h5 dir={langDir} translate="no">{t("add_new_product")}</h5>
              </div>
            </Link>
          </div>

          {/* <div className="import-pickup-type-selector-item">
            <Link
              href="/existing-products"
              className="import-pickup-type-selector-box hover:!bg-gray-100"
            >
              <div className="icon-container">
                <Image src={ExistingProductIcon} alt="add-product-icon" />
              </div>
              <div className="text-container">
                <h5>Choose from Existing product </h5>
                <p>
                  Lorem Ipsum is simply Lorem 1500s, when an unknown printer
                  took a galley of type and scrambled it to make a type specimen
                  book.
                </p>
              </div>
            </Link>
          </div> */}
        </div>
      </div>
    </DialogContent>
  );
};

export default AddProductContent;
