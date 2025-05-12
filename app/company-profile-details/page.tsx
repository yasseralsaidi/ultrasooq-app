"use client";
import { useMe } from "@/apis/queries/user.queries";
import BranchSection from "@/components/modules/companyProfileDetails/BranchSection";
import InformationSection from "@/components/modules/companyProfileDetails/InformationSection";
import MoreInformationSection from "@/components/modules/companyProfileDetails/MoreInformationSection";
import ProfileCard from "@/components/modules/companyProfileDetails/ProfileCard";
import ReviewSection from "@/components/modules/freelancerProfileDetails/ReviewSection";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon } from "@radix-ui/react-icons";
import ProductsSection from "@/components/modules/freelancerProfileDetails/ProductsSection";
import Footer from "@/components/shared/Footer";
import { useVendorDetails } from "@/apis/queries/product.queries";
import VendorCard from "@/components/modules/companyProfileDetails/VendorCard";
import VendorBranchSection from "@/components/modules/companyProfileDetails/VendorBranchSection";
import VendorInformationSection from "@/components/modules/companyProfileDetails/VendorInformationSection";
import VendorMoreInformationSection from "@/components/modules/companyProfileDetails/VendorMoreInfomationSection";
import BackgroundImage from "@/public/images/before-login-bg.png";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

export default function CompanyProfileDetailsPage() {
  const t = useTranslations();
  const { langDir } = useAuth();
  const [activeTab, setActiveTab] = useState("profile-info");
  const [activeSellerId, setActiveSellerId] = useState<string | null>();

  const me = useMe();

  const vendorQuery = useVendorDetails(
    {
      adminId: activeSellerId || "",
    },
    !!activeSellerId,
  );

  const vendor = vendorQuery.data?.data;

  useEffect(() => {
    const params = new URLSearchParams(document.location.search);
    let sellerId = params.get("userId");
    let type = params.get("type");

    setActiveSellerId(sellerId);
    setActiveTab(type || "profile-info");
  }, []);

  return (
    <>
      <section className="relative w-full py-7">
        <div className="absolute left-0 top-0 -z-10 h-full w-full">
          <Image
            src={BackgroundImage}
            className="h-full w-full object-cover object-center"
            alt="background"
            fill
            priority
            sizes="(100vw, 100vh)"
          />
        </div>
        <div className="container relative z-10 m-auto px-3">
          <div className="flex flex-wrap">
            <div className="mb-7 w-full">
              <h2
                className="text-2xl font-semibold leading-10 text-color-dark md:text-4xl"
                dir={langDir}
                translate="no"
              >
                {t("my_profile")}
              </h2>
            </div>

            {!activeSellerId ? (
              <ProfileCard userDetails={me.data?.data} />
            ) : null}

            {activeSellerId ? (
              <VendorCard vendor={vendor} isLoading={vendorQuery.isLoading} />
            ) : null}

            <div className="mt-6 w-full md:mt-12">
              <Tabs
                onValueChange={(e) => setActiveTab(e)}
                value={activeTab}
                // @ts-ignore
                dir={langDir}
              >
                <TabsList className="mb-0 flex h-auto grid-cols-3 flex-wrap justify-start gap-4 rounded-none bg-transparent px-0 pt-3 sm:mb-1 sm:gap-x-6 md:grid md:min-h-[80px] md:w-[560px] md:pt-7">
                  <TabsTrigger
                    value="profile-info"
                    className="w-auto rounded-b-none !bg-[#d1d5db] px-2 py-2 text-sm font-bold !text-[#71717A] data-[state=active]:!bg-dark-orange data-[state=active]:!text-white sm:w-auto md:w-full md:px-3 md:py-4 md:text-base"
                    translate="no"
                  >
                    {t("profile_info")}
                  </TabsTrigger>

                  <TabsTrigger
                    value="ratings"
                    className="w-auto rounded-b-none !bg-[#d1d5db] px-2 py-2 text-sm font-bold !text-[#71717A] data-[state=active]:!bg-dark-orange data-[state=active]:!text-white sm:w-auto md:w-full md:py-4 md:text-base"
                    translate="no"
                  >
                    {t("ratings_n_reviews")}
                  </TabsTrigger>

                  <TabsTrigger
                    value="products"
                    className="w-auto rounded-b-none !bg-[#d1d5db] px-2 py-2 text-sm font-bold !text-[#71717A] data-[state=active]:!bg-dark-orange data-[state=active]:!text-white sm:w-auto md:w-full md:py-4 md:text-base"
                    translate="no"
                  >
                    {t("products")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="profile-info" className="mt-0">
                  <div className="w-full rounded-b-3xl border border-solid border-gray-300 bg-white px-2 py-2 shadow-md sm:px-6 sm:pb-4 sm:pt-8 md:px-9 md:pb-7 md:pt-12">
                    {!activeSellerId ? (
                      <InformationSection userDetails={me.data?.data} />
                    ) : null}

                    {activeSellerId ? (
                      <VendorInformationSection vendor={vendor} />
                    ) : null}

                    {!activeSellerId && me.data?.data?.userBranch?.length ? (
                      <MoreInformationSection userDetails={me.data?.data} />
                    ) : null}

                    {activeSellerId && vendor?.userBranch?.length ? (
                      <VendorMoreInformationSection vendor={vendor} />
                    ) : null}

                    {/* Branch Section */}
                    {!me.data?.data?.userBranch?.length ? (
                      <p
                        className="pt-5 text-center text-lg font-medium text-color-dark"
                        dir={langDir}
                        translate="no"
                      >
                        {t("no_branch_exists")}
                      </p>
                    ) : null}
                    <div className="mb-4 w-full pt-4">
                      {!activeSellerId ? (
                        <div className="mb-5 flex w-full items-center justify-end">
                          <Link
                            href={
                              !me.data?.data?.userBranch?.length
                                ? "/company-profile"
                                : "/company-profile/add-branch"
                            }
                            className="flex items-center rounded-md border-0 bg-dark-orange px-3 py-2 text-xs font-medium capitalize leading-6 text-white sm:text-sm"
                            dir={langDir}
                            translate="no"
                          >
                            <PlusIcon className="mr-1 h-5 w-5" />
                            {t("add")}
                          </Link>
                        </div>
                      ) : null}
                      {!activeSellerId ?
                        me.data?.data?.userBranch
                          .sort(
                            (a: any, b: any) => b?.mainOffice - a?.mainOffice,
                          )
                          .map((item: any) => (
                            <React.Fragment key={item.id}>
                              <BranchSection branchDetails={item} />
                            </React.Fragment>
                          )) : null}

                      {activeSellerId ?
                        vendor?.userBranch
                          .sort(
                            (a: any, b: any) => b?.mainOffice - a?.mainOffice,
                          )
                          .map((item: any) => (
                            <React.Fragment key={item.id}>
                              <VendorBranchSection branchDetails={item} />
                            </React.Fragment>
                          )) : null}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="ratings" className="mt-0">
                  <div className="w-full rounded-b-3xl border border-solid border-gray-300 bg-white px-2 py-2 shadow-md sm:px-6 sm:pb-4 sm:pt-8 md:px-9 md:pb-7 md:pt-12">
                    {/* importing from freelancer details module */}
                    <ReviewSection
                      sellerId={
                        activeSellerId
                          ? (activeSellerId as string)
                          : me.data?.data?.id
                      }
                    />
                  </div>
                </TabsContent>
                <TabsContent value="products" className="mt-0">
                  <div className="w-full rounded-b-3xl border border-solid border-gray-300 bg-white px-2 py-2 shadow-md sm:px-6 sm:pb-4 sm:pt-8 md:px-9 md:pb-7 md:pt-12">
                    {/* importing from freelancer details module */}
                    <ProductsSection sellerId={activeSellerId as string} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
