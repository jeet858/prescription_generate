import React, { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import PrescipttionPopup from "./ViewPrescriptionPopup";
import Image from "next/image";
import { Modal } from "@mui/material";
import { env } from "~/env";
import { createClient } from "@supabase/supabase-js";
interface DragAndDropProps {
  patient_id: string;
}
const ViewReport: React.FunctionComponent<DragAndDropProps> = (props) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const handleCloseModal = () => {
    setOpenModal(false);
  };
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
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOpenModal(true);
  };
  const [selectedPrescription, setSelectedPrescription] = useState({
    patient: "",
    prescription: "",
  });
  useEffect(() => {
    const supabase_url = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabase_anon_key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabase_url, supabase_anon_key);
    if (props.patient_id) {
      setSelectedPrescription((prevState) => ({
        ...prevState,
        patient: props.patient_id,
      }));
    }
  }, [props.patient_id]);

  const { data: previousPrescription } = api.prescription.get_all.useQuery();
  const { data: patient } = api.patient.get_all.useQuery();
  const { data: reports } = api.prescription.get_all_test_report.useQuery();

  return (
    <div className="flex h-full w-full flex-col">
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
      <div className=" m-[1%] flex grow flex-col space-y-[1%]">
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
                    {item.date.toLocaleDateString()}-
                    {item.date.toLocaleTimeString()}
                  </option>
                );
              }
            })}
          </select>
        </div>
        <div className="flex h-fit  w-full items-center">
          <p className="mr-2 font-bold">Prescribed Tests:</p>
          {previousPrescriptionData?.tests}
        </div>
        <div className="flex h-full w-full flex-wrap items-center justify-center self-center">
          <div className="h-[400px] w-[400px] self-center overflow-hidden">
            <div className="h-full snap-y snap-mandatory overflow-x-hidden overflow-y-scroll ">
              {reports?.map((item, index) =>
                selectedPrescription.prescription === item.prescription_id ? (
                  <div
                    className="h-full w-full snap-center"
                    key={index}
                    onClick={() => handleImageClick(item.test_report)}
                  >
                    <Image
                      src={item.test_report}
                      alt={""}
                      width={400} // Specify the actual width of the image
                      height={400}
                      className=" aspect-square h-full w-full"
                    />
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </div>
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          className="flex h-full w-full items-center justify-center"
        >
          <div className="flex h-fit w-fit items-center justify-center">
            {selectedImage && (
              <div className="h-fit w-fit">
                <Image
                  src={selectedImage}
                  width={400}
                  height={400}
                  alt=""
                  className="aspect-square h-fit w-fit"
                />
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ViewReport;
