import React from "react";

type DeleteModalProps = {
  show: boolean;
  handleClose: any;
  variant: string;
  text: string;
  buttonText: string;
  buttonHandler: any;
};

const DeleteModal: React.FC<DeleteModalProps> = ({
  show,
  handleClose,
  variant,
  text,
  buttonText,
  buttonHandler,
}) => {
  return (
    <>
      {/* default-alert-popup */}
      {/* danger-alert-popup */}
      {/* success-alert-popup */}
      <div
        className={
          show
            ? "custom-ui-alert-popup danger-alert-popup size-420px show"
            : "custom-ui-alert-popup size-420px danger-alert-popup"
        }
      >
        <div className="alert-popup-headerpart">
          <h1>Are you sure?</h1>
          <div className="alert-popup-close" onClick={handleClose}>
            X
          </div>
        </div>
        <div className="alert-popup-bodypart">
          <p>{text}</p>
        </div>
        <div className="alert-actions">
          <div className="alert-actions-col">
            <button className="alert--cancel-btn" onClick={handleClose}>
              No
            </button>
          </div>
          <div className="alert-actions-col">
            <button
              id="deleteFile"
              className="alert--submit-btn"
              onClick={buttonHandler}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
      {show && (
        <div
          className="react-confirm-alert-overlay"
          onClick={handleClose}
        ></div>
      )}
    </>
  );
};

export default DeleteModal;
