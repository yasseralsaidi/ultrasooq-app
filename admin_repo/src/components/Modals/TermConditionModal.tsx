import React, { useReducer } from "react";
import { Modal } from "react-bootstrap";
import useGlobalStore from "../../hooks/useGlobalStore";
import LoadingScreen from "../LoadingScreen";
import Reducer from "../../services/Reducer";

const initState = {
  termAndAccept: "",
  loading: false,
  validate: false,
};

type TermConditionModalProps = {
  type: any;
};

const TermConditionModal: React.FC<TermConditionModalProps> = ({ type }) => {
  const { TOGGLE_TERM_CONDITION_MODAL, toggleForModal } = useGlobalStore();
  const [state] = useReducer(Reducer, initState);

  const handleClose = () => toggleForModal("TOGGLE_TERM_CONDITION_MODAL"); //dispatch({ type: 'TOGGLE_TERM_CONDITION_MODAL' });
  const handleNotClose = () => console.log("Not Close Modal");

  // useEffect(() => {
  // if(props.type === 'term'){
  //   // termConditionData()
  // }else{
  //   // privacyConditionData()
  // }
  // console.log(props)
  // }, [type]);

  // console.log(state);
  return (
    <div>
      {state.loading ? (
        <LoadingScreen />
      ) : (
        <Modal
          show={TOGGLE_TERM_CONDITION_MODAL}
          onHide={handleNotClose}
          aria-labelledby="contained-modal-title-vcenter"
          centered
          scrollable
          className="customModal1 termsCondition__modal"
        >
          <Modal.Header>
            <h5 className="modal-title">
              {type}
              {state.termAndAccept && state.termAndAccept.title}
            </h5>
            <button
              type="button"
              className="customModal1-close"
              onClick={handleClose}
            >
              <img src="/images/modaclosebtn.svg" alt="" />
            </button>
          </Modal.Header>
          <Modal.Body>
            {state.termAndAccept && (
              <div
                className="termsCondition__modal_wrapper"
                dangerouslySetInnerHTML={{
                  __html: state.termAndAccept.content,
                }}
              ></div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              className="themeBtnBlue"
              onClick={handleClose}
            >
              Read It
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default TermConditionModal;
