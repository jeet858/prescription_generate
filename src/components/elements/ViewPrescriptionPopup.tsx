import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";
import img from "../../../images/medical-symbol 1.png";
interface pdfProps {
  patient:
    | {
        first_name: string;
        last_name: string;
        contact_number: bigint;
        email_id: string | null;
        patient_id: string;
        gender: string;
        fathers_name: string | null;
        husbands_name: string | null;
        age: string;
        address_line1: string | null;
        address_line2: string | null;
        city: string | null;
        state: string | null;
        pin_code: number | null;
        country: string | null;
      }
    | null
    | undefined;
  prescription_data: {
    patient_id: string;
    tests: string;
    symptom: string;
    bp: string;
    diagnosis: string;
    weight: string;
    note: string;
    reports: string;
    medicine: {
      medicine: string;
      repeatitions: string;
      id: string;
    }[];
  };
  ref: React.RefObject<HTMLDivElement>;
}
const PrescipttionPopup: React.FC<pdfProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);

  const date = new Date();
  const handleGeneratePdf = async () => {
    if (!ref.current) {
      return;
    }

    // Increase the resolution of the captured canvas
    const scaleFactor = 4; // You can adjust this value for higher resolution
    const canvas = await html2canvas(ref.current, {
      scale: scaleFactor,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "px", "a5", true);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width / scaleFactor; // Adjusted width based on scale factor
    const imgHeight = canvas.height / scaleFactor; // Adjusted height based on scale factor
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    pdf.addImage(
      imgData,
      "PNG",
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio,
    );
    pdf.save(`${props.patient?.patient_id}_${date.toISOString()}.pdf`);
  };
  const handleDownloadPdf = async () => {
    if (!ref.current) {
      return;
    }

    // Increase the resolution of the captured canvas
    const scaleFactor = 4; // You can adjust this value for higher resolution
    const canvas = await html2canvas(ref.current, {
      scale: scaleFactor,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "px", "a4", true);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width / scaleFactor; // Adjusted width based on scale factor
    const imgHeight = canvas.height / scaleFactor; // Adjusted height based on scale factor
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    pdf.addImage(
      imgData,
      "PNG",
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio,
    );
    pdf.autoPrint();
    window.open(pdf.output("bloburl"), "_blank");
  };
  const formatTextWithLineBreaks = (text: string) => {
    if (!text) return "";
    return text.replace(/\n/g, "<br>");
  };

  return (
    <div className="flex h-[460px] flex-col items-center justify-center self-center">
      <div className="flex gap-x-4">
        <button
          onClick={handleGeneratePdf}
          className="mb-4 h-8 w-fit min-w-16 self-end bg-[#F36562] px-2 text-white"
        >
          Download
        </button>
        <button
          onClick={handleDownloadPdf}
          className="mb-4 h-8 w-fit min-w-16 self-end bg-[#F36562] px-2 text-white"
        >
          Print
        </button>
      </div>
      <div className="flex h-full w-fit flex-col items-center justify-center self-center overflow-y-scroll pt-[400px]">
        <div
          className="flex h-[842px] max-h-[842px] min-h-[842px] w-[595px] max-w-full flex-col  bg-white"
          id="pdfContainer"
          ref={ref}
        >
          <div className="flex h-[22.5%] w-full flex-row items-center justify-between  px-[2rem]">
            <div className="h-[40%] w-[10%]"></div>
          </div>
          <div className="flex h-fit w-full flex-row flex-wrap items-center justify-between border-t-[.1rem] border-[#958E8E] px-[1rem] py-[8px]">
            <div className="flex h-full w-full flex-col justify-start ">
              <div className="flex flex-row gap-x-4 text-sm">
                <div>
                  <span className="mr-2 font-bold">P-ID: </span>
                  <span className="">{props.patient?.patient_id}</span>{" "}
                </div>
                <div className="flex flex-row space-x-[1rem] whitespace-nowrap text-sm">
                  <span className="font-bold">Date:</span>
                  <span>
                    {date.getDate()}-{date.getMonth() + 1}-{date.getFullYear()}
                  </span>
                </div>
                <div className="flex flex-row space-x-[1rem] whitespace-nowrap text-sm">
                  <span className="font-bold">Time:</span>
                  <span>
                    {date.getHours()}:
                    {date.getMinutes() < 10
                      ? `0${date.getMinutes()}`
                      : date.getMinutes()}
                  </span>
                </div>
              </div>
              <div className="flex flex-row gap-x-4 text-sm">
                <div className="flex flex-row whitespace-nowrap text-sm">
                  <span className="mr-2 font-bold">Name: </span>
                  <span className="">
                    {props.patient?.first_name} {props.patient?.last_name}
                  </span>
                </div>
                <div className="flex flex-row  whitespace-nowrap text-sm">
                  <span className="mr-2 font-bold">Age: </span>
                  <span>{props.patient?.age}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col border-t-[.1rem] border-[#958E8E]">
            <div className="h-fit w-full space-y-[0.5rem] border-b-[.1rem] border-[#958E8E] p-[1rem] text-sm">
              <p className="text-wrap ">
                <span className="mr-1 font-bold">Symptoms:</span>
                {props.prescription_data.symptom}
              </p>
              {/* <p className="l space-x-2 text-wrap">
                <span className="mr-1 font-bold">Diagnosis:</span>
                {props.prescription_data.diagnosis}
              </p> */}
              <div className="flex flex-row flex-wrap gap-x-4 gap-y-2">
                <p className="gap-x-2 text-wrap">
                  <span className="font-bold">Diagnosis:</span>
                  {props.prescription_data.diagnosis}
                </p>
                <div className="flex flex-row  gap-x-2 whitespace-nowrap">
                  <span className="font-bold">BP:</span>
                  <span className="">{props.prescription_data.bp} mm Hg</span>
                </div>
                <div className="flex flex-row gap-x-2 whitespace-nowrap">
                  <span className="font-bold">Weight:</span>
                  <span className="">{props.prescription_data.weight}KG</span>
                </div>
              </div>
              <p className="text-wrap break-all">
                <span className="mr-1 font-bold">Reports:</span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: formatTextWithLineBreaks(
                      props.prescription_data.reports,
                    ),
                  }}
                ></span>
              </p>
              {/* <div className="grid grid-cols-2">
                <div className="flex w-full flex-row  space-x-1 whitespace-nowrap">
                  <span className="font-bold">BP:</span>
                  <span className="">{props.prescription_data.bp} mm Hg</span>
                </div>
                <div className="flex w-full flex-row space-x-1 whitespace-nowrap">
                  <span className="font-bold">Weight:</span>
                  <span className="">{props.prescription_data.weight}KG</span>
                </div>
              </div> */}
              {/* <div className="flex flex-row">
                <div className="flex flex-row  space-x-1 whitespace-nowrap">
                  <span className="font-bold">BP:</span>
                  <span className="">{props.prescription_data.bp} mm Hg</span>
                </div>
                <div className="flex flex-row space-x-1 whitespace-nowrap">
                  <span className="font-bold">Weight:</span>
                  <span className="">{props.prescription_data.weight}KG</span>
                </div>
                <p className="l space-x-2 text-wrap">
                  <span className="mr-1 font-bold">Diagnosis:</span>
                  {props.prescription_data.diagnosis}
                </p>
              </div> */}
            </div>
            <div className="flex h-full w-full flex-col gap-y-2 px-[1rem]">
              <div className="flex h-fit w-full flex-col">
                <h2 className="text-md font-bold">RX</h2>
                <div className="flex h-fit w-full flex-col text-sm">
                  {props.prescription_data.medicine.map((item, index) => {
                    return (
                      <div
                        className="mb-2 grid w-full grid-cols-2 justify-between"
                        key={index}
                      >
                        <div className="">{item.medicine}</div>
                        <div className="">{item.repeatitions}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={`flex h-fit w-full flex-col`}>
                <h2 className="text-md font-bold">Test To Do:</h2>
                <div className="flex h-fit w-[80%] flex-col">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: formatTextWithLineBreaks(
                        props.prescription_data.tests,
                      ),
                    }}
                  ></span>
                </div>
              </div>
              <div className="flex h-fit w-full flex-col">
                <h2 className="text-md font-bold">Note:</h2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: formatTextWithLineBreaks(
                      props.prescription_data.note,
                    ),
                  }}
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescipttionPopup;
