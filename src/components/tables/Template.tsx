import React from "react";
import Heading from "../elements/Heading";
import clsx from "clsx";
import { styled, css } from "@mui/system";
import { Modal as BaseModal } from "@mui/base/Modal";
import { FaSearch, FaEdit, FaPen } from "react-icons/fa";
import { api } from "~/utils/api";
import { FaX, FaXmark } from "react-icons/fa6";
import SuccessPopup from "../popups/Success";
import ErrorPopup from "../popups/Error";

const Template: React.FunctionComponent = () => {
  const [open, setOpen] = React.useState(false);
  const [successPopupOpen, setSuccessPopupOpen] = React.useState(false);
  const [errorPopup, setErrorPopup] = React.useState({
    state: false,
    message: "",
  });
  const [searchData, setSearchData] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const date = new Date();
  const { data: templates } = api.template.get_all.useQuery(undefined, {
    refetchInterval: 1000,
  });
  const { data: templatesData } = api.template.get_all_data.useQuery(
    undefined,
    {
      refetchInterval: 1000,
    },
  );
  const { data: repeatitions } = api.medicine.get_repetitions.useQuery(
    undefined,
    {
      refetchInterval: 1000,
    },
  );
  const { data: meds } = api.medicine.get_all.useQuery();
  const [templateData, setTemplateData] = React.useState({
    template_id: "",
    description: "",
    template_data: [] as {
      medicine: string;
      repeatitions: string;
      id: string;
    }[],
  });
  const [medicineList, setMedicineList] = React.useState({
    medicine: "",
    repeatitions: "",
    id: "",
  });
  const handleMedicineChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setMedicineList({
      ...medicineList,
      [name]: value,
      id: date.toTimeString(),
    });
  };
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setTemplateData({
      ...templateData,
      [name]: value,
    });
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setTemplateData({
      template_id: "",
      description: " ",
      template_data: [] as {
        medicine: string;
        repeatitions: string;
        id: string;
      }[],
    });
    setMedicineList({
      medicine: "",
      repeatitions: "",
      id: "",
    });
    setOpen(false);
    setIsEditing(false);
  };
  const create_template = api.template.create_template.useMutation({
    onError: (err, context) => {
      setErrorPopup({
        state: true,
        message: `Error occured while creating the template ${err.message}`,
      });
    },
    onSuccess: () => {
      handleClose();
      setSuccessPopupOpen(true);
      setMedicineList({
        id: "",
        medicine: "",
        repeatitions: "",
      }),
        setTemplateData({
          template_id: "",
          description: " ",
          template_data: [] as {
            medicine: string;
            repeatitions: string;
            id: string;
          }[],
        });
    },
  });
  const delete_template = api.template.deleteTemplate.useMutation({
    onError: (err, context) => {
      setErrorPopup({
        state: true,
        message: `Error occured while deleting the template ${err.message}`,
      });
    },
    onSuccess: () => {
      handleClose();
      setSuccessPopupOpen(true);
      setMedicineList({
        id: "",
        medicine: "",
        repeatitions: "",
      }),
        setTemplateData({
          template_id: "",
          description: " ",
          template_data: [] as {
            medicine: string;
            repeatitions: string;
            id: string;
          }[],
        });
    },
  });

  const create = () => {
    if (
      templateData.template_id === "" ||
      templateData.template_data.length === 0
    ) {
      if (templateData.template_id === "") {
        setErrorPopup({
          message: "id error occured please try again or contact developers",
          state: true,
        });
      } else if (templateData.template_data.length === 0) {
        setErrorPopup({
          message: "Please add atleast one medicine",
          state: true,
        });
      }
      console.log(templateData.template_data.length);
    } else {
      if (medicineList.medicine !== "" || medicineList.repeatitions !== "") {
        setErrorPopup({
          message: "Please save the current medicine input",
          state: true,
        });
      } else {
        const exists = templates?.some(
          (template) => template.template_id === templateData.template_id,
        );
        if (exists && !isEditing) {
          setErrorPopup({
            message: "A template already exists with same name",
            state: true,
          });
          return;
        }
        create_template.mutate(templateData);
      }
    }
  };
  return (
    <div className="h-full w-full overflow-x-hidden">
      <div className="relative h-fit w-full">
        <button
          type="button"
          onClick={handleOpen}
          className="absolute left-[83.7%] top-[5%] h-[41px] w-[182px] rounded-[8px] bg-[#f36562] text-white tablet:left-[78%] tablet:h-fit tablet:w-[110px]"
        >
          Add New Template
        </button>
        <Modal
          aria-labelledby="unstyled-modal-title"
          aria-describedby="unstyled-modal-description"
          open={open}
          onClose={handleClose}
          slots={{ backdrop: StyledBackdrop }}
        >
          <ModalContent sx={{ width: 736, height: 635 }}>
            <div className="flex h-full w-full flex-col overflow-y-scroll pr-2">
              <div className="h-[15%] w-full">
                <p className="text-center text-[32px]">Add New Template</p>
              </div>
              <div className="h-fit w-full space-y-[2%]">
                <div className=" flex flex-row items-center">
                  <span className="w-[20%] font-bold">Template Name</span>
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="grow rounded-sm border border-[#DBDBDB] bg-[#FFFDFD] p-[1%]"
                    name="template_id"
                    value={templateData.template_id}
                    onChange={handleChange}
                  />
                </div>
                <div className=" flex flex-row items-center">
                  <span className="w-[20%] font-bold">Description</span>
                  <textarea
                    placeholder="Enter Description(Optional)"
                    className="max-h-10 min-h-10 grow rounded-sm border border-[#DBDBDB] bg-[#FFFDFD] p-[1%]"
                    name="description"
                    value={templateData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
              <div className="h-fit w-full">
                <p className="text-start text-[20px] font-bold">Rx</p>
                <div className="h-fit w-full">
                  <p className="mt-[4%] text-3xl font-bold">RX</p>
                  {templateData.template_data.map((item, index) => {
                    return (
                      <div
                        className="my-2 flex w-full items-center justify-between text-xl"
                        key={index}
                      >
                        <p className="w-2/5">{item.medicine}</p>
                        <p className="w-2/5">{item.repeatitions}</p>
                        <FaPen
                          className="h-4 w-4 text-[#4690C7]"
                          onClick={() => {
                            if (
                              medicineList.medicine !== "" ||
                              medicineList.repeatitions !== ""
                            ) {
                              const arr = templateData.template_data;
                              arr.push(medicineList);
                              setTemplateData({
                                ...templateData,
                                template_data: arr,
                              });
                              const element = templateData.template_data.find(
                                (ele) =>
                                  ele.id === item.id &&
                                  ele.medicine === item.medicine &&
                                  ele.repeatitions === item.repeatitions,
                              );
                              element ? setMedicineList(element) : null;
                            }
                            const element = templateData.template_data.find(
                              (ele) =>
                                ele.id === item.id &&
                                ele.medicine === item.medicine &&
                                ele.repeatitions === item.repeatitions,
                            );
                            element ? setMedicineList(element) : null;
                            const updatedMedicineList =
                              templateData.template_data.filter(
                                (ele) =>
                                  ele.id !== item.id ||
                                  ele.medicine !== item.medicine ||
                                  ele.repeatitions !== item.repeatitions,
                              );
                            setTemplateData({
                              ...templateData,
                              template_data: updatedMedicineList,
                            });
                          }}
                        />
                        <FaXmark
                          className="h-6 w-6 text-[#E43030]"
                          onClick={() => {
                            const updatedMedicineList =
                              templateData.template_data.filter(
                                (ele) =>
                                  ele.id !== item.id ||
                                  ele.medicine !== item.medicine ||
                                  ele.repeatitions !== item.repeatitions,
                              );
                            setTemplateData({
                              ...templateData,
                              template_data: updatedMedicineList,
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex h-fit w-full flex-row">
                  <div className="m-[5%] w-[40%]">
                    <input
                      name="medicine"
                      type="text"
                      className="h-12 w-full rounded-sm border border-[#DBDBDB] bg-[#FFFDFD] p-[1%]"
                      placeholder="Select Meds"
                      list="Medicine"
                      value={medicineList.medicine}
                      onChange={handleMedicineChange}
                    />
                    <datalist id="Medicine">
                      {meds?.map((item, index) => (
                        <option key={index} value={item.name}></option>
                      ))}
                    </datalist>
                  </div>
                  <input
                    id=""
                    list="repeatitions_list"
                    name="repeatitions"
                    placeholder="Repeatitions"
                    className="m-[5%] h-12 w-[40%] rounded-sm border border-[#DBDBDB] bg-[#FFFDFD] p-[1%]"
                    value={medicineList.repeatitions}
                    onChange={handleMedicineChange}
                  />
                  <datalist id="repeatitions_list">
                    <option value=""></option>
                    {repeatitions?.map((item, index) => {
                      return <option value={item.name} key={index}></option>;
                    })}
                  </datalist>

                  <button
                    className="text-[#F36562]"
                    onClick={() => {
                      console.log(medicineList);
                      if (
                        medicineList.medicine === "" ||
                        medicineList.repeatitions === ""
                      ) {
                        setErrorPopup({
                          state: true,
                          message: "Medicine or repeatitions cant be empty",
                        });

                        return;
                      }
                      setTemplateData((prevData) => ({
                        ...prevData,
                        template_data: [
                          ...prevData.template_data,
                          medicineList,
                        ],
                      }));
                      setMedicineList({
                        medicine: "",
                        repeatitions: "",
                        id: "",
                      });
                    }}
                  >
                    <span>Save</span>
                  </button>
                </div>
              </div>
              <div className="flex h-fit w-full justify-center space-x-8 self-end text-white">
                <button
                  className="h-10 w-[103px] bg-[#3D4460]"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  className="h-10 w-[103px] bg-[#F36562]"
                  onClick={() => {
                    console.log(templateData);
                    create();
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </ModalContent>
        </Modal>
        <Modal
          aria-labelledby="unstyled-modal-title"
          aria-describedby="unstyled-modal-description"
          open={successPopupOpen}
          onClose={() => {
            setSuccessPopupOpen(false);
          }}
          slots={{ backdrop: StyledBackdrop }}
        >
          <SuccessPopup
            onClick={() => {
              setSuccessPopupOpen(false);
            }}
            message="The Template is Successfully saved"
          />
        </Modal>
        <Modal
          aria-labelledby="unstyled-modal-title"
          aria-describedby="unstyled-modal-description"
          open={errorPopup.state}
          onClose={() => {
            setErrorPopup({ state: false, message: "" });
          }}
          slots={{ backdrop: StyledBackdrop }}
        >
          <ErrorPopup
            onClick={() => {
              setErrorPopup({ state: false, message: "" });
            }}
            message={errorPopup.message}
          />
        </Modal>
        <Heading SecondHeading1="Templates" SecondHeading2="" text="" />
      </div>
      <div className="flex w-full flex-row items-center space-x-[3%]">
        <input
          type="text"
          placeholder="Search"
          className="ml-[1%] rounded-sm border border-[#DBDBDB] bg-[#FFFDFD] p-[1%]"
          onChange={(e) => {
            setSearchData(e.target.value);
          }}
        />{" "}
        <button className="flex h-[42px] w-[55px] items-center justify-center bg-[#F36562] text-white">
          <FaSearch />
        </button>
      </div>
      <div className="h-[66%] w-full flex-col overflow-y-scroll">
        <div className="flex flex-col">
          <div className="sticky top-0 flex h-[86px] w-full flex-row items-center justify-evenly bg-white">
            <div className="flex w-1/3 justify-center">Template</div>
            <div className="flex w-1/3 justify-center">Description</div>
            <div className="flex w-1/3 justify-center">Action</div>
          </div>
          {templates
            ?.filter(
              (item) =>
                searchData === "" || item.template_id.includes(searchData),
            )
            .map((item, index) => (
              <div
                key={index}
                className={`${index % 2 !== 0 ? "bg-[#F9F1F1]" : "bg-[#F0F0F0]"} flex h-[86px] w-full flex-row items-center justify-evenly tablet:text-center tablet:text-sm`}
              >
                <div className="flex w-1/3 justify-center  text-center">
                  {item.template_id}
                </div>
                <div className="flex w-1/3 justify-center text-center">
                  {item.description}
                </div>
                <div className="flex w-1/3 justify-center gap-x-4 text-[#F36562]">
                  <FaEdit
                    onClick={() => {
                      handleOpen();
                      setIsEditing(true);
                      const temp_data = templatesData?.filter(
                        (ele) => ele.template_id === item.template_id,
                      );
                      const temp_array =
                        temp_data?.map((item) => ({
                          id: date.toTimeString(),
                          medicine: item.medicine,
                          repeatitions: item.doseage,
                        })) ?? [];
                      console.log(temp_array);
                      setTemplateData({
                        template_id: item.template_id,
                        description: item.description,
                        template_data: temp_array,
                      });
                    }}
                  />
                  <FaX
                    onClick={() => {
                      delete_template.mutate({
                        template_id: item.template_id,
                      });
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Template;

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
const blue = {
  200: "#99CCFF",
  300: "#66B2FF",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  700: "#0066CC",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const Modal = styled(BaseModal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

const ModalContent = styled("div")(
  ({ theme }) => css`
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 500;
    text-align: start;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background-color: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === "dark" ? "rgb(0 0 0 / 0.5)" : "rgb(0 0 0 / 0.2)"};
    padding: 24px;
    color: ${theme.palette.mode === "dark" ? grey[50] : grey[900]};

    & .modal-title {
      margin: 0;
      line-height: 1.5rem;
      margin-bottom: 8px;
    }

    & .modal-description {
      margin: 0;
      line-height: 1.5rem;
      font-weight: 400;
      color: ${theme.palette.mode === "dark" ? grey[400] : grey[800]};
      margin-bottom: 4px;
    }
  `,
);

const TriggerButton = styled("button")(
  ({ theme }) => css`
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 150ms ease;
    cursor: pointer;
    background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    color: ${theme.palette.mode === "dark" ? grey[200] : grey[900]};
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    &:active {
      background: ${theme.palette.mode === "dark" ? grey[700] : grey[100]};
    }

    &:focus-visible {
      box-shadow: 0 0 0 4px
        ${theme.palette.mode === "dark" ? blue[300] : blue[200]};
      outline: none;
    }

    /* Adding button properties */
    position: absolute;
    left: 83.7%;
    top: 5%;
    height: 41px;
    width: 182px;
    border-radius: 8px;
    background-color: #f36562;
    color: white;
  `,
);
