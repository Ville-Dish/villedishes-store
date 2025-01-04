import { Img, Section, Text } from "@react-email/components";

const baseUrl = process.env.VERCEL_URL
  ? process.env.VERCEL_URL
  : process.env?.NEXT_PUBLIC_BASE_URL
  ? process.env.NEXT_PUBLIC_BASE_URL
  : "";

export const EmailHeader = () => {
  return (
    <Section style={header}>
      <Img
        src={`${baseUrl}/static/ville-logo.png`}
        alt="VilleDishes Logo"
        width={50}
        height={50}
        style={image}
      />
      <Text style={textStyle} className="text-slate-500">
        VilleDishes
      </Text>
    </Section>
  );
};

const header = {
  backgroundColor: "#fff1e2",
  color: "white",
  padding: "20px",
  textAlign: "center" as const,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "20px",
  borderBottom: "1px solid #e1e1e1",
};

const image = { display: "flex", margin: "0 auto" };

const textStyle = { fontSize: "24px", fontWeight: "bold", marginTop: "10px" };
