import { POISectionMobile } from "./sections/POISectionMobile";

export function MainControlsMobile() {
  return (
    <div className="fixed bottom-8 left-0 right-0 h-1/3 overflow-hidden flex items-center justify-center">
      {trackData ? (
        <POISectionMobile />
      ) : (
        <div className="w-full p-5 m-10 rounded-2xl bg-white/80 backdrop-blur-md">
          <UploadSection />
        </div>
      )}
    </div>
  );
}
