import * as React from "react";

import Heading from "../elements/Heading";
import { FaSearch } from "react-icons/fa";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { css, Modal, styled } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import clsx from "clsx";

const NewAppointmentsTable: React.FunctionComponent = () => {
  const { data, isLoading, isError } = api.patient.get_all.useQuery();
  const [searchData, setSearchData] = React.useState("");
  const [templateSearchText, setTemplateSearchText] = React.useState("");
  const [attendPatientData, setAttendPatientData] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const router = useRouter();
  const { data: templates } = api.template.get_all.useQuery();

  return (
    <div className="h-full w-full">
      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={open}
        onClose={handleClose}
        slots={{ backdrop: StyledBackdrop }}
        className="flex items-center justify-center"
      >
        <div className="flex h-4/5 w-4/5 flex-col self-center bg-white tablet:w-[85%]">
          <div className="flex h-fit w-full justify-center text-2xl">
            <p>Select</p>
            <p className="pl-2 text-[#E52727]">Template</p>
          </div>
          <div className="mb-2 flex h-fit w-4/5 items-center justify-center self-center border border-[#DBDBDB]">
            <div className="flex w-full items-center justify-center px-2">
              <input
                className="w-full placeholder:text-[#958E8E] focus:outline-none"
                placeholder="Search Template..."
                onChange={(e) => {
                  setTemplateSearchText(e.target.value);
                }}
              />
              <FaSearch className="cursor-pointer" />
            </div>
          </div>
          <div className="flex h-fit w-full bg-[#F0F0F0]">
            <p className="flex w-1/3 items-center justify-center">Sl No.</p>
            <p className="flex w-1/3 items-center justify-center">Name</p>
            <p className="flex w-1/3 items-center justify-center">
              Description
            </p>
          </div>
          {/* add code for popup to select templates */}
          <div className="flex h-full w-full flex-col overflow-y-scroll pb-2 pl-1">
            <div
              className="flex h-fit min-h-fit w-full cursor-pointer gap-x-2 border-b border-black hover:bg-[#F0F0F0]"
              onClick={() => {
                router.push({
                  pathname: "patient-prescription",
                  query: {
                    patient_id: attendPatientData,
                    template_id: "blank",
                  },
                });
              }}
            >
              <p className="flex h-fit min-h-fit w-1/3 flex-col items-center justify-center self-center text-center">
                0.
              </p>
              <p className="flex h-fit min-h-fit w-1/3 flex-col items-center justify-center self-center text-center">
                Blank
              </p>
              <p className="flex h-fit min-h-fit w-1/3 flex-col items-center justify-center  self-center text-center">
                This is a blank template and it creates a blank prescription
              </p>
            </div>
            {templates?.map((template, index) => {
              if (
                templateSearchText === "" ||
                template.template_id
                  .toLocaleLowerCase()
                  .includes(templateSearchText.toLocaleLowerCase())
              ) {
                return (
                  <div
                    key={index}
                    className="flex h-fit w-full cursor-pointer gap-x-2 border-b border-black hover:bg-[#F0F0F0]"
                    onClick={() => {
                      console.log(attendPatientData);
                      console.log(template.template_id);

                      router.push({
                        pathname: "patient-prescription",
                        query: {
                          patient_id: attendPatientData,
                          template_id: template.template_id,
                        },
                      });
                    }}
                  >
                    <p className="flex h-fit min-h-fit w-1/3 flex-col items-center justify-center  self-center text-center">
                      {index + 1}.
                    </p>
                    <p className="flex h-fit min-h-fit w-1/3 flex-col items-center justify-center  self-center text-center">
                      {template.template_id}
                    </p>
                    <p className="flex h-fit min-h-fit w-1/3 flex-col items-center justify-center  self-center text-center">
                      {template.description}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </Modal>
      <Heading
        SecondHeading1={"New Appointment"}
        SecondHeading2={"List"}
        text={""}
      />
      <div className="flex h-[5%] justify-start space-x-2">
        <input
          type="text"
          placeholder="Search..."
          className="m-1"
          onChange={(e) => {
            setSearchData(e.target.value);
          }}
        />
        {/* <input type="date" className="m-1" /> */}
        <button className="flex h-[42px] w-[55px] items-center justify-center bg-[#F36562] text-white">
          <FaSearch />
        </button>
      </div>
      <div className="flex-grow overflow-hidden">
        <div className="flex h-full w-full flex-col">
          <div className="sticky top-0 flex h-[86px] w-full flex-row bg-white">
            <div className="flex  h-[86px] w-[15%] items-center justify-center text-center">
              P-ID
            </div>
            <div className="flex  h-[86px] w-[20%] items-center justify-center text-center">
              NAME
            </div>
            <div className="flex  h-[86px] w-[15%] items-center justify-center text-center">
              AGE
            </div>
            <div className="flex  h-[86px] w-[20%] items-center justify-center text-center">
              CONTACT NO
            </div>
            <div className="flex  h-[86px] w-[30%] items-center justify-center text-center">
              ACTION
            </div>
          </div>
          <div className="flex w-full flex-col pb-4">
            {data
              ?.filter(
                (item) =>
                  searchData === "" ||
                  item.patient_id
                    .toLocaleLowerCase()
                    .includes(searchData.toLocaleLowerCase()) ||
                  item.first_name
                    .toLocaleLowerCase()
                    .includes(searchData.toLocaleLowerCase()) ||
                  item.last_name
                    .toLocaleLowerCase()
                    .includes(searchData.toLocaleLowerCase()) ||
                  item.contact_number.toString().includes(searchData),
              )
              .map((item, index) => (
                <div
                  key={index}
                  className={`${index % 2 !== 0 ? "bg-[#F9F1F1]" : "bg-[#F0F0F0]"} flex h-[86px]`}
                >
                  <div className="flex  w-[15%] items-center justify-center text-center tablet:text-sm">
                    {item.patient_id}
                  </div>
                  <div className="flex  w-[20%] items-center justify-center text-center tablet:text-sm">
                    {item.first_name} {item.last_name}
                  </div>
                  <div className="flex w-[15%] items-center justify-center text-center tablet:text-sm">
                    {item.age}
                  </div>
                  <div className="flex  w-[20%] items-center justify-center text-center tablet:text-sm">
                    {item.contact_number.toString()}
                  </div>
                  <div className="flex w-[30%] items-center justify-center space-x-4 tablet:space-x-2 tablet:text-sm ">
                    <button
                      className="h-[41px] w-[95px] bg-[#FCA19F] hover:bg-[#F36562] tablet:h-[30px] tablet:w-[70px]"
                      onClick={() => {
                        router.push({
                          pathname: "patient-details",
                          query: {
                            patient_id: item.patient_id,
                          },
                        });
                      }}
                    >
                      DETAILS
                    </button>
                    <button
                      className="h-[41px] w-[95px] bg-[#FCA19F] hover:bg-[#F36562] tablet:h-[30px] tablet:w-[70px]"
                      onClick={() => {
                        setAttendPatientData(item.patient_id);
                        handleOpen();
                        // router.push({
                        //   pathname: "patient-prescription",
                        //   query: { patient_id: item.patient_id },
                        // });
                      }}
                    >
                      ATTEND
                    </button>

                    {/* <button
                      className="h-[41px] w-[95px] bg-[#FCA19F] hover:bg-[#F36562]"
                      onClick={() => {
                        router.push({
                          pathname: "report-upload",
                          query: {
                            patient_id: item.patient_id,
                          },
                        });
                      }}
                    >
                      REPORT
                    </button> */}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentsTable;
const Backdrop = React.forwardRef<
  HTMLDivElement,
  { open?: boolean; className: string }
>((props, ref) => {
  const { open, className, ...other } = props;
  return (
    <div
      className={clsx({ "base-Backdrop-open": open }, className)}
      ref={ref}
      {...other}
    />
  );
});
Backdrop.displayName = "Backdrop";
const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.1);
  -webkit-tap-highlight-color: transparent;
`;
