import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPen, FaPrint } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { Modal, TextField } from "@mui/material";
import { api } from "~/utils/api";
import PrescipttionPopup from "./ViewPrescriptionPopup";
import SuccessPopup from "../popups/Success";
import ErrorPopup from "../popups/Error";
import NotSavedPopup from "../popups/NotSavedPopup";
import ProcessingPopup from "../popups/Processing";
interface Iprops {
  previous_prescription?: string;
}
const Prescriptiion: React.FunctionComponent<Iprops> = (props) => {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [selectPreviousPrescription, setPreviousPrescription] = useState("");
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavedPopupOpen, setIsSavedPopupOpen] = React.useState(false);
  const [alreadySavedPopup, setAlreadySavedPopup] = React.useState(false);
  const [processingPopup, setProcessingPopup] = useState(false);
  const [successPopupOpen, setSuccessPopupOpen] = React.useState(false);
  const [errorPopup, setErrorPopup] = React.useState({
    state: false,
    type: "",
  });
  const { patient_id, template_id, previous_prescription } = router.query;
  const date = new Date();
  const { data: patient } = api.patient.find_by_id.useQuery(
    patient_id as string,
  );
  const {
    data: template_data,
    isError,
    isLoading,
  } = api.template.template_data_by_id.useQuery({
    template_id: template_id as string,
  });
  const { data: previousPrescriptions } =
    api.prescription.get_by_patient_id.useQuery(
      {
        patient_id: patient_id as string,
      },
      { refetchInterval: 2000 },
    );
  const {
    data: previousPrescriptionData,
    isLoading: isPreviousPrescriptionDataLoading,
    isError: isPreviousPrescriptionDataError,
  } = api.prescription.get_whole_prescription_data_by_id.useQuery({
    prescription_id: props.previous_prescription as string,
  });
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [prescriptionData, setPrescriptionData] = useState({
    prescription_id: `${patient_id?.toString()}_${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getFullYear()).slice(2)}${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`,
    patient_id: patient_id as string,
    date: date,
    tests: "",
    symptom: "",
    bp: "",
    diagnosis: "",
    weight: "",
    note: "",
    reports: "",
    test_report: "",
    medicine: [] as {
      medicine: string;
      repeatitions: string;
      id: string;
    }[],
  });
  const [medicineList, setMedicineList] = useState({
    medicine: "",
    repeatitions: "",
    id: "",
  });
  useEffect(() => {
    if (
      previous_prescription &&
      !initialFetchDone &&
      !isPreviousPrescriptionDataError &&
      !isPreviousPrescriptionDataLoading &&
      previousPrescriptionData &&
      previousPrescriptionData.prescription &&
      previousPrescriptionData.prescription_data
    ) {
      console.log(previousPrescriptionData.prescription);
      console.log(previousPrescriptionData.prescription_data);

      const arr: {
        id: string;
        medicine: string;
        repeatitions: string;
      }[] = [];
      previousPrescriptionData.prescription_data.forEach((item) => {
        const newItem = {
          id: date.toISOString(),
          medicine: item.medicine,
          repeatitions: item.repeatitions, // Renaming 'doseage' to 'repetitions'
        };
        arr.push(newItem);
      });
      setPrescriptionData({
        ...prescriptionData,
        patient_id: patient_id as string,
        prescription_id: `${previousPrescriptionData.prescription.patient_id.toString()}_${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getFullYear()).slice(2)}${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`,
        medicine: arr,
        tests: previousPrescriptionData.prescription.tests as string,
        note: previousPrescriptionData.prescription.note as string,
        symptom: previousPrescriptionData.prescription.symptom,
        diagnosis: previousPrescriptionData.prescription.diagnosis,
        bp: previousPrescriptionData.prescription.bp as string,
        weight: previousPrescriptionData.prescription.weight
          ? previousPrescriptionData.prescription.weight.toString()
          : "",
      });

      // Set initial fetch done to true
      setInitialFetchDone(true);
    } else if (
      !isLoading &&
      !isError &&
      template_data &&
      patient_id &&
      !initialFetchDone
    ) {
      // Perform your desired operation here
      console.log("Data successfully fetched:", template_data);
      // You can perform any operation you want with the fetched data here
      const arr: {
        id: string;
        medicine: string;
        repeatitions: string;
      }[] = [];
      template_data.forEach((item) => {
        const newItem = {
          id: date.toISOString(),
          medicine: item.medicine,
          repeatitions: item.doseage, // Renaming 'doseage' to 'repetitions'
        };
        arr.push(newItem);
      });
      setPrescriptionData({
        ...prescriptionData,
        patient_id: patient_id as string,
        prescription_id: `${patient_id.toString()}_${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getFullYear()).slice(2)}${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`,
        medicine: arr,
      });

      // Set initial fetch done to true
      setInitialFetchDone(true);
    }
  }, [
    template_data,
    isLoading,
    isError,
    initialFetchDone,
    patient_id,
    prescriptionData,
  ]);
  const handleMedicineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setMedicineList({
      ...medicineList,
      [name]: value,
      id: date.toTimeString(),
    });
  };

  const savePrescription = api.prescription.create_prescription.useMutation({
    onError(error, variables, context) {
      setProcessingPopup(false);
      setErrorPopup({
        state: true,
        type: error.message,
      });
    },
    onSuccess(data, variables, context) {
      setIsSaved(true);
      setProcessingPopup(false);
      setSuccessPopupOpen(true);
    },
  });
  const create = () => {
    if (isSaved) {
      setAlreadySavedPopup(true);
      return;
    }
    setProcessingPopup(true);

    setPrescriptionData({
      ...prescriptionData,
      prescription_id: `${patient_id?.toString()}_${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getFullYear()).slice(2)}${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`,
    });
    console.log(prescriptionData.patient_id, prescriptionData.prescription_id);
    if (
      prescriptionData.patient_id === "" ||
      prescriptionData.medicine.length === 0
    ) {
      setProcessingPopup(false);
      if (prescriptionData.patient_id === "") {
        setErrorPopup({ type: "id", state: true });
        return;
      } else if (prescriptionData.medicine.length === 0) {
        setErrorPopup({ type: "medicine_empty", state: true });
        return;
      }
      console.log(prescriptionData.medicine.length);
    } else if (
      prescriptionData.symptom === "" ||
      prescriptionData.diagnosis === ""
    ) {
      setProcessingPopup(false);
      setErrorPopup({ type: "prescription_data", state: true });
      return;
    } else {
      console.log(medicineList);

      if (medicineList.medicine !== "" || medicineList.repeatitions !== "") {
        setProcessingPopup(false);

        setErrorPopup({ type: "medicine_pending", state: true });
      } else {
        savePrescription.mutate(prescriptionData);
      }
    }
  };
  const { data: repetitions } = api.medicine.get_repetitions.useQuery();

  const { data: medicine } = api.medicine.get_all.useQuery();

  if (!initialFetchDone) {
    return <div>Loading</div>;
  }
  return (
    <div
      className="flex h-full w-full flex-col font-serif text-xs"
      id="pdfContainer"
    >
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
          message="The Prescription is Successfully saved"
        />
      </Modal>
      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={errorPopup.state}
        onClose={() => {
          setErrorPopup({ state: false, type: "" });
        }}
        className="flex h-full w-full items-center justify-center"
      >
        <ErrorPopup
          onClick={() => {
            setErrorPopup({ state: false, type: "" });
          }}
          message={`${errorPopup.type === "id" ? "Patient id is not available please restart the process" : errorPopup.type === "medicine_empty" ? "Please add atleast one medicine in order to continue" : errorPopup.type === "medicine_pending" ? "You have unsaved medicines please save or remove them before continue" : errorPopup.type === "prescription_data" ? "Please enter symptom , diagnosis, " : `Error occured contact developers ${errorPopup.type}`}`}
        />
      </Modal>
      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={isSavedPopupOpen}
        onClose={() => {
          setIsSavedPopupOpen(false);
        }}
        className="flex h-full w-full items-center justify-center"
      >
        <NotSavedPopup
          onNoClick={() => {
            setIsSavedPopupOpen(false);
          }}
          onYesClick={() => {
            setIsSavedPopupOpen(false);
            setOpen(true);
          }}
        />
      </Modal>
      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={alreadySavedPopup}
        onClose={() => {
          setAlreadySavedPopup(false);
        }}
        className="flex h-full w-full items-center justify-center"
      >
        <ErrorPopup
          onClick={() => {
            setAlreadySavedPopup(false);
          }}
          message="Prescription is already saved"
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
        open={open}
        onClose={handleClose}
        className="flex   justify-center overflow-x-scroll overflow-y-scroll"
      >
        <PrescipttionPopup
          patient={patient}
          prescription_data={prescriptionData}
          ref={ref}
        ></PrescipttionPopup>
      </Modal>
      <div className="flex h-fit w-full flex-row justify-between bg-[#F0F0F0] p-[1%]">
        <div className="flex flex-col ">
          <span className=" space-x-5">
            <span className="font-bold text-black">P-ID:</span>
            <span>{patient?.patient_id}</span>
          </span>
          <span className=" space-x-5">
            <span className="font-bold text-black">Name:</span>
            <span>
              {patient?.first_name} {patient?.last_name}
            </span>
          </span>
          <span className=" space-x-5">
            <span className="font-bold text-black">Age:</span>
            <span>{patient?.age}</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className=" space-x-5">
            <span className="font-bold text-black">Date:</span>
            <span>
              {date.getDate()}-{date.getMonth() + 1}-{date.getFullYear()}
            </span>
          </span>
          <span className=" space-x-5">
            <span className="font-bold text-black">Time:</span>
            <span>
              {date.getHours()}:
              {date.getMinutes() < 10
                ? `0${date.getMinutes()}`
                : date.getMinutes()}
            </span>
          </span>
        </div>
      </div>
      <div className="flex h-full w-full flex-wrap overflow-y-scroll">
        <div className="my-2 flex h-[99%] w-full flex-col self-center">
          <div className="flex h-[15%] w-full flex-row ">
            <div className="flex h-full w-[85%] flex-col justify-evenly">
              <div className="flex h-[45%] w-[85%] justify-between">
                <div className="ml-2 flex h-full w-1/2 items-center justify-between ">
                  <p className="w-[20%] text-lg font-bold xl2:w-fit xl2:text-sm">
                    Symptoms
                  </p>
                  <textarea
                    placeholder="Enter Symptoms"
                    className="m-2 h-full w-[70%] border-2 border-[#9AA0B9] p-2 focus:outline-[#9AA0B9]"
                    value={prescriptionData.symptom}
                    onChange={(e) => {
                      setPrescriptionData({
                        ...prescriptionData,
                        symptom: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="ml-2 flex h-full w-1/2 items-center justify-between ">
                  <p className="w-[20%] text-lg font-bold xl2:w-fit xl2:text-sm">
                    BP
                  </p>
                  <input
                    type="text"
                    placeholder="Enter BP"
                    value={prescriptionData.bp}
                    className="m-2 h-full w-[70%] border-2 border-[#9AA0B9] p-2 focus:outline-[#9AA0B9]"
                    onChange={(e) => {
                      setPrescriptionData({
                        ...prescriptionData,
                        bp: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex h-[45%] w-[85%] ">
                <div className="ml-2 flex h-full w-1/2 items-center justify-between ">
                  <p className="w-[20%] text-lg font-bold xl2:w-fit xl2:text-sm">
                    Diagnosis
                  </p>
                  <textarea
                    placeholder="Enter Diagnosis"
                    value={prescriptionData.diagnosis}
                    className="m-2 h-full w-[70%] border-2 border-[#9AA0B9] p-2 focus:outline-[#9AA0B9]"
                    onChange={(e) => {
                      setPrescriptionData({
                        ...prescriptionData,
                        diagnosis: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="ml-2 flex h-full w-1/2 items-center justify-between ">
                  <p className="w-[20%] text-lg font-bold xl2:w-fit xl2:text-sm">
                    Weight
                  </p>
                  <input
                    type="number"
                    placeholder="Enter Weight (in Kg)"
                    value={prescriptionData.weight}
                    className="m-2 h-full w-[70%] border-2 border-[#9AA0B9] p-2 focus:outline-[#9AA0B9]"
                    onChange={(e) => {
                      setPrescriptionData({
                        ...prescriptionData,
                        weight: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex h-[45%] w-[85%] items-center justify-between">
                <p className="ml-2 w-[14%] text-lg font-bold xl2:w-fit xl2:text-sm">
                  Reports
                </p>
                <textarea
                  placeholder="Reports(Optional)"
                  value={prescriptionData.reports}
                  className="mr-2 h-full w-[80%] flex-grow border-2 border-[#9AA0B9] p-2 focus:outline-[#9AA0B9]"
                  onChange={(e) => {
                    setPrescriptionData({
                      ...prescriptionData,
                      reports: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex h-full w-[15%]">
              <div className="flex w-1/2 cursor-pointer flex-col items-center justify-center">
                <FaPrint
                  className="h-8 w-8 text-[#7E7E7E]"
                  onClick={() => {
                    create();
                    console.log(template_id, patient_id);
                  }}
                />

                <p>Save</p>
              </div>
              <div className="flex w-1/2 cursor-pointer flex-col items-center justify-center">
                <FaEye
                  className="h-8 w-8 text-[#7E7E7E]"
                  onClick={() => {
                    isSaved ? setOpen(true) : setIsSavedPopupOpen(true);
                    console.log(template_id, patient_id);
                  }}
                />
                <p>Preview</p>
              </div>
            </div>
          </div>
          <div className="flex h-[85%] w-full flex-col px-2">
            <div className="flex h-full w-full flex-col">
              <div className="h-fit w-full">
                <p className="mt-[4%] text-3xl font-bold">RX</p>
                {prescriptionData.medicine.map((item, index) => {
                  return (
                    <div
                      className="my-2 flex w-3/5 items-center justify-between text-xl"
                      key={index}
                    >
                      <p className="w-[40%] ">{item.medicine}</p>
                      <p className="w-[40%]">{item.repeatitions}</p>

                      <FaPen
                        className="h-4 w-4 text-[#4690C7]"
                        onClick={() => {
                          if (
                            medicineList.medicine !== "" ||
                            medicineList.repeatitions !== ""
                          ) {
                            const arr = prescriptionData.medicine;
                            arr.push(medicineList);
                            setPrescriptionData({
                              ...prescriptionData,
                              medicine: arr,
                            });
                            const element = prescriptionData.medicine.find(
                              (ele) =>
                                ele.id === item.id &&
                                ele.medicine === item.medicine &&
                                ele.repeatitions === item.repeatitions,
                            );
                            element ? setMedicineList(element) : null;
                          }
                          const element = prescriptionData.medicine.find(
                            (ele) =>
                              ele.id === item.id &&
                              ele.medicine === item.medicine &&
                              ele.repeatitions === item.repeatitions,
                          );
                          element ? setMedicineList(element) : null;
                          const updatedMedicineList =
                            prescriptionData.medicine.filter(
                              (ele) =>
                                ele.id !== item.id ||
                                ele.medicine !== item.medicine ||
                                ele.repeatitions !== item.repeatitions,
                            );
                          setPrescriptionData({
                            ...prescriptionData,
                            medicine: updatedMedicineList,
                          });
                        }}
                      />

                      <FaXmark
                        className="h-6 w-6 text-[#E43030]"
                        onClick={() => {
                          const updatedMedicineList =
                            prescriptionData.medicine.filter(
                              (ele) =>
                                ele.id !== item.id ||
                                ele.medicine !== item.medicine ||
                                ele.repeatitions !== item.repeatitions,
                            );
                          setPrescriptionData({
                            ...prescriptionData,
                            medicine: updatedMedicineList,
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-[2%] flex h-fit w-full justify-evenly">
                <input
                  name="medicine"
                  className="h-11 w-[30%] border-2 border-[#DBDBDB] focus:outline-[#DBDBDB]"
                  list="medicine"
                  type="text"
                  placeholder="Select Medicine"
                  onChange={handleMedicineChange}
                  value={medicineList.medicine}
                />
                <datalist id="medicine">
                  {medicine?.map((item, index) => {
                    return <option key={index} value={item.name}></option>;
                  })}
                </datalist>
                <input
                  name="repeatitions"
                  className="h-11 w-[30%] border-2 border-[#DBDBDB] focus:outline-[#DBDBDB]"
                  list="repeatitions"
                  type="text"
                  placeholder="Select Repeatitions"
                  onChange={handleMedicineChange}
                  value={medicineList.repeatitions}
                />
                <datalist id="repeatitions">
                  {repetitions?.map((item, index) => {
                    return (
                      <option key={index} value={item.name}>
                        {item.name}
                      </option>
                    );
                  })}
                </datalist>

                <button
                  className="h-10 w-[10%] bg-[#F36562] text-white"
                  onClick={() => {
                    console.log(medicineList);
                    if (
                      medicineList.medicine === "" ||
                      medicineList.repeatitions === ""
                    ) {
                      alert("medicine name or repeatation cant be empty");
                      return;
                    } else if (
                      prescriptionData.medicine.find(
                        (item) =>
                          item.medicine === medicineList.medicine &&
                          item.repeatitions === medicineList.repeatitions,
                      )
                    ) {
                      alert(
                        "Same medicine with exact same repetitions already exists",
                      );
                      setMedicineList({
                        medicine: "",
                        repeatitions: "",
                        id: "",
                      });
                      return;
                    }
                    setPrescriptionData((prevData) => ({
                      ...prevData,
                      medicine: [...prevData.medicine, medicineList],
                    }));
                    setMedicineList({
                      medicine: "",
                      repeatitions: "",
                      id: "",
                    });
                  }}
                >
                  Save
                </button>
              </div>

              <div className="mt-4 flex h-fit w-4/5 items-center justify-between">
                <p className="w-32 text-xl font-bold">Tests To do</p>
                <TextField
                  id="outlined-multiline-flexible"
                  multiline
                  maxRows={4}
                  value={prescriptionData.tests}
                  className="min-w-0 flex-grow font-serif"
                  placeholder="Tests(Optional)"
                  onChange={(e) => {
                    setPrescriptionData({
                      ...prescriptionData,
                      tests: e.target.value,
                    });
                  }}
                />
              </div>

              <div className="my-4 flex h-fit w-4/5 items-center justify-between">
                <p className="w-32 text-xl font-bold">Notes</p>
                <TextField
                  id="outlined-multiline-flexible"
                  multiline
                  maxRows={4}
                  value={prescriptionData.note}
                  className="h-fit min-w-0 flex-grow font-serif"
                  placeholder="Notes (Optional)"
                  onChange={(e) => {
                    setPrescriptionData({
                      ...prescriptionData,
                      note: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="mb-2 mt-4 flex h-fit w-full items-center justify-center gap-x-4">
                <button
                  className="flex h-10 w-20 items-center justify-center bg-[#3D4460] text-white"
                  onClick={async () => {
                    await router.push("new-appointments");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex h-10 w-20 items-center justify-center bg-[#F36562] text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    create();
                  }}
                >
                  Save
                </button>
              </div>
            </div>
            <div className="flex h-1/5 w-full flex-wrap justify-between border-t-2 border-[#958E8E] pb-4">
              <div className="ml-4 mt-2 flex h-full w-[45%] flex-col justify-evenly">
                <p className="text-lg font-bold">
                  Prescription, Test Procedures & Reports
                </p>
                <div className="flex w-full items-center justify-between">
                  <select
                    className="mr-2 h-12 w-[75%] border-2 border-[#958E8E]"
                    onChange={(e) => {
                      setPreviousPrescription(e.target.value);
                    }}
                  >
                    <option value="">
                      Tap to view previous prescriptions with report
                    </option>
                    {previousPrescriptions?.map(
                      (previous_prescription, index) => {
                        return (
                          <option
                            value={previous_prescription.prescription_id}
                            key={index}
                          >
                            {previous_prescription.date.toDateString()}-
                            {previous_prescription.date.toLocaleTimeString()}
                          </option>
                        );
                      },
                    )}
                  </select>
                  <button
                    className="h-12 w-[20%] min-w-[20%] bg-[#F36562] font-semibold text-white"
                    onClick={async (e) => {
                      e.preventDefault();
                      console.log(selectPreviousPrescription);
                      if (selectPreviousPrescription !== "") {
                        await router.push({
                          pathname: "prescription-view",
                          query: {
                            prescription_id: selectPreviousPrescription,
                            patient_id: patient_id,
                            template_id: template_id,
                          },
                        });
                      } else {
                        alert("No previous prescription is selected");
                      }
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prescriptiion;
