"use client";

import { createContext, useContext, useState } from "react";

type Ctx = { selected: string; setSelected: (key: string) => void };

const SelectionContext = createContext<Ctx>({ selected: "", setSelected: () => {} });

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState("");
  return (
    <SelectionContext.Provider value={{ selected, setSelected }}>{children}</SelectionContext.Provider>
  );
}

export const useSelection = () => useContext(SelectionContext);
