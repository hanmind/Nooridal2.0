import React, { createContext, useContext, useState } from 'react';

const PregnancyInfoContext = createContext();

export const usePregnancyInfo = () => useContext(PregnancyInfoContext);

export const PregnancyInfoProvider = ({ children }) => {
  const [pregnancyInfo, setPregnancyInfo] = useState(null);

  return (
    <PregnancyInfoContext.Provider value={{ pregnancyInfo, setPregnancyInfo }}>
      {children}
    </PregnancyInfoContext.Provider>
  );
};

export default PregnancyInfoContext; 