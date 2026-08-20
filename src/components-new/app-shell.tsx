import React from "react";
import { NewSidebar } from "./sidebar";

export const NewAppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <section id="app" data-od-id="app">
      <div className="app-shell">
        <NewSidebar />
        <main className="main">{children}</main>
      </div>
    </section>
  );
};
