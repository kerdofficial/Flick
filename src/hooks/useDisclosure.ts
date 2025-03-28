import { useState } from "react";

export const useDisclosure = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const toggle = () => setIsOpen(!isOpen);

  return { isOpen, toggle };
};
