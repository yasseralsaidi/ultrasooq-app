import React from "react";
import ReactPaginate from "react-paginate";
import { FiChevronsRight, FiChevronsLeft } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type PaginationProps = {
  totalCount: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
};

const Pagination: React.FC<PaginationProps> = ({
  totalCount = 0,
  page,
  setPage,
  limit,
}) => {
  const itemsPerPage = limit;
  const pageCount = totalCount && Math.ceil(totalCount / itemsPerPage);

  const handlePageClick = (event: { selected: number }) =>
    setPage(event.selected + 1);

  return (
    <ul className="flex justify-center w-full gap-x-3">
      <li>
        <button
          type="button"
          className="flex items-center gap-x-2 bg-[#F8F5F5] px-2 py-1 shadow-md rounded-sm"
          onClick={() => setPage(1)}
        >
          <FiChevronsLeft size={20} />
          First
        </button>
      </li>
      <li className="flex items-center">
        <ReactPaginate
          breakLabel="..."
          breakClassName="react-paginate"
          breakLinkClassName="react-paginate"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          forcePage={page - 1}
          renderOnZeroPageCount={null}
          containerClassName="flex gap-3"
          pageClassName="h-[30px] w-[30px] flex items-center justify-center rounded-[4px] bg-[#F8F5F5] text-[#A8A8A8] text-sm font-normal leading-[normal] tracking-[-0.029px] border-solid border-[#F8F5F5] shadow-md child-anchor"
          activeClassName="h-[30px] w-[30px] flex items-center justify-center rounded-[4px] bg-red-500 text-white text-sm font-normal leading-[normal] tracking-[-0.029px] border-solid border-red-300 shadow-md child-anchor"
          previousLabel={
            <button
              type="button"
              className="flex items-center gap-x-2 bg-[#F8F5F5] p-2 shadow-md rounded-sm"
            >
              <FaChevronLeft size={14} color="#000" />
            </button>
          }
          nextLabel={
            <button
              type="button"
              className="flex items-center gap-x-2 bg-[#F8F5F5] p-2 shadow-md rounded-sm"
            >
              <FaChevronRight size={14} color="#000" />
            </button>
          }
        />
      </li>
      <li>
        <button
          type="button"
          className="flex items-center gap-x-2 bg-[#F8F5F5] px-2 py-1 shadow-md rounded-sm"
          onClick={() => setPage(pageCount)}
        >
          Last
          <FiChevronsRight size={20} />
        </button>
      </li>
    </ul>
  );
};

export default Pagination;
