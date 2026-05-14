import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params;
  const size = Math.min(Math.max(parseInt(sizeParam) || 192, 64), 512);
  const padding = Math.round(size * 0.18);
  const logoSize = size - padding * 2;

  const origin = new URL(req.url).origin;
  const logoUrl = `${origin}/logo.svg`;

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: "#ffffff",
          borderRadius: Math.round(size * 0.22),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          width={logoSize}
          height={logoSize}
          alt="SquadCredit"
        />
      </div>
    ),
    { width: size, height: size }
  );
}
