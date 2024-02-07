let filesData = [];
let selectedFiles = [];
let filesBody;
let fileUpload;
let downloadButton;
let checkBoxHead;

const numerizeFiles = () => {
  Object.keys(filesData).forEach((fileName, index) => {
    const fileNoId = `${fileName}-file-no`;
    const fileNo = document.getElementById(fileNoId);
    fileNo.textContent = index + 1;
  });
};

const triggerCheckBoxAndDownloadButton = () => {
  downloadButton.disabled = selectedFiles.length === 0;
  checkBoxHead.checked =
    selectedFiles.length === Object.keys(filesData).length &&
    selectedFiles.length !== 0;
};

const isUnique = (fileName) => {
  return !Object.keys(filesData).includes(fileName);
};

const handleUpload = (file) => {
  const reader = new FileReader();

  reader.onload = () => {
    const buffer = new Uint8Array(reader.result);
    const array = Array.from(buffer);
    const fileNameData = file.name;

    if (!isUnique(fileNameData)) {
      generateToast({
        message: `⚠️ ${fileNameData} already exists! ⚠️`,
        background: "hsl(51 97.8% 65.1%)",
        color: "hsl(51 97.8% 12.1%)",
        length: "2000ms",
      });
      return;
    }

    if (!XBOX360Retitler.checkFile(array)) {
      generateToast({
        message: `⚠️ ${fileNameData} is not a valid file. ⚠️`,
        background: "hsl(350 100% 66.5%)",
        color: "hsl(350 100% 13.5%)",
        length: "2000ms",
      });
      return;
    }

    const oldTitleData = XBOX360Retitler.readTitle(array);
    filesData[fileNameData] = {
      fileName: fileNameData,
      oldTitle: oldTitleData,
      newTitle: oldTitleData,
      data: array.slice(),
    };

    const fileContainer = document.createElement("div");
    fileContainer.id = fileNameData;
    fileContainer.classList.add("file-container", "grid-container");
    const fileNo = document.createElement("span");
    fileNo.id = `${fileNameData}-file-no`;
    fileNo.textContent = Object.keys(filesData).length;
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.id = `${fileNameData}-checkbox`;
    const fileName = document.createElement("span");
    fileName.textContent = fileNameData;
    fileName.classList.add("file-name");
    fileName.id = `${fileNameData}-file-name`;
    const oldTitle = document.createElement("input");
    oldTitle.type = "text";
    oldTitle.classList.add("title");
    oldTitle.value = oldTitleData;
    oldTitle.readOnly = true;
    oldTitle.id = `${fileNameData}-old-title`;
    const newTitle = document.createElement("input");
    newTitle.type = "text";
    newTitle.classList.add("title");
    newTitle.value = oldTitleData;
    newTitle.id = `${fileNameData}-new-title`;
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "✕";
    deleteButton.classList.add("delete-button");
    deleteButton.id = `${fileNameData}-delete-button`;

    newTitle.addEventListener("input", (event) => {
      const newValue = event.target.value;
      const fileName = event.target.parentElement.id;
      if (newValue.length > 0) {
        filesData[fileName].newTitle = newValue;
      } else {
        filesData[fileName].newTitle = "";
      }
    });

    deleteButton.addEventListener("click", (event) => {
      const fileName = event.target.parentElement.id;
      selectedFiles = selectedFiles.filter((e) => e !== fileName);
      delete filesData[fileName];
      filesBody.removeChild(fileContainer);
      numerizeFiles();
      triggerCheckBoxAndDownloadButton();
    });

    fileContainer.appendChild(fileNo);
    fileContainer.appendChild(checkBox);
    fileContainer.appendChild(fileName);
    fileContainer.appendChild(oldTitle);
    fileContainer.appendChild(newTitle);
    fileContainer.appendChild(deleteButton);
    filesBody.insertBefore(fileContainer, fileUpload);
  };

  reader.readAsArrayBuffer(file);
};

const handleUploadFiles = (files) => {
  [...files].forEach((file) => {
    handleUpload(file);
  });
  numerizeFiles();
};

const handleDragAndDrop = () => {
  const dropArea = fileUpload;

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const highlight = (e) => {
    dropArea.classList.add("highlight");
  };

  const unhighlight = (e) => {
    dropArea.classList.remove("highlight");
  };

  const handleDrop = (e) => {
    let dt = e.dataTransfer;
    let files = dt.files;

    handleFiles(files);
    numerizeFiles();
  };

  const handleFiles = (files) => {
    [...files].forEach(handleUpload);
  };

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropArea.addEventListener(eventName, highlight, false);
  });
  ["dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  dropArea.addEventListener("drop", handleDrop, false);
};

const handleDownload = () => {
  selectedFiles.forEach((fileName) => {
    const file = filesData[fileName];
    XBOX360Retitler.changeTitle(file.data, file.newTitle);
    XBOX360Retitler.writeHash(file.data);

    const blob = new Blob([new Uint8Array(file.data)], {
      type: "application/octet-stream",
    });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file.fileName;
    link.click();
  });
};

const handleCheckboxes = () => {
  checkBoxHead.addEventListener("change", (event) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      Object.values(filesData).forEach((file) => {
        const fileName = file.fileName;

        if (!selectedFiles.includes(fileName)) {
          const checkBox = document.getElementById(`${fileName}-checkbox`);
          selectedFiles.push(fileName);
          checkBox.checked = true;
        }
      });
    } else {
      selectedFiles.forEach((fileName) => {
        const checkBox = document.getElementById(`${fileName}-checkbox`);
        checkBox.checked = false;
      });

      selectedFiles = [];
    }

    triggerCheckBoxAndDownloadButton();
  });

  filesBody.addEventListener("change", (event) => {
    if (event.target.type === "checkbox") {
      const isChecked = event.target.checked;
      const fileName = event.target.parentElement.id;
      if (isChecked) {
        selectedFiles.push(fileName);
      } else {
        selectedFiles = selectedFiles.filter((e) => e !== fileName);
      }
      triggerCheckBoxAndDownloadButton();
    }
  });
};

const main = () => {
  filesBody = document.getElementById("files-body");
  fileUpload = document.getElementById("file-upload");
  checkBoxHead = document.getElementById("checkbox-head");
  downloadButton = document.getElementById("download-button");
  handleCheckboxes();
  handleDragAndDrop();
  initToast();
};

document.addEventListener("DOMContentLoaded", () => {
  main();
});
