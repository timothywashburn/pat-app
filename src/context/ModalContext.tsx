import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, TouchableOpacity } from 'react-native';

interface ModalContextType {
    showModal: (content: ReactNode) => void;
    hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);

    const showModal = (content: ReactNode) => {
        setModalContent(content);
    };

    const hideModal = () => {
        setModalContent(null);
    };

    return (
        <ModalContext.Provider value={{ showModal, hideModal }}>
            {children}
            {modalContent && (
                <View className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <TouchableOpacity
                        className="absolute inset-0"
                        onPress={hideModal}
                        activeOpacity={1}
                    />
                    <View className="z-20">
                        {modalContent}
                    </View>
                </View>
            )}
        </ModalContext.Provider>
    );
};
