"use client";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import {
  CURRENCIES,
  LANGUAGES,
  PRODUCT_CATEGORY_ID,
  PUREMOON_TOKEN_KEY,
  menuBarIconList,
} from "@/utils/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/apis/queries/user.queries";
import { getInitials, getOrCreateDeviceId } from "@/utils/helper";
import { useCategory } from "@/apis/queries/category.queries";
import { Button } from "@/components/ui/button";
import { useClickOutside } from "use-events";
import Link from "next/link";
import {
  useCartCountWithLogin,
  useCartCountWithoutLogin,
} from "@/apis/queries/cart.queries";
import { debounce, isArray } from "lodash";
import UnAuthUserIcon from "@/public/images/login.svg";
import WishlistIcon from "@/public/images/wishlist.svg";
import CartIcon from "@/public/images/cart.svg";
import HamburgerIcon from "@/public/images/humberger-icon.svg";
import HamburgerDownIcon from "@/public/images/humberger-down-icon.svg";
import LogoIcon from "@/public/images/logo-v2.png";
import { useWishlistCount } from "@/apis/queries/wishlist.queries";
import { signOut } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { MdOutlineImageNotSupported } from "react-icons/md";
import { useCategoryStore } from "@/lib/categoryStore";
import GoogleTranslate from "@/components/GoogleTranslate";
import { IoCloseOutline, IoCloseSharp } from "react-icons/io5";
import { IoIosMenu } from "react-icons/io";
import {
  PERMISSION_ORDERS,
  PERMISSION_PRODUCTS,
  PERMISSION_RFQ_QUOTES,
  PERMISSION_RFQ_SELLER_REQUESTS,
  PERMISSION_SELLER_REWARDS,
  PERMISSION_SHARE_LINKS,
  PERMISSION_TEAM_MEMBERS,
  getPermissions,
} from "@/helpers/permission";
import QueryForm from "@/components/modules/QueryForm";
import { useTranslations } from "next-intl";
import { cookies } from "next/headers";
import { setUserLocale } from "@/src/services/locale";
import { fetchIpInfo } from "@/apis/requests/ip.requests";

type CategoryProps = {
  id: number;
  parentId: number;
  name: string;
  icon: string;
  children: any;
};

type ButtonLinkProps = {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
};

const ButtonLink: React.FC<ButtonLinkProps> = ({
  href,
  onClick,
  children,
  className,
  ...props
}) => {
  return (
    <Link href={href} passHref legacyBehavior>
      <a onClick={onClick} {...props}>
        <button
          type="button"
          className="flex cursor-pointer text-sm font-semibold uppercase text-white md:px-8 md:py-10 md:text-sm lg:text-base xl:text-lg"
          onClick={onClick}
        >
          {children}
        </button>
      </a>
    </Link>
  );
};

const Header: React.FC<{ locale?: string }> = ({ locale = "en" }) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const permissions: string[] = getPermissions();
  const { toast } = useToast();
  const accessToken = getCookie(PUREMOON_TOKEN_KEY);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuId, setMenuId] = useState<string | number>();
  const [categoryId, setCategoryId] = useState();
  const [assignedToId, setAssignedToId] = useState();
  // const [subCategoryId, setSubCategoryId] = useState();
  const [subCategoryIndex, setSubCategoryIndex] = useState(0);
  const [subSubCategoryIndex, setSubSubCategoryIndex] = useState(0);
  const [subSubSubCategoryIndex, setSubSubSubCategoryIndex] = useState(0);
  const hasAccessToken = !!getCookie(PUREMOON_TOKEN_KEY);
  const deviceId = getOrCreateDeviceId() || "";
  const { clearUser, applyTranslation, langDir, changeCurrency } = useAuth();
  const wishlistCount = useWishlistCount(hasAccessToken);
  const cartCountWithLogin = useCartCountWithLogin(hasAccessToken);
  const cartCountWithoutLogin = useCartCountWithoutLogin(
    { deviceId },
    !hasAccessToken,
  );
  const category = useCategoryStore();
  const me = useMe(!!accessToken);
  const categoryQuery = useCategory("7");
  const subCategoryQuery = useCategory(
    PRODUCT_CATEGORY_ID.toString(), //categoryId ? categoryId : "",
    true, //!!categoryId,
  );

  const [searchTerm, setSearchTerm] = useState(searchParams?.get("term") || "");

  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  const [selectedLocale, setSelectedLocale] = useState<string>(locale || "en");
  const languages = [...LANGUAGES];

  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const currencies = [...CURRENCIES];

  // Debounced function to update URL
  const updateURL = debounce((newTerm) => {
    if (typeof window === "undefined") return; // Prevent SSR issues
    const params = new URLSearchParams(window.location.search);
    if (newTerm) {
      params.set("term", newTerm);
    } else {
      params.delete("term");
    }
    router.replace(`/trending?${params.toString()}`); // Update URL dynamically
  }, 500);

  const handleSearch = (event: any) => {
    const newTerm = event.target.value;
    setSearchTerm(newTerm);
    updateURL(newTerm);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleSearch(event);
    }
  };

  const memoizedInitials = useMemo(
    () => getInitials(me.data?.data?.firstName, me.data?.data?.lastName),
    [me.data?.data?.firstName, me.data?.data?.lastName],
  );

  const memoizedMenu = useMemo(() => {
    let tempArr: any = [];
    if (categoryQuery.data?.data) {
      tempArr = categoryQuery.data.data?.children?.map(
        (item: any, index: number) => {
          return {
            name: item.name,
            id: item.id,
            icon: menuBarIconList[index + 1],
          };
        },
      );
    }

    return tempArr || [];
  }, [categoryQuery.data?.data]);

  const memoizedCategory = useMemo(() => {
    let tempArr: any = [];
    if (categoryQuery.data?.data) {
      tempArr = categoryQuery.data.data?.children?.find(
        (item: { id: number }) => item.id === menuId,
      )?.children;
    }
    return tempArr || [];
  }, [categoryQuery.data?.data, menuId]);

  const memoizedSubCategory = useMemo(() => {
    let tempArr: any = [];
    if (subCategoryQuery.data?.data) {
      tempArr = subCategoryQuery.data.data?.children;
    }
    return tempArr || [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategoryQuery.data?.data, categoryId]);

  const handleProfile = () => {
    switch (me?.data?.data?.tradeRole) {
      case "BUYER":
        return "/buyer-profile-details";
      case "FREELANCER":
        return "/freelancer-profile-details";
      case "COMPANY":
        return "/company-profile-details";
      case "MEMBER":
        return "/member-profile-details";
      default:
        return "/home";
    }
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    deleteCookie(PUREMOON_TOKEN_KEY);
    queryClient.clear();
    clearUser();
    const data = await signOut({
      redirect: false,
      callbackUrl: "/home",
    });
    toast({
      title: t("logout_successful"),
      description: t("you_have_successfully_logged_out"),
      variant: "success",
    });

    router.push("/home");
  };

  const wrapperRef = useRef(null);
  const [isClickedOutside] = useClickOutside([wrapperRef], (event) => {});

  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const handleToggleQueryModal = () => setIsQueryModalOpen(!isQueryModalOpen);

  useEffect(() => {
    if (accessToken) {
      setIsLoggedIn(true);
    }
  }, [pathname, accessToken]);

  useEffect(() => {
    if (memoizedMenu.length) {
      setMenuId(memoizedMenu?.[1]?.id);
    }
  }, [memoizedMenu]);

  useEffect(() => {
    if (memoizedCategory.length) {
      setCategoryId(memoizedCategory?.[0]?.assignTo);
      setAssignedToId(memoizedCategory?.[0]?.id);
    }
  }, [memoizedCategory]);

  useEffect(() => {
    if (isClickedOutside) {
      setCategoryId(undefined);
    }
  }, [isClickedOutside]);

  useEffect(() => {
    const getIpInfo = async () => {
      try {
        if (!window?.localStorage?.ipInfo || getCookie("ipInfoLoaded") != "1") {
          const response = await fetchIpInfo();

          const ip = response.data.ip;
          if (ip) {
            let savedIpInfo = JSON.parse(
              window.localStorage.getItem("ipInfo") || "{}",
            );
            if (!savedIpInfo.ip || (savedIpInfo.ip && savedIpInfo.ip != ip)) {
              window.localStorage.setItem(
                "ipInfo",
                JSON.stringify(response.data),
              );

              let localeKey = response.data.languages.split(",")[0];
              if (localeKey.substr(0, 2) == "en") {
                localeKey = "en";
              }
              window.localStorage.setItem("locale", localeKey);
              applyTranslation(localeKey);

              setSelectedCurrency(response.data.currency || "USD");
              window.localStorage.setItem(
                "currency",
                response.data.currency || "USD",
              );
              changeCurrency(response.data.currency || "USD");
            }

            setCookie("ipInfoLoaded", "1");
          }
        } else {
          setSelectedCurrency(window.localStorage.currency || "USD");
          changeCurrency(window.localStorage.currency || "USD");
        }
      } catch (error) {}
    };

    if (typeof window !== "undefined") {
      getIpInfo();
    }

    let elem = document.querySelector(".goog-te-combo");
    if (elem) {
      // @ts-ignore
      elem.value = e.target.value;
      elem.dispatchEvent(new Event("change"));
      setTimeout(() => {
        let elem = document.querySelector(".goog-te-combo");
        // @ts-ignore
        if (elem && !elem.value) {
          // @ts-ignore
          elem.value = "ar";
          elem.dispatchEvent(new Event("change"));
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams?.get("term") || "");
  }, [searchParams]);

  const hideMenu = (permissionName: string): boolean => {
    if (
      me?.data?.data?.tradeRole === "MEMBER" &&
      !permissions.includes(permissionName)
    ) {
      return false;
    }
    return true;
  };

  return (
    <>
      <header className="relative w-full">
        <div className="w-full bg-dark-cyan">
          <div className="container m-auto px-3 pt-3">
            <div className="hidden sm:hidden md:flex md:gap-x-2.5">
              <div className="py-4 text-sm font-normal text-white md:w-4/12 lg:w-4/12">
                <p dir={langDir} translate="no">
                  {t("welcome")}
                </p>
              </div>
              <div className="flex justify-end py-4 text-sm font-normal text-white md:w-8/12 lg:w-8/12">
                <ul className="flex justify-end">
                  <li className="border-r border-solid border-white px-2 text-sm font-normal text-white">
                    <a href="#" dir={langDir} translate="no">
                      {t("store_location")}
                    </a>
                  </li>
                  {/* {me?.data?.data?.tradeRole === "BUYER" ? ( */}
                  <li className="border-r border-solid border-white px-2 text-sm font-normal text-white">
                    <Link href="/my-orders" dir={langDir} translate="no">
                      {t("track_your_order")}
                    </Link>
                  </li>
                  {/* ) : null} */}
                  <li className="border-r border-solid border-white px-2 text-sm font-normal text-white">
                    <select
                      dir={langDir}
                      className="border-0 bg-transparent text-white focus:outline-none"
                      value={selectedCurrency}
                      onChange={(e: any) => {
                        setSelectedCurrency(e.target?.value || "USD");
                        window.localStorage.setItem(
                          "currency",
                          e.target?.value || "USD",
                        );
                        changeCurrency(e.target.value || "USD");
                      }}
                    >
                      {currencies.map((item: { code: string }) => {
                        return (
                          <option
                            className="bg-dark-cyan"
                            value={item.code}
                            key={item.code}
                          >
                            {item.code}
                          </option>
                        );
                      })}
                    </select>
                  </li>
                  <li className="google_translate px-2 pr-0 text-sm font-normal text-white">
                    <GoogleTranslate />
                    <select
                      dir={langDir}
                      className="border-0 bg-transparent text-white focus:outline-none"
                      value={selectedLocale}
                      onChange={(e) => {
                        setSelectedLocale(e.target.value);
                        applyTranslation(e.target.value);
                        let elem = document.querySelector(".goog-te-combo");
                        if (elem) {
                          // @ts-ignore
                          elem.value = e.target.value;
                          elem.dispatchEvent(new Event("change"));
                          setTimeout(() => {
                            let elem = document.querySelector(".goog-te-combo");
                            // @ts-ignore
                            if (elem && !elem.value) {
                              // @ts-ignore
                              elem.value = "ar";
                              elem.dispatchEvent(new Event("change"));
                            }
                          }, 1000);
                        }
                      }}
                      // onChange={(e) => {
                      //   const newLocale = e.target.value;
                      //   setSelectedLocale(newLocale); // Update state
                      //   applyTranslation(newLocale); // Apply your translation logic

                      //   // Update Google Translate's combo box
                      //   let elem = document.querySelector(".goog-te-combo");
                      //   if (elem) {
                      //     // @ts-ignore
                      //     elem.value = newLocale;
                      //     elem.dispatchEvent(new Event("change"));
                      //   }

                      //   // Reload the page to reset the DOM
                      //   setTimeout(() => {
                      //     window.location.reload();
                      //   }, 100); // Small delay to ensure Google Translate applies the change
                      // }}
                    >
                      {languages.map(
                        (language: { locale: string; name: string }) => {
                          return (
                            <option
                              className="bg-dark-cyan"
                              key={language.locale}
                              value={language.locale}
                            >
                              {language.name}
                            </option>
                          );
                        },
                      )}
                      {/* <option className="bg-dark-cyan">German</option>
                      <option className="bg-dark-cyan">French</option> */}
                    </select>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center">
              <div className="order-1 !flex !w-5/12 flex-1 !items-center !py-4 md:!w-2/12 lg:!w-1/6">
                <Link href="/home">
                  <Image src={LogoIcon} alt="logo" />
                </Link>
              </div>
              <div className="order-3 flex w-[80%] items-center py-4 md:order-2 md:w-7/12 md:px-3 lg:w-4/6">
                {/* <div className="h-11 w-24 md:w-24 lg:w-auto">
                  <select className="h-full w-full focus:outline-none">
                    <option>All</option>
                    <option>Apps & Games</option>
                    <option>Beauty</option>
                    <option>Car & Motorbike</option>
                    <option>Clothing & Accessories</option>
                    <option>Computers & Accessories</option>
                    <option>Electronics</option>
                    <option>Movies & TV Shows</option>
                  </select>
                </div> */}
                <div className="h-11 w-3/4 border-l border-solid border-indigo-200 md:w-5/6">
                  <input
                    type="text"
                    className="form-control h-full w-full p-2.5 text-black focus:outline-none"
                    placeholder={t("global_search_placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown} // Calls search when Enter is pressed
                    dir={langDir}
                    translate="no"
                  />
                </div>
                <div className="h-11 w-1/4 md:w-1/6">
                  <button
                    type="button"
                    className="btn h-full w-full bg-dark-orange text-sm font-semibold text-white"
                    onClick={() => updateURL(searchTerm)} // Update URL when clicking search
                    dir={langDir}
                    translate="no"
                  >
                    {t("search")}
                  </button>
                </div>
              </div>
              <div className="order-2 flex w-7/12 justify-end sm:order-2 sm:w-7/12 md:order-3 md:w-3/12 md:py-4 lg:w-1/6">
                <ul className="flex items-center justify-end gap-x-4">
                  <li className="relative flex pb-3 pl-0 pr-1 pt-0">
                    <Link
                      href="/wishlist"
                      className="flex flex-wrap items-center"
                    >
                      <Image
                        src={WishlistIcon}
                        height={24}
                        width={28}
                        alt="wishlist"
                      />
                      <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-dark-orange text-xs font-bold text-white">
                        {wishlistCount.data?.data
                          ? wishlistCount.data?.data
                          : 0}
                      </div>
                    </Link>
                  </li>
                  <li className="relative flex pb-3 pl-0 pr-1 pt-0">
                    <Link href="/cart" className="flex flex-wrap items-center">
                      <Image
                        src={CartIcon}
                        height={29}
                        width={26}
                        alt="wishlist"
                      />
                      <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-dark-orange text-xs font-bold text-white">
                        {hasAccessToken
                          ? !isArray(cartCountWithLogin.data?.data)
                            ? cartCountWithLogin.data?.data
                            : 0
                          : !isArray(cartCountWithoutLogin.data?.data)
                            ? cartCountWithoutLogin.data?.data
                            : 0}
                      </div>
                    </Link>
                  </li>
                  <li className="relative flex">
                    {isLoggedIn ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-[44px] w-[44px]">
                          {me?.data?.data?.profilePicture ? (
                            <Image
                              src={me?.data?.data?.profilePicture}
                              alt="image-icon"
                              height={44}
                              width={44}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-[44px] w-[44px] rounded-full bg-gray-300">
                              <p className="p-2 text-lg font-bold">
                                {memoizedInitials}
                              </p>
                            </div>
                          )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <Link href={handleProfile()}>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              dir={langDir}
                              translate="no"
                            >
                              {t("profile_information")}
                            </DropdownMenuItem>
                          </Link>
                          {/* <DropdownMenuSeparator /> */}
                          {me?.data?.data?.tradeRole !== "BUYER" ? (
                            <>
                              {hideMenu(PERMISSION_TEAM_MEMBERS) ? (
                                <Link href="/team-members">
                                  <DropdownMenuItem
                                    dir={langDir}
                                    translate="no"
                                  >
                                    {t("team_members")}
                                  </DropdownMenuItem>
                                </Link>
                              ) : null}
                              {hideMenu(PERMISSION_PRODUCTS) ? (
                                <Link href="/manage-products">
                                  <DropdownMenuItem
                                    dir={langDir}
                                    translate="no"
                                  >
                                    {t("products")}
                                  </DropdownMenuItem>
                                </Link>
                              ) : null}
                              {hideMenu(PERMISSION_PRODUCTS) ? (
                                <Link href="/manage-services">
                                  <DropdownMenuItem
                                    dir={langDir}
                                    translate="no"
                                  >
                                    {t("services")}
                                  </DropdownMenuItem>
                                </Link>
                              ) : null}
                              {/* <DropdownMenuSeparator /> */}
                              {hideMenu(PERMISSION_ORDERS) ? (
                                <Link href="/seller-orders">
                                  <DropdownMenuItem
                                    dir={langDir}
                                    translate="no"
                                  >
                                    {t("orders")}
                                  </DropdownMenuItem>
                                </Link>
                              ) : null}
                              {/* <DropdownMenuSeparator /> */}
                              {hideMenu(PERMISSION_RFQ_QUOTES) ? (
                                <Link href="/rfq-quotes">
                                  <DropdownMenuItem
                                    dir={langDir}
                                    translate="no"
                                  >
                                    {t("rfq_quotes")}
                                  </DropdownMenuItem>
                                </Link>
                              ) : null}
                              {/* <DropdownMenuSeparator /> */}
                              {hideMenu(PERMISSION_RFQ_SELLER_REQUESTS) ? (
                                <Link href="/seller-rfq-request">
                                  <DropdownMenuItem
                                    dir={langDir}
                                    translate="no"
                                  >
                                    {t("rfq_seller_requests")}
                                  </DropdownMenuItem>
                                </Link>
                              ) : null}
                              {hideMenu(PERMISSION_SELLER_REWARDS) ? (
                                <Link href="/seller-rewards">
                                  <DropdownMenuItem
                                    dir={langDir}
                                    translate="no"
                                  >
                                    {t("seller_rewards")}
                                  </DropdownMenuItem>
                                </Link>
                              ) : null}
                              {/* <DropdownMenuSeparator /> */}
                            </>
                          ) : null}
                          {hideMenu(PERMISSION_SHARE_LINKS) ? (
                            <Link href="/share-links">
                              <DropdownMenuItem dir={langDir} translate="no">
                                {t("share_links")}
                              </DropdownMenuItem>
                            </Link>
                          ) : null}
                          <Link href="/my-settings/address">
                            <DropdownMenuItem dir={langDir} translate="no">
                              {t("my_settings")}
                            </DropdownMenuItem>
                          </Link>
                          <Link href="/transactions">
                            <DropdownMenuItem dir={langDir} translate="no">
                              {t("transactions")}
                            </DropdownMenuItem>
                          </Link>
                          <Link href="/queries">
                            <DropdownMenuItem dir={langDir} translate="no">
                              {t("queries")}
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          {/* <DropdownMenuSeparator /> */}
                          <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer"
                            dir={langDir}
                            translate="no"
                          >
                            {t("logout")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div dir={langDir}>
                        <Image
                          src={UnAuthUserIcon}
                          height={28}
                          width={28}
                          alt="login-avatar-icon"
                        />
                        <div className="flex flex-col">
                          <Link
                            href="/login"
                            className="ml-0 flex cursor-pointer flex-col flex-wrap items-start text-sm font-bold text-white"
                            dir={langDir}
                            translate="no"
                          >
                            {t("login")}
                          </Link>
                          <Link
                            href="/register"
                            className="ml-0 flex cursor-pointer flex-col flex-wrap items-start text-sm font-bold text-white"
                            dir={langDir}
                            translate="no"
                          >
                            {t("register")}
                          </Link>
                        </div>
                      </div>
                    )}
                  </li>
                </ul>
              </div>
              <div
                className="humberger sm:w-7/12md:w-3/12 flex w-[20%] justify-end md:py-4 lg:w-1/6"
                onClick={handleClick}
              >
                <IoIosMenu />
              </div>
            </div>

            <div
              className={`me menu h-[44px] w-full px-3 md:flex md:px-0 ${isActive ? "show_menu" : "hidden"}`}
            >
              <div className="close" onClick={handleClick}>
                <IoCloseOutline />
              </div>
              <div
                className="flex w-full flex-col flex-wrap items-start justify-start gap-x-1 py-1 md:flex-row md:justify-between"
                dir={langDir}
              >
                <ButtonLink
                  key={0}
                  onClick={() => {
                    setMenuId(0);
                    router.push("/home");
                  }}
                  href="/home"
                >
                  <div
                    className="flex gap-x-3"
                    onClick={handleClick}
                    translate="no"
                  >
                    <Image
                      src={menuBarIconList[0]}
                      alt={t("home")}
                      height={0}
                      width={0}
                      className="h-7 w-7"
                    />{" "}
                    {t("home")}
                  </div>
                </ButtonLink>
                {memoizedMenu.map((item: any) => {
                  return (
                    <ButtonLink
                      key={item.id}
                      onClick={() => {
                        setMenuId(item.id);
                        if (item.name.toLowerCase().includes("home")) {
                          router.push("/home");
                        }

                        if (item.name.toLowerCase().includes("store")) {
                          router.push("/trending");
                        }

                        if (item.name.toLowerCase().includes("buy group")) {
                          router.push("/buygroup");
                        }

                        if (item.name.toLowerCase().includes("rfq")) {
                          router.push("/rfq");
                        }
                        if (item.name.toLowerCase().includes("factories")) {
                          router.push("/factories");
                        }
                        if (item.name.toLowerCase().includes("service")) {
                          router.push("/services");
                        }
                      }}
                      href={
                        item.name.toLowerCase().includes("home")
                          ? "/home"
                          : item.name.toLowerCase().includes("store")
                            ? "/trending"
                            : item.name.toLowerCase().includes("rfq")
                              ? "/rfq"
                              : item.name.toLowerCase().includes("factories")
                                ? "/factories"
                                : item.name.toLowerCase().includes("service")
                                  ? "/services"
                                  : item.name
                                        .toLowerCase()
                                        .includes("buy group")
                                    ? "/buygroup"
                                    : "/trending"
                      }
                    >
                      <div className="flex gap-x-3" onClick={handleClick}>
                        <Image
                          src={item.icon}
                          alt={item?.name}
                          height={0}
                          width={0}
                          className="h-7 w-7"
                        />{" "}
                        <p>{item?.name}</p>
                      </div>
                    </ButtonLink>
                  );
                })}
              </div>
            </div>
            {/* <p
              className={`mt-4 ${isActive ? "font-bold text-green-500" : "text-black"}`}
            >
              {isActive
                ? "Active class added!"
                : "Click the button to add a class"}
            </p> */}
          </div>
        </div>

        <div className="w-full border-b border-solid border-gray-300 bg-white">
          <div className="container m-auto px-3">
            <div className="relative flex flex-row flex-wrap md:flex-nowrap">
              <div className="flex w-full flex-1 flex-wrap gap-x-3 md:w-auto md:gap-x-5">
                <div className="dropdown">
                  {pathname == "/trending" || pathname == "/buygroup" ? (
                    <button className="dropbtn flex items-center">
                      <div>
                        <Image src={HamburgerIcon} alt="hamburger-icon" />
                      </div>
                      <p
                        className="mx-3 text-sm font-normal capitalize text-color-dark sm:text-base md:text-lg"
                        translate="no"
                      >
                        {t("all_categories")}
                      </p>
                      <div>
                        <Image
                          src={HamburgerDownIcon}
                          alt="hamburger-down-icon"
                        />
                      </div>
                    </button>
                  ) : null}

                  {(pathname == "/trending" || pathname == "/buygroup") &&
                  memoizedSubCategory?.length ? (
                    <div className="dropdown-content">
                      {memoizedSubCategory?.map(
                        (item: CategoryProps, index: number) => (
                          <div
                            key={item?.id}
                            className={cn(
                              "dropdown-content-child flex cursor-pointer items-center justify-start gap-2 p-3",
                              memoizedSubCategory?.length
                                ? index === subCategoryIndex
                                  ? "dropdown-active-child"
                                  : null
                                : null,
                            )}
                            dir={langDir}
                            onMouseEnter={() => setSubCategoryIndex(index)}
                            onClick={() => {
                              setSubCategoryIndex(index);
                              category.setSubCategories(
                                memoizedSubCategory?.[subCategoryIndex]
                                  ?.children,
                              );
                              // category.setSubSubCategories([]);
                              category.setCategoryId(item?.id.toString());
                              // save index to check for child categories part of parent or not
                              category.setSubCategoryIndex(index);
                              category.setSubCategoryParentName(item?.name);
                              category.setSubSubCategoryParentName(
                                memoizedSubCategory?.[subCategoryIndex]
                                  ?.children?.[0]?.name,
                              );
                              category.setSubSubCategories(
                                memoizedSubCategory?.[subCategoryIndex]
                                  ?.children?.[0]?.children,
                              );

                              //reset for second level category active index
                              category.setSecondLevelCategoryIndex(0);

                              category.setCategoryIds(item?.id.toString());
                            }}
                          >
                            {item?.icon ? (
                              <Image
                                src={item.icon}
                                alt={item?.name}
                                height={24}
                                width={24}
                              />
                            ) : (
                              <MdOutlineImageNotSupported size={24} />
                            )}
                            <p
                              title={item?.name}
                              className="text-beat text-start text-sm"
                            >
                              {item?.name}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  ) : null}

                  {pathname == "/trending" || pathname == "/buygroup" ? (
                    memoizedSubCategory?.[subCategoryIndex]?.children
                      ?.length ? (
                      <div className="dropdown-content-second">
                        {memoizedSubCategory?.[subCategoryIndex]?.children?.map(
                          (item: CategoryProps, index: number) => (
                            <div
                              key={item?.id}
                              className={cn(
                                "dropdown-content-child flex cursor-pointer items-center justify-start gap-2 p-3",
                                memoizedSubCategory?.[subCategoryIndex]
                                  ?.children?.length
                                  ? index === subSubCategoryIndex
                                    ? "dropdown-active-child"
                                    : null
                                  : null,
                              )}
                              onMouseEnter={() => setSubSubCategoryIndex(index)}
                              onClick={() => {
                                setSubSubCategoryIndex(index);
                                category.setSubSubCategories(
                                  memoizedSubCategory?.[subCategoryIndex]
                                    ?.children?.[subSubCategoryIndex]?.children,
                                );
                                category.setCategoryId(item?.id.toString());
                                category.setSecondLevelCategoryIndex(index);
                                category.setSubSubCategoryParentName(
                                  item?.name,
                                );
                                //FIXME: need condition
                                if (
                                  category.subCategoryIndex !== subCategoryIndex
                                ) {
                                  category.setSubCategories([]);
                                  category.setSubCategoryParentName("");
                                }
                                category.setCategoryIds(
                                  [
                                    memoizedSubCategory?.[
                                      subCategoryIndex
                                    ]?.id.toString(),
                                    item?.id.toString(),
                                  ].join(","),
                                );
                              }}
                              dir={langDir}
                            >
                              {item?.icon ? (
                                <Image
                                  src={item.icon}
                                  alt={item?.name}
                                  height={24}
                                  width={24}
                                />
                              ) : (
                                <MdOutlineImageNotSupported size={24} />
                              )}
                              <p
                                title={item?.name}
                                className="text-beat text-start text-sm"
                              >
                                {item?.name}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    ) : null
                  ) : null}

                  {(pathname == "/trending" || pathname == "/buygroup") &&
                  memoizedSubCategory?.[subCategoryIndex]?.children?.[
                    subSubCategoryIndex
                  ]?.children?.length ? (
                    <div className="dropdown-content-third p-3">
                      <h4 className="mb-2 text-sm" dir={langDir}>
                        {memoizedSubCategory?.[subCategoryIndex]?.children?.[
                          subSubCategoryIndex
                        ]?.name || ""}
                      </h4>
                      <div className="flex flex-col sm:grid sm:grid-cols-5">
                        {memoizedSubCategory?.[subCategoryIndex]?.children?.[
                          subSubCategoryIndex
                        ]?.children?.map(
                          (item: CategoryProps, index: number) => (
                            <div
                              key={item?.id}
                              className={cn(
                                "dropdown-content-child flex cursor-pointer flex-row items-center justify-start gap-2 p-3 sm:flex-col",
                                memoizedSubCategory?.[subCategoryIndex]
                                  ?.children?.[subSubCategoryIndex]?.children
                                  ?.length
                                  ? index === subSubSubCategoryIndex
                                    ? "dropdown-active-child"
                                    : null
                                  : null,
                              )}
                              onMouseEnter={() =>
                                setSubSubSubCategoryIndex(index)
                              }
                              onClick={() => {
                                setSubSubSubCategoryIndex(index);
                                category.setCategoryId(item?.id.toString());
                                category.setCategoryIds(
                                  [
                                    memoizedSubCategory?.[
                                      subCategoryIndex
                                    ]?.id.toString(),
                                    memoizedSubCategory?.[
                                      subCategoryIndex
                                    ]?.children?.[
                                      subSubCategoryIndex
                                    ]?.id.toString(),
                                    item?.id.toString(),
                                  ].join(","),
                                );
                              }}
                              dir={langDir}
                            >
                              <div className="relative h-8 w-8">
                                {item?.icon ? (
                                  <Image
                                    src={item.icon}
                                    alt={item?.name}
                                    // height={30}
                                    // width={30}
                                    fill
                                    className="object-contain"
                                  />
                                ) : (
                                  <MdOutlineImageNotSupported size={30} />
                                )}
                              </div>
                              <p
                                title={item?.name}
                                className="text-beat text-center text-sm"
                              >
                                {item?.name}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {pathname == "/trending" || pathname == "/buygroup" ? (
                  <div
                    className="flex items-center gap-x-1 md:gap-x-5"
                    dir={langDir}
                  >
                    {memoizedCategory.map((item: any) => (
                      <Button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          if (item?.assignTo) {
                            setCategoryId(item.assignTo);
                            setAssignedToId(item.id);
                          } else {
                            setCategoryId(undefined);
                            setAssignedToId(undefined);
                          }
                        }}
                        variant="link"
                        className={cn(
                          "p-1 text-sm font-semibold capitalize text-color-dark sm:text-base md:py-3",
                          item?.id === assignedToId
                            ? "underline"
                            : "no-underline",
                        )}
                      >
                        <p>{item.name}</p>
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex w-full items-center justify-end md:w-auto">
                <ul className="flex items-center justify-end gap-x-4">
                  <li className="py-1.5 text-sm font-normal capitalize text-light-gray sm:text-base md:text-lg">
                    <a href="#" className="text-light-gray" translate="no">
                      {t("buyer_central")}
                    </a>
                  </li>
                  <li className="py-1.5 text-sm font-normal capitalize text-light-gray sm:text-base md:text-lg">
                    <a
                      href="#"
                      className="text-light-gray"
                      onClick={handleToggleQueryModal}
                      translate="no"
                    >
                      {t("help_center")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Dialog open={isQueryModalOpen} onOpenChange={handleToggleQueryModal}>
        <DialogContent
          className="add-new-address-modal add_member_modal gap-0 p-0 md:!max-w-2xl"
          ref={wrapperRef}
        >
          <QueryForm onClose={handleToggleQueryModal} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
