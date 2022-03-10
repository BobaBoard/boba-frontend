import React from "react";

export const useConsoleHelloMessage = () => {
  React.useEffect(() => {
    console.log(
      "%c~*Welcome to BobaBoard*~",
      "font-size: 30px; color: white; text-shadow: -1px 2px 0 #ff4284, 1px 2px 0 #ff4284, 1px -2px 0 #ff4284, -1px -2px 0 #ff4284;"
    );
    console.log(
      "%cIf you're here out of curiosity, hello!°꒳°",
      "font-size: 20px; color: #ff4284;"
    );
    console.log(
      "%c★★★★ If you know what you're doing, please consider volunteering: https://docs.google.com/forms/d/e/1FAIpQLSdCX2_fZgIYX0PXeCAA-pfQrcLw_lSp2clGHTt3uBTWgnwVSw/viewform ★★★★",
      "font-size: 16px; color: #ff4284;"
    );
  }, []);
};
