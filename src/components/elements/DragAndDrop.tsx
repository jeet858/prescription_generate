import React, { useEffect, useRef, useState } from "react";
import { IoIosCloudUpload } from "react-icons/io";
import { api } from "~/utils/api";
import supabase, { createClient } from "@supabase/supabase-js";
import { env } from "~/env";
import img from "../../../public/gojo.jpeg";
import PrescriptionView from "~/pages/prescription-view";
import Image from "next/image";
import { Modal } from "@mui/material";
import SuccessPopup from "../popups/Success";
import ErrorPopup from "../popups/Error";
import ProcessingPopup from "../popups/Processing";
interface DragAndDropProps {
  patient_id: string;
}
const DragAndDrop: React.FunctionComponent<DragAndDropProps> = (props) => {
  const date = new Date();
  const [files, setFiles] = useState<FileList | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string[]>([]);
  const [processingPopup, setProcessingPopup] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState({
    patient: "",
    prescription: "",
  });
  const [previousPrescriptionData, setPreviousPrescriptionData] = useState<
    | {
        prescription_id: string;
        patient_id: string;
        date: Date;
        symptom: string;
        bp: string | null;
        tests: string | null;
        diagnosis: string;
        weight: number | null;
        note: string | null;
      }
    | undefined
  >();
  const [successPopupOpen, setSuccessPopupOpen] = React.useState(false);
  const [errorPopup, setErrorPopup] = React.useState({
    state: false,
    message: "",
  });
  useEffect(() => {
    if (props.patient_id) {
      setSelectedPrescription((prevState) => ({
        ...prevState,
        patient: props.patient_id,
      }));
    }
  }, [props.patient_id]);
  const ref = useRef<HTMLInputElement>(null);
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    // Handle dropped files
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles) {
      const arr = [];
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i];
        console.log(file?.name); // Access file properties here
        file && file.type.startsWith("image/")
          ? arr.push(URL.createObjectURL(file))
          : null;
      }
      setPreviewUrl(arr);
    }
  };
  const { data: previousPrescription } = api.prescription.get_all.useQuery();
  const { data: patient } = api.patient.get_all.useQuery();
  const saveFile = api.prescription.upload_multiple_test_report.useMutation({
    onError(error, variables, context) {
      alert(error.message);
      sqlInsertError();
    },
    onSuccess(data, variables, context) {
      handleCancel();
      setSelectedPrescription({ patient: "", prescription: "" });
      setProcessingPopup(false);
      setSuccessPopupOpen(true);
    },
  });
  const sqlInsertError = async () => {
    const supabase_url = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabase_anon_key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabase_url, supabase_anon_key);
    const { data, error: bucket } = await supabase.storage.deleteBucket(
      selectedPrescription.prescription,
    );
  };
  const handleFileUpload = async () => {
    const supabase_url = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabase_anon_key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabase_url, supabase_anon_key);

    // Check if files exist
    if (!files || files.length === 0 || !selectedPrescription.prescription) {
      setProcessingPopup(false);

      setErrorPopup({
        state: true,
        message: `Be sure to select patient_id and prescription properly and atleast one file \n Files_Length:${files?.length}\n Patient Id:${selectedPrescription.patient} \n Prescription_Id:${selectedPrescription.prescription}`,
      });
      return;
    }

    // Read the first selected file

    const { data: bucketData, error: bucketError } =
      await supabase.storage.createBucket(selectedPrescription.prescription, {
        public: true,
        allowedMimeTypes: ["image/*"],
      });
    const uploadUrl = [];
    if (bucketError) {
      if (bucketError.message !== "The resource already exists") {
        setProcessingPopup(false);

        setErrorPopup({
          state: true,
          message: `${bucketError.message}`,
        });
      }
    }
    if (bucketData || bucketError.message === "The resource already exists") {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
          console.log(file?.name); // Access file properties here
          const { data, error } = await supabase.storage
            .from(selectedPrescription.prescription)
            .upload(`${file.name}`, file, {
              cacheControl: "3600",
              upsert: true,
            });
          if (data) {
            const filePathWithEncodedSpaces = data.path.replace(/ /g, "%20");
            const uploadedImageUrl = `${supabase_url}/storage/v1/object/public/${selectedPrescription.prescription}/${filePathWithEncodedSpaces}`;
            uploadUrl.push(uploadedImageUrl);
            console.log(data.path);
            console.log(uploadedImageUrl);
          }
          if (error) {
            supabase.storage.deleteBucket(selectedPrescription.prescription);
            setProcessingPopup(false);
            setErrorPopup({
              state: true,
              message: `${error.message}`,
            });
            return;
          }
        }
      }
    }
    saveFile.mutate({
      date: date,
      prescription_id: selectedPrescription.prescription,
      test_report: uploadUrl,
    });
  };
  const handleCancel = () => {
    setFiles(null);
    setPreviewUrl([]);

    // Reset the file input directly
    if (ref.current) {
      ref.current.value = ""; // This clears the input
    }
  };
  // Input change event handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Set the selected files when input changes
    const files = e.target.files;
    console.log(files);
    if (files) {
      const arr = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(file?.name); // Access file properties here
        file ? arr.push(URL.createObjectURL(file)) : null;
      }
      setPreviewUrl(arr);
    }

    setFiles(e.target.files);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={successPopupOpen}
        onClose={() => {
          setSuccessPopupOpen(false);
        }}
        className="flex h-full w-full items-center justify-center"
      >
        <SuccessPopup
          onClick={() => {
            setSuccessPopupOpen(false);
          }}
          message="Files uploaded succesfully"
        />
      </Modal>
      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={processingPopup}
        onClose={() => {
          setProcessingPopup(false);
        }}
        className="flex h-full w-full items-center justify-center"
      >
        <ProcessingPopup
          onClick={() => {
            setProcessingPopup(false);
          }}
        />
      </Modal>
      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={errorPopup.state}
        onClose={() => {
          setErrorPopup({ state: false, message: "" });
        }}
        className="flex h-full w-full items-center justify-center"
      >
        <ErrorPopup
          onClick={() => {
            setErrorPopup({ state: false, message: "" });
          }}
          message={`${errorPopup.message}`}
        />
      </Modal>
      <div className="flex h-[15%] w-full items-center justify-center">
        <p className="text-[30px] font-medium">Upload Reports</p>
      </div>
      <div className="flex h-fit w-full flex-row justify-between bg-[#F0F0F0] p-[1%]">
        <div className="flex flex-col ">
          <span className=" space-x-5">
            <span className="font-bold text-black">P-ID:</span>
            <span>
              {
                patient?.find(
                  (item) => item.patient_id === selectedPrescription.patient,
                )?.patient_id
              }
            </span>
          </span>
          <span className=" space-x-5">
            <span className="font-bold text-black">Name:</span>
            <span>
              {
                patient?.find(
                  (item) => item.patient_id === selectedPrescription.patient,
                )?.first_name
              }
              -
              {
                patient?.find(
                  (item) => item.patient_id === selectedPrescription.patient,
                )?.last_name
              }
            </span>
          </span>
          <span className=" space-x-5">
            <span className="font-bold text-black">Age:</span>
            <span>
              {
                patient?.find(
                  (item) => item.patient_id === selectedPrescription.patient,
                )?.age
              }
            </span>
          </span>
        </div>
      </div>
      <div className=" m-[1%] flex grow flex-col space-y-[3%]">
        <p className="font-bold">Previous Prescription</p>
        <div className="flex flex-row space-x-[2%] ">
          <select
            name=""
            id=""
            className="h-[42px] w-fit border border-[#DBDBDB] p-1"
            value={selectedPrescription.patient}
            onChange={(e) => {
              setSelectedPrescription({
                ...selectedPrescription,
                patient: e.target.value,
              });
            }}
          >
            <option value="">---select patient---</option>

            {patient?.map((item, index) => {
              return (
                <option value={item.patient_id} key={index}>
                  {`${item.patient_id}--[${item.first_name} ${item.last_name}]`}
                </option>
              );
            })}
          </select>
          <select
            name=""
            id=""
            className="h-[42px] w-fit border border-[#DBDBDB] p-1"
            value={selectedPrescription.prescription}
            onChange={(e) => {
              setSelectedPrescription({
                ...selectedPrescription,
                prescription: e.target.value,
              });
              const ele = previousPrescription?.find(
                (item) => item.prescription_id === e.target.value,
              );
              console.log(ele);
              setPreviousPrescriptionData(ele);
            }}
          >
            <option value="">---select prescription---</option>
            {previousPrescription?.map((item, index) => {
              if (item.patient_id === selectedPrescription.patient) {
                return (
                  <option value={item.prescription_id} key={index}>
                    {item.prescription_id}-{item.date.toLocaleDateString()}-
                    {item.date.toLocaleTimeString()}
                  </option>
                );
              }
            })}
          </select>

          <button
            className="h-[42px] w-[103px] bg-[#F36562] text-white"
            onClick={(e) => {
              e.preventDefault();
              handleFileUpload();
              setProcessingPopup(true);
              console.log(selectedPrescription);
              console.log(files);
            }}
          >
            <p>Upload</p>
          </button>
        </div>
        <div className="flex h-fit  w-full items-center">
          <p className="mr-2 font-bold">Prescribed Tests:</p>
          {previousPrescriptionData?.tests}
        </div>
        <input
          type="file"
          onChange={handleFileInputChange}
          ref={ref}
          className="hidden"
          multiple
          accept="image/*"
        />
        {!files ? (
          <div
            className={`h-[61%] w-full rounded-md border-2 border-dashed border-[#656565] ${dragging ? "bg-[#d9d9d985]" : "bg-[#d9d9d9]"} p-[1%]`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => {
              if (ref.current) {
                ref.current.click();
              }
            }}
          >
            <div className="h-[10%] w-full  border-b-2 border-[#656565]">
              <p>Upload Document</p>
            </div>
            <div className="h-[90%] w-full">
              <div className="flex h-full w-full flex-col items-center justify-center">
                <IoIosCloudUpload className="h-[82px] w-[76px]" />
                <span className="text-[22px]/[25.3px]">Drag & Drop</span>
                <span className="text-[#969696]">
                  Your Files Or Browse To Upload
                </span>
                <span className="text-[12px]/[13.8px]">
                  Only Image files with max size of 15MB
                </span>
              </div>
            </div>
          </div>
        ) : (
          previewUrl.map((item, index) => {
            return (
              <div className="flex self-center" key={index}>
                <Image src={item} alt="" width={400} height={400} />
              </div>
            );
          })
        )}
      </div>
      <button
        className="mb-2 h-10 self-end bg-[#3D4460] px-2 text-white"
        onClick={handleCancel}
      >
        Cancel/New Selection
      </button>
    </div>
  );
};

export default DragAndDrop;
