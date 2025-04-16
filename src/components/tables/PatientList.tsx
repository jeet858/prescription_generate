import * as React from "react";

import Heading from "../elements/Heading";
import { FaSearch } from "react-icons/fa";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Modal } from "@mui/material";
import SuccessPopup from "../popups/Success";
import ErrorPopup from "../popups/Error";

const PatientListTable: React.FunctionComponent = () => {
  const { data, isLoading, isError } = api.patient.get_all.useQuery(undefined, {
    refetchInterval: 2000,
  });
  const deletePatient = api.patient.delete_patient.useMutation({
    onSuccess(data, variables, context) {
      setSuccessPopupOpen(true);
    },
    onError(error, variables, context) {
      setErrorPopup({
        state: true,
        message: `Error occured while deleteing patient data please try again ${error.message}`,
      });
    },
  });
  const [successPopupOpen, setSuccessPopupOpen] = React.useState(false);
  const [errorPopup, setErrorPopup] = React.useState({
    state: false,
    message: "",
  });
  const [searchData, setSearchData] = React.useState("");
  const router = useRouter();
  return (
    <div className="h-full w-full">
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
          message="The Patient is Successfully Deleted"
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
          message={errorPopup.message}
        />
      </Modal>
      <Heading SecondHeading1={"Patient"} SecondHeading2={"List"} text={""} />
      <div className="flex h-[5%] justify-start space-x-2">
        <input
          type="text"
          placeholder="Search..."
          className="m-1"
          onChange={(e) => {
            setSearchData(e.target.value);
          }}
        />
        <button className="flex h-[42px] w-[55px] items-center justify-center bg-[#F36562] text-white">
          <FaSearch />
        </button>
      </div>
      <div className="h-[75%] w-full">
        <div className="flex h-full w-full flex-col pb-4">
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
          {data
            ?.filter(
              (item) =>
                item.patient_id.includes(searchData) ||
                item.first_name.includes(searchData) ||
                item.last_name.includes(searchData) ||
                item.contact_number.toString().includes(searchData),
            )
            .map((item, index) => (
              <div
                key={index}
                className={`${index % 2 !== 0 ? "bg-[#F9F1F1]" : "bg-[#F0F0F0]"} flex h-[86px]`}
              >
                <div className="tablet:text-sm  flex w-[15%] items-center justify-center text-center">
                  {item.patient_id}
                </div>
                <div className="tablet:text-sm  flex w-[20%] items-center justify-center text-center">
                  {item.first_name} {item.last_name}
                </div>
                <div className="tablet:text-sm flex w-[15%] items-center justify-center text-center">
                  {item.age}
                </div>
                <div className="tablet:text-sm  flex w-[20%] items-center justify-center text-center">
                  {item.contact_number.toString()}
                </div>
                <div className="tablet:text-sm tablet:space-x-2 flex w-[30%] items-center justify-center space-x-4">
                  <button
                    className="tablet:h-[30px] tablet:w-[70px] h-[41px] w-[95px] bg-[#FCA19F] hover:bg-[#F36562]"
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
                    className="tablet:h-[30px] tablet:w-[70px] h-[41px] w-[95px] bg-[#FCA19F] hover:bg-[#F36562]"
                    onClick={() => {
                      // router.push({
                      //   pathname: "report-view",
                      //   query: {
                      //     patient_id: item.patient_id,
                      //   },
                      // });
                      deletePatient.mutate({ patient_id: item.patient_id });
                    }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PatientListTable;
