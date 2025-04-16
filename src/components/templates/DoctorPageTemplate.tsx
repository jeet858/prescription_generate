import * as React from "react";
import logo from "../../../images/healthcare logo 2_Mesa de trabajo 1 1.png";
import patient_registration_icon from "../../../images/registration-form 1.png";
import appointments_icon from "../../../images/Assignment.png";
import patient_list_icon from "../../../images/User attributes.png";
import reports_icon from "../../../images/Group 69.png";
import upload_reports_icon from "../../../images/file 1.png";
import templates_icon from "../../../images/Dashboard.png";
import doctor_logo from "../../../images/medical-symbol 1.png";
import Image from "next/image";
import { FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import { LuClipboardList, LuClipboardSignature } from "react-icons/lu";
import { PiUserList } from "react-icons/pi";
import { TbReportAnalytics } from "react-icons/tb";
import { MdOutlineDashboard, MdOutlineUploadFile } from "react-icons/md";
import { FaCircleUser } from "react-icons/fa6";
import { getSession, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
interface IProps {
  templateParams?: {
    title: string;
  };
  activePage:
    | "patient_registration"
    | "appointments"
    | "patient_list"
    | "reports"
    | "upload_reports"
    | "templates"
    | "";
  doctorName: string;
  children?: JSX.Element | JSX.Element[];
}
const DoctorPageTemplate: React.FunctionComponent<IProps> = (props) => {
  const router = useRouter();
  const a = useSession();
  return (
    <>
      <title></title>
      <main className=" flex h-screen w-screen flex-nowrap">
        <div className="flex h-full w-1/5 flex-col justify-evenly bg-[#3D4460]">
          <Image
            src={logo}
            alt="Description of the image"
            className="h-[5%] w-4/5 self-center"
          />
          <div className="flex h-[70%] w-full flex-col">
            <div
              className={`flex h-[10%] w-full items-center rounded-[45px] ${props.activePage === "patient_registration" ? "bg-[#FCA19F]" : "bg-transparent"} cursor-pointer hover:bg-[#F36562] tablet:gap-x-[6px]`}
              onClick={async () => {
                await router.push("patient-registration-form");
              }}
            >
              <div className="hit ml-[2.7rem] flex w-14 tablet:ml-4 tablet:w-fit">
                {/* <Image
                  src={patient_registration_icon}
                  alt="Description of the image"
                  className=" h-10 w-10"
                /> */}
                <LuClipboardSignature className="h-10 w-10 text-white tablet:h-8 tablet:w-8" />
              </div>
              <p className="text-lg font-medium text-white tablet:text-sm">
                Patient Registration
              </p>
            </div>
            <div
              className={`flex h-[10%] w-full items-center rounded-[45px] ${props.activePage === "appointments" ? "bg-[#FCA19F]" : "bg-transparent"} cursor-pointer hover:bg-[#F36562] tablet:gap-x-[6px]`}
              onClick={async () => {
                await router.push("new-appointments");
              }}
            >
              <div className="hit ml-[2.7rem] flex   w-14 tablet:ml-4 tablet:w-fit">
                {/* <Image
                  src={appointments_icon}
                  alt="Description of the image"
                  className=" h-10 w-10"
                /> */}
                <LuClipboardList className="h-10 w-10 text-white tablet:h-8 tablet:w-8" />
              </div>
              <p className="text-lg font-medium text-white tablet:text-sm">
                Appointments
              </p>
            </div>
            <div
              className={`flex h-[10%] w-full items-center rounded-[45px] ${props.activePage === "patient_list" ? "bg-[#FCA19F]" : "bg-transparent"} cursor-pointer hover:bg-[#F36562] tablet:gap-x-[6px]`}
              onClick={async () => {
                await router.push("patient-lists");
              }}
            >
              <div className="hit ml-10 flex w-14  tablet:ml-4 tablet:w-fit">
                {/* <Image
                  src={patient_list_icon}
                  alt="Description of the image"
                  className=" h-10 w-10"
                /> */}
                <PiUserList className="h-10 w-10 pl-[.2rem] text-white tablet:h-8  tablet:w-8 tablet:pl-0" />
              </div>
              <p className="text-lg font-medium text-white tablet:text-sm">
                Patient List
              </p>
            </div>
            {/* <div
              className={`flex h-[10%] w-full items-center rounded-[45px] ${props.activePage === "reports" ? "bg-[#FCA19F]" : "bg-transparent"} cursor-pointer hover:bg-[#F36562]`}
              onClick={async () => {
                await router.push("report-view");
              }}
            >
              // <div className="hit ml-10 flex w-14">
              //   <Image
              //     src={reports_icon}
              //     alt="Description of the image"
              //     className=" h-10 w-10"
              //   />

                <TbReportAnalytics className="h-10 w-10 text-white" />
              </div>
              <p className="text-lg font-medium text-white">Reports</p>
            </div> */}
            {/* <div
              className={`flex h-[10%] w-full items-center rounded-[45px] ${props.activePage === "upload_reports" ? "bg-[#FCA19F]" : "bg-transparent"} cursor-pointer hover:bg-[#F36562]`}
              onClick={async () => {
                await router.push("report-upload");
              }}
            >
              <div className="hit ml-10 flex w-14">
                // <Image
                //   src={upload_reports_icon}
                //   alt="Description of the image"
                //   className=" h-10 w-10"
                // />
                <MdOutlineUploadFile className="h-10 w-10 text-white" />
              </div>
              <p className="text-lg font-medium text-white">Upload Reports</p>
            </div> */}
            <div
              className={`flex h-[10%] w-full items-center rounded-[45px] ${props.activePage === "templates" ? "bg-[#FCA19F]" : "bg-transparent"} cursor-pointer hover:bg-[#F36562] tablet:gap-x-[6px]`}
              onClick={async () => {
                await router.push("template-list");
              }}
            >
              <div className="hit ml-10 flex w-14  tablet:ml-4 tablet:w-fit">
                {/* <Image
                  src={templates_icon}
                  alt="Description of the image"
                  className=" h-8 w-8"
                /> */}
                <MdOutlineDashboard className="h-10 w-10 text-white tablet:h-8 tablet:w-8" />
              </div>
              <p className="text-lg font-medium text-white tablet:text-sm">
                Templates
              </p>
            </div>
          </div>
          <div
            className="ml-10 flex cursor-pointer items-center  tablet:ml-4"
            onClick={async () => {
              await signOut({ redirect: true, callbackUrl: "/doctor-login" });
            }}
          >
            <FaSignOutAlt className="mr-2 h-10 w-10 text-white tablet:h-8 tablet:w-8" />
            <p className="text-lg font-medium text-white tablet:text-sm">
              Sign Out
            </p>
          </div>
        </div>
        <div className="flex h-screen w-4/5 flex-wrap items-center justify-center overflow-y-scroll">
          <div className="flex h-fit max-h-[95%] min-h-[95%] w-[95%] flex-col self-center rounded-md border-2 border-black">
            <div className="flex h-fit min-h-fit w-full items-center justify-between rounded-t-md border-black bg-[#9AA0B9] py-4">
              <Image alt="" src={doctor_logo} className="py-2 pl-2" />
              <div className="flex items-center justify-center">
                <FaCircleUser className="mr-4 h-10 w-10 text-white" />
                <p className="mr-4 text-lg font-medium text-white">
                  Dr. Amitava Bhattacharya
                </p>
              </div>
            </div>
            <div className="maxh-4/5 flex h-[80%] w-full flex-wrap overflow-y-scroll">
              {props.children}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DoctorPageTemplate;
