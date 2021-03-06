import React from "react";
import Dialog from "@material-ui/core/Dialog";

import "./FailedRequestDialog.scss";


interface ShuffleAnswerDialogProps {
  isOpen: boolean;
  hide(): void;
  submit(): void;
  close(): void;
}

const ShuffleAnswerDialog: React.FC<ShuffleAnswerDialogProps> = (props) => {
  return (
    <Dialog open={props.isOpen} onClose={props.hide} className="dialog-box">
      <div className="dialog-header">
        <div>Is this your answer?</div>
      </div>
      <div className="dialog-footer">
        <button className="btn btn-md bg-theme-orange yes-button"
          onClick={props.submit}>
          <span>Yes</span>
        </button>
        <button className="btn btn-md bg-gray no-button"
          onClick={props.close}>
          <span>No, skip</span>
        </button>
      </div>
    </Dialog>
  );
}

export default ShuffleAnswerDialog;
