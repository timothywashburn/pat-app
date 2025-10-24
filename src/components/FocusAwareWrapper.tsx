import React, { useRef, useEffect } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

interface FocusAwareTabScreenProps {
  children: React.ReactNode;
}

// Addresses the issue of being able to tab into unfocused screens on the website
export function FocusAwareWrapper({ children }: FocusAwareTabScreenProps) {
  const isFocused = useIsFocused();
  const isWeb = Platform.OS === 'web';
  const viewRef = useRef<View>(null);

  useEffect(() => {
    if (isWeb && viewRef.current) {
      const element = viewRef.current as unknown as HTMLElement;
      if (element && 'inert' in element) {
        element.inert = !isFocused;
      }
    }
  }, [isFocused, isWeb]);

  return (
    <View
      ref={viewRef}
      className="flex-1"
      pointerEvents={isFocused ? 'auto' : 'none'}
    >
      {children}
    </View>
  );
}