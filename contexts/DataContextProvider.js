import React, { useState, createContext } from 'react';

export const DataContext = createContext();

const DataContextProvider = (props) => {
  const [entries, setEntries] = useState({});
  return (
    <DataContext.Provider value={{
      entries,
      setEntries

    }}>
      { props.children}
    </DataContext.Provider >
  );
}
export default DataContextProvider;
