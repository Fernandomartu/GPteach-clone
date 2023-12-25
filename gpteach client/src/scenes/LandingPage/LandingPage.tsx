import { useState } from "react";

import RobotVideo from "../RobotLanding/RobotVideo";

const LandingPage = () => {
  const [view, setView] = useState<string | undefined>(undefined);

  return (
    <div className="flex flex-col items-center justify-center gap-[200px] w-full h-[100vh] bg-white">
      <RobotVideo setView={setView} view={view} />
    </div>
  );
};

export default LandingPage;
