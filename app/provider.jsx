"use client";
import React, { Suspense } from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react";
import AuthProvider from "./AuthProvider";

function Provider({ children }){
    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const disableUnloadAlert = (e) => {
                e.stopImmediatePropagation();
            };
            window.addEventListener("beforeunload", disableUnloadAlert, true);
            
            // Prevent property-based onbeforeunload assignments
            try {
                Object.defineProperty(window, 'onbeforeunload', {
                    get() { return null; },
                    set() { /* ignore */ },
                    configurable: true
                });
            } catch (e) {}

            return () => {
                window.removeEventListener("beforeunload", disableUnloadAlert, true);
            };
        }
    }, []);

    return(
        <Suspense fallback={<p>Loading...</p>}>
            <ConvexProvider client={convex}>
                <AuthProvider>{children}</AuthProvider>
                </ConvexProvider>
                </Suspense>
    )
}
export default Provider;
