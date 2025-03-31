import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

type Flick = {
  id: string;
  name: string;
  content: {
    plaintext: string;
    code: string;
  };
  updatedAt: Date;
  isEdited: boolean;
};

const defaultFlick: Flick = {
  id: uuidv4(),
  name: "New Flick",
  content: {
    plaintext: "",
    code: "",
  },
  updatedAt: new Date(),
  isEdited: false,
};

type FlickContextType = {
  flick: Flick[];
  setFlick: (flick: Flick[]) => void;
};

const defaultFlickContextValue: FlickContextType = {
  flick: [defaultFlick],
  setFlick: () => {},
};

const FlickContext = createContext<FlickContextType>(defaultFlickContextValue);

export const FlickProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [flick, setFlick] = useState<Flick[]>([defaultFlick]);

  useEffect(() => {
    const storedFlick = localStorage.getItem("flick");
    if (storedFlick) {
      setFlick(JSON.parse(storedFlick));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("flick", JSON.stringify(flick));
  }, [flick]);

  return (
    <FlickContext.Provider value={{ flick, setFlick }}>
      {children}
    </FlickContext.Provider>
  );
};

export const useFlick = () => {
  return useContext(FlickContext);
};
