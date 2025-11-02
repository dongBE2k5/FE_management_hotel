import React, { createContext, useContext, useState } from 'react';

type HostContextType = {
  hotelId: number | null;
  setHotelId: (id: number | null) => void;
//   adminName: string;
//   setAdminName: (name: string) => void;
};

const HostContext = createContext<HostContextType | undefined>(undefined);

export const HostProvider = ({ children }: { children: React.ReactNode }) => {
  const [hotelId, setHotelId] = useState<number | null>(null);
//   const [adminName, setAdminName] = useState<string>('');

  return (
    <HostContext.Provider value={{ hotelId, setHotelId}}>
      {children}
    </HostContext.Provider>
  );
};

export const useHost = () => {
  const context = useContext(HostContext);
  if (!context) {
    throw new Error("useHost must be used within a HostProvider");
  }
  return context;
};
