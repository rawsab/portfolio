import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-[#EFF1F7] min-h-screen">
      <Component {...pageProps} />
    </div>
  );
}
