import { Pane, FileUploader } from "evergreen-ui";

const FileUploadComponent = ({
  files,
  label,
  description,
  onChange,
  onRejected,
  maxSizeInBytes,
  renderFile,
  maxFiles,
  value,
  ...others
}) => {
  return (
    <Pane>
      <FileUploader
        label={label}
        description={description}
        maxSizeInBytes={maxSizeInBytes}
        maxFiles={maxFiles}
        onChange={onChange}
        onRejected={onRejected}
        renderFile={renderFile}
        values={value}
        {...others}
      />
    </Pane>
  );
};

export default FileUploadComponent;
