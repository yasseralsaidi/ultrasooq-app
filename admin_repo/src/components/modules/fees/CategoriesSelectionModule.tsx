import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { useCategoryById } from "../../../apis/queries/category.queries";

type CategoriesSelectionModuleProps = {
    categoriesSelected: {} | {[key: number]: number};
    onSelectCategory: (categories: {categoryId: number, categoryLocation: string}[]) => void;
};

const CategoriesSelectionModule: React.FC<CategoriesSelectionModuleProps> = ({ 
    categoriesSelected, 
    onSelectCategory 
}) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [activeAccordionIds, setActiveAccordionIds] = useState<any>([]);
    const [categoryIds, setCategoryIds] = useState<any[]>([]);

    const categoryQuery = useCategoryById("151", true);

    useEffect(() => {
        setSelectedCategories(Object.keys(categoriesSelected).map(id => Number(id)));
    }, [categoriesSelected]);

    useEffect(() => {
        setCategories(categoryQuery?.data?.data?.children?.filter((item: any) => {
            return item.id == 184 || item.id == 185
        }) || []);
    }, [categoryQuery?.data]);

    useEffect(() => {
        setCategoryIds(recusreItems(categories, [], {}));
    }, [categories]);

    const recusreItems = (items: any[], parents: number[], parentChild: any) => {
        for (let item of items) {
            let array = [...parents, item.id];
            parentChild[item.id] = array;
            if (item.children) recusreItems(item.children, [...array], parentChild)
        }

        return parentChild;
    };

    useEffect(() => {
        onSelectCategory(selectedCategories.map((category: number) => {
            return {
                categoryId: category,
                categoryLocation: categoryIds[category].join(',')
            }
        }));
    }, [selectedCategories])

    const findChildren = (item: any) => {
        if (!selectedCategories.includes(Number(item.id))) {
            setSelectedCategories((pre) => [...pre, Number(item.id)])
        }
        if (item?.children && item?.children.length > 0) {
            for (const child of item.children) {
                if (child?.children && child?.children?.length > 0) {
                    findChildren(child)
                } else {
                    if (!selectedCategories.includes(Number(child.id))) {
                        setSelectedCategories((pre) => [...pre, Number(child.id)])
                    }
                }
            }
        }
    }

    const removeChildren = (item: any) => {
        setSelectedCategories((pre) => pre.filter((id: number) => id !== Number(item.id)));
        if (item?.children && item?.children.length > 0) {
            for (const child of item.children) {
                if (child?.children && child?.children?.length > 0) {
                    removeChildren(child);
                } else {
                    setSelectedCategories((pre) => pre.filter((id: number) => id !== Number(child.id)));
                }
            }
        }
    }

    const toggleCategorySelect = (event: any, item: any) => {
        if (selectedCategories.includes(Number(item.id))) {
            removeChildren(item);
        } else {
            findChildren(item);
        }
    };

    const handleAccordion = (item: any) => {
        if (!item.children?.length) return;
        if (activeAccordionIds.includes(item.id)) {
            setActiveAccordionIds(activeAccordionIds.filter((id: number) => id !== item.id));
        } else {
            setActiveAccordionIds((prevState: any) => [...prevState, item.id,]);
        }
    }

    const recursiveRenderList = (list: any, prevIndex: number, parentData = null) => {
        return list.map((item: any) => (
            <div key={item.id} className="category-nested-accordion-item cursor-pointer">
                <div className={classNames("category-accordion-header", activeAccordionIds.includes(item.id) ? " active" : "")} >
                    <div className="lediv">
                        <div className={classNames("div-li", !item.children?.length ? " no-child" : "")}>
                            <div className="lediv" onClick={() => {
                                if (!item.children?.length) return;
                                if (activeAccordionIds.includes(item.id)) {
                                    setActiveAccordionIds(activeAccordionIds.filter((id: number) => id !== item.id));
                                    return;
                                }
                                setActiveAccordionIds((prevState: any) => [...prevState, item.id,]);
                            }}>
                                {!item.children?.length ? null : (<button type="button" className="func-btn" onClick={() => handleAccordion(item)}></button>)}
                                <h5>{item?.name}</h5>
                            </div>
                        </div>
                    </div>
                    <div className="rgdiv">
                        <input type="checkbox" name="categories" value={item.id} onChange={(event) => toggleCategorySelect(event, item)} 
                        checked={selectedCategories.includes(item.id)} />
                    </div>
                </div>
                <div className="category-accordion-content">
                    <div className="div-ul">
                        {item.children?.length ? recursiveRenderList(item.children, prevIndex + 1, item) : null}
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <>
            <h4>Select Categories</h4>
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="mb-2">
                        <div className="listingMain">
                            <div className="category-nested-accordions">
                                {categories.length > 0 ? recursiveRenderList(categories, 0) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CategoriesSelectionModule;