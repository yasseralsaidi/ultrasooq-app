import { Modal } from "react-bootstrap";
import { Table } from "react-bootstrap";
import { useFetchProductById } from "../../../apis/queries/products.queries";

type ProductPricesViewProps = {
  show: any;
  handleClose: () => void;
};

const ProductPricesView: React.FC<ProductPricesViewProps> = ({
  show,
  handleClose,
}) => {
  const productQueryById = useFetchProductById(
    show?.id ? show?.id : null,
    !!show?.id
  );

  return (
    <Modal size="lg" show={show.show} onHide={handleClose} centered>
      <Modal.Header>
        <Modal.Title>Prices</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <div className="customTable">
          <Table responsive>
            <thead>
              <tr className="whitespace-nowrap">
                <th>Name</th>
                <th>Product Price</th>
                <th>Offer Price</th>
                <th>Ask for Price</th>
                <th>Ask for Stock</th>
                <th>Price Status</th>
              </tr>
            </thead>
            <tbody>
              {productQueryById?.data?.data?.product_productPrice &&
              productQueryById?.data?.data?.product_productPrice?.length > 0 ? (
                productQueryById?.data?.data?.product_productPrice?.map(
                  (item: any) => (
                    <tr key={item.id}>
                      <td className="max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis">
                        {item?.adminDetail?.firstName}{" "}
                        {item?.adminDetail?.lastName}
                      </td>

                      <td>${item?.productPrice}</td>
                      <td>${item?.offerPrice}</td>
                      <td>{item?.askForPrice}</td>
                      <td>{item?.askForStock}</td>
                      <td>{item?.status}</td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td colSpan={12} className="text-center font-semibold py-10">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProductPricesView;
