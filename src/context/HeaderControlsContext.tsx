import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface HeaderControlsState {
    showAddButton?: boolean;
    onAddTapped?: () => void;
    showFilterButton?: boolean;
    isFilterActive?: boolean;
    onFilterTapped?: () => void;
    customFilter?: () => ReactNode;
    trailing?: () => ReactNode;
}

interface HeaderControlsContextType {
    headerControls: HeaderControlsState;
    setHeaderControls: (controls: HeaderControlsState) => void;
}

const HeaderControlsContext = createContext<HeaderControlsContextType | undefined>(undefined);

export const HeaderControlsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [headerControls, setHeaderControls] = useState<HeaderControlsState>({});

    return (
        <HeaderControlsContext.Provider value={{ headerControls, setHeaderControls }}>
            {children}
        </HeaderControlsContext.Provider>
    );
};

export const useHeaderControls = () => {
    const context = useContext(HeaderControlsContext);
    if (!context) {
        throw new Error('useHeaderControls must be used within a HeaderControlsProvider');
    }
    return context;
};
