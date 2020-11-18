import React from "react";
import Checkbox from "@material-ui/core/Checkbox";

import './ImageDialog.scss';
import SpriteIcon from "components/baseComponents/SpriteIcon";
import BaseDialogWrapper from "components/baseComponents/dialogs/BaseDialogWrapper";
import DropImage from "./DropImage";

interface DialogProps {
  open: boolean;
  upload(file: File): void;
  setDialog(open: boolean): void;
}

const ImageDialog: React.FC<DialogProps> = ({ open, upload, setDialog }) => {
  const [source, setSource] = React.useState('');
  const [caption, setCaption] = React.useState('');
  const [permision, setPermision] = React.useState(false);

  const [file, setFile] = React.useState(null as File | null);

  return (
    <BaseDialogWrapper open={open} close={() => setDialog(false)} submit={() => {}}>
      <div className="dialog-header image-dialog">
        <DropImage initFileName="" locked={false} setFile={setFile} />
        <div className="bold">Where did you get this image?</div>
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Add link to source or name of owner..."
        />
        <div onClick={() => setPermision(!permision)}>
          <Checkbox checked={permision} />
          I have permision to distribute this image
          <span className="text-theme-orange">*</span>
        </div>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add caption..."
        />
        <div className="centered">
          <SpriteIcon name="upload" className="upload-button" onClick={() => {
            if (file) {
              upload(file);
            }
           }} />
        </div>
      </div>
    </BaseDialogWrapper>
  );
}

export default ImageDialog;
