import React from "react";
import Image from "next/image";
import EmailIcon from "@/public/images/email.svg";
import PhoneCallIcon from "@/public/images/phone-call.svg";
import { useVendorDetails } from "@/apis/queries/product.queries";
import { COMPANY_UNIQUE_ID } from "@/utils/constants";
import NoImagePlaceholder from "@/public/images/no-image.jpg";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type VendorSectionProps = {
  adminId?: string;
};

const VendorSection: React.FC<VendorSectionProps> = ({ adminId }) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const vendorQuery = useVendorDetails(
    {
      adminId: adminId || "",
    },
    !!adminId,
  );

  const vendor = vendorQuery.data?.data;

  return vendorQuery.isLoading ? (
    <div className="mx-auto min-h-[240px] w-full rounded-2xl border border-gray-300 p-4">
      <div className="flex animate-pulse space-x-4">
        <div className="h-[89px] w-[89px] rounded-full bg-gray-300"></div>
        <div className="max-w-sm flex-1 space-y-6 py-1">
          <div className="h-2 rounded bg-gray-300"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-2 rounded bg-gray-300"></div>
              <div className="col-span-1 h-2 rounded bg-gray-300"></div>
            </div>
            <div className="h-2 rounded bg-gray-300"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1 h-2 rounded bg-gray-300"></div>
              <div className="col-span-1 h-2 rounded bg-gray-300"></div>
            </div>
            <div className="h-2 rounded bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="vendor-information-card-ui">
      <div className="vendor-image relative">
        <Image
          src={
            vendor?.profilePicture ? vendor.profilePicture : NoImagePlaceholder
          }
          alt="image-icon"
          className="rounded-2xl object-cover"
          fill
          sizes="(100vw, 100vh)"
        />
      </div>
      <div className="vendor-info">
        <Link
          href={
            vendor?.tradeRole === "COMPANY"
              ? `/company-profile-details?userId=${adminId}`
              : vendor?.tradeRole === "FREELANCER"
                ? `/freelancer-profile-details?userId=${adminId}`
                : "#"
          }
        >
          <h2>
            {vendor?.firstName} {vendor?.lastName}
          </h2>
        </Link>
        <ul className="vendor-contact-info">
          <li>
            <a href="mailto:test@gmail.com">
              <span className="icon">
                <Image src={EmailIcon} alt="email-icon" />
              </span>
              <span className="text">{vendor?.email || "-"}</span>
            </a>
          </li>
          <li>
            <a href="tel:1234567890">
              <span className="icon">
                <Image src={PhoneCallIcon} alt="phone-icon" />
              </span>
              <span className="text">{vendor?.phoneNumber || "-"}</span>
            </a>
          </li>
        </ul>
        <h5 dir={langDir} translate="no">{t("business_type")}</h5>
        <div className="tagLists">
          <div className="tagItem">
            {vendor?.userProfile
              ?.map((item: any) => item?.userProfileBusinessType)
              ?.flat()
              ?.map((item: any) => (
                <div key={item?.id} className="tagIbox mr-2">
                  {item?.userProfileBusinessTypeTag?.tagName}
                </div>
              ))}
          </div>
        </div>
        <h5 dir={langDir} translate="no">
          {t("company_id")}:{" "}
          <strong>
            {vendor?.uniqueId
              ? `${COMPANY_UNIQUE_ID}${vendor?.uniqueId}`
              : "NA"}
          </strong>
        </h5>
      </div>
    </div>
  );
};

export default VendorSection;
