import React, { useMemo } from "react";
import { getAmPm, parsedDays } from "@/utils/helper";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
// import TagInformationSection from "./TagInformationSection";
import EditIcon from "@/public/images/edit-icon.svg";
import Link from "next/link";
import ViewMultiTagSection from "./ViewMultiTagSection";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type BranchSectionProps = {
  branchDetails: any;
};

const BranchSection: React.FC<BranchSectionProps> = ({ branchDetails }) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const memoizedParsedDays = useMemo(
    () => parsedDays(branchDetails?.workingDays),
    [branchDetails?.workingDays],
  );

  return (
    <Accordion
      type="single"
      collapsible
      className="mb-5 w-full overflow-hidden rounded-lg border border-solid  border-gray-300"
    >
      <AccordionItem value="item-1" className="border-b-0 !bg-[#FAFAFA] px-3">
        <AccordionTrigger className="flex h-auto min-h-[48px] justify-between py-0 hover:!no-underline">
          <div className="flex w-full flex-wrap items-center justify-between px-2 py-4 md:flex-nowrap">
            <div className="flex w-auto items-start text-base font-medium text-color-dark">
              {branchDetails?.userBranchBusinessType?.map(
                (item: any, index: number, array: any[]) => (
                  <span className="mr-1.5" key={item?.id}>
                    {`${item?.userBranch_BusinessType_Tag?.tagName}${index !== array.length - 1 ? ", " : ""}`}
                  </span>
                ),
              )}
            </div>
            <p
              className={cn(
                branchDetails?.mainOffice === 1
                  ? "text-red-600"
                  : "text-dark-cyan",
                "text-base font-semibold leading-5",
              )}
              translate="no"
            >
              {branchDetails?.mainOffice === 1
                ? t("main_branch")
                : t("sub_branch")}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="w-full border-t border-solid border-gray-300 bg-white px-5 py-4">
            <div className="flex w-full items-center justify-between">
              <h2
                className="left-8 text-lg font-semibold text-color-dark"
                dir={langDir}
                translate="no"
              >
                {t("branch_information")}
              </h2>

              <Link
                href={`/company-profile/edit-branch?branchId=${branchDetails?.id}`}
                className="flex items-center rounded-md border-0 bg-dark-orange px-3 py-2 text-sm font-medium capitalize leading-6 text-white"
                dir={langDir}
                translate="no"
              >
                <Image
                  src={EditIcon}
                  height={18}
                  width={18}
                  className="mr-1"
                  alt="edit-icon"
                />
                {t("edit")}
              </Link>
            </div>
            <div className="flex w-full flex-wrap">
              <div className="sm:w-7/12">
                <div className="flex w-full flex-wrap py-4">
                  <div className="mr-1 flex w-4/12 items-center justify-start sm:mr-0">
                    <span
                      className="text-sm font-normal capitalize leading-4 text-gray-500"
                      dir={langDir}
                      translate="no"
                    >
                      {t("address")}:
                    </span>
                  </div>
                  <div className="mr-1 flex w-8/12  items-center justify-start sm:mr-0">
                    <p
                      className="text-base font-medium leading-4 text-color-dark"
                      dir={langDir}
                    >
                      {branchDetails?.address || "NA"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-5/12">
                <div className="flex w-full flex-wrap py-4">
                  <div className="mr-1 flex w-5/12 items-center justify-start sm:mr-0">
                    <span
                      className="text-sm font-normal capitalize leading-4 text-gray-500"
                      dir={langDir}
                      translate="no"
                    >
                      {t("country")}:
                    </span>
                  </div>
                  <div className="mr-1 flex w-7/12  items-center justify-start sm:mr-0">
                    <p
                      className="text-base font-medium capitalize leading-4 text-color-dark"
                      dir={langDir}
                    >
                      {branchDetails?.country || "NA"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-7/12">
                <div className="flex w-full flex-wrap py-4">
                  <div className="mr-1 flex w-4/12 items-center justify-start sm:mr-0">
                    <span
                      className="text-sm font-normal capitalize leading-4 text-gray-500"
                      dir={langDir}
                      translate="no"
                    >
                      {t("city")}:
                    </span>
                  </div>
                  <div className="mr-1 flex w-8/12  items-center justify-start sm:mr-0">
                    <p
                      className="text-base font-medium leading-4 text-color-dark"
                      dir={langDir}
                    >
                      {branchDetails?.city || "NA"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-5/12">
                <div className="flex w-full flex-wrap py-4">
                  <div className="mr-1 flex w-5/12 items-center justify-start sm:mr-0">
                    <span
                      className="text-sm font-normal capitalize leading-4 text-gray-500"
                      dir={langDir}
                      translate="no"
                    >
                      {t("branch_contact_number")}:
                    </span>
                  </div>
                  <div className="mr-1 flex w-7/12  items-center justify-start sm:mr-0">
                    <p
                      className="text-base font-medium leading-4 text-color-dark"
                      dir={langDir}
                    >
                      {branchDetails?.contactNumber || "NA"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-7/12">
                <div className="flex w-full flex-wrap py-4">
                  <div className="mr-1 flex w-4/12 items-center justify-start sm:mr-0">
                    <span
                      className="text-sm font-normal capitalize leading-4 text-gray-500"
                      dir={langDir}
                      translate="no"
                    >
                      {t("province")}:
                    </span>
                  </div>
                  <div className="mr-1 flex w-8/12  items-center justify-start sm:mr-0">
                    <p
                      className="text-base font-medium leading-4 text-color-dark"
                      dir={langDir}
                    >
                      {branchDetails?.province || "NA"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-5/12">
                <div className="flex w-full flex-wrap py-4">
                  <div className="mr-1 flex w-5/12 items-center justify-start sm:mr-0">
                    <span
                      className="text-sm font-normal capitalize leading-4 text-gray-500"
                      dir={langDir}
                      translate="no"
                    >
                      {t("branch_contact_name")}:
                    </span>
                  </div>
                  <div className="mr-1 flex w-7/12  items-center justify-start sm:mr-0">
                    <p
                      className="text-base font-medium leading-4 text-color-dark"
                      dir={langDir}
                    >
                      {branchDetails?.contactName || "NA"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-7/12">
                <div className="flex w-full flex-wrap py-4">
                  <div className="mr-1 flex w-4/12 items-center justify-start sm:mr-0">
                    <span
                      className="text-sm font-normal capitalize leading-4 text-gray-500"
                      dir={langDir}
                      translate="no"
                    >
                      {t("start_time")}:
                    </span>
                  </div>
                  <div className="mr-1 flex w-8/12  items-center justify-start sm:mr-0">
                    <p
                      className="text-base font-medium leading-4 text-color-dark"
                      dir={langDir}
                    >
                      {getAmPm(branchDetails?.startTime) || "NA"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-5/12">
                <div className="flex w-full flex-wrap py-4">
                  <div className="mr-1 flex w-5/12 items-center justify-start sm:mr-0">
                    <span
                      className="text-sm font-normal capitalize leading-4 text-gray-500"
                      dir={langDir}
                      translate="no"
                    >
                      {t("end_time")}:
                    </span>
                  </div>
                  <div className="mr-1 flex w-7/12  items-center justify-start sm:mr-0">
                    <p
                      className="text-base font-medium leading-4 text-color-dark"
                      dir={langDir}
                    >
                      {getAmPm(branchDetails?.endTime) || "NA"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-7/12">
                <div className="flex w-full flex-wrap py-4">
                  <div className="mr-1 flex w-4/12 items-center justify-start sm:mr-0">
                    <span
                      className="text-sm font-normal capitalize leading-4 text-gray-500"
                      dir={langDir}
                      translate="no"
                    >
                      {t("working_days")}:
                    </span>
                  </div>
                  <div className="mr-1 flex w-8/12  items-center justify-start sm:mr-0">
                    <p
                      className="text-base font-medium leading-4 text-color-dark"
                      dir={langDir}
                    >
                      {memoizedParsedDays || "NA"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-wrap">
                <div className="w-7/12">
                  <div className="flex w-full flex-wrap py-4">
                    <div className="mb-3 mr-1 flex w-full items-center justify-start sm:mr-0">
                      <span
                        className="text-sm font-normal capitalize leading-4 text-gray-500"
                        dir={langDir}
                        translate="no"
                      >
                        {t("branch_front_picture")}:
                      </span>
                    </div>
                    <div className="mr-1 flex w-full  items-center justify-start sm:mr-0">
                      <div
                        className="relative h-32 w-36 rounded-2xl border border-gray-300"
                        dir={langDir}
                      >
                        <Image
                          src={
                            branchDetails?.branchFrontPicture
                              ? branchDetails.branchFrontPicture
                              : "/images/no-image.jpg"
                          }
                          alt="branch-image"
                          className="object-contain"
                          fill
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-5/12">
                  <div className="flex w-full flex-wrap py-4">
                    <div className="mb-3 mr-1 flex w-full items-center justify-start sm:mr-0">
                      <span
                        className="text-sm font-normal capitalize leading-4 text-gray-500"
                        dir={langDir}
                        translate="no"
                      >
                        {t("address_proof")}
                      </span>
                    </div>
                    <div className="mr-1 flex w-full  items-center justify-start sm:mr-0">
                      <div
                        className="relative h-32 w-36 rounded-2xl border border-gray-300"
                        dir={langDir}
                      >
                        <Image
                          src={
                            branchDetails?.proofOfAddress
                              ? branchDetails.proofOfAddress
                              : "/images/no-image.jpg"
                          }
                          alt="branch-image"
                          className="object-contain"
                          fill
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <TagInformationSection tagDetails={branchDetails} /> */}
              <ViewMultiTagSection
                categoryDetails={branchDetails?.userBranch_userBranchCategory}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default BranchSection;
