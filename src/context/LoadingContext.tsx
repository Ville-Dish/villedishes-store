"use client";

import { createContext, useContext, useState } from "react";
import { LoadingSpinner } from "@/components/custom/loading-spinner";

interface LoadingContextType {
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <LoadingContext.Provider value={{ setIsLoading }}>
      {isLoading && <LoadingSpinner />}
      <div className={isLoading ? 'invisible' : 'visible'}>
        {children}
      </div>
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 