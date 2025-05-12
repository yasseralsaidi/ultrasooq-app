import { Modal } from "react-bootstrap";
import { Table } from "react-bootstrap";
import { useFetchProductById } from "../../../apis/queries/products.queries";

type ServicePriceViewProps = {
    data: any[],
    show: any;
    handleClose: () => void;
};

const ServicePriceView: React.FC<ServicePriceViewProps> = ({
    data,
    show,
    handleClose,
}) => {
    //   const productQueryById = useFetchProductById(
    //     show?.id ? show?.id : null,
    //     !!show?.id
    //   );

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
                                <th>Service</th>
                                <th>Cost</th>
                                <th>Cost Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data?.length > 0 ?
                                (
                                    data?.map(
                                        (item: any) => (
                                            <tr key={item.id}>
                                                <td className="max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis">
                                                    {item?.name || ""}
                                                </td>

                                                <td>${Number(item?.serviceCost || 0).toFixed(2)}</td>
                                                <td>{item?.serviceCostType}</td>
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

export default ServicePriceView;
