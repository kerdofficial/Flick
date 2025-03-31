import { createContext, useContext, useEffect, useState } from "react";

type Tab = {
  id: string;
  tabType: "plaintext" | "code";
  content: string;
  isEdited: boolean;
  flickId: string;
};

type TabsContextType = {
  tabs: Tab[];
  setTabs: (tabs: Tab[]) => void;
};

const TabsContext = createContext<TabsContextType>({
  tabs: [],
  setTabs: () => {},
});

export const TabsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tabs, setTabs] = useState<Tab[]>([]);

  useEffect(() => {
    const storedTabs = localStorage.getItem("tabs");
    if (storedTabs) {
      setTabs(JSON.parse(storedTabs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  return (
    <TabsContext.Provider value={{ tabs, setTabs }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabs = () => {
  return useContext(TabsContext);
};
