import * as React from "react";
import img from "../../images/medical-banner-with-doctor-patient 1.png";
import img2 from "../../images/healthcare-logo .png";

import Image from "next/image";
import { FaEye, FaUser } from "react-icons/fa";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

const DoctorLogin: React.FunctionComponent = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = React.useState({
    id: "",
    password: "",
    user_type: "doctor",
  });

  const handleSubmit = async () => {
    // console.log(userInfo);
    const res = await signIn("credentials", {
      id: userInfo.id,
      password: userInfo.password,
      user_type: userInfo.user_type,
      redirect: false,
    });
    if (res?.ok) {
      await router.push({
        pathname: "/doctor-dashboard",
        query: { user_type: userInfo.user_type },
      });
    }
    if (res?.error) {
      // Authentication error occurred
      alert("Incorrect username or password. Please try again.");
    }
    return undefined;
  };
  return (
    <>
      <title></title>
      <main className="flex h-screen w-screen flex-nowrap items-center justify-center bg-cover bg-center bg-no-repeat">
        <div className="relative flex h-screen w-2/3 flex-wrap">
          <Image
            src={img}
            alt="Description of the image"
            className="h-full w-full"
            objectFit="cover"
            objectPosition="center"
          />
          <div className="absolute z-10 flex h-full w-full flex-col justify-center bg-[#3D4461C7]">
            <p className="mb-4 ml-12 text-7xl font-bold text-[#F36562]">
              The Care &
            </p>
            <p className="mb-4 ml-12 text-7xl font-bold text-white">
              Compression
            </p>
            <p className="mb-4 ml-12 text-7xl font-bold text-[#F36562]">
              You Need
            </p>
          </div>
        </div>
        <div className="flex h-screen w-1/3 flex-col items-center justify-evenly">
          <Image
            src={img2}
            alt="Description of the image"
            className="h-1/12 w-4/5"
          />
          <p className="border-b-2 border-[#F36562] p-4 text-3xl font-medium text-[#3D4460]">
            SIGN IN
          </p>
          <div className="flex h-1/5 w-3/4 flex-col justify-between">
            <div className="flex h-1/3 w-full items-center justify-between rounded-xl border-2 border-[#969696]">
              <input
                placeholder="Enter User-id"
                className="ml-1 h-5/6 w-4/5 outline-none"
                value={userInfo.id}
                onChange={({ target }) =>
                  setUserInfo({ ...userInfo, id: target.value })
                }
              />
              <FaUser className="mr-4 h-5 w-5" />
            </div>
            <div className="flex h-1/3 w-full items-center justify-between rounded-xl border-2 border-[#969696]">
              <input
                placeholder="Enter Password"
                className="ml-1 h-5/6 w-4/5 outline-none"
                value={userInfo.password}
                onChange={({ target }) =>
                  setUserInfo({ ...userInfo, password: target.value })
                }
              />
              <FaEye className="mr-4 h-5 w-5" />
            </div>
          </div>
          <button
            className="flex h-[6%] w-1/5 items-center justify-center rounded-2xl bg-[#3D4460] text-center text-2xl font-medium text-white"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <p
            className="cursor-pointer font-bold text-[#F36562]"
            onClick={async () => {
              await router.push({
                pathname: "/compounder-login",
              });
            }}
          >
            Sign In As Compounder
          </p>
        </div>
      </main>
    </>
  );
};

export default DoctorLogin;
