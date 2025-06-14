import React from "react";
import { Text, View } from "react-native";

export const TableHeader: React.FC = () => {
    return (
        <View className="bg-surface-variant border-b border-divider">
            <View className="flex-row items-center py-3 px-6">
                <View className="flex-1 max-w-[35%] pr-4">
                    <Text className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                        Title
                    </Text>
                </View>

                <View className="w-[25%] px-2">
                    <Text className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                        Date
                    </Text>
                </View>

                <View className="w-[20%] px-2">
                    <Text className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                        Category
                    </Text>
                </View>

                <View className="w-[20%] px-2">
                    <Text className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                        Type
                    </Text>
                </View>
            </View>
        </View>
    );
};