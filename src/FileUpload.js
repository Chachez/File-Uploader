import React, { Fragment, useCallback, useState, useMemo } from "react";
import {
  FileCard,
  Alert,
  FileRejectionReason,
  majorScale,
  rebaseFiles,
} from "evergreen-ui";
import { Paper } from "@mui/material";
import { styled } from "@mui/system";
import { mimeTypesArray } from "./mimeTypes";
import FileUploadComponent from "./components/FIleUploadComponent";

const RootComponent = styled("div")(({ theme }) => ({
  maxWidth: "60%",
  maxHeight: "100%",
  margin: "0 auto",
  padding: theme.spacing(3, 3, 6, 3),
  overflow: "auto",
}));

const PaperComponent = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(5),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(6),
    padding: theme.spacing(3),
  },
  borderRadius: "10px",
  boxShadow: "0 10px 30px 0 rgba(172, 168, 168, 0.43)",
}));

const FileUpload = () => {
  const acceptedMimeTypes = mimeTypesArray;
  const maxFiles = 5;
  const maxSizeInBytes = 50 * 1024 ** 2; // 50 MB
  const [files, setFiles] = useState([]);
  const [fileRejections, setFileRejections] = useState([]);
  const values = useMemo(
    () => [
      ...files,
      ...fileRejections.map((fileRejection) => fileRejection.file),
    ],
    [files, fileRejections]
  );
  const handleRemove = useCallback(
    (file) => {
      const updatedFiles = files.filter(
        (existingFile) => existingFile !== file
      );
      const updatedFileRejections = fileRejections.filter(
        (fileRejection) => fileRejection.file !== file
      );

      // Call rebaseFiles to ensure accepted + rejected files are in sync (some might have previously been
      // rejected for being over the file count limit, but might be under the limit now!)
      const { accepted, rejected } = rebaseFiles(
        [
          ...updatedFiles,
          ...updatedFileRejections.map((fileRejection) => fileRejection.file),
        ],
        { acceptedMimeTypes, maxFiles, maxSizeInBytes }
      );

      setFiles(accepted);
      setFileRejections(rejected);
    },
    [acceptedMimeTypes, files, fileRejections, maxFiles, maxSizeInBytes]
  );

  const fileCountOverLimit = files.length + fileRejections.length - maxFiles;
  const fileCountError = `You can upload up to 5 files. Please remove ${fileCountOverLimit} ${
    fileCountOverLimit === 1 ? "file" : "files"
  }.`;

  return (
    <RootComponent>
      <PaperComponent>
        <FileUploadComponent
          acceptedMimeTypes={acceptedMimeTypes}
          label="Upload Files"
          description="You can upload up to 5 files. Files can be up to 50MB."
          disabled={files.length + fileRejections.length >= maxFiles}
          maxSizeInBytes={maxSizeInBytes}
          maxFiles={maxFiles}
          onAccepted={setFiles}
          onRejected={setFileRejections}
          renderFile={(file, index) => {
            const { name, size, type } = file;
            const renderFileCountError = index === 0 && fileCountOverLimit > 0;

            // We're displaying an <Alert /> component to aggregate files rejected for being over the maxFiles limit,
            // so don't show those errors individually on each <FileCard />
            const fileRejection = fileRejections.find(
              (fileRejection) =>
                fileRejection.file === file &&
                fileRejection.reason !== FileRejectionReason.OverFileLimit
            );
            const { message } = fileRejection || {};

            return (
              <Fragment key={`${file.name}-${index}`}>
                {renderFileCountError && (
                  <Alert
                    intent="danger"
                    marginBottom={majorScale(2)}
                    title={fileCountError}
                  />
                )}
                <FileCard
                  isInvalid={fileRejection != null}
                  name={name}
                  onRemove={() => handleRemove(file)}
                  sizeInBytes={size}
                  type={type}
                  validationMessage={message}
                />
              </Fragment>
            );
          }}
          values={values}
        />
      </PaperComponent>
    </RootComponent>
  );
};

export default FileUpload;
