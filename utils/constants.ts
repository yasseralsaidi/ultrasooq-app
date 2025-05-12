import HomeIcon from "@/public/images/menu-icon-home.svg";
import TrendingIcon from "@/public/images/menu-icon-trending.svg";
import BuyIcon from "@/public/images/menu-icon-buy.svg";
import PosIcon from "@/public/images/menu-icon-pos.svg";
import RfqIcon from "@/public/images/menu-icon-rfq.svg";
import ServiceIcon from "@/public/images/menu-icon-service.svg";

export const PUREMOON_TOKEN_KEY: string = "puremoon_accessToken";
export const PUREMOON_TEMP_TOKEN_KEY: string = "puremoon_temp_accessToken";

export const DAYS_OF_WEEK: {
  label: string;
  value: string;
}[] = [
  {
    label: "Sun",
    value: "sun",
  },
  {
    label: "Mon",
    value: "mon",
  },
  {
    label: "Tues",
    value: "tue",
  },
  {
    label: "Wed",
    value: "wed",
  },
  {
    label: "Thurs",
    value: "thu",
  },
  {
    label: "Fri",
    value: "fri",
  },
  {
    label: "Sat",
    value: "sat",
  },
];

export const SOCIAL_MEDIA_LIST: {
  label: string;
  value: string;
  icon: string;
}[] = [
  {
    label: "Facebook",
    value: "facebook",
    icon: "/images/social-facebook-icon.svg",
  },
  {
    label: "Twitter",
    value: "twitter",
    icon: "/images/social-twitter-icon.svg",
  },
  {
    label: "Instagram",
    value: "instagram",
    icon: "/images/social-instagram-icon.svg",
  },
  {
    label: "LinkedIn",
    value: "linkedIn",
    icon: "/images/social-linkedin-icon.svg",
  },
];

export const SOCIAL_MEDIA_ICON: Record<string, string> = {
  facebook: "/images/social-facebook-icon.svg",
  twitter: "/images/social-twitter-icon.svg",
  instagram: "/images/social-instagram-icon.svg",
  linkedIn: "/images/social-linkedin-icon.svg",
};

export const TAG_LIST: { label: string; value: string }[] = [
  { label: "online shope", value: "online_shope" },
  { label: "manufacturer / factory", value: "manufacturer_factory" },
  { label: "trading company", value: "trading_company" },
  { label: "distributor / wholesaler", value: "distributor_wholesaler" },
  { label: "retailer", value: "retailer" },
  { label: "individual", value: "individual" },
  { label: "other", value: "other" },
  { label: "service provider", value: "service_provider" },
];

export const BUSINESS_TYPE_LIST: { label: string; value: string }[] = [
  { label: "individual", value: "individual" },
  { label: "other", value: "other" },
  { label: "service provider", value: "service_provider" },
];

export const DAYS_NAME_LIST: { [key: string]: string } = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

export const FREELANCER_UNIQUE_ID = "PUREFW";
export const COMPANY_UNIQUE_ID = "PUREFC";
export const MEMBER_UNIQUE_ID = "PUREFM";

export const WEEKDAYS_LIST = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const EMAIL_REGEX_LOWERCASE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

export const ALPHABETS_REGEX = /^[a-zA-Z\s]*$/;

export const ALPHANUMERIC_REGEX = /^[0-9a-zA-Z\s]*$/;

export const HOURS_24_FORMAT = [
  "00:00",
  "00:30",
  "01:00",
  "01:30",
  "02:00",
  "02:30",
  "03:00",
  "03:30",
  "04:00",
  "04:30",
  "05:00",
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
];

export const menuBarIconList: string[] = [
  HomeIcon,
  TrendingIcon,
  BuyIcon,
  PosIcon,
  RfqIcon,
  ServiceIcon,
];

// TODO: remove later
export const ADMIN_BEARER =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxfSwic3ViIjoxLCJpYXQiOjE3MTAzMTI0NTksImV4cCI6MTc0MTg3MDA1OX0.XiU8kkLVYPBxZ5dy8tk8XP5ooVTrAJTvlOUfqbrLyHI";

export const TRADE_ROLE_LIST: { label: string; value: string }[] = [
  {
    label: "Buyer",
    value: "BUYER",
  },
  {
    label: "Freelancer",
    value: "FREELANCER",
  },
  {
    label: "Company",
    value: "COMPANY",
  },
];

export const GENDER_LIST: { label: string; value: string }[] = [
  {
    label: "Male",
    value: "MALE",
  },
  {
    label: "Female",
    value: "FEMALE",
  },
];

export const NO_OF_EMPLOYEES_LIST: { label: string; value: string }[] = [
  {
    label: "1-10",
    value: "1-10",
  },
  {
    label: "10-50",
    value: "10-50",
  },
  {
    label: "50-100",
    value: "50-100",
  },
  {
    label: "100-500",
    value: "100-500",
  },
  {
    label: "500+",
    value: "500+",
  },
];

export const INPUT_TYPE_LIST: { label: string; value: string }[] = [
  {
    label: "Text",
    value: "text",
  },
  {
    label: "Number",
    value: "number",
  },
];

export const SIZE_LIST: { label: string; value: string }[] = [
  {
    label: "Full",
    value: "full",
  },
  {
    label: "Small",
    value: "small",
  },
];

export const DELIVERY_STATUS: { [key: string]: string } = {
  CONFIRMED: "order_placed",
  SHIPPED: "order_shipped",
  OFD: "order_out_for_delivery",
  DELIVERED: "order_delivered",
  CANCELLED: "order_cancelled",
};

export const SELLER_DELIVERY_STATUS: { [key: string]: string } = {
  CONFIRMED: "order_placed",
  SHIPPED: "order_shipped",
  OFD: "order_out_for_delivery",
  DELIVERED: "order_delivered",
  CANCELLED: "order_cancelled",
};

export const STATUS_LIST: { label: string; value: string }[] = [
  {
    label: "Confirmed",
    value: "CONFIRMED",
  },
  {
    label: "Shipped",
    value: "SHIPPED",
  },
  {
    label: "On the way",
    value: "OFD",
  },
  {
    label: "Delivered",
    value: "DELIVERED",
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
  },
];

export const formattedDate = (formatDate: string) =>
  new Date(formatDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const videoExtensions: string[] = ["mp4", "mkv", "avi", "mov", "wmv"];
export const imageExtensions: string[] = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "bmp",
  "webp",
];

export const CONSUMER_TYPE_LIST = [
  {
    label: "consumer",
    value: "CONSUMER",
  },
  {
    label: "vendor",
    value: "VENDORS",
  },
  {
    label: "everyone",
    value: "EVERYONE",
  },
];

export const SELL_TYPE_LIST = [
  {
    label: "normal_sell",
    value: "NORMALSELL",
  },
  {
    label: "buy_group",
    value: "BUYGROUP",
  },
];

export const DELIVER_AFTER_LIST = [
  {
    label: "1",
    value: 1,
  },
  {
    label: "2",
    value: 2,
  },
  {
    label: "3",
    value: 3,
  },
  {
    label: "4",
    value: 4,
  },
  {
    label: "5",
    value: 5,
  },
  {
    label: "6",
    value: 6,
  },
  {
    label: "7",
    value: 7,
  },
];

export const PRODUCT_CONDITION_LIST = [
  {
    label: "new",
    value: "NEW",
  },
  {
    label: "old",
    value: "OLD",
  },
];

export const MONTHS: string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const CHAT_REQUEST_MESSAGE = {
  priceRequest: {
    value: "Requested for Offer Price ",
  },
};

export const STORE_MENU_ID = 8;
export const BUYGROUP_MENU_ID = 9;
export const FACTORIES_MENU_ID = 10;
export const RFQ_MENU_ID = 11;

export const PRODUCT_CATEGORY_ID = 4;
export const SERVICE_CATEGORY_ID = 6;
export const BUSINESS_TYPE_CATEGORY_ID = 5;

export const LANGUAGES = [
  {
    locale: 'en',
    name: 'English',
    direction: 'ltr',
  },
  {
    locale: 'ar',
    name: 'Arabic',
    direction: 'rtl',
  }
];

export const CURRENCIES = [
  {
    code: 'INR',
    symbol: '₹'
  },
  {
    code: 'USD',
    symbol: '$'
  },
  {
    code: 'AUD',
    symbol: '$'
  }
];
