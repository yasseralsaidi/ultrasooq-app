import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import validator from "validator";
import { TrendingProduct } from "@/utils/types/common.types";
import Link from "next/link";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type ProducTableProps = {
    list: TrendingProduct[];
};

const ServiceTable: React.FC<any> = ({ list }) => {
    const t = useTranslations();
    const { user, langDir, currency } = useAuth();

    const calculateDiscountedPrice = ({ item }: { item: any }) => {
        const price = item.productProductPrice ? Number(item.productProductPrice) : 0;
        let discount = item.consumerDiscount || 0;
        let discountType = item.consumerDiscountType;
        if (user?.tradeRole && user?.tradeRole != 'BUYER') {
            discount = item.vendorDiscount || 0;
            discountType = item.vendorDiscountType;
        }
        if (discountType == 'PERCENTAGE') {
            return Number((price - (price * discount) / 100).toFixed(2));
        }
        return Number((price - discount).toFixed(2));
    };

    return (
        <CardContent className="main-content w-full">
            <Card className="main-content-card !p-0 shadow-none">
                <div className="table-responsive theme-table-s1">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead dir={langDir} translate="no">{t("product")}</TableHead>
                                <TableHead dir={langDir} translate="no">{t("category")}</TableHead>
                                {/* <TableHead>SKU No</TableHead> */}
                                <TableHead dir={langDir} translate="no">{t("brand")}</TableHead>
                                <TableHead dir={langDir} translate="no">{t("price")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list?.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell th-name="Product">
                                        <Link href={`/trending/${item.id}`}>
                                            <figure className="product-image-with-text">
                                                <div className="image-container rounded-lg">
                                                    <Image
                                                        src={
                                                            item?.images?.[0]?.url && validator.isURL(item.images[0].url)
                                                                ? item.images[0].url
                                                                : PlaceholderImage
                                                        }
                                                        alt="product-image"
                                                        height={80}
                                                        width={80}
                                                    />
                                                </div>
                                                <figcaption>{item?.serviceName}</figcaption>
                                            </figure>
                                        </Link>
                                    </TableCell>
                                    {/* <TableCell th-name="Category">{item?.categoryName}</TableCell> */}
                                    {/* <TableCell th-name="SKU No">{item?.skuNo}</TableCell> */}
                                    {/* <TableCell th-name="Brand">{item?.brandName}</TableCell> */}
                                    {/* <TableCell th-name="Price">
                                        {item?.askForPrice === "true" ? (
                                            <Link href={`/seller-rfq-request?product_id=${item?.id}`}>
                                                <button
                                                    type="button"
                                                    className="inline-block rounded-sm bg-color-yellow px-3 py-1 text-sm font-bold text-white"
                                                    dir={langDir}
                                                    translate="no"
                                                >
                                                    {t("ask_vendor_for_price")}
                                                </button>
                                            </Link>
                                        ) : (
                                            `${currency.symbol}${calculateDiscountedPrice({ item })}`
                                        )}
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </CardContent>
    );
};

export default ServiceTable;
