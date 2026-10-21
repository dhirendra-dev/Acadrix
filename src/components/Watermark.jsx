import React from "react";

const LOGO_URL = "https://media.base44.com/images/public/6a4fdf2b258cb191501a9b70/1d2597b26_Screenshot_20260811-205052_VN-VideoEditor.png";

export default function Watermark() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center">
      <img
        src={LOGO_URL}
        alt=""
        aria-hidden="true"
        className="h-40 w-40 object-contain opacity-[0.21]"
      />
    </div>
  );
}