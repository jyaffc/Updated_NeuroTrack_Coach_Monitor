import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#07101a",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 12,
            display: "flex",
            height: 48,
            justifyContent: "center",
            position: "relative",
            width: 48,
          }}
        >
          <div
            style={{
              border: "1px solid rgba(103,232,249,0.45)",
              borderRadius: 8,
              inset: 8,
              position: "absolute",
            }}
          />
          <div
            style={{
              background: "#67e8f9",
              borderRadius: 999,
              boxShadow: "0 0 18px rgba(103,232,249,0.6)",
              height: 12,
              width: 12,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
