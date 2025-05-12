"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import TaskIcon from "@/public/images/task-icon.svg";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SellerChat from "@/components/modules/chat/seller/SellerChat";
import ProductChat from "@/components/modules/chat/productChat/ProductChat";
import VendorOperations from "@/components/modules/vendorOperations/VendorOperations";
import { PERMISSION_RFQ_SELLER_REQUESTS, checkPermission } from "@/helpers/permission";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

const SellerRfqRequestPage = () => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const router = useRouter();
  const hasPermission = checkPermission(PERMISSION_RFQ_SELLER_REQUESTS);
  const [currentTab, setCurrentTab] = useState<string>("RFQ");
  const [productId, setProductId] = useState<number | null>(null);

  useEffect(() => {
    if (!hasPermission) {
      router.push("/home");
      return;
    }

    const params = new URLSearchParams(document.location.search);
    let pId = params.get("product_id");
    if (pId) {
      setProductId(parseInt(pId));
      setCurrentTab("MSG");
    }
  }, []);

  if (!hasPermission) return <div></div>;

  return (
    <section className="m-auto flex w-full max-w-[1400px] flex-wrap py-8">
      <div className="w-full px-2 lg:w-[15%]">
        <div className="w-full px-0 py-0 shadow-lg">
          <ul>
            <li className="w-full py-1" dir={langDir}>
              <Link
                href="#"
                className="flex items-center justify-start rounded-xl p-2"
              >
                <div className="flex h-[20px] w-[20px] items-center justify-center ">
                  <Image src={TaskIcon} alt="Task Icon" />
                </div>
                <div className="pl-1 text-sm font-medium text-[#828593]">
                  Ultrasooq
                </div>
              </Link>
            </li>
            <li
              onClick={() => setCurrentTab("RFQ")}
              className={cn(
                currentTab === "RFQ"
                  ? "bg-dark-orange text-white"
                  : "bg-gray-50 text-black",
                "w-full py-1",
              )}
              dir={langDir}
            >
              <button className="flex items-center justify-start rounded-xl p-2">
                <div className="flex h-[20px] w-[20px] items-center justify-center">
                  <Image
                    src={TaskIcon}
                    alt="Task Icon"
                    className="brightness-0 invert"
                  />
                </div>
                <div className="pl-1 text-sm font-medium" dir={langDir} translate="no">{t("rfq")}</div>
              </button>
            </li>
            <li
              onClick={() => setCurrentTab("Vendor Operations")}
              className={cn(
                currentTab === "Vendor Operations"
                  ? "bg-dark-orange text-white"
                  : "bg-gray-50 text-black",
                "w-full py-1",
              )}
              dir={langDir}
            >
              <button className="flex items-center justify-start rounded-xl p-2">
                <div className="flex h-[20px] w-[20px] items-center justify-center">
                  <Image
                    src={TaskIcon}
                    alt="Task Icon"
                    className="brightness-0 invert"
                  />
                </div>
                <div className="pl-1 text-sm font-medium" dir={langDir} translate="no">
                  {t("vendor_operations")}
                </div>
              </button>
            </li>
            {productId ? (
              <li
                onClick={() => setCurrentTab("MSG")}
                className={cn(
                  currentTab === "MSG"
                    ? "bg-dark-orange text-white"
                    : "bg-gray-50 text-black",
                  "w-full py-1",
                )}
              >
                <button className="flex items-center justify-start rounded-xl p-2">
                  <div className="flex h-[20px] w-[20px] items-center justify-center ">
                    <Image
                      src={TaskIcon}
                      alt="Task Icon"
                      className="brightness-0 invert"
                    />
                  </div>
                  <div className="pl-1 text-sm font-medium">Messages</div>
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="w-full flex-wrap px-2 lg:w-[85%]">
        {currentTab === "RFQ" ? (
          <SellerChat />
        ) : productId ? (
          <ProductChat productId={productId} />
        ) : null}
        {currentTab === "Vendor Operations" ? <VendorOperations /> : null}
      </div>
    </section>
  );
};

export default SellerRfqRequestPage;
