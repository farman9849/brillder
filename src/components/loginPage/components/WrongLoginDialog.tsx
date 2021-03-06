import React from "react";
import Dialog from "@material-ui/core/Dialog";

interface WrongLoginDialogProps {
  isOpen: boolean;
  submit(): void;
  close(): void;
}

const WrongLoginDialog: React.FC<WrongLoginDialogProps> = props => {
  return (
    <Dialog open={props.isOpen} onClose={props.close} className="dialog-box">
      <div className="dialog-header">
        <div>We don't appear to have a record of you yet</div>
        <div>Sign up?</div>
      </div>
      <div className="dialog-footer">
        <button className="btn btn-md bg-theme-orange yes-button" onClick={props.submit}>
          <span>Yes</span>
        </button>
        <button className="btn btn-md bg-gray no-button" onClick={props.close}>
          <span>No</span>
        </button>
      </div>
    </Dialog>
  );
};

export default WrongLoginDialog;
