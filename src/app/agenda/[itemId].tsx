import React from 'react';
import { Redirect, useLocalSearchParams } from "expo-router";

export const AgendaItem: React.FC = () => {
    const { itemId } = useLocalSearchParams();

    return <Redirect href={{
        pathname: '/agenda',
        params: {
            itemId
        }
    }} />
}

export default AgendaItem;