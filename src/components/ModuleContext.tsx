import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Module } from '@timothyw/pat-common';

interface ModuleContextType {
    activeHiddenModule: Module | null;
    setActiveHiddenModule: (module: Module | null) => void;
    showHiddenModule: (module: Module) => void;
    hideActiveModule: () => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

interface ModuleProviderProps {
    children: ReactNode;
}

export const ModuleProvider: React.FC<ModuleProviderProps> = ({ children }) => {
    const [activeHiddenModule, setActiveHiddenModule] = useState<Module | null>(null);

    const showHiddenModule = (module: Module) => {
        console.log('showing hidden module:', module.type);
        setActiveHiddenModule(module);
    };

    const hideActiveModule = () => {
        console.log('hiding active module');
        setActiveHiddenModule(null);
    };

    return (
        <ModuleContext.Provider value={{
            activeHiddenModule,
            setActiveHiddenModule,
            showHiddenModule,
            hideActiveModule,
        }}>
            {children}
        </ModuleContext.Provider>
    );
};

export const useModuleContext = () => {
    const context = useContext(ModuleContext);
    if (context === undefined) {
        throw new Error('useModuleContext must be used within a ModuleProvider');
    }
    return context;
};