import { useEffect, useState } from "react";

export const useFrontBack = () => {
  const [frontBack, setFrontBack] = useState<string>(() => {
    const frontBackStorage = window.localStorage.getItem("frontBack");
    try {
      return frontBackStorage ? JSON.parse(frontBackStorage) : "FRONT";
    } catch (error) {
      console.error("Error parsing frontBack from localStorage:", error);
      return "FRONT";
    }
  });

  useEffect(() => {
    window.localStorage.setItem("frontBack", JSON.stringify(frontBack));
  }, [frontBack]);

  const changeFrontBack = () => {
    setFrontBack((prev) => (prev === "FRONT" ? "BACK" : "FRONT"));
  };

  return { frontBack, changeFrontBack };
};
