import { useSession } from "next-auth/react";
import React from "react";
import NewAppointmentsTable from "~/components/tables/NewAppointments";
import CompounderPageTemplate from "~/components/templates/CompounderTemplate";
import DoctorPageTemplate from "~/components/templates/DoctorPageTemplate";
import DoctorLogin from "./doctor-login";

const NewAppointments: React.FunctionComponent = () => {
  const ses = useSession();
  if (ses.status === "loading") {
    return <div></div>;
  } else if (
    ses.status === "authenticated" &&
    ses.data.user.email === "doctor"
  ) {
    return (
      <DoctorPageTemplate activePage="appointments" doctorName="Doctor's Name">
        <NewAppointmentsTable />
      </DoctorPageTemplate>
    );
  } else if (
    ses.status === "authenticated" &&
    ses.data.user.email === "compounder"
  ) {
    return (
      <div>
        <CompounderPageTemplate
          activePage="appointments"
          doctorName="Doctor's Name"
        >
          <NewAppointmentsTable />
        </CompounderPageTemplate>
      </div>
    );
  } else {
    return (
      <>
        <main className="flex h-full w-full">
          <DoctorLogin />
        </main>
      </>
    );
  }
};

export default NewAppointments;
