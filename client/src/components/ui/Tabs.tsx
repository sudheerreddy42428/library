import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
} | null>(null);

export const Tabs = ({ defaultValue, children, className = '' }: { defaultValue: string, children: React.ReactNode, className?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`flex items-center p-1 bg-[var(--muted)]/50 rounded-lg w-fit ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className = '' }: { value: string, children: React.ReactNode, className?: string }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within a Tabs component");

  const isActive = context.activeTab === value;

  return (
    <button
      className={`px-4 py-2 text-sm font-medium transition-all rounded-md ${
        isActive 
          ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' 
          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50'
      } ${className}`}
      onClick={() => context.setActiveTab(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = '' }: { value: string, children: React.ReactNode, className?: string }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within a Tabs component");

  if (context.activeTab !== value) return null;

  return <div className={`mt-2 ${className}`}>{children}</div>;
};
