import React from "react";
import { Modal, Button } from "react-bootstrap";
// import Barcode from "react-barcode";

type BarcodeViewProps = {
  show: any;
  handleClose: any;
  barcodeValue: any;
};

const BarcodeView: React.FC<BarcodeViewProps> = ({
  show,
  handleClose,
  barcodeValue,
}) => {
  return (
    <Modal size="xl" show={show.show} onHide={handleClose} centered>
      <Modal.Header>
        <Modal.Title>Scan the Bar code</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center flex justify-center">
        {/* {show?.id ? <Barcode value={show?.id} height={20} /> : null} */}
        {show?.id ? (
          <img src={show.id} alt="bar-code" height={70} width={900} />
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" size="sm" onClick={handleClose}>
          Got it, thanks!
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BarcodeView;
