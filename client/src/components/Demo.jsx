import React from "react";
import { SignIn2 } from "./ui/clean-minimal-sign-in";

/**
 * Demo - A demonstration component for the SignIn2 UI.
 * 
 * @returns {JSX.Element}
 */
const Demo = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Sign-In Component Demo</h1>
      <div className="flex justify-center">
        <SignIn2 />
      </div>
    </div>
  );
};

export { Demo };
